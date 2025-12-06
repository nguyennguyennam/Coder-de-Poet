// src/courses/course.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('searching')
export class SearchController {
  constructor(private readonly courseService: SearchService) {}

  @Get()
  async getCourses(
    @Query('search') search?: string,
    @Query('skip') skip = '0',
    @Query('take') take = '20',
    @Query('status') status?: 'draft' | 'published',
    @Query('access_type') access_type?: 'free' | 'premium',
    @Query('sort') sort?: 'latest' | 'students' | 'title',
  ) {
    return this.courseService.findAll({
      search,
      skip: Number(skip),
      take: Number(take),
      status: status as any,
      access_type: access_type as any,
      sort: sort as any,
    });
  }
}