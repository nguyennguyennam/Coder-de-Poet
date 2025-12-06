import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsInt, Min, IsUrl } from 'class-validator';

export class CreateLessonDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string; // text content (markdown or HTML)

  @IsEnum(['text', 'video', 'pdf'])
  @IsNotEmpty()
  contentType: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string; // video link (YouTube, Vimeo, etc.)

  @IsUrl()
  @IsOptional()
  fileUrl?: string; // file attachment (PDF, slides)

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number; // lesson order in course
}