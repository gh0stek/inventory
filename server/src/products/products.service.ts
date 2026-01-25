import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, gte, lte, gt, ilike, or, asc, desc, sql, SQL } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/database.provider';
import { products, Product, NewProduct, stores } from '../database/schema';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  ProductFilters,
} from './schemas/product.schema';

export interface PaginatedProducts {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ProductsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findByStore(
    storeId: number,
    filters: ProductFilters,
  ): Promise<PaginatedProducts> {
    // Verify store exists
    const storeResult = await this.db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId));
    if (storeResult.length === 0) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // Build WHERE conditions
    const conditions: SQL[] = [eq(products.storeId, storeId)];

    if (filters.category) {
      conditions.push(eq(products.category, filters.category));
    }

    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }

    if (filters.inStock) {
      conditions.push(gt(products.quantity, 0));
    }

    if (filters.lowStock !== undefined) {
      conditions.push(lte(products.quantity, filters.lowStock));
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(products.name, searchPattern),
          ilike(products.description, searchPattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause);
    const total = countResult[0].count;

    // Build ORDER BY
    const sortColumn = {
      name: products.name,
      price: products.price,
      quantity: products.quantity,
      createdAt: products.createdAt,
    }[filters.sortBy];

    const orderBy =
      filters.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Get paginated data
    const offset = (filters.page - 1) * filters.limit;
    const data = await this.db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(filters.limit)
      .offset(offset);

    return {
      data,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const result = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (result.length === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return result[0];
  }

  async create(storeId: number, createProductDto: CreateProductDto): Promise<Product> {
    // Verify store exists
    const storeResult = await this.db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId));
    if (storeResult.length === 0) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    const newProduct: NewProduct = {
      storeId,
      name: createProductDto.name,
      category: createProductDto.category,
      price: createProductDto.price.toString(),
      quantity: createProductDto.quantity ?? 0,
      sku: createProductDto.sku,
      description: createProductDto.description,
    };

    try {
      const result = await this.db
        .insert(products)
        .values(newProduct)
        .returning();
      return result[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Product with SKU "${createProductDto.sku}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);

    const updateData: Partial<NewProduct> = {
      updatedAt: new Date(),
    };

    if (updateProductDto.name !== undefined) {
      updateData.name = updateProductDto.name;
    }
    if (updateProductDto.category !== undefined) {
      updateData.category = updateProductDto.category;
    }
    if (updateProductDto.price !== undefined) {
      updateData.price = updateProductDto.price.toString();
    }
    if (updateProductDto.quantity !== undefined) {
      updateData.quantity = updateProductDto.quantity;
    }
    if (updateProductDto.sku !== undefined) {
      updateData.sku = updateProductDto.sku ?? undefined;
    }
    if (updateProductDto.description !== undefined) {
      updateData.description = updateProductDto.description ?? undefined;
    }

    try {
      const result = await this.db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();
      return result[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Product with SKU "${updateProductDto.sku}" already exists`,
        );
      }
      throw error;
    }
  }

  async updateStock(id: number, updateStockDto: UpdateStockDto): Promise<Product> {
    await this.findOne(id);

    const result = await this.db
      .update(products)
      .set({
        quantity: updateStockDto.quantity,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.db.delete(products).where(eq(products.id, id));
  }
}
