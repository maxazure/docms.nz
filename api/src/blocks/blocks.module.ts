import { Module } from '@nestjs/common';
import { BlocksController } from './blocks.controller';
import { BlockRegistryService } from './block-registry.service';

@Module({
  controllers: [BlocksController],
  providers: [BlockRegistryService],
  exports: [BlockRegistryService],
})
export class BlocksModule {}