import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Roles } from "src/auth/decorator/roles.decorator";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Users")
@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiBearerAuth("JWT-auth")
	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll() {
		return await this.userService.findAll();
	}

	@ApiBearerAuth("JWT-auth")
	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async findById(@Param("id") userId: string) {
		return await this.userService.findById(userId);
	}

	@Post()
	async create(@Body() data: CreateUserDto) {
		return await this.userService.create(data);
	}

	@ApiBearerAuth("JWT-auth")
	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	async update(@Param("id") userId: string, @Body() data: UpdateUserDto) {
		return await this.userService.update(userId, data);
	}

	@ApiBearerAuth("JWT-auth")
	@Delete(":id")
	@Roles("ADMIN")
	@UseGuards(JwtAuthGuard)
	async softDelete(@Param("id") userId: string) {
		return await this.userService.softDeleteUser(userId);
	}
}
