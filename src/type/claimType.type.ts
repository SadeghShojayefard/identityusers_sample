export type claimType = {
    id: string;
    claimType: string;
    claimValue: string;
    description: string;

};

export type roleType = {
    id: string;
    name: string;
    description: string;
    concurrencyStamp: string;
    claims: claimType[] | [];
};
