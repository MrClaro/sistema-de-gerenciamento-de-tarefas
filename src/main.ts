import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ["error", "warn", "log", "debug"],
	});

	const config = new DocumentBuilder()
		.setTitle("Task Management System (To-Do API)")
		.setDescription(
			`A RESTful API for task management with authentication and authorization.
            
            Features:
            - User authentication with JWT
            - User management (create, update, list, delete)
            - Task management (create, update, list, delete)
            - Role-based access control (ADMIN and USER)
            
            Authentication:
            To access protected endpoints, include the JWT token in the request header:
            \`\`\`
            Authorization: Bearer your-jwt-token
            \`\`\`
            
            Task Statuses:
            - PENDING: Task is pending
            - COMPLETED: Task is completed
            
            Roles:
            - ADMIN: Full access to the system
            - USER: Limited access to their own tasks`,
		)
		.setVersion("1.0")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				name: "JWT",
				description: "Enter JWT token",
				in: "header",
			},
			"JWT-auth",
		)
		.addTag("Users", "Operations related to user management")
		.addTag("Tasks", "Operations related to task management")
		.addTag("Auth", "JWT authentication")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, documentFactory);

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	);
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
