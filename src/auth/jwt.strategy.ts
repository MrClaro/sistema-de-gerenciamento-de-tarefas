import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

export interface JwtPayload {
	sub: string;
	name: string;
	roles?: string[];
	iat?: number;
	exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(config: ConfigService) {
		super({
			secretOrKey: config.getOrThrow("JWT_SECRET"),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
		});
	}

	async validate(payload: JwtPayload): Promise<any> {
		return {
			userId: payload.sub,
			name: payload.name,
			roles: payload.roles || [],
		};
	}
}
