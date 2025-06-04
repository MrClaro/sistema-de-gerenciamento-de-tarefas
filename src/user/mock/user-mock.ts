import { Role } from "@prisma/client";
import { CreateUserDto } from "../dto/create-user.dto";
import { ResponseUserDto } from "../dto/response-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

interface MockPrismaUser {
	id: string;
	name: string;
	email: string;
	password: string;
	role: Role;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const mockPrismaUser = (
	id: string,
	data: Partial<Omit<MockPrismaUser, "id" | "password">> & {
		password?: string;
	},
): MockPrismaUser => ({
	id,
	name: data.name || "Test User",
	email: data.email || "test@example.com",
	password: data.password || "defaultSecurePassword123",
	role: data.role || Role.USER,
	isActive: data.isActive === undefined ? true : data.isActive,
	createdAt: data.createdAt || new Date(),
	updatedAt: data.updatedAt || new Date(),
	...data,
});

export const defaultUserId = "default-mock-user-id";

export const mockUserResponse: ResponseUserDto = new ResponseUserDto(
	mockPrismaUser(defaultUserId, {
		name: "John Mock Doe",
		email: "john.mock@example.com",
		role: Role.USER,
		isActive: true,
	}),
);

export const mockAdminUserResponse: ResponseUserDto = new ResponseUserDto(
	mockPrismaUser("default-mock-admin-id", {
		name: "Admin Mock User",
		email: "admin.mock@example.com",
		role: Role.ADMIN,
		isActive: true,
	}),
);

export const mockUserArrayResponse: ResponseUserDto[] = [
	mockUserResponse,
	new ResponseUserDto(
		mockPrismaUser("another-mock-user-id", {
			name: "Jane Mock Doe",
			email: "jane.mock@example.com",
			role: Role.USER,
			isActive: true,
		}),
	),
	mockAdminUserResponse,
];

export const mockCreateUserDto: CreateUserDto = {
	name: "New Mock User",
	email: "new.mock@example.com",
	password: "password123",
};

export const mockUpdateUserDto: UpdateUserDto = {
	name: "Updated Mock Name",
	email: "updated.mock@example.com",
};

export const mockUserService = {
	findAll: jest.fn().mockResolvedValue(mockUserArrayResponse),
	findById: jest.fn().mockImplementation((id: string) => {
		if (id === defaultUserId) {
			return Promise.resolve(mockUserResponse);
		}
		if (id === "default-mock-admin-id") {
			return Promise.resolve(mockAdminUserResponse);
		}
		const found = mockUserArrayResponse.find((user) => user.id === id);
		return Promise.resolve(found || null);
	}),
	create: jest.fn().mockImplementation((dto: CreateUserDto) => {
		const newUserPrisma = mockPrismaUser(`new-id-${Date.now()}`, {
			...dto,
			isActive: true,
		});
		return Promise.resolve(new ResponseUserDto(newUserPrisma));
	}),
	update: jest.fn().mockImplementation((id: string, dto: UpdateUserDto) => {
		const baseUser = mockPrismaUser(id, {
			name: "Base User for Update",
			email: "base.update@example.com",
			role: Role.USER,
			isActive: true,
		});

		if (id === defaultUserId) {
			const updatedPrismaUser = {
				...baseUser,
				...dto,
				updatedAt: new Date(),
			};
			return Promise.resolve(
				new ResponseUserDto(updatedPrismaUser as MockPrismaUser),
			);
		}
		return Promise.resolve(null);
	}),
	softDeleteUser: jest.fn().mockImplementation((id: string) => {
		if (
			mockUserArrayResponse.some((user) => user.id === id) ||
			id === defaultUserId
		) {
			return Promise.resolve({ message: "User soft deleted successfully", id });
		}
		return Promise.resolve({
			message: "User not found or already deleted",
			id,
		});
	}),
};
