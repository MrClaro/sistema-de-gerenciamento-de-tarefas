import { Role, User as PrismaUser } from "@prisma/client";

export class ResponseUserDto {
	id: string;
	name: string;
	email: string;
	role: Role;
	password?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;

	constructor(userFromPrisma: PrismaUser) {
		this.id = userFromPrisma.id;
		this.name = userFromPrisma.name;
		this.email = userFromPrisma.email;
		this.role = userFromPrisma.role;
		this.password = userFromPrisma.password ?? undefined;
		this.isActive = userFromPrisma.isActive;
		this.createdAt = userFromPrisma.createdAt;
		this.updatedAt = userFromPrisma.updatedAt;
	}
}
