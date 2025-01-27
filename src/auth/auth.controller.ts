import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDTO } from 'src/dto/auth.dto';

@Controller('users')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Post("register")
    signUp(@Body() body: UserDTO) {
        return this.authService.signUpService(body)
    }

    @Post("login")
    signIn() {
        return this.authService.signInService()
    }
}
