import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { CommonModule } from '../common/module';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [CommonModule, BlocksModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
