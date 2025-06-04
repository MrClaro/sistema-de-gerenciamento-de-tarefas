import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsOptional,
	IsString,
} from "class-validator";
import { TaskStatusEnum } from "../enum/task-status.enum";

export class UpdateTaskDto {
	@IsOptional()
	@IsString({ message: "Title must be a string" })
	title?: string;

	@IsOptional()
	@IsString({ message: "Description must be a string" })
	description?: string;

	@IsOptional()
	@IsEnum(TaskStatusEnum, {
		message: `Status must be one of the following values: ${Object.values(TaskStatusEnum).join(", ")}`,
	})
	status?: TaskStatusEnum;

	@IsOptional()
	@IsDate({ message: "DueDate must be a valid date" })
	dueDate?: Date;

	@IsOptional()
	@IsBoolean({ message: "IsActive must be a boolean" })
	isActive?: boolean;
}
