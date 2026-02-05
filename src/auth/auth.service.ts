import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthService {
  // 제네릭 타입을 any로 지정하여 할당 오류(unsafe assignment) 해결
  private supabase: SupabaseClient<any, any, any>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new InternalServerErrorException('Supabase 환경 변수가 설정되지 않았습니다.');
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
