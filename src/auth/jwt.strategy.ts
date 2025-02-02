import { Injectable, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private readonly authService: AuthService){
        const jwtSecretKry = process.env.JWT_SECRET_KEY;
        if(!jwtSecretKry){
            throw new Error('Secret key not found');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecretKry,
        });
    }

    async validate(payload: {mobile: string}){
        const {mobile} = payload;
        const user = await this.authService.validateUser(mobile)
        if(!user){
            return new UnauthorizedException("Invalid credentials.")
        }
        return user;
    }
}


