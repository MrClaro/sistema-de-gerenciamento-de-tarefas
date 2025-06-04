import { Test, TestingModule } from "@nestjs/testing";
import { TaskService } from "../task.service";
import { PrismaService } from "src/database/prisma.service";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { ResponseTaskDto } from "../dto/response-task.dto";
import { Task as PrismaTask, TaskStatus } from "@prisma/client";
import { NotFoundException } from "@nestjs/common";
import {
	mockPrismaTask,
	defaultTaskId,
	mockCreateTaskDto,
	mockUpdateTaskDto,
} from "../mock/task-mock";
import { defaultUserId } from "../../user/mock/user-mock";
import { TaskStatusEnum } from "../enum/task-status.enum";

describe("TaskService", () => {
	let service: TaskService;
	let prisma: PrismaService;

	const mockPrismaService = {
		task: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TaskService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<TaskService>(TaskService);
		prisma = module.get<PrismaService>(PrismaService);

		mockPrismaService.task.findMany.mockReset();
		mockPrismaService.task.findUnique.mockReset();
		mockPrismaService.task.create.mockReset();
		mockPrismaService.task.update.mockReset();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("findAll()", () => {
		it("should return an array of active tasks for the user as ResponseTaskDto", async () => {
			const taskEntities: PrismaTask[] = [
				mockPrismaTask("1", {
					title: "Task One",
					isActive: true,
					userId: defaultUserId,
				}),
				mockPrismaTask("2", {
					title: "Task Two",
					isActive: true,
					userId: defaultUserId,
				}),
			];
			mockPrismaService.task.findMany.mockResolvedValue(taskEntities);

			const result = await service.findAll(defaultUserId);

			expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
				where: { isActive: true, userId: defaultUserId },
			});
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(ResponseTaskDto);
			expect(result[0].title).toEqual(taskEntities[0].title);
			expect(result[1].title).toEqual(taskEntities[1].title);
		});

		it("should return an empty array if no active tasks are found for the user", async () => {
			mockPrismaService.task.findMany.mockResolvedValue([]);
			const result = await service.findAll(defaultUserId);
			expect(result).toEqual([]);
		});
	});

	describe("findByStatus()", () => {
		const statusToFind = TaskStatusEnum.PENDING;
		it("should return an array of active tasks for the user matching the status", async () => {
			const taskEntities: PrismaTask[] = [
				mockPrismaTask("1", {
					title: "Pending Task One",
					status: statusToFind as unknown as TaskStatus,
					isActive: true,
					userId: defaultUserId,
				}),
				mockPrismaTask("2", {
					title: "Pending Task Two",
					status: statusToFind as unknown as TaskStatus,
					isActive: true,
					userId: defaultUserId,
				}),
			];
			mockPrismaService.task.findMany.mockResolvedValue(taskEntities);

			const result = await service.findByStatus(statusToFind, defaultUserId);

			expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
				where: { status: statusToFind, isActive: true, userId: defaultUserId },
			});
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(ResponseTaskDto);
			expect(result[0].status).toEqual(statusToFind);
		});

		it("should return an empty array if no active tasks match the status for the user", async () => {
			mockPrismaService.task.findMany.mockResolvedValue([]);
			const result = await service.findByStatus(statusToFind, defaultUserId);
			expect(result).toEqual([]);
		});
	});

	describe("findById()", () => {
		const taskEntity = mockPrismaTask(defaultTaskId, {
			title: "Found Task",
			userId: defaultUserId,
			isActive: true,
		});

		it("should return a task as ResponseTaskDto if found, active, and belongs to user", async () => {
			mockPrismaService.task.findUnique.mockResolvedValue(taskEntity);
			const result = await service.findById(defaultTaskId, defaultUserId);

			expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
				where: { id: defaultTaskId },
			});
			expect(result).toBeInstanceOf(ResponseTaskDto);
			expect(result.id).toEqual(defaultTaskId);
			expect(result.title).toEqual(taskEntity.title);
		});

		it("should throw NotFoundException if task is not found", async () => {
			mockPrismaService.task.findUnique.mockResolvedValue(null);
			await expect(
				service.findById(defaultTaskId, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(`Task with ID "${defaultTaskId}" not found`),
			);
		});

		it("should throw NotFoundException if task is inactive", async () => {
			const inactiveTask = mockPrismaTask(defaultTaskId, {
				isActive: false,
				userId: defaultUserId,
			});
			mockPrismaService.task.findUnique.mockResolvedValue(inactiveTask);
			await expect(
				service.findById(defaultTaskId, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(`Task with ID "${defaultTaskId}" not found`),
			);
		});

		it("should throw NotFoundException if task does not belong to user", async () => {
			const otherUserTask = mockPrismaTask(defaultTaskId, {
				userId: "other-user-id",
				isActive: true,
			});
			mockPrismaService.task.findUnique.mockResolvedValue(otherUserTask);
			await expect(
				service.findById(defaultTaskId, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(
					`Task with ID "${defaultTaskId}" not found for this user.`,
				),
			);
		});
	});

	describe("createTask()", () => {
		const createTaskData: CreateTaskDto = { ...mockCreateTaskDto };
		const createdTaskEntity = mockPrismaTask("new-task-id", {
			...createTaskData,
			userId: defaultUserId,
		});

		it("should create a task and return ResponseTaskDto", async () => {
			mockPrismaService.task.create.mockResolvedValue(createdTaskEntity);
			const result = await service.createTask(createTaskData, defaultUserId);

			expect(mockPrismaService.task.create).toHaveBeenCalledWith({
				data: {
					...createTaskData,
					userId: defaultUserId,
				},
			});
			expect(result).toBeInstanceOf(ResponseTaskDto);
			expect(result.title).toEqual(createTaskData.title);
			expect(result.userId).toEqual(defaultUserId);
		});
	});

	describe("updateTask()", () => {
		const updateTaskData: UpdateTaskDto = { ...mockUpdateTaskDto };
		const existingTaskEntity = mockPrismaTask(defaultTaskId, {
			title: "Old Title",
			userId: defaultUserId,
			isActive: true,
		});
		const updatedTaskEntity = mockPrismaTask(defaultTaskId, {
			...existingTaskEntity,
			...updateTaskData,
		});

		beforeEach(() => {
			mockPrismaService.task.findUnique.mockResolvedValue(existingTaskEntity);
			mockPrismaService.task.update.mockResolvedValue(updatedTaskEntity);
		});

		it("should update a task and return ResponseTaskDto", async () => {
			const result = await service.updateTask(
				defaultTaskId,
				updateTaskData,
				defaultUserId,
			);

			expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
				where: { id: defaultTaskId },
			});
			expect(mockPrismaService.task.update).toHaveBeenCalledWith({
				where: { id: defaultTaskId },
				data: { ...updateTaskData },
			});
			expect(result).toBeInstanceOf(ResponseTaskDto);
			expect(result.title).toEqual(updateTaskData.title);
			expect(result.status).toEqual(updateTaskData.status);
		});

		it("should throw NotFoundException if task to update is not found", async () => {
			mockPrismaService.task.findUnique.mockResolvedValue(null);
			await expect(
				service.updateTask(defaultTaskId, updateTaskData, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(`Task with ID "${defaultTaskId}" not found`),
			);
		});

		it("should throw NotFoundException if task to update does not belong to user", async () => {
			const otherUserTask = mockPrismaTask(defaultTaskId, {
				userId: "other-user-id",
				isActive: true,
			});
			mockPrismaService.task.findUnique.mockResolvedValue(otherUserTask);
			await expect(
				service.updateTask(defaultTaskId, updateTaskData, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(
					`Task with ID "${defaultTaskId}" not found for this user.`,
				),
			);
		});
	});

	describe("softDeleteTask()", () => {
		const activeTaskEntity = mockPrismaTask(defaultTaskId, {
			isActive: true,
			userId: defaultUserId,
		});
		const inactiveTaskEntity = mockPrismaTask(defaultTaskId, {
			isActive: false,
			userId: defaultUserId,
		});

		it("should soft delete an active task and return ResponseTaskDto", async () => {
			mockPrismaService.task.findUnique.mockResolvedValue(activeTaskEntity);
			const softDeletedEntity = { ...activeTaskEntity, isActive: false };
			mockPrismaService.task.update.mockResolvedValue(softDeletedEntity);

			const result = await service.softDeleteTask(defaultTaskId, defaultUserId);

			expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
				where: { id: defaultTaskId },
			});
			expect(mockPrismaService.task.update).toHaveBeenCalledWith({
				where: { id: defaultTaskId },
				data: { isActive: false },
			});
			expect(result).toBeInstanceOf(ResponseTaskDto);
			expect(result.isActive).toBe(false);
		});

		it("should throw NotFoundException if task to delete is not found", async () => {
			mockPrismaService.task.findUnique.mockResolvedValue(null);
			await expect(
				service.softDeleteTask(defaultTaskId, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(`Task with ID "${defaultTaskId}" not found`),
			);
		});

		it("should throw NotFoundException if task to delete does not belong to user", async () => {
			const otherUserTask = mockPrismaTask(defaultTaskId, {
				userId: "other-user-id",
				isActive: true,
			});
			mockPrismaService.task.findUnique.mockResolvedValue(otherUserTask);
			await expect(
				service.softDeleteTask(defaultTaskId, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(
					`Task with ID "${defaultTaskId}" not found for this user.`,
				),
			);
		});

		it("should throw NotFoundException if task is already inactive", async () => {
			mockPrismaService.task.findUnique.mockResolvedValue(inactiveTaskEntity);
			await expect(
				service.softDeleteTask(defaultTaskId, defaultUserId),
			).rejects.toThrow(
				new NotFoundException(
					`Task with ID "${defaultTaskId}" is already deleted.`,
				),
			);
		});
	});
});
