// import { IsNotEmpty, IsString } from '@nestjs/class-validator';
// export class signUpDto {
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsString()
//   email: string;

//   @IsNotEmpty()
//   @IsString()
//   password: string;
// }

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SignUpSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(5).nonempty('Password is required'), // Ensures password is not empty,
    confirmPassword: z.string().nonempty('Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // Error will be attached to confirmPassword
  });

export class SignUpDto extends createZodDto(SignUpSchema) {}
