import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AuthGuard } from './auth.guard';
// 'import' 뒤에 'type'을 추가합니다.
import type { RequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return {
      message: '인증 성공',
      user: req.user,
    };
  }
}
