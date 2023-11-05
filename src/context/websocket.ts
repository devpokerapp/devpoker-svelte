import { writable } from "svelte/store";

export const websocket: IWebSocketContext = (() => {
    const listeners: IWebSocketListener[] = [];
    const initiated = writable(false);
    const connected = writable(false);
    let url: string;
    let socket: WebSocket;

    function listen(event: string, callback: (message: ReceivedMessage) => void): void {
		listeners.push({ event, callback });
	}

	function send(message: EmittedMessage): void {
        if (socket === undefined || socket.readyState === 3) {
            console.error("Disconnected WebSocket!", socket);
            return;
        }
        const payload = JSON.stringify({
            correlation_id: 'gateway_service',
            method: 'request',
            data: message
        });
        socket.send(payload);
    };

    function propagate(message: ReceivedMessage) {
		if (message === undefined || message.type === "result") {
            return;
        }
        const affected = listeners.filter((listener) => listener.event === message.event);
        affected.forEach((listener) => (listener.callback(message)));
	}

    function restart() {
        init(url);
    }

    function init(connectionUrl: string) {
		const instance = new WebSocket(connectionUrl);
        url = connectionUrl;

		instance.onopen = () => {
			console.debug('[ws] established websocket connection!')
            connected.set(true);
            initiated.set(true);
		}

		instance.onclose = (event: CloseEvent) => {
			if (event.wasClean) {
                console.debug(`[ws] connection closed cleanly. code=${event.code} reason=${event.reason}`);
            } else {
                console.debug('[ws] connection died');
            }
            connected.set(false);
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

    function asap(callback: () => void): void {
        if (connected) {
            callback();
            return;
        }
        listen('connected', () => {
            callback();
        });
    }

    return {
        connected,
        initiated,
        init,
        restart,
        listen,
        send,
        asap,
    }
})();
