import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PublicService } from './public.service';
import { SaveFormResponseDto } from './dto/saveResponse.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}
  @Get(':formId')
  async publicRoute(@Param('formId') id: string, @Res() res: Response) {
    const form = await this.publicService.getFormById(+id);
    return res.status(200).json({ success: true, form });
  }

  @Post('submit-form')
  async submitFormResponse(
    @Body() body: SaveFormResponseDto,
    @Res() res: Response,
  ) {
    try {
      console.log('Received body:', body);
      await this.publicService.saveFormResponse(body);
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
