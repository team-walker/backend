import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BookmarkService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async addBookmark(userId: string, contentId: number) {
    // Check for duplicate
    const { data: existing } = await this.client
      .from('bookmark')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('Bookmark already exists');
    }

    const { data, error } = await this.client
      .from('bookmark')
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23503') {
        throw new NotFoundException('Landmark content does not exist');
      }
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async removeBookmark(userId: string, contentId: number) {
    const { error } = await this.client
      .from('bookmark')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return { message: 'Bookmark removed successfully' };
  }

  async getBookmarks(userId: string) {
    // Relationship is joined on 'landmark' table using the FK on content_id
    const { data, error } = await this.client
      .from('bookmark')
      .select(
        `
        id,
        content_id,
        created_at,
        landmark (
          contentid,
          title,
          firstimage,
          addr1,
          cat1,
          cat2,
          cat3
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async isBookmarked(userId: string, contentId: number): Promise<{ isBookmarked: boolean }> {
    // Use HEAD request to check for existence efficiently
    const { count, error } = await this.client
      .from('bookmark')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // count will be non-null if successful
    return { isBookmarked: (count || 0) > 0 };
  }
}
