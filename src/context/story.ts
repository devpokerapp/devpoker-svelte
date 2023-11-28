import { getContext } from "svelte";
import { get, writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getStoryContext = (): IStoryContext => {
    const websocket = getContext<IWebSocketContext>('websocket');
    const eventContext = getContext<IEventContext>('event');
    const pollingContext = getContext<IPollingContext>('polling');
    const context = getEntityContext<Story>({
        entity: 'story'
    });

    const activeStoryId = writable<string | undefined>(undefined);
    const activeStory = writable<Story | undefined>(undefined);

    // TODO: listen for story_revealed

    activeStory.subscribe((value: Story | undefined) => {
        eventContext.entities.set(value?.events || []);
        pollingContext.entities.set(value?.pollings || []);
    });

    context.entities.subscribe((value: Story[]) => {
        const entity = value.find((entity) => entity.id === get(activeStoryId));
        activeStory.set(entity);
    });

    function getStoryChannel(id: string): string {
        return `story:${id}`
    }

    function activate(story: Story | undefined): void {
        const oldId = get(activeStory)?.id;
        const storyId = story?.id;
        activeStory.set(story);
        activeStoryId.set(storyId);

        if (oldId !== undefined) {
            websocket.unsubscribe(getStoryChannel(oldId));
        }

        if (storyId !== undefined) {
            websocket.subscribe(getStoryChannel(storyId));
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
