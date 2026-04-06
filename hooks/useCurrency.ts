import { useBranch } from './useBranch';
import { useOrganization } from './useUsers';
import { CURRENCY_MAP, formatCurrency as formatCurrencyUtil } from '@/lib/currency-utils';

export function useCurrency() {
    const { branchId } = useBranch();
    const { data: organization, isLoading } = useOrganization(branchId);

    const currencyCode = organization?.currency || 'USD';
    const displayType = organization?.currencyDisplay || 'symbol';

    function format(amount: number | string) {
        if (isLoading) return '...';
        return formatCurrencyUtil(amount, currencyCode, displayType);
    }

    const symbol = displayType === 'symbol' ? (CURRENCY_MAP[currencyCode] || currencyCode) : currencyCode;

    return {
        format,
        symbol,
        currencyCode,
        displayType,
        isLoading
    };
}
