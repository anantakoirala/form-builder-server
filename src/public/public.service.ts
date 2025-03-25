import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveFormResponseDto } from './dto/saveResponse.dto';
import { Form } from '@prisma/client';

export type FormBlockType =
  | 'RowLayout'
  | 'RadioSelect'
  | 'TextField'
  | 'TextArea'
  | 'StarRating'
  | 'Heading'
  | 'Paragraph'
  | 'Select'
  | 'MultipleChoice'
  | 'Fileupload';

const acceptableBLockTypeForQuestion = [
  'TextField',
  'TextArea',
  'Select',
  'StarRating',
  'MultipleChoice',
  'Fileupload',
];
type FormBlockInstance = {
  id: string;
  blockType: FormBlockType;
  attributes?: Record<string, any>;
  childBlocks?: FormBlockInstance[];
  isLocked?: boolean;
};

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
      const updateform = await this.prisma.form.update({
        where: { id: id },
        data: {
          views: form.views + 1,
        },
      });
      return updateform;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Ensure that the NotFoundException is not caught by another part of the code
      }
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async saveFormResponse(
    body: SaveFormResponseDto,
    files: Express.Multer.File[],
  ) {
    try {
      const form = await this.prisma.form.findUnique({
        where: { id: +body.formId },
      });
      if (!form) {
        throw new NotFoundException('Not Found');
      }

      const { formId, ...bodyWithOutFormId } = body;

      if (files.length > 0) {
        files.forEach((file: Express.Multer.File, index: number) => {
          bodyWithOutFormId[file.fieldname] = file.path;
        });
      }
      this.checkValidInput(form, bodyWithOutFormId);

      const response = await this.prisma.formResponse.create({
        data: {
          formId: +body.formId,
          response: bodyWithOutFormId,
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Ensure that the NotFoundException is not caught by another part of the code
      }
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  checkValidInput(form: Form, bodyWithOutFormId: Record<string, unknown>) {
    if (Object.keys(bodyWithOutFormId).length === 0) {
      throw new BadRequestException('Request body cannot be empty');
    }
    // Handle jsonBlocks if it exists
    const jsonBlocks = form.jsonBlocks;
    const childBlockIds: string[] = [];
    if (jsonBlocks && typeof jsonBlocks === 'object') {
      for (const [key, value] of Object.entries(jsonBlocks)) {
        if (value && typeof value === 'object' && 'childBlocks' in value) {
          if (Array.isArray(value.childBlocks)) {
            for (const childBlock of value.childBlocks) {
              if (childBlock && typeof childBlock === 'object') {
                const typedChildBlock = childBlock as FormBlockInstance;

                childBlockIds.push(typedChildBlock.id);
              }
            }
          }
        }
      }
    }

    for (const [key, value] of Object.entries(bodyWithOutFormId)) {
      if (!childBlockIds.includes(key)) {
        throw new InternalServerErrorException('something');
      }
    }
  }
}
