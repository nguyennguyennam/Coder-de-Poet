// src/lesson/Message/ai-kafka.events.ts

import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import type { LessonQuizGeneratedEvent } from "../models/Dto/Quiz.Dto";

@Controller()
export class AiKafkaEventsController {
  private readonly logger = new Logger(AiKafkaEventsController.name);


  /**
   * Consume LessonQuizGeneratedEvent from AI_service.
   * Logs full message details.
   */
  @EventPattern('ai.lesson_quiz_generated')
  async handleLessonQuizGenerated(
    @Payload() event: LessonQuizGeneratedEvent,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log('Raw event type: ' + typeof event);
    this.logger.log('Raw event: ' + JSON.stringify(event, null, 2));
    const kafkaMsg = context.getMessage();

    const key = kafkaMsg.key?.toString();
    const partition = context.getPartition();
    const offset = kafkaMsg.offset;
    const timestamp = kafkaMsg.timestamp;

    this.logger.log(
      '\n📥 RECEIVED Kafka Message from AI Service\n' +
        `  • Topic: ai.lesson_quiz_generated\n` +
        `  • Partition: ${partition}\n` +
        `  • Offset: ${offset}\n` +
        `  • Timestamp: ${timestamp}\n` +
        `  • Key: ${key}\n` +
        `  • Payload:\n${JSON.stringify(event, null, 2)}\n` +
        '----------------------------------------',
    );

    if (event.status === 'COMPLETED') {
        console.log("Handling completed quiz event");
    } else {
        console.log("Handling failed quiz event");
    }
  }
}
