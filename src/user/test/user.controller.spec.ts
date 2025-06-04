import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../user.controller";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { ResponseUserDto } from "../dto/response-user.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import {
	mockUserService,
	mockUserResponse,
	mockUserArrayResponse,
	defaultUserId,
} from "../mock/UserMock";
import { UserService } from "../user.service";
import { Role } from "../enum/user-role.enum";

describe("UserController", () => {
	let controller: UserController;
	let service: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: mockUserService,
				},
			],
		})
			.overrideGuard(JwtAuthGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<UserController>(UserController);
		service = module.get<UserService>(UserService);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("findAll()", () => {
		it("should call userService.findAll and return an array of users", async () => {
			const result = await controller.findAll();
			expect(service.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockUserArrayResponse);
			expect(result.length).toBe(mockUserArrayResponse.length);
			if (result.length > 0) {
				expect(result[0]).toBeInstanceOf(ResponseUserDto);
			}
		});
	});

	describe("findById(:id)", () => {
		it("should call userService.findById with the correct id and return a user", async () => {
			const result = await controller.findById(defaultUserId);
			expect(service.findById).toHaveBeenCalledWith(defaultUserId);
			expect(result).toEqual(mockUserResponse);
			expect(result).toBeInstanceOf(ResponseUserDto);
		});

		it("should return null if userService.findById returns null", async () => {
			const nonExistentId = "non-existent-uuid";
			const result = await controller.findById(nonExistentId);
			expect(service.findById).toHaveBeenCalledWith(nonExistentId);
			expect(result).toBeNull();
		});
	});

	describe("create()", () => {
		it("should call userService.create with the correct data and return the created user", async () => {
			const createUserDto: CreateUserDto = {
				name: "New User From Test",
				email: "newuser.test@example.com",
				password: "passwordTest123",
				role: Role.USER,
			};
			const result = await controller.create(createUserDto);
			expect(service.create).toHaveBeenCalledWith(createUserDto);
			expect(result).toBeInstanceOf(ResponseUserDto);
			expect(result.email).toEqual(createUserDto.email);
		});
	});

	describe("update(:id)", () => {
		it("should call userService.update with the correct id and data, and return the updated user", async () => {
			const updateUserDto: UpdateUserDto = {
				name: "Updated Name From Test",
			};
			const result = await controller.update(defaultUserId, updateUserDto);
			expect(service.update).toHaveBeenCalledWith(defaultUserId, updateUserDto);
			expect(result).toBeInstanceOf(ResponseUserDto);
			expect(result.name).toEqual(updateUserDto.name);
		});
	});

	describe("softDelete(:id)", () => {
		it("should call userService.softDeleteUser with the correct id and return a success message", async () => {
			const expectedResponse = {
				message: "User soft deleted successfully",
				id: defaultUserId,
			};
			mockUserService.softDeleteUser.mockResolvedValueOnce(expectedResponse);

			const result = await controller.softDelete(defaultUserId);
			expect(service.softDeleteUser).toHaveBeenCalledWith(defaultUserId);
			expect(result).toEqual(expectedResponse);
		});

		it("should have Roles decorator for ADMIN on softDelete method", () => {
			const classRoles = Reflect.getMetadata(
				"roles",
				UserController.prototype.softDelete,
			);
			expect(classRoles).toEqual(["ADMIN"]);
		});
	});
});
