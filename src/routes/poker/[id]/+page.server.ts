export const load = (context) => {
    return {
        id: context.params.id,
        inviteCode: context.url.searchParams.get('i'),
        currentURL: context.url.toString()
    };
};
