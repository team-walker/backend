import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty({ example: 'uuid-1234', description: '사용자 UUID' })
  id: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: '사용자 이메일' })
  email?: string;

  @ApiPropertyOptional({ example: '2025-06-13T00:00:00Z', description: '마지막 로그인 시각' })
  last_sign_in_at?: string;
}

export class AuthMeResponseDto {
  @ApiProperty({ example: '인증 성공' })
  message: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Supabase 유저 정보',
  })
  user: UserResponseDto;
}
