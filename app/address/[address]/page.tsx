import { TransactionHistoryCard } from '@components/account/history/TransactionHistoryCard';
import getReadableTitleFromAddress, { AddressPageMetadataProps } from '@utils/get-readable-title-from-address';
import { Metadata } from 'next/types';

// import { OwnedTokensCard } from '@/app/components/account/OwnedTokensCard';
// import { TokenHistoryCard } from '@/app/components/account/TokenHistoryCard';
// import { TransactionsProvider } from '@/app/providers/transactions';

type Props = Readonly<{
    params: {
        address: string;
    };
}>;

export async function generateMetadata(props: AddressPageMetadataProps): Promise<Metadata> {
    return {
        description: `History of all transactions involving the address ${props.params.address} on Rox`,
        title: `Transaction History | ${await getReadableTitleFromAddress(props)} | Rox`,
    };
}

export default function TransactionHistoryPage({ params: { address } }: Props) {
    return (
        <>
            <TransactionHistoryCard address={address} />
            {/* <TransactionsProvider>
                <OwnedTokensCard address={address} />
                <TokenHistoryCard address={address} />
            </TransactionsProvider> */}
        </>
    );
}
