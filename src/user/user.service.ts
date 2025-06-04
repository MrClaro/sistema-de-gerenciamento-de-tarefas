import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "src/database/prisma.service";
import { Role, Prisma, User } from "@prisma/client";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ResponseUserDto } from "./dto/response-user.dto";

import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	// Find all active users
	async findAll(): Promise<ResponseUserDto[]> {
		const userEntities = await this.prisma.user.findMany({
			where: {
				isActive: true,
			},
		});
		return userEntities.map((userEntity) => new ResponseUserDto(userEntity));
	}

	// Find one user by ID
	async findById(id: string): Promise<ResponseUserDto> {
		const userEntity = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!userEntity) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}
		return new ResponseUserDto(userEntity);
	}

	async findByEmail(email: string): Promise<User | null> {
		const userEntity = await this.prisma.user.findUnique({
			where: { email },
		});
		return userEntity;
	}

	// Create a new user
	async create(data: CreateUserDto): Promise<ResponseUserDto> {
		const { role: roleString, password: plainPassword, ...userData } = data;

		const hashedPassword = await bcrypt.hash(plainPassword, 10);

		const prismaCreateData: Prisma.UserCreateInput = {
			...userData,
			password: hashedPassword,
		};

		if (roleString) {
			const roleEnumValue = Role[roleString.toUpperCase() as keyof typeof Role];
			if (!roleEnumValue) {
				throw new BadRequestException(`Invalid role value: ${roleString}`);
			}
			prismaCreateData.role = roleEnumValue;
		}

		try {
			const createdUser = await this.prisma.user.create({
				data: prismaCreateData,
			});
			return new ResponseUserDto(createdUser);
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				const fields = (error.meta?.target as string[])?.join(", ");
				throw new ConflictException(
					`User with the provided fields already exists: ${fields}`,
				);
			}
			throw error;
		}
	}

	// Update an existing user
	async update(userId: string, data: UpdateUserDto): Promise<ResponseUserDto> {
		const existingUser = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			throw new NotFoundException(`User with ID "${userId}" not found`);
		}

		const {
			currentPassword,
			newPassword,
			role: roleString,
			name,
			email,
			isActive,
		} = data;

		const prismaUpdateData: Prisma.UserUpdateInput = {};
		let requireCurrentPasswordCheck = false;

		if (newPassword) {
			requireCurrentPasswordCheck = true;
			if (!currentPassword) {
				throw new BadRequestException(
					"Current password is required to set a new password.",
				);
			}
		} else if (
			currentPassword &&
			(name !== undefined ||
				email !== undefined ||
				isActive !== undefined ||
				roleString !== undefined)
		) {
			requireCurrentPasswordCheck = true;
		}

		if (requireCurrentPasswordCheck) {
			if (!currentPassword) {
				throw new BadRequestException(
					"Current password is required to perform this update.",
				);
			}
			const isPasswordValid = await bcrypt.compare(
				currentPassword,
				existingUser.password,
			);
			if (!isPasswordValid) {
				throw new BadRequestException("Invalid current password.");
			}
		}

		if (name !== undefined) prismaUpdateData.name = name;
		if (email !== undefined) prismaUpdateData.email = email;
		if (isActive !== undefined) prismaUpdateData.isActive = isActive;

		if (newPassword) {
			prismaUpdateData.password = await bcrypt.hash(newPassword, 10);
		}

		if (roleString) {
			const roleEnumValue = Role[roleString.toUpperCase() as keyof typeof Role];
			if (!roleEnumValue) {
				throw new BadRequestException(
					`Invalid role value: ${roleString}. Must be USER or ADMIN.`,
				);
			}
			prismaUpdateData.role = roleEnumValue;
		}

		if (Object.keys(prismaUpdateData).length === 0) {
			return new ResponseUserDto(existingUser);
		}

		try {
			const updatedUserEntity = await this.prisma.user.update({
				where: { id: userId },
				data: prismaUpdateData,
			});
			return new ResponseUserDto(updatedUserEntity);
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				const fields = (error.meta?.target as string[])?.join(", ");
				throw new ConflictException(
					`User with the provided fields already exists: ${fields}`,
				);
			}
			throw error;
		}
	}

	// Soft delete a user
	async softDeleteUser(userIdToDelete: string): Promise<ResponseUserDto> {
		const user = await this.prisma.user.findUnique({
			where: { id: userIdToDelete },
		});

		if (!user) {
			throw new NotFoundException(
				`User with ID "${userIdToDelete}" not found.`,
			);
		}

		if (!user.isActive) {
			throw new BadRequestException(
				`User with ID "${userIdToDelete}" is already inactive.`,
			);
		}

		const updatedUser = await this.prisma.user.update({
			where: { id: userIdToDelete },
			data: { isActive: false },
		});

		return new ResponseUserDto(updatedUser);
	}
}
