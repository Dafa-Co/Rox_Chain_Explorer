import Logo from '@img/rox.svg';
import { lamportsToSolString } from '@utils/index';
import Image from 'next/image';
import React from 'react';

export function SolBalance({
    lamports,
    maximumFractionDigits = 9,
}: {
    lamports: number | bigint;
    maximumFractionDigits?: number;
}) {
    return (
        <div className="flex !e-items-center !e-justify-center">
            <Image
                alt="Rox Explorer"
                width={12}
                height={12}
                src={Logo}
                className="me-1"
                style={{ marginBottom: 0.7 }}
            />

            <span className="font-monospace">{lamportsToSolString(lamports, maximumFractionDigits)}</span>
        </div>
    );
}
