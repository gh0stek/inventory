import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  DRIZZLE,
  DrizzleProvider,
  Transactional,
} from "../database/database.provider";
import { stores, Store, NewStore, products } from "../database/schema";
import { CreateStoreDto, UpdateStoreDto } from "./schemas/store.schema";

@Injectable()
export class StoresService {
  constructor(@Inject(DRIZZLE) private dbProvider: DrizzleProvider) {}

  async findAll(): Promise<Store[]> {
    return this.dbProvider.db.select().from(stores);
  }

  async findOne(id: number): Promise<Store> {
    const result = await this.dbProvider.db
      .select()
      .from(stores)
      .where(eq(stores.id, id));

    if (result.length === 0) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return result[0];
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const newStore: NewStore = {
      name: createStoreDto.name,
      address: createStoreDto.address,
      phone: createStoreDto.phone,
    };

    try {
      const result = await this.dbProvider.db
        .insert(stores)
        .values(newStore)
        .returning();
      return result[0];
    } catch (error: any) {
      if (error.code === "23505") {
        throw new ConflictException(
          `Store with name "${createStoreDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    await this.findOne(id);

    const updateData: Partial<NewStore> = {
      updatedAt: new Date(),
    };

    if (updateStoreDto.name !== undefined) {
      updateData.name = updateStoreDto.name;
    }
    if (updateStoreDto.address !== undefined) {
      updateData.address = updateStoreDto.address ?? undefined;
    }
    if (updateStoreDto.phone !== undefined) {
      updateData.phone = updateStoreDto.phone ?? undefined;
    }

    try {
      const result = await this.dbProvider.db
        .update(stores)
        .set(updateData)
        .where(eq(stores.id, id))
        .returning();
      return result[0];
    } catch (error: any) {
      if (error.code === "23505") {
        throw new ConflictException(
          `Store with name "${updateStoreDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  @Transactional()
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.dbProvider.db.delete(products).where(eq(products.storeId, id));
    await this.dbProvider.db.delete(stores).where(eq(stores.id, id));
  }
}
