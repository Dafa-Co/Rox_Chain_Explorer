import { Address } from '@components/common/Address';
import { SolBalance } from '@components/common/SolBalance';
import { ParsedInstruction, SignatureResult, SystemProgram } from '@solana/web3.js';
import React from 'react';

import { InstructionCard } from '../InstructionCard';
import { TransferInfo } from './types';

export function TransferDetailsCard(props: {
    ix: ParsedInstruction;
    index: number;
    result: SignatureResult;
    info: TransferInfo;
    innerCards?: JSX.Element[];
    childIndex?: number;
}) {
    const { ix, index, result, info, innerCards, childIndex } = props;

    return (
        <InstructionCard
            ix={ix}
            index={index}
            result={result}
            title="System Program: Transfer"
            innerCards={innerCards}
            childIndex={childIndex}
        >
            <tr>
                <td className="card-header-slot">Program</td>
                <td className="text-lg-end card-header-title">
                    <Address pubkey={SystemProgram.programId} alignRight link />
                </td>
            </tr>

            <tr>
                <td className="card-header-slot">From Address</td>
                <td className="text-lg-end card-header-title    ">
                    <Address pubkey={info.source} alignRight link />
                </td>
            </tr>

            <tr>
                <td className="card-header-slot">To Address</td>
                <td className="text-lg-end card-header-title">
                    <Address pubkey={info.destination} alignRight link />
                </td>
            </tr>

            <tr>
                <td className="card-header-slot">Transfer Amount (ROX)</td>
                <td className="text-lg-end card-header-title">
                    <SolBalance lamports={info.lamports} />
                </td>
            </tr>
        </InstructionCard>
    );
}
