export const PATTERN_FIBONACCI = '0,1,2,3,5,8,13,?,__coffee';

export const PATTERN_TSHIRT = 'PP,P,M,G,GG,?,__coffee';

export const PATTERNS: VotePattern[] = [
    {
        type: 'fibo',
        name: 'Fibonacci',
        value: PATTERN_FIBONACCI
    },
    {
        type: 'tshirt',
        name: 'T-Shirt sizing',
        value: PATTERN_TSHIRT
    },
    {
        type: 'custom',
        name: 'Customizado',
        value: undefined
    }
];

export const getOptionsFromPattern = (textPattern: string) => {
    return textPattern.split(',');
};
