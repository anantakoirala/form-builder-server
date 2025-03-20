import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AcceptedChildBlockType = [
  'TextField',
  'StarRating',
  'RadioSelect',
  'Heading',
  'TextArea',
  'Paragraph',
  'Select',
  'MultipleChoice',
];

// Define the schema for TextField attributes
const TextFieldAttributesSchema = z.object({
  label: z.string().trim().min(2).max(255),
  required: z.boolean().default(false),
  placeHolder: z.string().trim().optional(),
  helperText: z.string().trim().max(255).optional(),
});

const TextAreaAttributesSchema = z.object({
  placeHolder: z.string().trim().optional(),
  label: z.string().trim().min(2).max(255),
  required: z.boolean().default(false),
  helperText: z.string().trim().max(255).optional(),
  rows: z.number().min(1).max(20).default(3),
});

const SelectFieldAttributesSchema = z.object({
  label: z.string().trim().min(2).max(255),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)),
  placeHolder: z.string().trim().optional(),
});

const MultipleChoiceAttributesSchema = z.object({
  label: z.string().trim().min(2).max(255),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)),
  placeHolder: z.string().trim().optional(),
});

const ParagraphAttributesSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  fontSize: z.enum(['small', 'medium', 'large']).default('small'),
  fontWeight: z.enum(['normal', 'lighter']).default('normal'),
});

const RadioAttributesSchema = z.object({
  label: z.string().trim().min(2).max(255),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)),
});

const HeadingAttributesSchema = z.object({
  label: z.string().trim().min(2).max(255),
  level: z.number().min(1).max(6).default(1), // Defaults to H1
  fontSize: z
    .enum(['small', 'medium', 'large', 'x-large', '2x-large', '4x-large'])
    .default('medium'),
  fontWeight: z.enum(['normal', 'bold', 'bolder', 'lighter']).default('normal'),
});

const StarRatingAttributesSchema = z.object({
  label: z.string().trim().min(2).max(255),
  maxStars: z.number().min(1),
  required: z.boolean().default(false),
});

const ChildBlockSchema = z
  .object({
    id: z.string(),
    blockType: z.string(), // Child blocks can have any type
    attributes: z.record(z.any()).optional(), // attributes will be validated below
  })
  .refine(
    (data) => {
      // Log the blockType to the console
      console.log('Checking blockType:', data.blockType);

      // Check if blockType is in AcceptedChildBlockType
      return AcceptedChildBlockType.includes(data.blockType);
    },
    {
      message: `Invalid blockType`,
      path: ['blockType'],
    },
  )
  .refine(
    (data) => {
      // Check attributes for each blockType
      switch (data.blockType) {
        case 'TextField':
          return TextFieldAttributesSchema.safeParse(data.attributes).success;
        case 'TextArea':
          return TextAreaAttributesSchema.safeParse(data.attributes).success;
        case 'Paragraph':
          return ParagraphAttributesSchema.safeParse(data.attributes).success;
        case 'RadioSelect':
          return RadioAttributesSchema.safeParse(data.attributes).success;
        case 'Heading':
          return HeadingAttributesSchema.safeParse(data.attributes).success;
        case 'StarRating':
          return StarRatingAttributesSchema.safeParse(data.attributes).success;
        case 'Select':
          return SelectFieldAttributesSchema.safeParse(data.attributes).success;
        case 'MultipleChoice':
          return MultipleChoiceAttributesSchema.safeParse(data.attributes)
            .success;
        default:
          return true; // If blockType is not in the predefined types, skip validation
      }
    },
    {
      message: 'Invalid attributes for the specified blockType',
      path: ['attributes'],
    },
  );

// Define the main schema for blocks (Only "RowLayout" allowed)
const BlockSchema = z.object({
  id: z.string(),
  isLocked: z.boolean(),
  blockType: z.literal('RowLayout'), // Restrict blockType to ONLY "RowLayout"
  attributes: z.record(z.any()).optional(),
  childBlocks: z.array(ChildBlockSchema).optional(), // Child blocks allowed
});

const CreateFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least two characters' }),
  description: z.string().optional(),
  jsonBlocks: z.array(BlockSchema),
});
export class CreateFormDto extends createZodDto(CreateFormSchema) {}
