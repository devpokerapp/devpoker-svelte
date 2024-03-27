export const formatUTC = (date: string) => {
    return new Date(date + '+00:00').toLocaleString();
}
