import { get, writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getStoryContext = (): IStoryContext => {
    const context = getEntityContext<Story>({
        entity: 'story'
    });

    const activeStoryId = writable<string | undefined>(undefined);
    const activeStory = writable<Story | undefined>(undefined);

    activeStoryId.subscribe((value: string | undefined) => {
        if (value === undefined) {
            activeStory.set(undefined);
        }
        const entity = get<Story[]>(context.entities).find((entity) => entity.id === value);
        activeStory.set(entity);
    });

    context.entities.subscribe((value: Story[]) => {
        const entity = value.find((entity) => entity.id === get(activeStoryId));
        activeStory.set(entity);
    });

    function activate(id: string | undefined): void {
        activeStoryId.set(id);
    }

    return {
        ...context,
        activeStoryId,
        activeStory,
        activate,
    }
};
