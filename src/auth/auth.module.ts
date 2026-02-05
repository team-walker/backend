import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthGuard],
  // 다른 모듈에서 직접 주입(Injection)할 일이 없으므로 exports는 비워둡니다.
  exports: [],
})
export class AuthModule {}
