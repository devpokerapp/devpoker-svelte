import { getContext } from "svelte";
import { get, writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getStoryContext = (): IStoryContext => {
    const websocket = getContext<IWebSocketContext>('websocket');
    const eventContext = getContext<IEventContext>('event');
    const context = getEntityContext<Story>({
        entity: 'story'
    });

    const activeStoryId = writable<string | undefined>(undefined);
    const activeStory = writable<Story | undefined>(undefined);

    // TODO: listen for story_revealed

    activeStoryId.subscribe((value: string | undefined) => {
        if (value === undefined) {
            activeStory.set(undefined);
        }
        const entity = get<Story[]>(context.entities).find((entity) => entity.id === value);
        activeStory.set(entity);
    });

    activeStory.subscribe((value: Story | undefined) => {
        eventContext.entities.set(value?.events || []);
    });

    context.entities.subscribe((value: Story[]) => {
        const entity = value.find((entity) => entity.id === get(activeStoryId));
        activeStory.set(entity);
    });

    function getStoryChannel(id: string): string {
        return `story:${id}`
    }

    function activate(id: string | undefined): void {
        const oldId = get(activeStoryId);
        activeStoryId.set(id);

        if (oldId !== undefined) {
            websocket.unsubscribe(getStoryChannel(oldId));
        }

        if (id !== undefined) {
            websocket.subscribe(getStoryChannel(id));
        }

    }

    async function reveal(id: string): Promise<void> {
        await websocket.sendAndWait({
            service: 'story_service',
            method: 'reveal',
            data: {
                entity_id: id
            }
        });
    }

    return {
        ...context,
        activeStoryId,
        activeStory,
        activate,
        reveal,
    }
};
