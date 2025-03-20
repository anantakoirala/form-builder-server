import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}
  async getFormById(id: number) {
    console.log('public id', id);
    try {
      const form = await this.prisma.form.findUnique({
        where: { id: id, published: true },
      });
      console.log('form', form);
      if (!form) {
        console.log('form not found');
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
}
