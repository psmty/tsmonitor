export type AttributeData = {
    id: number;
    name: string;
    type: 'string' | 'number' | 'selection';
    members?: string[];
    allow_new_members: boolean;
}