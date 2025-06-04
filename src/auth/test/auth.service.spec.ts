import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { UserService } from "../../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Role, User as PrismaUser } from "@prisma/client";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { mockPrismaUser, defaultUserId } from "../../user/mock/user-mock";
import { ResponseUserDto } from "../../user/dto/response-user.dto";
import { CreateUserForAuthDto } from "../dto/create-user-for-auth.dto";

jest.mock("bcrypt", () => ({
	hash: jest.fn(),
	compare: jest.fn(),
}));

describe("AuthService", () => {
	let service: AuthService;
	let userService: UserService;
	let jwtService: JwtService;

	const mockUserService = {
		findByEmail: jest.fn(),
		create: jest.fn(),
	};

	const mockJwtService = {
		signAsync: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserService,
					useValue: mockUserService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		userService = module.get<UserService>(UserService);
		jwtService = module.get<JwtService>(JwtService);

		(bcrypt.compare as jest.Mock).mockReset();
		(bcrypt.hash as jest.Mock).mockReset();
		mockUserService.findByEmail.mockReset();
		mockUserService.create.mockReset();
		mockJwtService.signAsync.mockReset();
		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		(console.error as jest.Mock).mockRestore();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("signIn()", () => {
		const email = "test@example.com";
		const password = "password123";
		const validHashedPassword = "hashedPassword";

		const mockValidUser: PrismaUser = {
			id: defaultUserId,
			email: email,
			password: validHashedPassword,
			isActive: true,
			role: Role.USER,
			name: "Test User",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const mockInactiveUser: PrismaUser = {
			...mockValidUser,
			id: "inactive-user-id",
			isActive: false,
		};
		const mockAccessToken = "mock.access.token";

		it("should return an access token if credentials are valid and user is active", async () => {
			mockUserService.findByEmail.mockResolvedValue(mockValidUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

			const result = await service.signIn(email, password);

			expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
			expect(bcrypt.compare).toHaveBeenCalledWith(
				password,
				mockValidUser.password,
			);
			expect(mockJwtService.signAsync).toHaveBeenCalledWith({
				sub: mockValidUser.id,
				name: mockValidUser.name,
				roles: [mockValidUser.role.toString()],
			});
			expect(result).toEqual({ access_token: mockAccessToken });
		});

		it("should throw UnauthorizedException if user is not found", async () => {
			mockUserService.findByEmail.mockResolvedValue(null);
			await expect(service.signIn(email, password)).rejects.toThrow(
				new UnauthorizedException("Invalid credentials or user inactive"),
			);
		});

		it("should throw UnauthorizedException if user is inactive", async () => {
			mockUserService.findByEmail.mockResolvedValue(mockInactiveUser);
			await expect(service.signIn(email, password)).rejects.toThrow(
				new UnauthorizedException("Invalid credentials or user inactive"),
			);
		});

		it("should throw UnauthorizedException if user password is not a string", async () => {
			const userWithInvalidPasswordType: PrismaUser = {
				...mockValidUser,
				password: null as any,
			};
			mockUserService.findByEmail.mockResolvedValue(
				userWithInvalidPasswordType,
			);
			await expect(service.signIn(email, password)).rejects.toThrow(
				new UnauthorizedException("Invalid credentials"),
			);
			expect(console.error).toHaveBeenCalledWith(
				`User with email ${email} does not have a valid password set.`,
			);
		});

		it("should throw UnauthorizedException if user password is an empty string", async () => {
			const userWithEmptyPassword: PrismaUser = {
				...mockValidUser,
				password: "",
			};
			mockUserService.findByEmail.mockResolvedValue(userWithEmptyPassword);
			await expect(service.signIn(email, password)).rejects.toThrow(
				new UnauthorizedException("Invalid credentials"),
			);
			expect(console.error).toHaveBeenCalledWith(
				`User with email ${email} does not have a valid password set.`,
			);
		});

		it("should throw UnauthorizedException if password does not match", async () => {
			mockUserService.findByEmail.mockResolvedValue(mockValidUser);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);
			await expect(service.signIn(email, password)).rejects.toThrow(
				new UnauthorizedException("Invalid credentials"),
			);
		});
	});

	describe("register()", () => {
		const registerDto: CreateUserForAuthDto = {
			name: "New Registered User",
			email: "register@example.com",
			password: "password123",
		};

		const createdUserPrismaEntity = mockPrismaUser("new-registered-user-id", {
			name: registerDto.name,
			email: registerDto.email,
			role: registerDto.role,
			isActive: true,
		});
		const createdUserResponseDto = new ResponseUserDto(
			createdUserPrismaEntity as PrismaUser,
		);

		const mockAccessToken = "mock.registration.token";

		it("should register a new user, return user data and access token", async () => {
			mockUserService.findByEmail.mockResolvedValue(null);
			mockUserService.create.mockResolvedValue(createdUserResponseDto);
			mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

			const result = await service.register(registerDto);

			expect(mockUserService.findByEmail).toHaveBeenCalledWith(
				registerDto.email,
			);
			expect(mockUserService.create).toHaveBeenCalledWith({
				email: registerDto.email,
				name: registerDto.name,
				password: registerDto.password,
				role: registerDto.role || Role.USER,
			});
			expect(mockJwtService.signAsync).toHaveBeenCalledWith({
				sub: createdUserResponseDto.id,
				name: createdUserResponseDto.name,
				roles: createdUserResponseDto.role
					? [createdUserResponseDto.role.toString()]
					: [Role.USER.toString()],
			});
			expect(result).toEqual({
				access_token: mockAccessToken,
				user: createdUserResponseDto,
			});
		});

		it("should register a new user with default role if role is not provided in DTO", async () => {
			const dtoWithoutRole: CreateUserForAuthDto = {
				name: "New User No Role",
				email: "register.norole@example.com",
				password: "password123",
			};
			const userEntityWithDefaultRole = mockPrismaUser("new-user-no-role-id", {
				name: dtoWithoutRole.name,
				email: dtoWithoutRole.email,
				role: Role.USER,
				isActive: true,
			});
			const userResponseWithDefaultRole = new ResponseUserDto(
				userEntityWithDefaultRole as PrismaUser,
			);

			mockUserService.findByEmail.mockResolvedValue(null);
			mockUserService.create.mockResolvedValue(userResponseWithDefaultRole);
			mockJwtService.signAsync.mockResolvedValue(mockAccessToken);

			const result = await service.register(dtoWithoutRole);

			expect(mockUserService.create).toHaveBeenCalledWith({
				email: dtoWithoutRole.email,
				name: dtoWithoutRole.name,
				password: dtoWithoutRole.password,
				role: Role.USER,
			});
			expect(mockJwtService.signAsync).toHaveBeenCalledWith({
				sub: userResponseWithDefaultRole.id,
				name: userResponseWithDefaultRole.name,
				roles: userResponseWithDefaultRole.role
					? [userResponseWithDefaultRole.role.toString()]
					: [Role.USER.toString()],
			});
			expect(result.user.role).toEqual(Role.USER);
		});

		it("should throw ConflictException if email already exists", async () => {
			mockUserService.findByEmail.mockResolvedValue(
				createdUserPrismaEntity as PrismaUser,
			);
			await expect(service.register(registerDto)).rejects.toThrow(
				new ConflictException("Email already registered"),
			);
		});
	});
});
