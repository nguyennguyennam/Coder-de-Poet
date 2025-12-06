import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  providers: [EnrollmentsRepository, EnrollmentsService, AuthGuard],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsRepository, EnrollmentsService],
})
export class EnrollmentsModule {}
