import { Role, User as PrismaUser } from "@prisma/client";

export class ResponseUserDto {
	/** The unique identifier of the user
	 * @example "123e4567-e89b-12d3-a456-426614174000"
	 */
	id: string;

	/** The full name of the user
	 * @example "John Doe"
	 */
	name: string;

	/** The email address of the user, used for authentication
	 * @example "john.doe@gmail.com"
	 */
	email: string;

	/** The role of the user, can be either USER or ADMIN
	 * @example "USER"
	 */
	role: Role;

	/** Indicates if the user account is active
	 * @example true
	 */
	isActive: boolean;

	/** The date and time when the user was created
	 * @example "2024-03-20T15:30:00Z"
	 */
	createdAt: Date;

	/** The date and time when the user was last updated
	 * @example "2024-03-20T15:30:00Z"
	 */
	updatedAt: Date;

	constructor(userFromPrisma: PrismaUser) {
		this.id = userFromPrisma.id;
		this.name = userFromPrisma.name;
		this.email = userFromPrisma.email;
		this.role = userFromPrisma.role;
		this.isActive = userFromPrisma.isActive;
		this.createdAt = userFromPrisma.createdAt;
		this.updatedAt = userFromPrisma.updatedAt;
	}
}
