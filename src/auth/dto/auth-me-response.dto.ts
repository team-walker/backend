import { ApiProperty } from '@nestjs/swagger';

export class AuthMeResponseDto {
  @ApiProperty({ example: '인증 성공' })
  message: string;

  @ApiProperty({
    example: {
      id: 'uuid-1234',
      email: 'user@example.com',
      last_sign_in_at: '2025-06-13T...',
    },
    description: 'Supabase 유저 정보',
  })
  user: any; // 구체적인 User 타입을 지정해도 좋습니다.
}
