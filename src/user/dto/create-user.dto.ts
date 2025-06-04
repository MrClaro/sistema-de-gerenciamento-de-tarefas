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
	/** The name of the user
	 * @example John
	 */
	@IsNotEmpty({ message: "Name is required" })
	@IsString()
	name: string;

	/** The password of the user, must be at least 8 characters long, it is used to authenticate the user
	 * @example 12345678
	 */

	@IsNotEmpty({ message: "Password is required" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	password: string;

	/** The email of the user, must be a valid email address, it is used to authenticate the user
	 * @example john.doe@gmail.com
	 */
	@IsNotEmpty({ message: "Email is required" })
	@IsEmail({}, { message: "Email must be a valid email address" })
	email: string;

	/** The role of the user, must be either ADMIN or USER
	 * @example ADMIN
	 */
	@IsOptional()
	@IsEnum(["ADMIN", "USER"], { message: "Role must be either ADMIN or USER" })
	role?: Role;
}
