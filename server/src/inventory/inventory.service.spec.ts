import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { DRIZZLE } from "../database/database.provider";

describe("InventoryService", () => {
  let service: InventoryService;
  let mockDb: any;

  const mockStore = {
    id: 1,
    name: "Test Store",
    address: "123 Test St",
    phone: "555-1234",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getStoreStats", () => {
    it("should return store statistics", async () => {
      // Store exists check
      mockDb.db.where.mockResolvedValueOnce([mockStore]);
      // Overall stats
      mockDb.db.where.mockResolvedValueOnce([
        {
          totalProducts: 10,
          totalQuantity: "100",
          totalInventoryValue: "5000.00",
        },
      ]);
      // Out of stock count
      mockDb.db.where.mockResolvedValueOnce([{ count: 2 }]);
      // Low stock count
      mockDb.db.where.mockResolvedValueOnce([{ count: 3 }]);
      // Category breakdown
      mockDb.db.orderBy.mockResolvedValueOnce([
        {
          category: "Electronics",
          productCount: 5,
          totalQuantity: "50",
          totalValue: "2500.00",
        },
        {
          category: "Clothing",
          productCount: 5,
          totalQuantity: "50",
          totalValue: "2500.00",
        },
      ]);

      const result = await service.getStoreStats(1);

      expect(result.storeId).toBe(1);
      expect(result.storeName).toBe("Test Store");
      expect(result.totalProducts).toBe(10);
      expect(result.totalQuantity).toBe(100);
      expect(result.totalInventoryValue).toBe(5000);
      expect(result.outOfStockCount).toBe(2);
      expect(result.lowStockCount).toBe(3);
      expect(result.categoryBreakdown).toHaveLength(2);
    });

    it("should throw NotFoundException when store not found", async () => {
      mockDb.db.where.mockResolvedValueOnce([]);

      await expect(service.getStoreStats(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should use custom low stock threshold", async () => {
      mockDb.db.where.mockResolvedValueOnce([mockStore]);
      mockDb.db.where.mockResolvedValueOnce([
        {
          totalProducts: 10,
          totalQuantity: "100",
          totalInventoryValue: "5000.00",
        },
      ]);
      mockDb.db.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.db.where.mockResolvedValueOnce([{ count: 5 }]); // More items with higher threshold
      mockDb.db.orderBy.mockResolvedValueOnce([]);

      const result = await service.getStoreStats(1, 10);

      expect(result.lowStockCount).toBe(5);
    });

    it("should handle store with no products", async () => {
      mockDb.db.where.mockResolvedValueOnce([mockStore]);
      mockDb.db.where.mockResolvedValueOnce([
        { totalProducts: 0, totalQuantity: null, totalInventoryValue: "0" },
      ]);
      mockDb.db.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.db.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.db.orderBy.mockResolvedValueOnce([]);

      const result = await service.getStoreStats(1);

      expect(result.totalProducts).toBe(0);
      expect(result.totalQuantity).toBe(0);
      expect(result.totalInventoryValue).toBe(0);
      expect(result.outOfStockCount).toBe(0);
      expect(result.lowStockCount).toBe(0);
      expect(result.categoryBreakdown).toEqual([]);
    });

    it("should correctly format category breakdown", async () => {
      mockDb.db.where.mockResolvedValueOnce([mockStore]);
      mockDb.db.where.mockResolvedValueOnce([
        {
          totalProducts: 3,
          totalQuantity: "30",
          totalInventoryValue: "300.00",
        },
      ]);
      mockDb.db.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.db.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.db.orderBy.mockResolvedValueOnce([
        {
          category: "Food",
          productCount: 3,
          totalQuantity: "30",
          totalValue: "300.00",
        },
      ]);

      const result = await service.getStoreStats(1);

      expect(result.categoryBreakdown).toEqual([
        {
          category: "Food",
          productCount: 3,
          totalQuantity: 30,
          totalValue: 300,
        },
      ]);
    });
  });
});
