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
    anonymousVoting: boolean;
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
    keycloakUserId?: string;
    secretKey?: string;
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
    anonymous: boolean;
    storyId: string;
    votes: Vote[];
}

interface Vote extends Model {
    value: string;
    pollingId: string;
    participantId: string;
    participant: Participant;
}

interface Invite extends Model {
    code: string;
    expiresAt: string;
    pokerId: string;
}

/**
 * DTOs
 */
interface QueryFilter {
    attr: string;
    value: string;
}

interface QueryRead<T> {
    items: T[];
    metadata: {
        filters: QueryFilter[];
    }
}

interface SimpleListing<T> {
    items: T[];
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

/**
 * Local Storage Objects
 */
interface ManagedLocalStorage<T> {
    get(): T | undefined;
    set(value: T): void;
    clear(): void;
}

interface ParticipantLSO {
    id: string;
    secretKey: string;
}
