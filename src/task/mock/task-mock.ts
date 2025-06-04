import { Task, TaskStatus } from "@prisma/client";
import { CreateTaskDto } from "../dto/create-task.dto";
import { ResponseTaskDto } from "../dto/response-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { TaskStatusEnum } from "../enum/task-status.enum";
import { defaultUserId } from "../../user/mock/user-mock";

interface MockPrismaTask {
	id: string;
	title: string;
	description: string | null;
	status: TaskStatus;
	dueDate: Date | null;
	userId: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const mockPrismaTask = (
	id: string,
	data: Partial<Omit<MockPrismaTask, "id">> & { userId?: string },
): MockPrismaTask => ({
	id,
	title: data.title || "Sample Task Title",
	description:
		data.description === undefined
			? "Sample task description."
			: data.description,
	status: data.status || (TaskStatusEnum.PENDING as unknown as TaskStatus),
	dueDate:
		data.dueDate === undefined
			? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
			: data.dueDate,
	userId: data.userId || defaultUserId,
	isActive: data.isActive === undefined ? true : data.isActive,
	createdAt: data.createdAt || new Date(),
	updatedAt: data.updatedAt || new Date(),
	...data,
});

export const defaultTaskId = "default-mock-task-id";
export const anotherTaskId = "another-mock-task-id";

export const mockTaskResponse: ResponseTaskDto = new ResponseTaskDto(
	mockPrismaTask(defaultTaskId, {
		title: "Complete Project Proposal",
		description:
			"Draft and finalize the project proposal document for client review.",
		status: TaskStatusEnum.PENDING as unknown as TaskStatus,
		dueDate: new Date("2025-07-15T00:00:00Z"),
		userId: defaultUserId,
	}) as Task,
);

export const mockAnotherTaskResponse: ResponseTaskDto = new ResponseTaskDto(
	mockPrismaTask(anotherTaskId, {
		title: "Setup Development Environment",
		description:
			"Install all necessary tools and configure the local development server.",
		status: TaskStatusEnum.PENDING as unknown as TaskStatus,
		dueDate: new Date("2025-06-10T00:00:00Z"),
		userId: defaultUserId,
	}) as Task,
);

export const mockTaskArrayResponse: ResponseTaskDto[] = [
	mockTaskResponse,
	mockAnotherTaskResponse,
	new ResponseTaskDto(
		mockPrismaTask("completed-task-id", {
			title: "Review Pull Request",
			description: "Review PR #42 for the new feature.",
			status: TaskStatusEnum.COMPLETED as unknown as TaskStatus,
			dueDate: new Date("2025-06-01T00:00:00Z"),
			isActive: false,
			userId: defaultUserId,
		}) as Task,
	),
];

export const mockCreateTaskDto: CreateTaskDto = {
	title: "New Mock Task",
	description: "This is a task created for mocking purposes.",
	dueDate: new Date("2025-08-01T00:00:00Z"),
};

export const mockUpdateTaskDto: UpdateTaskDto = {
	title: "Updated Mock Task Title",
	description: "Updated description for the mock task.",
	status: TaskStatusEnum.COMPLETED,
	dueDate: new Date("2025-08-15T00:00:00Z"),
};

export const mockTaskService = {
	findAll: jest.fn().mockImplementation((userId: string) => {
		const tasks = mockTaskArrayResponse.filter(
			(task) => task.userId === userId,
		);
		return Promise.resolve(tasks);
	}),
	findByStatus: jest
		.fn()
		.mockImplementation((status: TaskStatusEnum, userId: string) => {
			const tasks = mockTaskArrayResponse.filter(
				(task) => task.status === status && task.userId === userId,
			);
			return Promise.resolve(tasks);
		}),
	findById: jest.fn().mockImplementation((id: string, userId: string) => {
		const found = mockTaskArrayResponse.find(
			(task) => task.id === id && task.userId === userId,
		);
		return Promise.resolve(found || null);
	}),
	createTask: jest
		.fn()
		.mockImplementation((dto: CreateTaskDto, userId: string) => {
			const newPrismaTaskData = mockPrismaTask(`new-task-id-${Date.now()}`, {
				...dto,
				userId,
				status: TaskStatusEnum.PENDING as unknown as TaskStatus,
				isActive: true,
			});
			return Promise.resolve(new ResponseTaskDto(newPrismaTaskData as Task));
		}),
	updateTask: jest
		.fn()
		.mockImplementation((id: string, dto: UpdateTaskDto, userId: string) => {
			const taskIndex = mockTaskArrayResponse.findIndex(
				(task) => task.id === id && task.userId === userId,
			);
			if (taskIndex === -1) {
				return Promise.resolve(null);
			}

			const existingTaskAsPrisma = mockPrismaTask(
				mockTaskArrayResponse[taskIndex].id,
				{
					title: mockTaskArrayResponse[taskIndex].title,
					description: mockTaskArrayResponse[taskIndex].description,
					status: mockTaskArrayResponse[taskIndex]
						.status as unknown as TaskStatus,
					dueDate: mockTaskArrayResponse[taskIndex].dueDate,
					userId: mockTaskArrayResponse[taskIndex].userId,
					isActive: mockTaskArrayResponse[taskIndex].isActive,
					createdAt: mockTaskArrayResponse[taskIndex].createdAt,
					updatedAt: mockTaskArrayResponse[taskIndex].updatedAt,
				},
			);

			const updatedPrismaData = {
				...existingTaskAsPrisma,
				...dto,
				status: dto.status
					? (dto.status as unknown as TaskStatus)
					: existingTaskAsPrisma.status,
				updatedAt: new Date(),
			};
			return Promise.resolve(new ResponseTaskDto(updatedPrismaData as Task));
		}),
	softDeleteTask: jest.fn().mockImplementation((id: string, userId: string) => {
		const taskExists = mockTaskArrayResponse.some(
			(task) => task.id === id && task.userId === userId && task.isActive,
		);
		if (taskExists) {
			return Promise.resolve({ message: "Task soft deleted successfully", id });
		}
		return Promise.resolve({
			message: "Task not found or already deleted",
			id,
		});
	}),
};
