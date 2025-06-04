import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from "class-validator";
import { Role } from "../enum/user-role.enum";
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
	@IsEnum(["ADMIN", "USER"], { message: "Role must be either ADMIN or USER" })
	role?: Role;
}
