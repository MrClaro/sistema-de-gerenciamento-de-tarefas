import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";

@Controller("task")
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@Get()
	async findAll() {
		return await this.taskService.findAll();
	}

	@Get(":id")
	async findById(@Param("id") taskId: string) {
		return await this.taskService.findById(taskId);
	}

	@Post()
	async createTask(@Body() createTaskDto: CreateTaskDto) {
		return await this.taskService.createTask(createTaskDto);
	}

	@Patch(":id")
	async updateTask(
		@Param("id") taskId: string,
		@Body() updateTaskDto: CreateTaskDto,
	) {
		return await this.taskService.updateTask(taskId, updateTaskDto);
	}
}
