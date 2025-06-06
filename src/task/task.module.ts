import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { PrismaService } from "src/database/prisma.service";

@Module({
	providers: [TaskService, PrismaService],
	controllers: [TaskController],
})
export class TaskModule {}
