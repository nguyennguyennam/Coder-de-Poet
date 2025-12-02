// src/courses/search.module.ts

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { JwtModule } from '@nestjs/jwt';

import { SearchService } from './search.service';
import { SearchRepository } from './search.repository';
import { SearchController } from './search.controller';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [SearchController], // Nếu sau này có SearchController thì thêm vào đây
  providers: [SearchService, SearchRepository],
  exports: [SearchService],
})
export class SearchModule {}
