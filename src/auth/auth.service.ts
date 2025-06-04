import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	async signIn(email: string, pass: string): Promise<{ access_token: string }> {
		const user = await this.userService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException("Invalid credentials");
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
		const payload = { sub: user.id, username: user.name };
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}

	async register(registerDto: {
		email: string;
		name: string;
		password: string;
	}): Promise<{ access_token?: string; user: any }> {
		const existingUser = await this.userService.findByEmail(registerDto.email);
		if (existingUser) {
			throw new ConflictException("Email already registered");
		}

		const newUser = await this.userService.create({
			email: registerDto.email,
			name: registerDto.name,
			password: registerDto.password,
		});

		const payload = { sub: newUser.id, username: newUser.name };
		const accessToken = await this.jwtService.signAsync(payload);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _unusedPassword, ...userResult } = newUser;

		return {
			access_token: accessToken,
			user: userResult,
		};
	}
}
