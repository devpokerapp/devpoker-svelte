interface EmittedMessage {
    service: string;
    method: string;
    data: object;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MessageResult {
    type: "result" | "event";
    success: boolean;
    correlation_id: string;
    data: object;
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
    init(url: string): void;
    send(message: EmittedMessage): void;
    listen(event: string, callback: (message: ReceivedMessage) => void): void;
}
