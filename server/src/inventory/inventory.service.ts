import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, sql, count, sum } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/database.provider';
import { stores, products } from '../database/schema';

export interface CategoryBreakdown {
  category: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
}

export interface StoreStats {
  storeId: number;
  storeName: string;
  totalProducts: number;
  totalQuantity: number;
  totalInventoryValue: number;
  outOfStockCount: number;
  lowStockCount: number;
  categoryBreakdown: CategoryBreakdown[];
}

@Injectable()
export class InventoryService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getStoreStats(storeId: number, lowStockThreshold: number = 5): Promise<StoreStats> {
    // Verify store exists
    const storeResult = await this.db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId));

    if (storeResult.length === 0) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    const store = storeResult[0];

    // Get overall stats
    const overallStats = await this.db
      .select({
        totalProducts: count(),
        totalQuantity: sum(products.quantity),
        totalInventoryValue: sql<string>`COALESCE(SUM(${products.price}::numeric * ${products.quantity}), 0)`,
      })
      .from(products)
      .where(eq(products.storeId, storeId));

    // Get out of stock count
    const outOfStockResult = await this.db
      .select({ count: count() })
      .from(products)
      .where(sql`${products.storeId} = ${storeId} AND ${products.quantity} = 0`);

    // Get low stock count (quantity > 0 AND quantity <= threshold)
    const lowStockResult = await this.db
      .select({ count: count() })
      .from(products)
      .where(
        sql`${products.storeId} = ${storeId} AND ${products.quantity} > 0 AND ${products.quantity} <= ${lowStockThreshold}`,
      );

    // Get category breakdown
    const categoryStats = await this.db
      .select({
        category: products.category,
        productCount: count(),
        totalQuantity: sum(products.quantity),
        totalValue: sql<string>`COALESCE(SUM(${products.price}::numeric * ${products.quantity}), 0)`,
      })
      .from(products)
      .where(eq(products.storeId, storeId))
      .groupBy(products.category)
      .orderBy(products.category);

    const stats = overallStats[0];

    return {
      storeId: store.id,
      storeName: store.name,
      totalProducts: stats.totalProducts,
      totalQuantity: Number(stats.totalQuantity) || 0,
      totalInventoryValue: parseFloat(stats.totalInventoryValue) || 0,
      outOfStockCount: outOfStockResult[0].count,
      lowStockCount: lowStockResult[0].count,
      categoryBreakdown: categoryStats.map((cat) => ({
        category: cat.category,
        productCount: cat.productCount,
        totalQuantity: Number(cat.totalQuantity) || 0,
        totalValue: parseFloat(cat.totalValue) || 0,
      })),
    };
  }
}
