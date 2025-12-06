import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { EnrollmentsRepository } from '../../modules/enrollments/enrollments.repository';

@Injectable()
export class EnrolledGuard implements CanActivate {
  constructor(private readonly enrollRepo: EnrollmentsRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Expect courseId as query param or route param
    const courseId = req.params?.courseId || req.query?.courseId || req.body?.courseId;
    if (!courseId) {
      throw new ForbiddenException('Course ID is required to check enrollment');
    }

    const isEnrolled = await this.enrollRepo.isEnrolled(user.id, courseId);
    if (!isEnrolled) {
      throw new ForbiddenException('User is not enrolled in this course');
    }

    return true;
  }
}
