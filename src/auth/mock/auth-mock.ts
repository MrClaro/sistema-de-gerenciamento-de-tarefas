import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { ResponseUserDto } from "../../user/dto/response-user.dto";
import { Role, User as PrismaUser } from "@prisma/client";
import { mockPrismaUser, defaultUserId } from "../../user/mock/user-mock";

export const mockLoginUserDto: LoginUserDto = {
	email: "test@example.com",
	password: "password123",
};

export const mockRegisterUserDto: RegisterUserDto = {
	email: "newuser@example.com",
	name: "New User",
	password: "newPassword123",
};

export const mockSignInResponse = {
	access_token: "mockGeneratedAccessTokenForSignIn",
};

const registeredPrismaUser = mockPrismaUser(defaultUserId, {
	name: mockRegisterUserDto.name,
	email: mockRegisterUserDto.email,
	role: Role.USER,
	isActive: true,
});

export const mockRegisteredUserResponseDto = new ResponseUserDto(
	registeredPrismaUser as PrismaUser,
);

export const mockRegisterServiceResponse = {
	access_token: "mockGeneratedAccessTokenForRegister",
	user: mockRegisteredUserResponseDto,
};

export const mockAuthService = {
	signIn: jest.fn().mockResolvedValue(mockSignInResponse),
	register: jest.fn().mockResolvedValue(mockRegisterServiceResponse),
};
