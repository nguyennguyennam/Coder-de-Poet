"""
main.py

FastAPI application for the AI Service.

Responsibilities:
- Initialize Kafka producer/consumer on startup.
- Continuously consume `GenerateLessonQuizCommand` messages.
- For each message:
    - Call the Extractor Strategy pattern to decide which strategy to apply
"""

import asyncio
import logging
from typing import Optional
from fastapi import FastAPI

from .models import GenerateLessonQuizCommand, LessonQuizGeneratedEvent
from .message_service import (
    create_producer,
    create_consumer,
    parse_generate_lesson_quiz_command,
    send_lesson_quiz_generated_event,
)

from .strategy.context import StrategyContext
from .transcript_service import delete_video
import os


logger = logging.getLogger("ai_service")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="AI Service (Transcript + Quiz Generator)")

producer = None
consumer_task: Optional[asyncio.Task] = None


@app.on_event("startup")
async def startup_event():
    """
    Initialize Kafka components and start the consumer loop.
    """
    global producer, consumer_task
    loop = asyncio.get_event_loop()

    producer = await create_producer(loop)
    consumer = await create_consumer(loop)

    consumer_task = loop.create_task(consume_loop(consumer))
    logger.info("AI Service started — Kafka consumer loop running.")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Stop background tasks when shutting down.
    """
    global consumer_task

    if consumer_task:
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            pass

    logger.info("AI Service shutdown completed.")


@app.get("/health")
async def health_check():
    """Simple health check."""
    return {"status": "ok"}


async def consume_loop(consumer):
    """
    Kafka consumption pipeline:
    - Parse command
    - Download video
    - Generate transcript
    - Generate quiz
    - Publish event
    """
    logger.info("Kafka consumer loop started.")
    context = StrategyContext()

    try:
        async for msg in consumer:
            raw_value = msg.value
            logger.info(
                f"[Kafka] Received message topic={msg.topic}, "
                f"partition={msg.partition}, offset={msg.offset}"
            )

            cmd: Optional[GenerateLessonQuizCommand] = None

            try:
                #1. 
                cmd = parse_generate_lesson_quiz_command(raw_value)

                #2. Execute strategy pattern to get extractor
                result = await context.execute_strategy(cmd)

                # 3. Build success event
                event = LessonQuizGeneratedEvent(
                    lesson_id=cmd.lesson_id,
                    course_id=cmd.course_id,
                    status="COMPLETED",
                    transcript=result.get("transcript"),
                    quiz_questions=result.get("quiz"),
                    tag = result.get("tags"),
                    #category = result.get("category")
                )

            except Exception:
                logger.exception("Processing error.")
                event = LessonQuizGeneratedEvent(
                    lesson_id=cmd.lesson_id if cmd else "unknown",
                    course_id=cmd.course_id if cmd else None,
                    status="FAILED",
                    tag=[]

                )

            # 6. Publish event
            await send_lesson_quiz_generated_event(producer, event)

            # 7. Clean up downloaded video
            try:
                if cmd.video_url in locals():
                    delete_video(cmd.video_url)
            except Exception:
                logger.warning("Failed to delete video file.", exc_info=True)

    except asyncio.CancelledError:
        logger.info("Consumer loop cancelled.")
    except Exception:
        logger.exception("Fatal error inside consumer loop.")
