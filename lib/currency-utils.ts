export const CURRENCY_MAP: Record<string, string> = {
    'Tsh': 'TSh',
    'USD': '$',
    'EUR': '€',
    'KES': 'KSh',
    'GBP': '£',
    'ZAR': 'R',
};

export function formatCurrency(
    amount: number | string,
    currencyCode: string = 'USD',
    displayType: 'symbol' | 'code' = 'symbol'
): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formattedNumber = numericAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (displayType === 'code') {
        return `${currencyCode} ${formattedNumber}`;
    }

    const symbol = CURRENCY_MAP[currencyCode] || currencyCode;
    return `${symbol}${formattedNumber}`;
}
