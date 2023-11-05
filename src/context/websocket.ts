import { nanoid } from "nanoid";
import { get, writable } from "svelte/store";

export const websocket: IWebSocketContext = (() => {
    const listeners: WSEventListener[] = [];
    const resultListeners: WSResultListener[] = [];
    let url: string;
    let socket: WebSocket;

    const initiated = writable(false);
    const connected = writable(false);

    function listen(event: string, callback: (message: ReceivedMessage) => void): void {
		listeners.push({ event, callback });
	}

    function buildPayload(data: object): string {
        const payload = JSON.stringify({
            correlation_id: 'gateway_service',
            method: 'request',
            data,
        });
        return payload;
    }

	function send(message: EmittedMessage): string {
        if (socket === undefined || socket.readyState === 3) {
            console.error("Disconnected WebSocket!", socket);
            throw Error('Disconnected WebSocket!');
        }

        const transactionId = nanoid();
        const payload = buildPayload({
            ...message,
            transaction_id: transactionId
        });

        socket.send(payload);

        return transactionId;
    };

    function sendAndWait(message: EmittedMessage): Promise<RPCResponse> {
        return new Promise((resolve, reject) => {
            const transactionId = send(message);

            const handler = (message: ReceivedMessage) => {
                const response = message.data as RPCResponse
                if (response.success) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }
            
            resultListeners.push({
                transactionId,
                callback: handler
            });

            // TODO: reject by timeout?
        });
    }

    function propagate(message: ReceivedMessage) {
		if (message === undefined) {
            return;
        }

        const affected: WSListener[] = [];

        if (message.type === "result") {
            affected.push(...resultListeners.filter((listener) => {
                const result = message.data as RPCResponse;
                return listener.transactionId === result.transaction_id;
            }));
        }

        if (message.type === "event") {
            affected.push(...listeners.filter((listener) => {
                return listener.event === message.event
            }));
        }

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
        if (get(connected)) {
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
        sendAndWait,
        asap,
    }
})();
