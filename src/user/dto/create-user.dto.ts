import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from "class-validator";
export class CreateUserDto {
	@IsNotEmpty({ message: "Name is required" })
	@IsString()
	name: string;

	@IsNotEmpty({ message: "Password is required" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	password: string;

	@IsNotEmpty({ message: "Email is required" })
	@IsEmail({}, { message: "Email must be a valid email address" })
	email: string;

	@IsOptional()
	@IsIn(["USER", "ADMIN"], { message: "Role must be either USER or ADMIN" })
	role?: string;
}
