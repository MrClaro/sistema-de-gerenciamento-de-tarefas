import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { PrismaService } from "src/database/prisma.service";
import { Role, Prisma } from "@prisma/client";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UserResponseDto } from "./dto/response-user.dto";

import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findById(id: string): Promise<UserResponseDto> {
		const userEntity = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!userEntity) {
			throw new NotFoundException(`User with ID "${id}" not found`);
		}
		return new UserResponseDto(userEntity);
	}

	async findAll(): Promise<UserResponseDto[]> {
		const userEntities = await this.prisma.user.findMany({
			where: {
				isActive: true,
			},
		});
		return userEntities.map((userEntity) => new UserResponseDto(userEntity));
	}

	async create(data: CreateUserDto): Promise<UserResponseDto> {
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
			return new UserResponseDto(createdUser);
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

	//TODO: Modularizar esse update
	async update(userId: string, data: UpdateUserDto): Promise<UserResponseDto> {
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
			return new UserResponseDto(existingUser);
		}

		try {
			const updatedUserEntity = await this.prisma.user.update({
				where: { id: userId },
				data: prismaUpdateData,
			});
			return new UserResponseDto(updatedUserEntity);
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
}
