import { Injectable, Logger } from "@nestjs/common";
import { AiKafkaClient } from "../Message/kafka.client";
import { GenerateLessonQuizCommand, LessonQuizGeneratedEvent } from "../models/Dto/Quiz.Dto";

@Injectable() 
    export class QuizService {
        private readonly logger = new Logger(QuizService.name);

        constructor (private readonly aiKafkaClient: AiKafkaClient) {}

        async createQuiz (dto: any) : Promise<void> {
            
            const command : GenerateLessonQuizCommand = {
                lesson_id: dto.lesson_id,
                course_id: dto.course_id,
                lesson_name: dto.lesson_name,
                video_url: dto.video_url,
                
            };

            await this.aiKafkaClient.sendGenerateLessonQuizCommand(command);
            this.logger.log(`Sent GenerateLessonQuizCommand for lesson_id=${dto.lesson_id}`);
        }

        async handleQuizGeneratedEvent (event: LessonQuizGeneratedEvent) : Promise<void> {
            if (event.status === "COMPLETED") {
                this.logger.log(`Quiz generation completed for lesson_id=${event.lesson_id}`);
            } else {
                this.logger.error(`Quiz generation failed for lesson_id=${event.lesson_id}`);
            }
    }

}