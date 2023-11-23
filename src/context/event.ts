import { writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getEventContext = (): IEventContext => {
    const context = getEntityContext<PokerEvent>({
        entity: 'event'
    });

    const unrevealedVotes = writable<PokerEvent[]>([]);

    context.entities.subscribe((value: PokerEvent[]) => {
        unrevealedVotes.set(value.filter((event) => {
            return event.type === "vote" && event.revealed === false
        }));
    });

    return {
        ...context,
        unrevealedVotes
    }
}
