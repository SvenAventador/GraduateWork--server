export class UserDto {
    id: number;
    userName: string;
    userEmail: string;
    userRole: string;
    userFio: string | null;
    userAddress: string | null;
    userPhone: string | null;

    constructor(id: number,
                userName: string,
                userEmail: string,
                userRole: string,
                userFio: string | null = null,
                userAddress: string | null = null,
                userPhone: string | null = null) {
        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.userFio = userFio;
        this.userAddress = userAddress;
        this.userPhone = userPhone;
    }
}