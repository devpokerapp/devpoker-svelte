import { getContext } from "svelte";
import { writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getPollingContext = (): IPollingContext => {
    const websocket = getContext<IWebSocketContext>('websocket');
    const voteContext = getContext<IVoteContext>('vote');
    const context = getEntityContext<Polling>({
        entity: 'polling'
    });

    const current = writable<Polling | undefined>(undefined);

    context.entities.subscribe((value: Polling[]) => {
        if (value.length < 1) {
            current.set(undefined);
            return;
        }
        // current polling is defined by searching the latest not marked as completed
        let polling = value.findLast((polling) => !polling.completed)
        if (polling === undefined) {
            polling = value[value.length - 1];
        }
        current.set(polling);
    });

    websocket.listen('polling_restarted', (message) => {
        const polling = message.data as Polling;
        current.set(polling);
    })

    current.subscribe((value) => {
        voteContext.entities.set(value?.votes || []);
    })

    async function complete(id: string, value: string): Promise<void> {
        await websocket.sendAndWait({
            service: 'polling_service',
            method: 'complete',
            data: {
                payload: {
                    id,
                    value
                }
            }
        });
    };

    async function restart(id: string): Promise<void> {
        await websocket.sendAndWait({
            service: 'polling_service',
            method: 'restart',
            data: {
                entity_id: id
            }
        });
    }

    return {
        ...context,
        current,
        complete,
        restart
    }
}
