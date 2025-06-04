import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { ResponseTaskDto } from "./dto/response-task.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Injectable()
export class TaskService {
	constructor(private prisma: PrismaService) {}

	// Retrieves all active tasks
	async findAll() {
		const tasks = await this.prisma.task.findMany({
			where: {
				isActive: true,
			},
		});
		return tasks.map((task) => new ResponseTaskDto(task));
	}

	// Retrieves one task by its ID
	async findById(id: string): Promise<ResponseTaskDto> {
		const taskEntity = await this.prisma.task.findUnique({
			where: { id },
		});

		if (!taskEntity) {
			throw new NotFoundException(`Task with ID "${id}" not found`);
		}
		return new ResponseTaskDto(taskEntity);
	}

	// Creates a new task
	async createTask(data: CreateTaskDto): Promise<ResponseTaskDto> {
		const prismaCreateData = {
			...data,
		};
		const createdTask = await this.prisma.task.create({
			data: prismaCreateData,
		});
		return new ResponseTaskDto(createdTask);
	}

	// Updates an existing task by its ID
	async updateTask(
		taskId: string,
		updateTaskDto: UpdateTaskDto,
	): Promise<ResponseTaskDto> {
		const taskEntity = await this.prisma.task.findUnique({
			where: { id: taskId },
		});

		if (!taskEntity) {
			throw new NotFoundException(`Task with ID "${taskId}" not found`);
		}

		const updatedTask = await this.prisma.task.update({
			where: { id: taskId },
			data: {
				...updateTaskDto,
			},
		});
		return new ResponseTaskDto(updatedTask);
	}
}
