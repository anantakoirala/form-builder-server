import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';

import { SaveFormResponseDto } from './dto/saveResponse.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { PublicService } from './public.service';
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}
  @Get(':formId')
  async publicRoute(@Param('formId') id: string, @Res() res: Response) {
    const form = await this.publicService.getFormById(+id);
    return res.status(200).json({ success: true, form });
  }

  @Post('submit-form')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadDir = './uploads';
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          callback(null, uploadDir);
        },
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  async submitFormResponse(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: SaveFormResponseDto,
    @Res() res: Response,
  ) {
    try {
      await this.publicService.saveFormResponse(body, files);
      return res
        .status(201)
        .json({ success: true, message: 'Form submitted successfully' });
    } catch (error) {
      console.error('Error saving form:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}
