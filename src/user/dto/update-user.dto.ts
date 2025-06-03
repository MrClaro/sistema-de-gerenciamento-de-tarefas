import {
	IsBoolean,
	IsEmail,
	IsIn,
	IsOptional,
	IsString,
	MinLength,
} from "class-validator";
export class UpdateUserDto {
	@IsOptional()
	@IsString()
	name: string;

	@IsOptional()
	@IsString({ message: "Current password must be a string" })
	currentPassword?: string;

	@IsOptional()
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	newPassword?: string;

	@IsOptional()
	@IsEmail({}, { message: "Email must be a valid email address" })
	email: string;

	@IsOptional()
	@IsIn(["USER", "ADMIN"], { message: "Role must be either USER or ADMIN" })
	role?: string;

	@IsOptional()
	@IsBoolean({ message: "isActive must be a boolean value" })
	isActive?: boolean;
}
