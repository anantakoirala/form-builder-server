import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveFormResponseDto } from './dto/saveResponse.dto';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}
  async getFormById(id: number) {
    try {
      const form = await this.prisma.form.findUnique({
        where: { id: id, published: true },
      });

      if (!form) {
        throw new NotFoundException('Not Found');
      }
      return form;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Ensure that the NotFoundException is not caught by another part of the code
      }
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async saveFormResponse(body: SaveFormResponseDto) {
    try {
      console.log('body', body);
      const form = await this.prisma.form.findUnique({
        where: { id: +body.formId },
      });
      if (!form) {
        throw new NotFoundException('Not Found');
      }

      const response = await this.prisma.formResponse.create({
        data: {
          formId: +body.formId,
          response: body.data,
        },
      });

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Ensure that the NotFoundException is not caught by another part of the code
      }
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }
}
