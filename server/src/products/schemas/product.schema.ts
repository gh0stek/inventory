import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  category: z.string().min(1, 'Category is required').max(100, 'Category is too long'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative').default(0),
  sku: z.string().max(50, 'SKU is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category is too long').optional(),
  price: z.number().positive('Price must be positive').optional(),
  quantity: z.number().int().nonnegative('Quantity cannot be negative').optional(),
  sku: z.string().max(50, 'SKU is too long').nullable().optional(),
  description: z.string().max(1000, 'Description is too long').nullable().optional(),
});

export const updateStockSchema = z.object({
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
});

export const productFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
  lowStock: z.coerce.number().int().nonnegative().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'quantity', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class CreateProductDto extends createZodDto(createProductSchema) {}
export class UpdateProductDto extends createZodDto(updateProductSchema) {}
export class UpdateStockDto extends createZodDto(updateStockSchema) {}
export class ProductFiltersDto extends createZodDto(productFiltersSchema) {}

export type ProductFilters = z.infer<typeof productFiltersSchema>;
