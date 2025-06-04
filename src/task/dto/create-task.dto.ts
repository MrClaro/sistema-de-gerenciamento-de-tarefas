import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
	@IsNotEmpty({ message: "Title is required" })
	@IsString({ message: "Title must be a string" })
	title: string;

	@IsOptional()
	@IsString({ message: "Description must be a string" })
	description?: string;

	@IsOptional()
	@IsDate({ message: "Due date must be a valid date" })
	dueDate?: Date;

	@IsNotEmpty({ message: "User ID is required" })
	@IsString({ message: "User ID must be a string" })
	userId: string;
}
