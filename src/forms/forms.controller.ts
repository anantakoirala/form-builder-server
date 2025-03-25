import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser';
import { Response } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  async create(
    @GetUser() user: { userId: number },
    @Body() createFormDto: CreateFormDto,
    @Res() res: Response,
  ) {
    const result = await this.formsService.create(createFormDto, user.userId);

    return res
      .status(200)
      .json({ success: true, message: 'Form created successfully' });
  }
  @Get('getstats')
  async getUsersFormStat(
    @GetUser() user: { userId: number },
    @Res() res: Response,
  ) {
    const result = await this.formsService.getUserFormStat(user.userId);
    return res.status(200).json({ success: true, result });
  }

  @Get()
  async findAll(@GetUser() user: { userId: number }, @Res() res: Response) {
    const result = await this.formsService.findAll(user.userId);
    return res.status(200).json({ success: true, forms: result });
  }

  @Get(':id')
  async findOne(
    @GetUser() user: { userId: number },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const result = await this.formsService.findOne(+id, user.userId);
    return res.status(200).json({ success: true, result });
  }

  @Patch(':id')
  update(
    @GetUser() user: { userId: number },
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    return this.formsService.update(+id, updateFormDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: { userId: number }) {
    return this.formsService.remove(+id, user.userId);
  }
}
