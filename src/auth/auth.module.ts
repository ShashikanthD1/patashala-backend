import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from "dotenv";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersEntity } from '../entities/auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {expiresIn: '1h'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
