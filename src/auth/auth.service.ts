import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";
import { CreateUserForAuthDto } from "./dto/create-user-for-auth.dto";
import { Role } from "src/user/enum/user-role.enum";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	async signIn(email: string, pass: string): Promise<{ access_token: string }> {
		const user: User | null = await this.userService.findByEmail(email);

		if (!user || !user.isActive) {
			throw new UnauthorizedException("Invalid credentials or user inactive");
		}

		if (typeof user.password !== "string" || user.password.length === 0) {
			console.error(
				`User with email ${email} does not have a valid password set.`,
			);
			throw new UnauthorizedException("Invalid credentials");
		}

		const isPasswordMatching = await bcrypt.compare(pass, user.password);

		if (!isPasswordMatching) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const payload = {
			sub: user.id,
			name: user.name,
			roles: user.role ? [user.role.toString()] : [Role.USER.toString()],
		};
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}

	async register(registerDto: CreateUserForAuthDto): Promise<{
		access_token?: string;
		user: Omit<User, "password">;
	}> {
		const existingUser = await this.userService.findByEmail(registerDto.email);
		if (existingUser) {
			throw new ConflictException("Email already registered");
		}

		const newUser = await this.userService.create({
			email: registerDto.email,
			name: registerDto.name,
			password: registerDto.password,
			role: registerDto.role || Role.USER,
		});

		const payload = {
			sub: newUser.id,
			name: newUser.name,
			roles: newUser.role ? [newUser.role.toString()] : [Role.USER.toString()],
		};
		const accessToken = await this.jwtService.signAsync(payload);

		return {
			access_token: accessToken,
			user: newUser,
		};
	}
}
