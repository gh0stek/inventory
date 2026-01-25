import { Global, Module } from '@nestjs/common';
import { drizzleProvider } from './database.provider';
import { SeedService } from './seed.service';

@Global()
@Module({
  providers: [drizzleProvider, SeedService],
  exports: [drizzleProvider],
})
export class DatabaseModule {}
