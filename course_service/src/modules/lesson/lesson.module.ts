// src/modules/lessons/lesson.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { QuizController } from './controller/lesson.controller';
import { QuizService } from './services/quiz.services';

import { AiKafkaClient } from './Message/kafka.client';
import { AiKafkaEventsController } from './Message/kafka.events';

const brokers =
  process.env.KAFKA_BOOTSTRAP_SERVERS?.split(',') ?? ['localhost:9093'];

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AI_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'course-service-producer',
            brokers,
          },
          consumer: {
            groupId: 'course_service_group-client',
          },
        },
      },
    ]),
  ],

  controllers: [
    QuizController,
    AiKafkaEventsController,
  ],

  providers: [
    QuizService,
    AiKafkaClient,
  ],
})
export class LessonModule {}
