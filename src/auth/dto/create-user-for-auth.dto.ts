import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
	IsEnum,
} from "class-validator";
import { Role } from "src/user/enum/user-role.enum";

export class CreateUserForAuthDto {
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
	@IsEnum(Role, { message: "Role must be either USER or ADMIN" })
	role?: Role;
}
