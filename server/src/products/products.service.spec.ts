import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { DRIZZLE } from '../database/database.provider';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockDb: any;

  const mockStore = {
    id: 1,
    name: 'Test Store',
    address: '123 Test St',
    phone: '555-1234',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    id: 1,
    storeId: 1,
    name: 'Test Product',
    category: 'Electronics',
    price: '99.99',
    quantity: 10,
    sku: 'TEST-001',
    description: 'A test product',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByStore', () => {
    const defaultFilters = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    it('should return paginated products for a store', async () => {
      const products = [mockProduct];
      // Store exists check
      mockDb.where.mockResolvedValueOnce([mockStore]);
      // Count query
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      // Products query
      mockDb.offset.mockResolvedValueOnce(products);

      const result = await service.findByStore(1, defaultFilters);

      expect(result.data).toEqual(products);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should throw NotFoundException when store not found', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      await expect(service.findByStore(999, defaultFilters)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should filter by category', async () => {
      const filters = { ...defaultFilters, category: 'Electronics' };
      mockDb.where.mockResolvedValueOnce([mockStore]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([mockProduct]);

      const result = await service.findByStore(1, filters);

      expect(result.data).toHaveLength(1);
    });

    it('should filter by price range', async () => {
      const filters = { ...defaultFilters, minPrice: 50, maxPrice: 150 };
      mockDb.where.mockResolvedValueOnce([mockStore]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([mockProduct]);

      const result = await service.findByStore(1, filters);

      expect(result.data).toHaveLength(1);
    });

    it('should filter in-stock products only', async () => {
      const filters = { ...defaultFilters, inStock: true };
      mockDb.where.mockResolvedValueOnce([mockStore]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([mockProduct]);

      const result = await service.findByStore(1, filters);

      expect(result.data).toHaveLength(1);
    });

    it('should return empty data when no products match filters', async () => {
      mockDb.where.mockResolvedValueOnce([mockStore]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.offset.mockResolvedValueOnce([]);

      const result = await service.findByStore(1, defaultFilters);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockDb.where.mockResolvedValue([mockProduct]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockDb.where.mockResolvedValue([]);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });

  describe('create', () => {
    const createProductDto = {
      name: 'New Product',
      category: 'Electronics',
      price: 149.99,
      quantity: 5,
      sku: 'NEW-001',
      description: 'A new product',
    };

    it('should create and return a new product', async () => {
      const newProduct = { ...mockProduct, ...createProductDto, price: '149.99' };
      mockDb.where.mockResolvedValueOnce([mockStore]); // Store exists check
      mockDb.returning.mockResolvedValue([newProduct]);

      const result = await service.create(1, createProductDto);

      expect(result).toEqual(newProduct);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw NotFoundException when store not found', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      await expect(service.create(999, createProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate SKU', async () => {
      mockDb.where.mockResolvedValueOnce([mockStore]);
      const error = { code: '23505' };
      mockDb.returning.mockRejectedValue(error);

      await expect(service.create(1, createProductDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateProductDto = {
      name: 'Updated Product',
      price: 199.99,
    };

    it('should update and return the product', async () => {
      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
        price: '199.99',
      };
      mockDb.where.mockResolvedValueOnce([mockProduct]); // findOne call
      mockDb.returning.mockResolvedValue([updatedProduct]);

      const result = await service.update(1, updateProductDto);

      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockDb.where.mockResolvedValue([]);

      await expect(service.update(999, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate SKU', async () => {
      mockDb.where.mockResolvedValueOnce([mockProduct]);
      const error = { code: '23505' };
      mockDb.returning.mockRejectedValue(error);

      await expect(
        service.update(1, { ...updateProductDto, sku: 'DUPLICATE' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStock', () => {
    const updateStockDto = { quantity: 25 };

    it('should update stock quantity and return the product', async () => {
      const updatedProduct = { ...mockProduct, quantity: 25 };
      mockDb.where.mockResolvedValueOnce([mockProduct]); // findOne call
      mockDb.returning.mockResolvedValue([updatedProduct]);

      const result = await service.updateStock(1, updateStockDto);

      expect(result.quantity).toBe(25);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockDb.where.mockResolvedValue([]);

      await expect(service.updateStock(999, updateStockDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockDb.where
        .mockResolvedValueOnce([mockProduct]) // findOne call
        .mockResolvedValueOnce(undefined); // delete call

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      mockDb.where.mockResolvedValue([]);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
