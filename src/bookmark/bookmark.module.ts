import { Module } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [BookmarkController],
  providers: [BookmarkService, AuthGuard],
})
export class BookmarkModule {}
