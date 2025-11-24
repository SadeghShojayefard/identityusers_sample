
export type userEditType = {
    id: string,
    userName: string,
    email: string,
    emailConfirmed: boolean,
    concurrencyStamp: string,
    phoneNumber: string,
    phoneNumberConfirmed: boolean,
    accessFailedCount: number,
    name: string,
    roles: {
        roleId: string,
        roleName: string
    }[] | [],
    claims: {
        claimID: string,
        claimDescription: string
    }[] | []
} 