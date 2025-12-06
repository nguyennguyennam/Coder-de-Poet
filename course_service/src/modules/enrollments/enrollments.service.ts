import { Injectable, NotFoundException} from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';

@Injectable()
export class EnrollmentsService {
  constructor(private enrollmentsRepository: EnrollmentsRepository) {}

  async getCoursesForUser(userId: string) {
    return this.enrollmentsRepository.getCoursesForUser(userId);
  }

  async enrollUserToCourse(userId: string, courseId: string) {
    return this.enrollmentsRepository.createEnrollment(userId, courseId);
  }

  async isEnrolled(studentId: string, courseId: string) {
    return this.enrollmentsRepository.isEnrolled(studentId, courseId);
  }

    async unenrollUserFromCourse(userId: string, courseId: string) {
    // Kiểm tra xem có enrollment không
    const isEnrolled = await this.enrollmentsRepository.isEnrolled(userId, courseId);
    
    if (!isEnrolled) {
      throw new NotFoundException('User is not enrolled in this course');
    }
    
    return this.enrollmentsRepository.deleteEnrollment(userId, courseId);
  }
}
