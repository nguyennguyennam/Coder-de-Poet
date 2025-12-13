'''
    This file contains CloudinaryExtractor class, which use quiz_service and tag_service for quiz and tag generation.
    Inherits IQuizExtractor interface
'''

from .IExtractor import IQuizExtractor
from abc import ABC, abstractmethod
from ..models import GenerateLessonQuizCommand
from typing import Optional
from ..quiz.quiz_service import generate_quiz_from_transcript
from ..quiz.tag_service import tag_generate
from  ..transcript_service import transcribe_video
import asyncio


#Use async.io for parallel events with quiz and tag generation

class CloudinaryExtractor (IQuizExtractor):
    async def extract(self, cmd: GenerateLessonQuizCommand) -> dict:
        video_url = str(cmd.video_url)
        transcript = await asyncio.to_thread(transcribe_video, video_url, cmd.language)
        
        quiz, tags = await asyncio.gather(
            generate_quiz_from_transcript(transcript, cmd),
            tag_generate(transcript)
        )
        print("Tags generated:", tags)
        return {
            "source": "cloudinary",
            "video_url": cmd.video_url,
            "category": None,
            "tags": tags if tags else None,
            "quiz": quiz,
            "transcript": transcript
        }