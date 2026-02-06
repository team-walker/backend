import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: ReturnType<typeof createClient>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new InternalServerErrorException('Supabase 설정이 누락되었습니다.');
    }

    this.supabase = createClient(url, key);
  }

  async verifyToken(token: string): Promise<User> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return data.user;
  }
}
