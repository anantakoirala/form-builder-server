import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const saveFormResponseSchema = z.object({
  data: z.record(
    z.union([
      z.string(),
      z.number(),
      z.array(z.string()).optional(), // Optional array of strings
    ]),
  ),
  formId: z.string(),
});
export class SaveFormResponseDto extends createZodDto(saveFormResponseSchema) {}
