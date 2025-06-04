import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseEnumPipe,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";
import { CurrentUserDto } from "src/auth/dto/current-user.dto";
import { TaskStatusEnum } from "./enum/task-status.enum";

@Controller("task")
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll(@CurrentUser() user: CurrentUserDto) {
		return await this.taskService.findAll(user.userId);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async findById(
		@Param("id") taskId: string,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.findById(taskId, user.userId);
	}

	@Get(":status")
	@UseGuards(JwtAuthGuard)
	async findByStatus(
		@Param("status", new ParseEnumPipe(TaskStatusEnum)) status: TaskStatusEnum,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.findByStatus(status, user.userId);
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	async createTask(
		@Body() createTaskDto: CreateTaskDto,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.createTask(createTaskDto, user.userId);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	async updateTask(
		@Param("id") taskId: string,
		@Body() updateTaskDto: CreateTaskDto,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.updateTask(
			taskId,
			updateTaskDto,
			user.userId,
		);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard)
	async softDelete(
		@Param("id") taskId: string,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.softDeleteTask(taskId, user.userId);
	}
}
