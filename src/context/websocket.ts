interface EmittedMessage {
    correlation_id: string;
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

export const websocket: IWebSocketContext = (() => {
    const listeners: IWebSocketListener[] = [];
    let socket: WebSocket;

    function listen(event: string, callback: (message: ReceivedMessage) => void): void {
		listeners.push({ event, callback })
	}

	function send(message: EmittedMessage): void {
        if (socket === undefined || socket.readyState === 3) {
            console.error("Disconnected WebSocket!", socket);
            return;
        }
        const payload = JSON.stringify(message);
        socket.send(payload);
    };

    function propagate(message: ReceivedMessage) {
		if (message === undefined || message.type === "result") {
            return;
        }
        const affected = listeners.filter((listener) => listener.event === message.event);
        affected.forEach((listener) => (listener.callback(message)));
	}

    function init(url: string) {
		const instance = new WebSocket(url);

		instance.onopen = () => {
			console.debug('[ws] established websocket connection!')
		}

		instance.onclose = (event: CloseEvent) => {
			if (event.wasClean) {
                console.debug(`[ws] connection closed cleanly. code=${event.code} reason=${event.reason}`);
            } else {
                console.debug('[ws] connection died');
            }
		}

		instance.onerror = (event: Event) => {
			console.debug(`[ws] error. ${event}`);
		}

		instance.onmessage = (event: MessageEvent<string>) => {
			console.debug(`[ws] received message. ${event.data}`);
			const message = JSON.parse(event.data) as ReceivedMessage;
			propagate(message);
		}

		socket = instance;
	}

    return {
        init,
        listen,
        send
    }
})();
