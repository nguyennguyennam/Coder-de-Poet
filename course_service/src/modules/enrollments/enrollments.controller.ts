import { Controller, Get, Param, Post, Body, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { AuthGuard } from '../auth/jwt-auth.guard';

@Controller('enrollments')
@UseGuards(AuthGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  // GET /enrollments/user/:userId - get all courses for a user
  @Get('user/:userId')
  async getCoursesForUser(@Param('userId') userId: string) {
    return this.enrollmentsService.getCoursesForUser(userId);
  }

  // POST /enrollments/enroll - enroll a user to a course
  @Post('enroll')
  async enrollUserToCourse(
    @Body('userId') userId: string,
    @Body('courseId') courseId: string,
  ) {
    return this.enrollmentsService.enrollUserToCourse(userId, courseId);
  }

  // DELETE /enrollments/unenroll - unenroll a user from a course
  @Delete('unenroll')
  async unenrollUserFromCourse(
    @Body('userId') userId: string,
    @Body('courseId') courseId: string,
  ) {
    return this.enrollmentsService.unenrollUserFromCourse(userId, courseId);
  }

  // GET /enrollments/check?studentId=...&courseId=...
  @Get('check')
  async checkEnrollment(@Query('studentId') studentId: string, @Query('courseId') courseId: string) {
    if (!studentId || !courseId) {
      return { enrolled: false };
    }
    const enrolled = await this.enrollmentsService.isEnrolled(studentId, courseId);
    return { enrolled };
  }
}