import { Role } from "src/user/enum/user-role.enum";

export class CurrentUserDto {
	userId: string;
	name: string;
	roles: Role[];

	constructor(partial: Partial<CurrentUserDto>) {
		Object.assign(this, partial);
	}
}
