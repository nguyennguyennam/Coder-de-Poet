// src/lesson/controller/quiz.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { QuizService } from '../services/quiz.services';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}


  @Post('generate')
  async generateQuiz(@Body() body: any) {
    const result = await this.quizService.createQuiz(body);

    return result;
  }
}
