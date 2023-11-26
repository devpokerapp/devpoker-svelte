import { getEntityContext } from "./entity";

export const getPollingContext = (): IPollingContext => {
    const context = getEntityContext<Polling>({
        entity: 'polling'
    });

    return {
        ...context,
    }
}
