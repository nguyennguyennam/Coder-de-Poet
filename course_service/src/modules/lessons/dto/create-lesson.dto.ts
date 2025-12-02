export class CreateLessonDto {
  courseId!: string;
  title!: string;
  contentType?: string;
  contentUrl?: string;
  contentBody?: string;
  position?: number;
}
