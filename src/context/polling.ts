import { writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getPollingContext = (): IPollingContext => {
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

    return {
        ...context,
        current,
    }
}
