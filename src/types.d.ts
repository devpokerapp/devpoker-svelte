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

interface Participant extends Model {
    name: string;
    pokerId: string;
    sid: string;
}
