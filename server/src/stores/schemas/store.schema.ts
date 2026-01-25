import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createStoreSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  address: z.string().max(500, 'Address is too long').optional(),
  phone: z.string().max(50, 'Phone number is too long').optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  address: z.string().max(500, 'Address is too long').nullable().optional(),
  phone: z.string().max(50, 'Phone number is too long').nullable().optional(),
});

export class CreateStoreDto extends createZodDto(createStoreSchema) {}
export class UpdateStoreDto extends createZodDto(updateStoreSchema) {}
