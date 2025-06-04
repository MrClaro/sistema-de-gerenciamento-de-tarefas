import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterUserDto {
	/** The email address of the user, must be a valid email format
	 * @example "john.doe@gmail.com"
	 */
	@IsEmail()
	@IsNotEmpty()
	email: string;

	/** The full name of the user
	 * @example "John Doe"
	 */
	@IsNotEmpty()
	@IsString()
	name: string;

	/** The password for the user's account
	 * @example "securePassword123"
	 */
	@IsNotEmpty()
	@IsString()
	password: string;
}
