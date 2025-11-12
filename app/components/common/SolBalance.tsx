import Logo from '@img/logos-solana/rox-chain-dark.svg';
import { lamportsToSolString } from '@utils/index';
import Image from 'next/image';
import React from 'react';

export function SolBalance({
    lamports,
    maximumFractionDigits = 9,
    hideLogo = false
}: {
    lamports: number | bigint;
    maximumFractionDigits?: number;
    hideLogo: boolean;
}) {
    return (
        <div className="flex !e-items-center !e-justify-center">
            <span className="font-monospace">{lamportsToSolString(lamports, maximumFractionDigits)}</span>
            {!hideLogo ?  (<Image
                alt="Rox Explorer"
                width={16}
                height={16}
                src={Logo}
                className="ms-2"
                style={{ marginBottom: 0.7 }}
            />) : null}
        </div>
    );
}
