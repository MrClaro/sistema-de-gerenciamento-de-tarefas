import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { TaskModule } from "./task/task.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		UserModule,
		TaskModule,
		AuthModule,
		ConfigModule.forRoot({ isGlobal: true }),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
