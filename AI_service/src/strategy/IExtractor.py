from abc import ABC, abstractmethod
from ..models import GenerateLessonQuizCommand

class IQuizExtractor (ABC):
    @abstractmethod
    async def extract(self, cmd : GenerateLessonQuizCommand) -> dict:
        pass
    