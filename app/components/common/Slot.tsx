import { useClusterPath } from '@utils/url';
import Link from 'next/link';
import React from 'react';

import { Copyable } from './Copyable';

type Props = {
    slot: number | bigint;
    link?: boolean;
    fontWeight?: string;
    fontSize?: string;
};
export function Slot({ slot, link, fontWeight = '400', fontSize = '20x' }: Props) {
    const slotPath = useClusterPath({ pathname: `/block/${slot}` });
    return (
        <span style={{ fontSize, fontWeight }} className="font-monospace">
            {link ? (
                <Copyable text={slot.toString()}>
                    <Link href={slotPath}>{slot.toLocaleString('en-US')}</Link>
                </Copyable>
            ) : (
                slot.toLocaleString('en-US')
            )}
        </span>
    );
}
