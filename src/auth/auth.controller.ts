import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { Request } from 'express';

import { AuthGuard } from './auth.guard';

// Express Request에 user 타입을 포함한 인터페이스 정의
interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return {
      message: '인증 성공',
      user: req.user, // 이제 안전하게 접근 가능합니다.
    };
  }
}
