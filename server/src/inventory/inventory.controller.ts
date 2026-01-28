import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { InventoryService, StoreStats } from "./inventory.service";

@Controller("stores")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(":id/stats")
  async getStoreStats(
    @Param("id", ParseIntPipe) id: number,
    @Query("lowStockThreshold") lowStockThreshold?: string,
  ): Promise<StoreStats> {
    const threshold = lowStockThreshold ? parseInt(lowStockThreshold, 10) : 5;
    return this.inventoryService.getStoreStats(id, threshold);
  }
}
