export class UserDto {
    id: number;
    userName: string;
    userEmail: string;
    userRole: string;

    constructor(id: number,
                userName: string,
                userEmail: string,
                userRole: string) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userRole = userRole;
    }
}