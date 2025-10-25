import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/module';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './common/modules/permissions.module';
import { SiteModule } from './site/site.module';
import { MediaModule } from './media/media.module';
import { MenuModule } from './menu/menu.module';
import { BlocksModule } from './blocks/blocks.module';
import { PageModule } from './page/page.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { PostModule } from './post/post.module';
import { ProductModule } from './product/product.module';
import { FormSubmissionModule } from './form-submission/form-submission.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    PermissionsModule,
    SiteModule,
    MediaModule,
    MenuModule,
    BlocksModule,
    PageModule,
    CategoryModule,
    TagModule,
    PostModule,
    ProductModule,
    FormSubmissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}