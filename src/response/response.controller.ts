import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Controller('response')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Post()
  create(@Body() createResponseDto: CreateResponseDto) {
    return this.responseService.create(createResponseDto);
  }

  @Get('/download/uploads/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const contentTypeMap: Record<string, string> = {
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      png: 'image/png',
      jpg: 'image/jpeg',
      pdf: 'application/pdf',
      // Add more mappings as needed for other file types
    };

    const splitFileName = filename.split('.');
    let lowerCaseExtension: string | undefined;

    if (splitFileName.length > 1) {
      const fileExtension = splitFileName.pop();
      if (fileExtension) {
        lowerCaseExtension = fileExtension.toLowerCase();
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'No file extension found' });
      }
    } else {
      console.error('Invalid filename format');
      return res
        .status(404)
        .json({ success: false, message: 'Invalid filename format' });
    }

    // Determine the content type based on the file extension
    const contentType =
      contentTypeMap[lowerCaseExtension] || 'application/octet-stream';

    const filePath = join(process.cwd(), 'uploads', filename);

    if (fs.existsSync(filePath)) {
      // Set headers before sending the file
      res.setHeader('X-Filename', filename); // Custom header for filename
      res.setHeader('Content-Type', contentType); // Content type
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      ); // Force download with filename

      // Send the file as response
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('File sending error:', err);
          res.status(500).send({ message: 'Error sending file' });
        }
      });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  }

  @Get()
  findAll() {
    return this.responseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responseService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResponseDto: UpdateResponseDto,
  ) {
    return this.responseService.update(+id, updateResponseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.responseService.remove(+id);
  }
}
