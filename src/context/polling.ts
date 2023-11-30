import { getContext } from "svelte";
import { writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getPollingContext = (): IPollingContext => {
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
        const polling = value[0]; // TODO: get the latest. for now will only have one so its okay
        current.set(polling);
    });

    current.subscribe((value) => {
        voteContext.entities.set(value?.votes || []);
    })

    return {
        ...context,
        current,
    }
}
