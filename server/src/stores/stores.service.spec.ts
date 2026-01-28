import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { StoresService } from "./stores.service";
import { DRIZZLE } from "../database/database.provider";

describe("StoresService", () => {
  let service: StoresService;
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
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of stores", async () => {
      const stores = [mockStore, { ...mockStore, id: 2, name: "Store 2" }];
      mockDb.db.from.mockResolvedValue(stores);

      const result = await service.findAll();

      expect(result).toEqual(stores);
      expect(mockDb.db.select).toHaveBeenCalled();
    });

    it("should return empty array when no stores exist", async () => {
      mockDb.db.from.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a store by id", async () => {
      mockDb.db.where.mockResolvedValue([mockStore]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockStore);
    });

    it("should throw NotFoundException when store not found", async () => {
      mockDb.db.where.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        "Store with ID 999 not found",
      );
    });
  });

  describe("create", () => {
    const createStoreDto = {
      name: "New Store",
      address: "456 New St",
      phone: "555-5678",
    };

    it("should create and return a new store", async () => {
      const newStore = { ...mockStore, ...createStoreDto };
      mockDb.db.returning.mockResolvedValue([newStore]);

      const result = await service.create(createStoreDto);

      expect(result).toEqual(newStore);
      expect(mockDb.db.insert).toHaveBeenCalled();
    });

    it("should throw ConflictException on duplicate name", async () => {
      const error = { code: "23505" };
      mockDb.db.returning.mockRejectedValue(error);

      await expect(service.create(createStoreDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should rethrow non-conflict errors", async () => {
      const error = new Error("Database error");
      mockDb.db.returning.mockRejectedValue(error);

      await expect(service.create(createStoreDto)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("update", () => {
    const updateStoreDto = {
      name: "Updated Store",
    };

    it("should update and return the store", async () => {
      const updatedStore = { ...mockStore, ...updateStoreDto };
      mockDb.db.where.mockResolvedValueOnce([mockStore]); // findOne call
      mockDb.db.returning.mockResolvedValue([updatedStore]);

      const result = await service.update(1, updateStoreDto);

      expect(result).toEqual(updatedStore);
    });

    it("should throw NotFoundException when store not found", async () => {
      mockDb.db.where.mockResolvedValue([]);

      await expect(service.update(999, updateStoreDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ConflictException on duplicate name", async () => {
      mockDb.db.where.mockResolvedValueOnce([mockStore]); // findOne call
      const error = { code: "23505" };
      mockDb.db.returning.mockRejectedValue(error);

      await expect(service.update(1, updateStoreDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("remove", () => {
    it("should delete a store", async () => {
      mockDb.db.where
        .mockResolvedValueOnce([mockStore]) // findOne call
        .mockResolvedValueOnce(undefined); // delete call

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockDb.db.delete).toHaveBeenCalled();
    });

    it("should throw NotFoundException when store not found", async () => {
      mockDb.db.where.mockResolvedValue([]);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
