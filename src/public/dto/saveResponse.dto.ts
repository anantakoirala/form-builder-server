import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const saveFormResponseSchema = z.record(z.any()); // Accepts dynamic keys
export class SaveFormResponseDto extends createZodDto(saveFormResponseSchema) {}
