import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthService {
  // 타입을 ReturnType으로 지정하여 린트 에러 방지
  private supabase: ReturnType<typeof createClient>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new Error('SUPABASE 환경변수 없음');
    }

    this.supabase = createClient(url, key);
  }

  async verifyToken(token: string): Promise<User> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    return data.user;
  }
}
