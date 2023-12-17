import { getContext } from "svelte";
import { get, writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getPokerContext = (): IPokerContext => {
    const websocket = getContext<IWebSocketContext>('websocket');
    const storyContext = getContext<IStoryContext>('story');
    const context = getEntityContext<Poker>({
        entity: 'poker'
    });

    const current = writable<Poker | undefined>(undefined);

    websocket.listen('poker_selected_story', (message) => {
        const story = message.data as Story;
        storyContext.activate(story);
    });

    context.entities.subscribe((value: Poker[]) => {
        if (value.length < 1) {
            current.set(undefined);
            return;
        }
        const old = get(current);
        if (old === undefined) {
            return;
        }
        const entity = value.find((entity) => entity.id === old.id);
        console.log({ entity });
        current.set(entity);
    });

    async function selectStory(id: string | undefined): Promise<void> {
        if (get(current) === undefined) {
            return;
        }
        await websocket.sendAndWait({
            service: 'poker_service',
            method: 'select_story',
            data: {
                poker_id: get(current)?.id,
                story_id: id,
            }
        });
    }

    return {
        ...context,
        current,
        selectStory,
    }
}
