import { Role } from "src/user/enum/user-role.enum";

export class CurrentUserDto {
	/** The unique identifier of the current user
	 * @example "123e4567-e89b-12d3-a456-426614174000"
	 */
	userId: string;

	/** The full name of the current user
	 * @example "John Doe"
	 */
	name: string;

	/** The roles assigned to the current user
	 * @example ["USER", "ADMIN"]
	 */
	roles: Role[];

	constructor(partial: Partial<CurrentUserDto>) {
		Object.assign(this, partial);
	}
}
