import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from './auth.guard';
import type { RequestWithUser } from './interfaces/request-with-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 정보 조회',
    description: '토큰을 통해 인증된 유저의 정보를 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return {
      message: '인증 성공',
      user: req.user,
    };
  }
}
