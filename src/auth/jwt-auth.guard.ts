import {
	ExecutionContext,
	Injectable,
	ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ROLES_KEY } from "./decorator/roles.decorator";

interface UserWithRoles {
	roles: string[];
	userId: string;
	name: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const canActivateBase = await super.canActivate(context);
		if (!canActivateBase) {
			return false;
		}

		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user as UserWithRoles;

		if (!user || !user.roles || !Array.isArray(user.roles)) {
			throw new ForbiddenException(
				"User roles are missing or improperly formatted in the token payload.",
			);
		}

		const userRoles: string[] = user.roles;
		const hasRequiredRole = requiredRoles.some((role) =>
			userRoles.includes(role),
		);

		if (hasRequiredRole) {
			return true;
		} else {
			throw new ForbiddenException(
				"You do not have permission to access this resource.",
			);
		}
	}
}
