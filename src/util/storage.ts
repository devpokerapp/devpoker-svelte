const LS_PARTICIPANT = 'devpokerapp:participant';

export const getLocalStorageParticipantKey = (pokerId: string): string => {
    return `${LS_PARTICIPANT}:${pokerId}`;
};
