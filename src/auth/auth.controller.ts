import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from './auth.guard';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
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
  @ApiResponse({ status: 200, description: '성공', type: AuthMeResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get('me')
  getMe(@Req() req: RequestWithUser): AuthMeResponseDto {
    return {
      message: '인증 성공',
      user: {
        id: req.user.id,
        email: req.user.email,
        last_sign_in_at: req.user.last_sign_in_at,
      },
    };
  }
}
