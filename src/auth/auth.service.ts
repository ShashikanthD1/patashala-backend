import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDTO } from 'src/dto/auth.dto';
import { UsersEntity } from 'src/entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(UsersEntity) private repo: Repository<UsersEntity>) { }
    async signUpService(body: UserDTO) {
        try {
            const user = this.repo.create(body)
            await this.repo.save(user)

            return {
                statusCode: HttpStatus.CREATED,
                message: "User Created Successfully"
            }

        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Failed to create user",
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            )
        }
    }

    signInService() {
        return "signIn"
    }
}
