export const countElements = (array: string[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (counts[item] === undefined) {
            counts[item] = 0;
        }
        counts[item] += 1;
    }
    return counts;
}

export const getMostUsed = (array: string[]): string[] => {
    let maxCount = 0;
    let items: string[] = [];

    const counts = countElements(array);
    
    Object.entries(counts).forEach(([value, count]) => {
        if (count > maxCount) {
            maxCount = count;
            items = [];
        }
        if (count === maxCount) {
            items.push(value);
        }
    });
    
    return items;
}
