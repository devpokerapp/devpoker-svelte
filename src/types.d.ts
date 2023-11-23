/**
 * Models
 */
interface Model {
    id: string;
    createdAt: string;
    updatedAt: string;
}

interface Poker extends Model {
    creator: string;
    currentStoryId?: string;
    stories: Story[];
    participants: Participant[];
}

interface Story extends Model {
    name: string;
    description?: string;
    value?: string;
    pokerId: string;
    events: PokerEvent[];
}

interface Participant extends Model {
    name: string;
    pokerId: string;
    sid: string;
}

interface PokerEvent extends Model {
    type: "vote" | "comment" | "action";
    content: string;
    creator: string;
    revealed: boolean;
    storyId: string;
}

/**
 * DTOs
 */
interface QueryRead<T> {
    items: T[];
    metadata: {
        filters: [];
    }
}

interface PokerContext {
    poker: Poker;
    stories: Story[];
    participants: Participant[];
}
