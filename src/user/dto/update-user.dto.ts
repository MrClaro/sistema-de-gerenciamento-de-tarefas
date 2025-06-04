import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MinLength,
} from "class-validator";
import { Role } from "../enum/user-role.enum";
export class UpdateUserDto {
	/** The full name of the user, optional for update
	 * @example "John Doe"
	 */
	@IsOptional()
	@IsString()
	name?: string;

	/** The current password of the user, required when changing password
	 * @example "currentPassword123"
	 */
	@IsOptional()
	@IsString({ message: "Current password must be a string" })
	currentPassword?: string;

	/** The new password for the user, must be at least 8 characters long
	 * @example "newSecurePassword123"
	 */
	@IsOptional()
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	newPassword?: string;

	/** The email address of the user, must be a valid email format
	 * @example "john.doe@gmail.com"
	 */
	@IsOptional()
	@IsEmail({}, { message: "Email must be a valid email address" })
	email?: string;

	/** The role assigned to the user, can be either USER or ADMIN
	 * @example "USER"
	 */
	@IsOptional()
	@IsEnum(["ADMIN", "USER"], { message: "Role must be either ADMIN or USER" })
	role?: Role;
}
