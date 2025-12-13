'''

    Define the context interface for strategy pattern
    We will have 2 strategies for 2 kind of video sources: Youtuble and Cloudinary videos
    With Youtube videos, since the tag and category are available, we just need to extract transcript 
    With Cloudinary videos, we need to generate transcript, tags and category
'''

from .IExtractor import IQuizExtractor
from .youtubeExtractor import YoutubeExtractor
from .cloudinaryExtractor import CloudinaryExtractor
from ..models import GenerateLessonQuizCommand    

class StrategyContext:
    @property
    def strategy (self) -> IQuizExtractor:
        return self._strategy
    
    @strategy.setter
    def strategy (self, strategy: IQuizExtractor) -> None:
        self._strategy = strategy
    
    async def execute_strategy (self, cmd: GenerateLessonQuizCommand) -> dict:
        match cmd.source_type:
            case "youtube":
                self._strategy = YoutubeExtractor()
            case "cloudinary":
                self._strategy = CloudinaryExtractor()
            case _:
                raise ValueError(f"Unsupported source type: {cmd.source_type}")
        return await self._strategy.extract(cmd)

        


    
    

    