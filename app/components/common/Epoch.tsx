import { useClusterPath } from '@utils/url';
import Link from 'next/link';
import React from 'react';

import { Copyable } from './Copyable';

type Props = {
    epoch: number | bigint;
    link?: boolean;
    fontSize?: string;
};
export function Epoch({ epoch, link, fontSize = '20px' }: Props) {
    const epochPath = useClusterPath({ pathname: `/epoch/${epoch}` });
    return (
        <span style={{ fontSize, fontWeight: '400' }} className="font-monospace">
            {link ? (
                <Copyable text={epoch.toString()}>
                    <Link href={epochPath}>{epoch.toLocaleString('en-US')}</Link>
                </Copyable>
            ) : (
                epoch.toLocaleString('en-US')
            )}
        </span>
    );
}
