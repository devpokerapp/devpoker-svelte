import { get } from "svelte/store";
import { getEntityContext } from "./entity";

export const getParticipantContext = (): IParticipantContext => {
    const context = getEntityContext<Participant>({
        entity: 'participant'
    });

    function getParticipantName(id: string): string | undefined {
        const found = (get(context.entities) as Participant[]).find((participant) => {
			return participant.id === id;
		});
        return found?.name;
    }

    return {
        ...context,
        getParticipantName,
    }
}
