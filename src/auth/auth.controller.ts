import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO, LoginDTO } from 'src/dto/auth.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('users')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Post("register")
    signUp(@Body(new ValidationPipe()) body: UserDTO) {
        return this.authService.signUpService(body)
    }

    @Post("login")
    signIn(@Body() body: LoginDTO) {
        return this.authService.signInService(body)
    }

    @UseGuards(JwtAuthGuard)
    @Post("profile")
    profile(){
        return "hello"
    }
}
