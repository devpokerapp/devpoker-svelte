interface Model {
    id: string;
    created_at: string;
    updated_at: string;
}

interface Poker extends Model {
    creator: string;
    current_story_id?: string;
}
