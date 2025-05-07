import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';
import { UpdateFormNameDto } from './dto/update-form-name.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}
  async create(createFormDto: CreateFormDto, userId: number) {
    try {
      const prismaTransaction = await this.prisma.$transaction(
        async (prisma) => {
          const createdForm = await prisma.form.create({
            data: {
              name: createFormDto.name,
              description: createFormDto.description,
              userId: userId,
              jsonBlocks: createFormDto.jsonBlocks,
            },
          });
          if (createdForm) {
            const formSetting = await prisma.formSettings.create({
              data: {
                primaryColor: createFormDto.primaryColor,
                backgroundColor: createFormDto.defaultBackgroundColor,
                formId: createdForm.id,
              },
            });
          }
          return createdForm;
        },
      );
      return prismaTransaction;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async findAll(userId: number) {
    try {
      const forms = await this.prisma.form.findMany({
        where: { userId: userId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: { response: true }, // Count the number of responses
          },
        },
      });
      return forms.map((form) => ({
        ...form,
        responseCount: form._count.response, // Attach response count to the result
      }));
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async findOne(id: number, userId: number) {
    try {
      const form = await this.prisma.form.findUnique({
        where: { userId: userId, id: id },
      });
      if (!form) {
        throw new NotFoundException(`Form not found`);
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

  async update(id: number, updateFormDto: UpdateFormDto, userId: number) {
    try {
      const form = await this.prisma.form.findUnique({
        where: { userId: userId, id: id },
      });
      if (!form) {
        throw new NotFoundException(`Form not found`);
      }
      const updatedForm = await this.prisma.form.update({
        where: { id: id },
        data: {
          jsonBlocks: updateFormDto.jsonBlocks, // Save the JSON data
          published: updateFormDto.published,
        },
      });
      return updatedForm;
    } catch (error) {
      console.error('Error updating form:', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async remove(id: number, userId: number) {
    try {
      const deletedForm = await this.prisma.form.delete({
        where: { id, userId },
      });

      if (!deletedForm) {
        throw new NotFoundException(`Form with ID ${id} not found`);
      }

      return { success: true, message: 'Form deleted successfully' };
    } catch (error) {
      console.log('error', error);

      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async getUserFormStat(userId: number) {
    try {
      const { _sum, _count } = await this.prisma.form.aggregate({
        where: { userId: userId },
        _sum: {
          views: true,
          responses: true,
        },
        _count: {
          id: true,
        },
      });

      const views = _sum.views ?? 0;
      const totalResponses = _sum.responses ?? 0;
      const totalForms = _count.id ?? 0;
      return { views, totalResponses, totalForms };
    } catch (error: unknown) {
      console.error(error); // Log actual error
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async updateFormName(updateFormNameDto: UpdateFormNameDto, userId: number) {
    try {
      const form = await this.prisma.form.findUnique({
        where: { id: updateFormNameDto.formId },
      });
      if (!form) {
        throw new NotFoundException('Form not found');
      }
      const updatedForm = await this.prisma.form.update({
        where: { id: updateFormNameDto.formId },
        data: {
          name: updateFormNameDto.name,
        },
      });
      return { success: true, name: updatedForm.name };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }
}
