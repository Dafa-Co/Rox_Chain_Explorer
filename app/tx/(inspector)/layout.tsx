import { Metadata } from 'next/types';
import React from 'react';

type Props = Readonly<{
    children: React.ReactNode;
    params: Readonly<{
        signature: string;
    }>;
}>;

export async function generateMetadata({ params: { signature } }: Props): Promise<Metadata> {
    if (signature) {
        return {
            description: `Interactively inspect the Rox transaction with signature ${signature}`,
            title: `Transaction Inspector | ${signature} | Rox`,
        };
    } else {
        return {
            description: `Interactively inspect Rox transactions`,
            title: `Transaction Inspector | Rox`,
        };
    }
}

export default function TransactionInspectorLayout({ children }: Props) {
    return children;
}
