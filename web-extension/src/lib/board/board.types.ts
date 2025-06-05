export type BoardResponse = {
    id: string,
    name: string,
    description: string | null,
    owner_id: string,
    is_default: boolean,
    created_at: string,
    updated_at: string,
};
