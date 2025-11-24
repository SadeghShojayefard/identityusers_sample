export type DetailModalType = {
    title: string;
    children: React.ReactNode;
    action: {
        action: (id: string) => void,
        onSuccess: () => void;
        data: string;
    } | null;
};