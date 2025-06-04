export class CurrentUserDto {
	userId: string;
	name: string;

	constructor(partial: Partial<CurrentUserDto>) {
		Object.assign(this, partial);
	}
}
