import { IsEnum, IsISO8601, IsOptional, IsString } from "class-validator";
import { TaskStatusEnum } from "../enum/task-status.enum";
import { Transform, Type } from "class-transformer";

export class UpdateTaskDto {
	/** The title of the task, it is optional and must be a string
	 * @example "Update project documentation"
	 */
	@IsOptional()
	@IsString({ message: "Title must be a string" })
	title?: string;

	/** The description of the task, it is optional and must be a string
	 * @example "Update documentation with new API endpoints"
	 */
	@IsOptional()
	@IsString({ message: "Description must be a string" })
	description?: string;

	/** The status of the task, it is optional and must be one of the predefined status values
	 * @example "COMPLETED"
	 */
	@IsOptional()
	@IsEnum(TaskStatusEnum, {
		message: `Status must be one of the following values: ${Object.values(TaskStatusEnum).join(", ")}`,
	})
	status?: TaskStatusEnum;

	/** The due date of the task, it is optional and must be a valid date
	 * @description The deadline by which the task should be completed. Accepts both YYYY-MM-DD and ISO 8601 formats
	 * @example "2024-03-20" or "2024-03-20T15:30:00Z"
	 * @format date-time
	 */
	@IsOptional()
	@Transform(({ value }) => {
		if (!value) return value;

		if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
			return new Date(`${value}T00:00:00Z`);
		}

		const parsed = new Date(value);
		if (isNaN(parsed.getTime())) {
			throw new Error("Due date must be a valid date");
		}

		return parsed;
	})
	@Type(() => Date)
	dueDate?: Date;
}
