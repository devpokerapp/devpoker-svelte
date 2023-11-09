interface Model {
    id: string;
    createdAt: string;
    updatedAt: string;
}

interface Poker extends Model {
    creator: string;
    currentStoryId?: string;
}

interface Story extends Model {
    name: string;
    description?: string;
    value?: string;
    pokerId: string;
}
