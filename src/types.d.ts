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
    votePattern: string;
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
    pollings: Polling[];
}

interface Participant extends Model {
    name: string;
    pokerId: string;
    sid: string;
}

interface PokerEvent extends Model {
    type: "vote" | "comment" | "action" | "complete" | "restart";
    content: string;
    creator: string;
    revealed: boolean;
    storyId: string;
}

interface Polling extends Model {
    value?: string;
    completed: boolean;
    revealed: boolean;
    storyId: string;
    votes: Vote[];
}

interface Vote extends Model {
    value: string;
    pollingId: string;
    participantId: string;
    participant: Participant;
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


/**
 * Others
 */
type VotePatternType = 'fibo' | 'tshirt' | 'custom';
interface VotePattern {
    type: VotePatternType;
    name: string;
    value?: string;
}
