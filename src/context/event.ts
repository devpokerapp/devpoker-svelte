import { writable } from "svelte/store";
import { getEntityContext } from "./entity";

export const getEventContext = (): IEventContext => {
    const context = getEntityContext<PokerEvent>({
        entity: 'event'
    });

    const unrevealedVotes = writable<PokerEvent[]>([]);
    const currentVotes = writable<PokerEvent[]>([]);
    // FIXME: current votes should not include votes placed after the reveal

    context.entities.subscribe((value: PokerEvent[]) => {
        currentVotes.set(value.filter((event) => {
            return event.type === "vote"
        }));
        unrevealedVotes.set(value.filter((event) => {
            return event.type === "vote" && event.revealed === false
        }));
    });

    return {
        ...context,
        unrevealedVotes,
        currentVotes,
    }
}
