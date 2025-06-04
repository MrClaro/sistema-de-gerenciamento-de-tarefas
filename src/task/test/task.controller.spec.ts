import { Test, TestingModule } from "@nestjs/testing";
import { TaskController } from "../task.controller";
import { TaskService } from "../task.service";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { ResponseTaskDto } from "../dto/response-task.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { CurrentUserDto } from "../../auth/dto/current-user.dto";
import {
	mockTaskService,
	mockTaskResponse,
	mockTaskArrayResponse,
	defaultTaskId,
	mockCreateTaskDto,
	mockUpdateTaskDto,
	mockPrismaTask,
} from "../mock/task-mock";
import { TaskStatusEnum } from "../enum/task-status.enum";
import { defaultUserId } from "../../user/mock/user-mock";
import { Role } from "src/user/enum/user-role.enum";

const mockCurrentUser: CurrentUserDto = {
	userId: defaultUserId,
	name: "John Doe",
	roles: [Role.USER, Role.ADMIN],
};

describe("TaskController", () => {
	let controller: TaskController;
	let service: TaskService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TaskController],
			providers: [
				{
					provide: TaskService,
					useValue: mockTaskService,
				},
			],
		})
			.overrideGuard(JwtAuthGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<TaskController>(TaskController);
		service = module.get<TaskService>(TaskService);
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("getTasks()", () => {
		it("should call taskService.findAll with userId when no status is provided", async () => {
			mockTaskService.findAll.mockResolvedValueOnce(
				mockTaskArrayResponse.filter(
					(task) => task.userId === mockCurrentUser.userId,
				),
			);

			const result = await controller.getTasks(mockCurrentUser);
			expect(service.findAll).toHaveBeenCalledWith(mockCurrentUser.userId);
			expect(result.length).toBeGreaterThanOrEqual(0);
			if (result.length > 0) {
				expect(result[0]).toBeInstanceOf(ResponseTaskDto);
			}
		});
	});

	describe("findById(:id)", () => {
		it("should call taskService.findById with taskId and userId, and return a task", async () => {
			mockTaskService.findById.mockResolvedValueOnce(mockTaskResponse);

			const result = await controller.findById(defaultTaskId, mockCurrentUser);
			expect(service.findById).toHaveBeenCalledWith(
				defaultTaskId,
				mockCurrentUser.userId,
			);
			expect(result).toEqual(mockTaskResponse);
			expect(result).toBeInstanceOf(ResponseTaskDto);
		});

		it("should return null if taskService.findById returns null", async () => {
			const nonExistentId = "non-existent-task-uuid";
			mockTaskService.findById.mockResolvedValueOnce(null);

			const result = await controller.findById(nonExistentId, mockCurrentUser);
			expect(service.findById).toHaveBeenCalledWith(
				nonExistentId,
				mockCurrentUser.userId,
			);
			expect(result).toBeNull();
		});
	});

	describe("createTask()", () => {
		it("should call taskService.createTask with DTO and userId, and return the created task", async () => {
			const createTaskDto: CreateTaskDto = { ...mockCreateTaskDto };
			const createdTaskResponse = new ResponseTaskDto({
				...mockPrismaTask("new-created-id", {
					...createTaskDto,
					userId: mockCurrentUser.userId,
					status: TaskStatusEnum.PENDING as any,
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
				id: "new-created-id",
			} as any);

			mockTaskService.createTask.mockResolvedValueOnce(createdTaskResponse);

			const result = await controller.createTask(
				createTaskDto,
				mockCurrentUser,
			);
			expect(service.createTask).toHaveBeenCalledWith(
				createTaskDto,
				mockCurrentUser.userId,
			);
			expect(result).toBeInstanceOf(ResponseTaskDto);
			expect(result.title).toEqual(createTaskDto.title);
			expect(result.userId).toEqual(mockCurrentUser.userId);
		});
	});

	describe("updateTask(:id)", () => {
		it("should call taskService.updateTask with taskId, DTO, and userId, and return the updated task", async () => {
			const updateTaskDto: UpdateTaskDto = { ...mockUpdateTaskDto };
			const updatedResponse = new ResponseTaskDto({
				...mockTaskResponse,
				...updateTaskDto,
				id: defaultTaskId,
				userId: mockCurrentUser.userId,
				updatedAt: new Date(),
			} as any);

			mockTaskService.updateTask.mockResolvedValueOnce(updatedResponse);

			const result = await controller.updateTask(
				defaultTaskId,
				updateTaskDto,
				mockCurrentUser,
			);
			expect(service.updateTask).toHaveBeenCalledWith(
				defaultTaskId,
				updateTaskDto,
				mockCurrentUser.userId,
			);
			expect(result).toBeInstanceOf(ResponseTaskDto);
			if (updateTaskDto.title) {
				expect(result.title).toEqual(updateTaskDto.title);
			}
		});
	});

	describe("softDelete(:id)", () => {
		it("should call taskService.softDeleteTask with taskId and userId, and return a success message", async () => {
			const expectedResponse = {
				message: "Task soft deleted successfully",
				id: defaultTaskId,
			};
			mockTaskService.softDeleteTask.mockResolvedValueOnce(expectedResponse);

			const result = await controller.softDelete(
				defaultTaskId,
				mockCurrentUser,
			);
			expect(service.softDeleteTask).toHaveBeenCalledWith(
				defaultTaskId,
				mockCurrentUser.userId,
			);
			expect(result).toEqual(expectedResponse);
		});
	});
});
