import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as twilio from 'twilio';
import { JwtService } from '@nestjs/jwt';
import { UserDTO, LoginDTO } from '../dto/auth.dto';
import { UsersEntity } from '../entities/auth.entity';


@Injectable()
export class AuthService {
    private readonly client: twilio.Twilio;
    private otpStore = new Map();
    constructor(@InjectRepository(UsersEntity) private userRepo: Repository<UsersEntity>, private jwtService: JwtService) {
        const accountSid = process.env.MESSAGE_ACCOUNT_SID;
        const authToken = process.env.MESSAGE_AUTH_KEY;
        this.client = twilio(accountSid, authToken);
    }

    private generateOtp(): string {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        this.otpStore.set("otp", { otp, expiresAt })
        return otp;
    }

    async sendOtp(mobile: string, otp: string | number, actionType: string) {
        try {
            const response = await this.client.messages.create({
                body: `${otp} is your OTP to ${actionType} to the patashala account`,
                from: process.env.MESSAGE_FROM_NUMBER,
                to: mobile
            })
            return {
                statusCode: HttpStatus.OK,
                message: 'OTP sent successfully',
                messageSid: response.sid
            }
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message || "Failed to send otp",
                },
                HttpStatus.BAD_REQUEST
            )
        }
    }

    verifyOtp(otp: string) {
        const storedOtpData = this.otpStore.get("otp")

        if (!storedOtpData) {
            throw new BadRequestException("OTP is not found or expired")
        }

        if (Date.now() > storedOtpData.expiresAt) {
            this.otpStore.delete("otp")
            throw new BadRequestException("OTP expired")
        }

        if (storedOtpData.otp === otp) {
            return true
        } else {
            throw new BadRequestException("Invalid OTP")
        }
    }

    async validateUser (mobile: string){
        const user = await this.userRepo.findOne({ where: { mobile } })
        return user;
    }

    async signUpService(body: UserDTO) {
        const { email, mobile, otp } = body;
        try {
            if (otp) {
                const result = this.verifyOtp(otp)
                if (result) {
                    const user = this.userRepo.create(body)
                    await this.userRepo.save(user)
                    this.otpStore.delete("otp")
                    return {
                        statusCode: HttpStatus.CREATED,
                        message: "User Created Successfully"
                    }
                }
            } else {
                const isEmailExists = await this.userRepo.findOne({ where: { email } })
                if (isEmailExists) {
                    throw new BadRequestException("Email is already taken")
                }
                const isMobileExists = await this.userRepo.findOne({ where: { mobile } })
                if (isMobileExists) {
                    throw new BadRequestException("Mobile number is already taken")
                }
                const otp = this.generateOtp();
                return this.sendOtp(body.mobile, otp, "register")
            }

        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message || "Failed to create user",
                },
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async signInService(body: LoginDTO) {
        const { mobile, otp } = body
        try {
            const user = await this.validateUser(mobile)
            if (!user) {
                throw new UnauthorizedException()
            }
            if (otp) {
                const result = this.verifyOtp(otp);
                if (result) {
                    const payload = {sub: user.id, username: user.name}
                    return {
                        access_token: await this.jwtService.signAsync(payload)
                    }
                }
            } else {
                const otp = this.generateOtp();
                return this.sendOtp(body.mobile, otp, "register")
            }
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message || "Failed to login user",
                },
                HttpStatus.BAD_REQUEST
            )
        }
    }
}
