import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export type FormBlockType =
  | 'RowLayout'
  | 'RadioSelect'
  | 'TextField'
  | 'TextArea'
  | 'StarRating'
  | 'Heading'
  | 'Paragraph'
  | 'Select'
  | 'MultipleChoice';

const acceptableBLockTypeForQuestion = [
  'TextField',
  'TextArea',
  'Select',
  'StarRating',
  'MultipleChoice',
];

type FormBlockInstance = {
  id: string;
  blockType: FormBlockType;
  attributes?: Record<string, any>;
  childBlocks?: FormBlockInstance[];
  isLocked?: boolean;
};

@Injectable()
export class ResponseService {
  constructor(private prisma: PrismaService) {}
  create(createResponseDto: CreateResponseDto) {
    return 'This action adds a new response';
  }

  findAll() {
    return `This action returns all response`;
  }

  async findOne(id: number) {
    try {
      const form = await this.prisma.form.findUnique({
        where: { id: id },
        include: {
          response: {
            select: {
              response: true,
            },
          },
        },
      });
      if (!form) {
        throw new NotFoundException('Not found');
      }

      // Handle jsonBlocks if it exists
      const jsonBlocks = form.jsonBlocks;
      const responses = form.response;

      const childBlockIds: Map<string, string> = new Map();

      if (jsonBlocks && typeof jsonBlocks === 'object') {
        // Check if it's an object before using Object.entries
        for (const [key, value] of Object.entries(jsonBlocks)) {
          if (value && typeof value === 'object' && 'childBlocks' in value) {
            // Check if childBlocks is an array (or object depending on your data)
            if (Array.isArray(value.childBlocks)) {
              for (const childBlock of value.childBlocks) {
                if (childBlock && typeof childBlock === 'object') {
                  // Log childBlock attributes safely
                  const typedChildBlock = childBlock as FormBlockInstance;
                  if (
                    acceptableBLockTypeForQuestion.includes(
                      typedChildBlock.blockType,
                    )
                  ) {
                    // Type narrowing for id and label to ensure they're strings
                    const childBlockId =
                      typeof typedChildBlock.id === 'string'
                        ? typedChildBlock.id
                        : '';
                    const label =
                      typeof typedChildBlock.attributes?.label === 'string'
                        ? typedChildBlock.attributes.label
                        : '';

                    // Use childBlock.id as the key and its label as the value
                    childBlockIds.set(childBlockId, label);
                  }
                } else {
                  console.log('childBlock is null or undefined');
                }
              }
            } else {
              console.log('childBlocks is not an array');
            }
          } else {
            console.log('value does not have childBlocks');
          }
        }
      } else {
        console.log('jsonBlocks is either null or not an object');
      }

      // Create a new map where the key is the label and the value is the response

      const arrayOfResponses: { label: string; response: string }[][] = [];
      for (const res of responses) {
        const responseArray: { label: string; response: string }[] = []; // Array for each response
        // Iterate over childBlockIds for each response
        childBlockIds.forEach((label, childBlockId) => {
          if (res.response) {
            if (res.response[childBlockId]) {
              if (Array.isArray(res.response?.[childBlockId])) {
                const ans = res.response[childBlockId].join(', '); // Convert array to comma-separated string
                console.log('Array converted to string:', ans);
                responseArray.push({
                  label: label,
                  response: ans,
                });
              } else {
                responseArray.push({
                  label: label,
                  response: res.response[childBlockId] as string, // Default to empty string if no response
                });
              }
            } else {
              responseArray.push({
                label: label,
                response: '', // Default to empty string if no response
              });
            }
          }
        });

        // After finishing this map for one response, push it into the array

        arrayOfResponses.push(responseArray);
      }
      const headers: string[] = [];
      childBlockIds.forEach((label, id) => {
        headers.push(label);
      });

      return {
        form,
        headers,
        arrayOfResponses,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Ensure that the NotFoundException is not caught by another part of the code
      }
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
    return `This action returns a #${id} response`;
  }

  update(id: number, updateResponseDto: UpdateResponseDto) {
    return `This action updates a #${id} response`;
  }

  remove(id: number) {
    return `This action removes a #${id} response`;
  }
}
