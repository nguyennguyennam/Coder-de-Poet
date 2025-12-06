import { 
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
 } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { AuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role_guard.auth';
import { Roles } from '../auth/roles.decorator';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Post()
    @UseGuards(AuthGuard, RoleGuard)
    @Roles('instructor', 'admin')
    create(@Body() dto: CreateCourseDto, @Req() req) {
        return this.coursesService.create({ ...dto, instructorId: req.user.id });
    }

    @Get()
    findAll(@Query() query: QueryCourseDto) {
        return this.coursesService.findAll(query);
    }

    @Get('top-tags')
    topTags(@Query('limit') limit?: string) {
        const l = limit ? Math.max(1, parseInt(limit, 10) || 3) : 3;
        return this.coursesService.getTopTags(l);
    }

    @Get('category/:categoryId/top')
    topByCategory(@Param('categoryId') categoryId: string, @Query('limit') limit?: string) {
        const l = limit ? Math.max(1, parseInt(limit, 10) || 4) : 4;
        return this.coursesService.getTopCoursesByCategory(categoryId, l);
    }

    @Get('top')
    top(@Query('limit') limit?: string) {
        const l = limit ? Math.max(1, parseInt(limit, 10) || 4) : 4;
        return this.coursesService.getTopCourses(l);
    }

    // GET /courses/by-category/:categoryId?skip=0&take=20&search=...&status=...
    @Get('by-category/:categoryId')
    getCoursesByCategory(
        @Param('categoryId') categoryId: string,
        @Query() query: QueryCourseDto
    ) {
        return this.coursesService.getCoursesByCategory(categoryId, query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard, RoleGuard)
    @Roles('instructor', 'admin')
    update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req) {
        return this.coursesService.update(id, dto, req.user.userId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RoleGuard)
    @Roles('instructor', 'admin')
    remove(@Param('id') id: string, @Req() req) {
        return this.coursesService.remove(id, req.user.userId);
    }

    @Post(':id/publish')
    publish(@Param('id') id: string) {
        return this.coursesService.publish(id);
    }

    @Patch(':id/unpublish')
    unpublish(@Param('id') id: string) {
        return this.coursesService.unpublish(id);
    }

    @Patch(':id/draft')
    draft(@Param('id') id: string) {
        return this.coursesService.draft(id);
    }


}
