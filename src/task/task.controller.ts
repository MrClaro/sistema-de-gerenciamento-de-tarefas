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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UpdateTaskDto } from "./dto/update-task.dto";

@ApiTags("Tasks")
@Controller("tasks")
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@ApiBearerAuth("JWT-auth")
	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll(@CurrentUser() user: CurrentUserDto) {
		return await this.taskService.findAll(user.userId);
	}

	@ApiBearerAuth("JWT-auth")
	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async findById(
		@Param("id") taskId: string,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.findById(taskId, user.userId);
	}

	@ApiBearerAuth("JWT-auth")
	@Get(":status")
	@UseGuards(JwtAuthGuard)
	async findByStatus(
		@Param("status", new ParseEnumPipe(TaskStatusEnum)) status: TaskStatusEnum,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.findByStatus(status, user.userId);
	}

	@ApiBearerAuth("JWT-auth")
	@Post()
	@UseGuards(JwtAuthGuard)
	async createTask(
		@Body() createTaskDto: CreateTaskDto,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.createTask(createTaskDto, user.userId);
	}

	@ApiBearerAuth("JWT-auth")
	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	async updateTask(
		@Param("id") taskId: string,
		@Body() updateTaskDto: UpdateTaskDto,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.updateTask(
			taskId,
			updateTaskDto,
			user.userId,
		);
	}

	@ApiBearerAuth("JWT-auth")
	@Delete(":id")
	@UseGuards(JwtAuthGuard)
	async softDelete(
		@Param("id") taskId: string,
		@CurrentUser() user: CurrentUserDto,
	) {
		return await this.taskService.softDeleteTask(taskId, user.userId);
	}
}
