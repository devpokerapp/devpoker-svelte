interface EmittedMessage {
    service: string;
    method: string;
    data: object;
}

interface RPCResponse {
    success: boolean;
    service: string;
    method: string;
    result: object;
    error: object;
    transaction_id: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ResultingMessage {
    type: "result" | "event";
    success: boolean;
    correlation_id: string;
    data: RPCResponse | object;
}

interface ReceivedMessage {
    type: "result" | "event";
    event: string;
    data: object;
}

interface WSListener {
    callback: (message: ReceivedMessage) => void;
}

interface WSEventListener extends WSListener {
    event: string;
}

interface WSResultListener extends WSListener {
    transactionId: string;
}

interface IWebSocketContext {
    connected: Writable<boolean>;
    initiated: Writable<boolean>;
    init(url: string): void;
    restart(): void;
    send(message: EmittedMessage): string;
    sendAndWait(message: EmittedMessage): Promise<RPCResponse>;
    listen(event: string, callback: (message: ReceivedMessage) => void): void;
    asap(callback: () => void): void;
    subscribe(channel: string): void;
    unsubscribe(channel: string): void;
}

interface IEntityContext<T> {
    entities: Writable<T[]>;
    retrieve(id: string): Promise<T | undefined>;
    create(entity: T): Promise<T | undefined>;
    update(id: string, entity: T): Promise<T | undefined>;
    remove(id: string): Promise<void>;
}

interface IPokerContext extends IEntityContext<Poker> {
    current: Writable<Poker | undefined>;
    selectStory(id: string | undefined): Promise<void>;
}

interface IStoryContext extends IEntityContext<Story> {
    activeStoryId: Writable<string | undefined>;
    activeStory: Writable<Story | undefined>;
    activate(story: Story | undefined): void;
}

interface IParticipantContext extends IEntityContext<Participant> {
    getParticipantName(id: string): string | undefined;
}

interface IEventContext extends IEntityContext<PokerEvent> {
    unrevealedVotes: Writable<PokerEvent[]>;
    currentVotes: Writable<PokerEvent[]>;
}

interface IPollingContext extends IEntityContext<Polling> {
    current: Writable<Polling | undefined>;
}

interface IVoteContext extends IEntityContext<Vote> {}
