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
	/** The full name of the user
	 * @example "John Doe"
	 */
	@IsNotEmpty({ message: "Name is required" })
	@IsString()
	name: string;

	/** The password for the user's account, must be at least 8 characters long
	 * @example "securePassword123"
	 */
	@IsNotEmpty({ message: "Password is required" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	password: string;

	/** The email address of the user, must be a valid email format
	 * @example "john.doe@gmail.com"
	 */
	@IsNotEmpty({ message: "Email is required" })
	@IsEmail({}, { message: "Email must be a valid email address" })
	email: string;

	/** The role assigned to the user, can be either USER or ADMIN
	 * @example "USER"
	 */
	@IsOptional()
	@IsEnum(Role, { message: "Role must be either USER or ADMIN" })
	role?: Role;
}
