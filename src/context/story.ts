import { getContext } from "svelte";
import { get, writable } from "svelte/store";

export const getStoryContext = (): IStoryContext => {
    const service = 'story_service';
    const websocket = getContext<IWebSocketContext>('websocket');

    const entities = writable<Story[]>([]);

    websocket.listen('story_created', (message) => {
        const story = message.data as Story;
        entities.set([
            ...get(entities),
            story
        ])
    });

    async function retrieve(id: string): Promise<Story | undefined> {
        const response = await websocket.sendAndWait({
            service,
            method: 'retrieve',
            data: {
                entity_id: id
            }
        });

        if (!response.success) {
            console.error(response.error);
            return undefined;
        }

        const story = response.result as Story;
        return story;
    }

    async function create(entity: Story): Promise<Story | undefined> {
        const response = await websocket.sendAndWait({
            service,
            method: 'create',
            data: {
                payload: {
                    ...entity
                }
            }
        })

        if (!response.success) {
            console.error(response.error);
            return undefined;
        }

        const story = response.result as Story;
        return story;
    }

    async function update(id: string, entity: Story): Promise<Story | undefined> {
        const response = await websocket.sendAndWait({
            service,
            method: 'update',
            data: {
                entity_id: id,
                payload: {
                    ...entity
                }
            }
        })
        
        if (!response.success) {
            console.error(response.error);
            return undefined;
        }

        const story = response.result as Story;
        return story;
    }

    async function remove(id: string): Promise<void> {
        const response = await websocket.sendAndWait({
            service,
            method: 'delete',
            data: {
                entity_id: id,
            }
        })
        
        if (!response.success) {
            console.error(response.error);
        }
    }

    return {
        entities,
        retrieve,
        create,
        update,
        remove,
    }
};
