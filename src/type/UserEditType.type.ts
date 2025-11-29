export type userEditType = {
    id: string,
    username: string,
    name: string,
    email: string,
    emailConfirmed: boolean,
    concurrencyStamp: string,
    phoneNumber: string,
    phoneNumberConfirmed: boolean,
    accessFailedCount: number,
    avatar: string,
    securityStamp: string,
    password: string,
    roles: {
        roleId: string,
        roleName: string
    }[] | [],
    claims: {
        claimID: string,
        claimDescription: string
    }[] | []
}




