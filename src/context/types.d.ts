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
    send(message: EmittedMessage): void; // dispatches a message without waiting for a return
    request(message: EmittedMessage): Promise<RPCResponse>;
    listen(event: string, callback: (message: ReceivedMessage) => void): void;
    asap(callback: () => void): void;
}
