import {
	Body,
	Controller,
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

@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll() {
		return await this.userService.findAll();
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard)
	async findById(@Param("id") userId: string) {
		return await this.userService.findById(userId);
	}

	@Post()
	async create(@Body() data: CreateUserDto) {
		return await this.userService.create(data);
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	async update(@Param("id") userId: string, @Body() data: UpdateUserDto) {
		return await this.userService.update(userId, data);
	}
}
