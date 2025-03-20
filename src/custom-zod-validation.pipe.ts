import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express'; // Import Response from Express
import { ZodIssue } from 'zod';
import { ZodValidationPipe } from 'nestjs-zod';

@Catch(BadRequestException)
export class CustomZodValidationPipe
  extends ZodValidationPipe
  implements ExceptionFilter
{
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // Explicitly type the response

    const errorResponse = exception.getResponse() as
      | { errors?: ZodIssue[] }
      | string;

    if (
      typeof errorResponse === 'object' &&
      errorResponse?.errors &&
      Array.isArray(errorResponse.errors)
    ) {
      const formattedErrors = this.formatZodErrors(errorResponse.errors);
      return response.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return response
      .status(400)
      .json({ statusCode: 400, message: errorResponse });
  }

  private formatZodErrors(errors: ZodIssue[]) {
    return errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));
  }
}
