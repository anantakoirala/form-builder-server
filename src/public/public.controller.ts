import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}
  @Get(':formId')
  async publicRoute(@Param('formId') id: string, @Res() res: Response) {
    console.log('formId', typeof id);
    const form = await this.publicService.getFormById(+id);
    return res.status(200).json({ success: true, form });
  }
}
