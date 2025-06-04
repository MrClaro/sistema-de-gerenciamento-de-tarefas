import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterUserDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;
	@IsNotEmpty()
	@IsString()
	name: string;
	@IsNotEmpty()
	@IsString()
	password: string;
}
