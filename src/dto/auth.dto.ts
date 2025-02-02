import {IsNotEmpty,MinLength,IsEmail,IsPhoneNumber,Matches} from "class-validator";
export class UserDTO {
    @IsNotEmpty()
    @MinLength(3)
    name: string

    @IsNotEmpty()
    @IsPhoneNumber()
    mobile: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    otp?: string
}

export class LoginDTO {
    @IsNotEmpty()
    @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
    otp: string

    @IsNotEmpty()
    @IsPhoneNumber()
    mobile: string
}