import { Task } from "@prisma/client";
export class ResponseTaskDto {
	/** The unique identifier of the task
	 * @example "123e4567-e89b-12d3-a456-426614174000"
	 */
	id: string;

	/** The title of the task
	 * @example "Complete project documentation"
	 */
	title: string;

	/** The current status of the task
	 * @example "COMPLETED"
	 */
	status: string;

	/** The due date of the task, if set
	 * @example "2024-03-20T15:30:00Z"
	 */
	dueDate?: Date;

	/** The description of the task, if provided
	 * @example "Write documentation for all API endpoints and models"
	 */
	description?: string;

	/** The ID of the user who owns this task
	 * @example "123e4567-e89b-12d3-a456-426614174001"
	 */
	userId: string;

	/** Whether the task is currently active
	 * @example true
	 */
	isActive: boolean;

	/** The date and time when the task was created
	 * @example "2024-03-15T10:00:00Z"
	 */
	createdAt: Date;

	/** The date and time when the task was last updated
	 * @example "2024-03-16T14:30:00Z"
	 */
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
