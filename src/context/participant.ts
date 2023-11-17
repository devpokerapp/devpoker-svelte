import { getEntityContext } from "./entity";

export const getParticipantContext = (): IParticipantContext => {
    const context = getEntityContext<Participant>({
        entity: 'participant'
    });

    return {
        ...context,
    }
}
