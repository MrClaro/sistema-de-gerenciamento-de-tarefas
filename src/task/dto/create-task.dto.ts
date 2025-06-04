import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateTaskDto {
	/** The title of the task, it is required and must be a string
	 * @description A brief and descriptive title for the task that helps identify its purpose
	 * @example "Implement user authentication"
	 * @minLength 3
	 * @maxLength 100
	 */
	@IsNotEmpty({ message: "Title is required" })
	@IsString({ message: "Title must be a string" })
	title: string;

	/** The description of the task, it is optional and must be a string
	 * @description A detailed explanation of what needs to be done in the task
	 * @example "Implement JWT authentication with refresh tokens and password reset functionality"
	 * @maxLength 500
	 */
	@IsOptional()
	@IsString({ message: "Description must be a string" })
	description?: string;

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
