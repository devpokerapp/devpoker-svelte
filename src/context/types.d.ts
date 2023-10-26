interface IWebSocketContext {
    init(url: string): void;
    send(message: EmittedMessage): void;
    listen(event: string, callback: (message: ReceivedMessage) => void): void;
}
