import { getEntityContext } from "./entity";

export const getVoteContext = (): IVoteContext => {
    const context = getEntityContext<Vote>({
        entity: 'vote'
    });

    return {
        ...context
    }
}
