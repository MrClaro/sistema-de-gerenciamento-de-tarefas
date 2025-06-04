import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user.service";
import { PrismaService } from "src/database/prisma.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { ResponseUserDto } from "../dto/response-user.dto";
import { Role, User as PrismaUser } from "@prisma/client";
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as bcrypt from "bcrypt";
import { mockPrismaUser, defaultUserId } from "../mock/user-mock";

jest.mock("bcrypt", () => ({
	hash: jest.fn(),
	compare: jest.fn(),
}));

describe("UserService", () => {
	let service: UserService;
	let prisma: PrismaService;

	const mockPrismaService = {
		user: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: PrismaService,
					useValue: mockPrismaService,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		prisma = module.get<PrismaService>(PrismaService);

		(bcrypt.hash as jest.Mock).mockReset();
		(bcrypt.compare as jest.Mock).mockReset();
		mockPrismaService.user.findMany.mockReset();
		mockPrismaService.user.findUnique.mockReset();
		mockPrismaService.user.create.mockReset();
		mockPrismaService.user.update.mockReset();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("findAll()", () => {
		it("should return an array of active users as ResponseUserDto", async () => {
			const userEntities: PrismaUser[] = [
				mockPrismaUser("1", { name: "User One", isActive: true }),
				mockPrismaUser("2", { name: "User Two", isActive: true }),
			];
			mockPrismaService.user.findMany.mockResolvedValue(userEntities);

			const result = await service.findAll();

			expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
				where: { isActive: true },
			});
			expect(result).toHaveLength(2);
			expect(result[0]).toBeInstanceOf(ResponseUserDto);
			expect(result[0].name).toEqual(userEntities[0].name);
			expect(result[1].name).toEqual(userEntities[1].name);
		});

		it("should return an empty array if no active users are found", async () => {
			mockPrismaService.user.findMany.mockResolvedValue([]);
			const result = await service.findAll();
			expect(result).toEqual([]);
		});
	});

	describe("findById()", () => {
		const userEntity = mockPrismaUser(defaultUserId, { name: "Found User" });

		it("should return a user as ResponseUserDto if found", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(userEntity);
			const result = await service.findById(defaultUserId);

			expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
				where: { id: defaultUserId },
			});
			expect(result).toBeInstanceOf(ResponseUserDto);
			expect(result.id).toEqual(defaultUserId);
			expect(result.name).toEqual(userEntity.name);
		});

		it("should throw NotFoundException if user is not found", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(null);
			await expect(service.findById(defaultUserId)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe("findByEmail()", () => {
		const userEmail = "testbyemail@example.com";
		const userEntity = mockPrismaUser("email-user-id", { email: userEmail });

		it("should return a user entity if found", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(userEntity);
			const result = await service.findByEmail(userEmail);

			expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
				where: { email: userEmail },
			});
			expect(result).toEqual(userEntity);
		});

		it("should return null if user is not found by email", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(null);
			const result = await service.findByEmail(userEmail);
			expect(result).toBeNull();
		});
	});

	describe("create()", () => {
		const createUserDto: CreateUserDto = {
			name: "New Service User",
			email: "newservice@example.com",
			password: "password123",
		};
		const hashedPassword = "hashedPasswordFromCreate";
		const createdUserEntity = mockPrismaUser("new-user-id-from-create", {
			name: createUserDto.name,
			email: createUserDto.email,
			password: hashedPassword,
			role: createUserDto.role,
		});

		beforeEach(() => {
			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
			mockPrismaService.user.create.mockResolvedValue(createdUserEntity);
		});

		it("should create a user and return ResponseUserDto", async () => {
			const dtoWithStringRole: CreateUserDto = {
				...createUserDto,
				role: "USER" as any,
			};
			const result = await service.create(dtoWithStringRole);

			expect(bcrypt.hash).toHaveBeenCalledWith(dtoWithStringRole.password, 10);
			expect(mockPrismaService.user.create).toHaveBeenCalledWith({
				data: {
					name: dtoWithStringRole.name,
					email: dtoWithStringRole.email,
					password: hashedPassword,
					role: Role.USER,
				},
			});
			expect(result).toBeInstanceOf(ResponseUserDto);
			expect(result.email).toEqual(dtoWithStringRole.email);
		});

		it("should create a user with default role if role is not provided in DTO", async () => {
			const dtoWithoutRole: CreateUserDto = {
				name: "No Role User",
				email: "norole@example.com",
				password: "password123",
			};
			const userEntityWithoutRolePrisma = mockPrismaUser("no-role-id", {
				...dtoWithoutRole,
				password: hashedPassword,
				role: Role.USER,
			});
			mockPrismaService.user.create.mockResolvedValue(
				userEntityWithoutRolePrisma,
			);

			const result = await service.create(dtoWithoutRole);

			expect(mockPrismaService.user.create).toHaveBeenCalledWith({
				data: {
					name: dtoWithoutRole.name,
					email: dtoWithoutRole.email,
					password: hashedPassword,
				},
			});
			expect(result.role).toEqual(Role.USER);
		});

		it("should throw BadRequestException for invalid role string", async () => {
			const dtoWithInvalidRole: CreateUserDto = {
				...createUserDto,
				role: "INVALID_ROLE" as any,
			};
			await expect(service.create(dtoWithInvalidRole)).rejects.toThrow(
				new BadRequestException(`Invalid role value: INVALID_ROLE`),
			);
		});

		it("should throw ConflictException if email already exists (P2002)", async () => {
			const error = new PrismaClientKnownRequestError("User creation failed", {
				code: "P2002",
				clientVersion: "x.y.z",
				meta: { target: ["email"] },
			});
			mockPrismaService.user.create.mockRejectedValue(error);

			await expect(service.create(createUserDto)).rejects.toThrow(
				new ConflictException(
					"User with the provided fields already exists: email",
				),
			);
		});
	});

	describe("update()", () => {
		const existingUserEntity = mockPrismaUser(defaultUserId, {
			name: "Old Name",
			password: "oldHashedPasswordFromDb",
		});

		beforeEach(() => {
			mockPrismaService.user.findUnique.mockResolvedValue(existingUserEntity);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			(bcrypt.hash as jest.Mock).mockResolvedValue(
				"newHashedPasswordFromUpdate",
			);
			mockPrismaService.user.update.mockImplementation((args) => {
				return Promise.resolve(
					mockPrismaUser(args.where.id, {
						...existingUserEntity,
						...args.data,
					}),
				);
			});
		});

		it("should throw NotFoundException if user to update is not found", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(null);
			const updateUserDto: UpdateUserDto = { name: "Any Name" };
			await expect(
				service.update(defaultUserId, updateUserDto),
			).rejects.toThrow(NotFoundException);
		});

		it("should update user name and return ResponseUserDto (no password change)", async () => {
			const updateUserDto: UpdateUserDto = { name: "New Updated Name" };
			const expectedUpdatedEntity = mockPrismaUser(defaultUserId, {
				...existingUserEntity,
				name: "New Updated Name",
			});
			mockPrismaService.user.update.mockResolvedValue(expectedUpdatedEntity);

			const result = await service.update(defaultUserId, updateUserDto);

			expect(mockPrismaService.user.update).toHaveBeenCalledWith({
				where: { id: defaultUserId },
				data: { name: "New Updated Name" },
			});
			expect(result).toBeInstanceOf(ResponseUserDto);
			expect(result.name).toEqual("New Updated Name");
		});

		it("should update password if newPassword and valid currentPassword are provided", async () => {
			const updateUserDto: UpdateUserDto = {
				currentPassword: "oldPlainPassword",
				newPassword: "newPlainPassword123",
			};
			const expectedUpdatedEntity = mockPrismaUser(defaultUserId, {
				...existingUserEntity,
				password: "newHashedPasswordFromUpdate",
			});
			mockPrismaService.user.update.mockResolvedValue(expectedUpdatedEntity);

			const result = await service.update(defaultUserId, updateUserDto);

			expect(bcrypt.compare).toHaveBeenCalledWith(
				"oldPlainPassword",
				existingUserEntity.password,
			);
			expect(bcrypt.hash).toHaveBeenCalledWith("newPlainPassword123", 10);
			expect(mockPrismaService.user.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { password: "newHashedPasswordFromUpdate" },
				}),
			);
			expect(result.id).toBe(defaultUserId);
		});

		it("should throw BadRequestException if newPassword is provided without currentPassword", async () => {
			const updateUserDto: UpdateUserDto = { newPassword: "newPassword123" };
			await expect(
				service.update(defaultUserId, updateUserDto),
			).rejects.toThrow(
				new BadRequestException(
					"Current password is required to set a new password.",
				),
			);
		});

		it("should throw BadRequestException if currentPassword check is required but currentPassword is not provided", async () => {
			const updateUserDto: UpdateUserDto = { newPassword: "someNewPassword" };
			await expect(
				service.update(defaultUserId, updateUserDto),
			).rejects.toThrow(
				new BadRequestException(
					"Current password is required to set a new password.",
				),
			);
		});

		it("should throw BadRequestException if currentPassword is provided for other updates but is invalid", async () => {
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);
			const updateUserDto: UpdateUserDto = {
				name: "Another Name",
				currentPassword: "wrongOldPassword",
			};
			await expect(
				service.update(defaultUserId, updateUserDto),
			).rejects.toThrow(new BadRequestException("Invalid current password."));
		});

		it("should return existing user if UpdateUserDto is empty and no password change logic is triggered", async () => {
			const updateUserDto: UpdateUserDto = {};
			const result = await service.update(defaultUserId, updateUserDto);

			expect(mockPrismaService.user.update).not.toHaveBeenCalled();
			expect(result).toBeInstanceOf(ResponseUserDto);
			expect(result.id).toEqual(existingUserEntity.id);
			expect(result.name).toEqual(existingUserEntity.name);
		});
	});

	describe("softDeleteUser()", () => {
		const activeUserEntity = mockPrismaUser(defaultUserId, { isActive: true });
		const inactiveUserEntity = mockPrismaUser(defaultUserId, {
			isActive: false,
		});

		it("should soft delete an active user and return ResponseUserDto", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(activeUserEntity);
			const expectedSoftDeletedEntity = mockPrismaUser(defaultUserId, {
				...activeUserEntity,
				isActive: false,
			});
			mockPrismaService.user.update.mockResolvedValue(
				expectedSoftDeletedEntity,
			);

			const result = await service.softDeleteUser(defaultUserId);

			expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
				where: { id: defaultUserId },
			});
			expect(mockPrismaService.user.update).toHaveBeenCalledWith({
				where: { id: defaultUserId },
				data: { isActive: false },
			});
			expect(result).toBeInstanceOf(ResponseUserDto);
			expect(result.isActive).toBe(false);
		});

		it("should throw NotFoundException if user to delete is not found", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(null);
			await expect(service.softDeleteUser(defaultUserId)).rejects.toThrow(
				NotFoundException,
			);
		});

		it("should throw BadRequestException if user is already inactive", async () => {
			mockPrismaService.user.findUnique.mockResolvedValue(inactiveUserEntity);
			await expect(service.softDeleteUser(defaultUserId)).rejects.toThrow(
				new BadRequestException(
					`User with ID "${defaultUserId}" is already inactive.`,
				),
			);
		});
	});
});
