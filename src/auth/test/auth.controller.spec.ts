import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import {
	mockAuthService,
	mockLoginUserDto,
	mockRegisterUserDto,
	mockSignInResponse,
	mockRegisterServiceResponse,
} from "../mock/auth-mock";

describe("AuthController", () => {
	let controller: AuthController;
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockAuthService,
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
		service = module.get<AuthService>(AuthService);
		jest.clearAllMocks();
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("signIn()", () => {
		it("should call authService.signIn with email and password and return an access token", async () => {
			const result = await controller.signIn(mockLoginUserDto);

			expect(service.signIn).toHaveBeenCalledWith(
				mockLoginUserDto.email,
				mockLoginUserDto.password,
			);
			expect(result).toEqual(mockSignInResponse);
		});
	});

	describe("register()", () => {
		it("should call authService.register with the register DTO and return the registered user data with token", async () => {
			const result = await controller.register(mockRegisterUserDto);

			expect(service.register).toHaveBeenCalledWith(mockRegisterUserDto);
			expect(result).toEqual(mockRegisterServiceResponse);
		});
	});
});
