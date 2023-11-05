interface EmittedMessage {
    service: string;
    method: string;
    data: object;
}

interface RPCResult {
    success: boolean;
    service: string;
    method: string;
    result: object;
    error: object;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ResultingMessage {
    type: "result" | "event";
    success: boolean;
    correlation_id: string;
    data: RPCResult | object;
}

interface ReceivedMessage {
    type: "result" | "event";
    event: string;
    data: object;
}

interface IWebSocketListener {
    event: string;
    callback: (message: ReceivedMessage) => void;
}

interface IWebSocketContext {
    connected: Writable<boolean>;
    initiated: Writable<boolean>;
    init(url: string): void;
    restart(): void;
    send(message: EmittedMessage): void;
    listen(event: string, callback: (message: ReceivedMessage) => void): void;
    asap(callback: () => void): void;
}
