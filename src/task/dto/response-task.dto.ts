import { Task } from "@prisma/client";
export class ResponseTaskDto {
	id: string;
	title: string;
	status: string;
	dueDate?: Date;
	description?: string;
	userId: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;

	constructor(taskFromPrisma: Task) {
		this.id = taskFromPrisma.id;
		this.title = taskFromPrisma.title;
		this.status = taskFromPrisma.status;
		this.description = taskFromPrisma.description ?? undefined;
		this.dueDate = taskFromPrisma.dueDate ?? undefined;
		this.userId = taskFromPrisma.userId;
		this.isActive = taskFromPrisma.isActive;
		this.createdAt = taskFromPrisma.createdAt;
		this.updatedAt = taskFromPrisma.updatedAt;
	}
}
