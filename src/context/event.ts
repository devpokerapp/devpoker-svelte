import { getEntityContext } from "./entity";

export const getEventContext = (): IEventContext => {
    const context = getEntityContext<PokerEvent>({
        entity: 'event'
    });

    return {
        ...context
    }
}
