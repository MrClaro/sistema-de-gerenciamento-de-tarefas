import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post("login")
	signIn(@Body() signInDto: LoginUserDto) {
		return this.authService.signIn(signInDto.email, signInDto.password);
	}
	@Post("register")
	register(@Body() registerDto: RegisterUserDto) {
		return this.authService.register(registerDto);
	}
}
