import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateFormNameSchema = z.object({
  name: z.string().min(3).max(30),
  formId: z.number(),
});
export class UpdateFormNameDto extends createZodDto(UpdateFormNameSchema) {}
