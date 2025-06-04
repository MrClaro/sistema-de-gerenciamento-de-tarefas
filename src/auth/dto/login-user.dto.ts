import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
	/** The email address of the user, used for authentication
	 * @example "john.doe@gmail.com"
	 */
	@IsNotEmpty()
	@IsString()
	email: string;

	/** The password of the user, used for authentication
	 * @example "password123"
	 */
	@IsNotEmpty()
	@IsString()
	password: string;
}
