import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MinLength,
} from "class-validator";
import { Role } from "../enum/user-role.enum";
export class UpdateUserDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString({ message: "Current password must be a string" })
	currentPassword?: string;

	@IsOptional()
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	newPassword?: string;

	@IsOptional()
	@IsEmail({}, { message: "Email must be a valid email address" })
	email?: string;

	@IsOptional()
	@IsEnum(["ADMIN", "USER"], { message: "Role must be either ADMIN or USER" })
	role?: Role;

	@IsOptional()
	@IsBoolean({ message: "isActive must be a boolean value" })
	isActive?: boolean;
}
