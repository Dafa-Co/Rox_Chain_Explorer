'use client';

import { Address } from '@components/common/Address';
import { BalanceDelta } from '@components/common/BalanceDelta';
import { ErrorCard } from '@components/common/ErrorCard';
import { Identicon } from '@components/common/Identicon';
import { InfoTooltip } from '@components/common/InfoTooltip';
import { LoadingCard } from '@components/common/LoadingCard';
import { Signature } from '@components/common/Signature';
import { Slot } from '@components/common/Slot';
import { SolBalance } from '@components/common/SolBalance';
import { TableCardBody } from '@components/common/TableCardBody';
import { SignatureContext } from '@components/instruction/SignatureContext';
import { InstructionsSection } from '@components/transaction/InstructionsSection';
// import { ProgramLogSection } from '@components/transaction/ProgramLogSection';
import { TokenBalancesCard, generateTokenBalanceRows } from '@components/transaction/TokenBalancesCard';
import { FetchStatus } from '@providers/cache';
import { useCluster } from '@providers/cluster';
import {
    TransactionStatusInfo,
    useFetchTransactionStatus,
    useTransactionDetails,
    useTransactionStatus,
} from '@providers/transactions';
import { useFetchTransactionDetails } from '@providers/transactions/parsed';
// import { ParsedTransaction, SystemInstruction, SystemProgram, TransactionSignature } from '@solana/web3.js';
import { ParsedTransaction, PublicKey, TransactionSignature } from '@solana/web3.js';
import { Cluster, ClusterStatus } from '@utils/cluster';
import { displayTimestamp } from '@utils/date';
import { SignatureProps } from '@utils/index';
import { getTransactionInstructionError } from '@utils/program-err';
// import { intoTransactionInstruction } from '@utils/tx';
import { useClusterPath } from '@utils/url';
import useTabVisibility from '@utils/use-tab-visibility';
import { BigNumber } from 'bignumber.js';
import bs58 from 'bs58';
import Link from 'next/link';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Settings } from 'react-feather';
import useSWR from 'swr';

import { useScaledUiAmountForMint } from '@/app/providers/accounts/tokens';
import { getTokenInfo, getTokenInfoSwrKey } from '@/app/utils/token-info';

const AUTO_REFRESH_INTERVAL = 2000;
const ZERO_CONFIRMATION_BAILOUT = 5;

async function fetchTokenInfo([_, address, cluster, url]: ['get-token-info', string, Cluster, string]) {
    return await getTokenInfo(new PublicKey(address), cluster, url);
}

enum AutoRefresh {
    Active,
    Inactive,
    BailedOut,
}

type AutoRefreshProps = {
    autoRefresh: AutoRefresh;
};

type Props = Readonly<{
    params: SignatureProps;
}>;

function getTransactionErrorReason(
    info: TransactionStatusInfo,
    tx: ParsedTransaction | undefined
): { errorReason: string; errorLink?: string } {
    if (typeof info.result.err === 'string') {
        return { errorReason: `Runtime Error: "${info.result.err}"` };
    }

    const programError = getTransactionInstructionError(info.result.err);
    if (programError !== undefined) {
        return { errorReason: `Program Error: "Instruction #${programError.index + 1} Failed"` };
    }

    const { InsufficientFundsForRent } = info.result.err as { InsufficientFundsForRent?: { account_index: number } };
    if (InsufficientFundsForRent !== undefined) {
        if (tx) {
            const address = tx.message.accountKeys[InsufficientFundsForRent.account_index].pubkey;
            return { errorLink: `/address/${address}`, errorReason: `Insufficient Funds For Rent: ${address}` };
        }
        return { errorReason: `Insufficient Funds For Rent: Account #${InsufficientFundsForRent.account_index + 1}` };
    }

    return { errorReason: `Unknown Error: "${JSON.stringify(info.result.err)}"` };
}

export default function TransactionDetailsPageClient({ params: { signature: raw } }: Props) {
    let signature: TransactionSignature | undefined;

    try {
        const decoded = bs58.decode(raw);
        if (decoded.length === 64) {
            signature = raw;
        }
    } catch (err) {
        /* empty */
    }

    const status = useTransactionStatus(signature);
    const clusterStatus = useCluster().status;
    const [zeroConfirmationRetries, setZeroConfirmationRetries] = useState(0);
    const { visible: isTabVisible } = useTabVisibility();

    let autoRefresh = AutoRefresh.Inactive;
    if (!isTabVisible) {
        autoRefresh = AutoRefresh.Inactive;
    } else if (zeroConfirmationRetries >= ZERO_CONFIRMATION_BAILOUT) {
        autoRefresh = AutoRefresh.BailedOut;
    } else if (status?.data?.info && status.data.info.confirmations !== 'max') {
        autoRefresh = AutoRefresh.Active;
    }

    useEffect(() => {
        if (status?.status === FetchStatus.Fetched && status.data?.info && status.data.info.confirmations === 0) {
            setZeroConfirmationRetries(retries => retries + 1);
        }
    }, [status]);

    useEffect(() => {
        if (status?.status === FetchStatus.Fetching && autoRefresh === AutoRefresh.BailedOut) {
            setZeroConfirmationRetries(0);
        }
    }, [status, autoRefresh, setZeroConfirmationRetries]);

    return (
        <div className="container">
            <div className="header mt-5">
                <div className="header-body bg-white px-4">
                    <h6 className="header-pretitle card-header-slot">Details</h6>
                    <h2 className="header-title card-header-title">Transaction</h2>
                </div>
            </div>
            {signature === undefined ? (
                <ErrorCard text={`Signature "${raw}" is not valid`} />
            ) : clusterStatus === ClusterStatus.Failure ? (
                <ErrorCard text="RPC is not responding. Please change your RPC url and try again." />
            ) : (
                <SignatureContext.Provider value={signature}>
                    <StatusCard signature={signature} autoRefresh={autoRefresh} />
                    <Suspense fallback={<LoadingCard message="Loading transaction details" />}>
                        <DetailsSection signature={signature} />
                    </Suspense>
                </SignatureContext.Provider>
            )}
        </div>
    );
}

function StatusCard({ signature, autoRefresh }: SignatureProps & AutoRefreshProps) {
    const fetchStatus = useFetchTransactionStatus();
    const status = useTransactionStatus(signature);
    const details = useTransactionDetails(signature);
    const { cluster, clusterInfo, name: clusterName, status: clusterStatus, url: clusterUrl } = useCluster();
    const inspectPath = useClusterPath({ pathname: `/tx/${signature}/inspect` });

    // Fetch transaction on load
    useEffect(() => {
        if (!status && clusterStatus === ClusterStatus.Connected) {
            fetchStatus(signature);
        }
    }, [signature, clusterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect to set and clear interval for auto-refresh
    useEffect(() => {
        if (autoRefresh === AutoRefresh.Active) {
            const intervalHandle: NodeJS.Timeout = setInterval(() => fetchStatus(signature), AUTO_REFRESH_INTERVAL);

            return () => {
                clearInterval(intervalHandle);
            };
        }
    }, [autoRefresh, fetchStatus, signature]);

    const transactionWithMeta = details?.data?.transactionWithMeta;
    const fee = transactionWithMeta?.meta?.fee;
    const costUnits = transactionWithMeta?.meta?.costUnits;
    const transaction = transactionWithMeta?.transaction;
    const tokenTransferData = useMemo(() => {
        if (!transactionWithMeta || !transaction?.message?.accountKeys) {
            return undefined;
        }

        const { meta } = transactionWithMeta;
        if (!meta?.postTokenBalances || meta.postTokenBalances.length === 0) {
            return undefined;
        }

        const rows = generateTokenBalanceRows(
            meta.preTokenBalances ?? [],
            meta.postTokenBalances,
            transaction.message.accountKeys
        );

        const meaningfulRows = rows.filter(row => !row.delta.isZero());
        if (meaningfulRows.length === 0) {
            return undefined;
        }

        meaningfulRows.sort((a, b) => b.delta.abs().comparedTo(a.delta.abs()));
        const selectedRow = meaningfulRows.find(row => row.delta.gt(0)) ?? meaningfulRows[0];
        const matchingBalance = meta.postTokenBalances.find(
            balance => balance.accountIndex === selectedRow.accountIndex && balance.mint === selectedRow.mint
        );

        const decimals = matchingBalance?.uiTokenAmount.decimals ?? 0;

        return {
            amountUiString: selectedRow.delta.abs().toString(),
            decimals,
            mint: selectedRow.mint,
        };
    }, [transactionWithMeta, transaction]);
    const tokenInfoKey = useMemo(
        () =>
            tokenTransferData?.mint ? getTokenInfoSwrKey(tokenTransferData.mint, cluster, clusterUrl) : null,
        [tokenTransferData?.mint, cluster, clusterUrl]
    );
    const { data: tokenTransferInfo } = useSWR(tokenInfoKey, fetchTokenInfo);
    const [scaledTransferAmount] = useScaledUiAmountForMint(
        tokenTransferData?.mint,
        tokenTransferData?.amountUiString ?? '0'
    );
    const tokenSymbol =
        tokenTransferInfo?.symbol ||
        (tokenTransferData ? `${tokenTransferData.mint.slice(0, 4)}...${tokenTransferData.mint.slice(-4)}` : undefined);
    const tokenLogoUri = tokenTransferInfo?.logoURI ?? undefined;
    const formattedTransferAmount = useMemo(() => {
        if (!tokenTransferData) {
            return undefined;
        }
        const decimalsToDisplay = Math.min(tokenTransferData.decimals, 9);
        const amount = new BigNumber(scaledTransferAmount);
        if (!amount.isFinite()) {
            return tokenTransferData.amountUiString;
        }
        return amount.toFormat(decimalsToDisplay);
    }, [tokenTransferData, scaledTransferAmount]);
    const blockhash = transaction?.message.recentBlockhash;
    // const isNonce = (() => {
    //     if (!transaction || transaction.message.instructions.length < 1) {
    //         return false;
    //     }

    //     const ix = intoTransactionInstruction(transaction, transaction.message.instructions[0]);
    //     return (
    //         ix &&
    //         SystemProgram.programId.equals(ix.programId) &&
    //         SystemInstruction.decodeInstructionType(ix) === 'AdvanceNonceAccount'
    //     );
    // })();

    if (!status || (status.status === FetchStatus.Fetching && autoRefresh === AutoRefresh.Inactive)) {
        return <LoadingCard />;
    } else if (status.status === FetchStatus.FetchFailed) {
        return <ErrorCard retry={() => fetchStatus(signature)} text="Fetch Failed" />;
    } else if (!status.data?.info) {
        if (clusterInfo && clusterInfo.firstAvailableBlock > 0) {
            return (
                <ErrorCard
                    retry={() => fetchStatus(signature)}
                    text="Not Found"
                    subtext={`Note: Transactions processed before block ${clusterInfo.firstAvailableBlock} are not available at this time`}
                />
            );
        }
        return <ErrorCard retry={() => fetchStatus(signature)} text="Not Found" />;
    }

    const { info } = status.data;

    let statusClass = 'success';
    let statusText = 'Success';
    let errorReason = undefined;
    let errorLink = undefined;

    if (info.result.err) {
        statusClass = 'warning';
        statusText = 'Error';

        const err = getTransactionErrorReason(info, transaction);
        errorReason = err.errorReason;
        if (err.errorLink !== undefined) {
            if (cluster === Cluster.MainnetBeta) {
                errorLink = err.errorLink;
            } else {
                errorLink = `${err.errorLink}?cluster=${clusterName.toLowerCase()}${
                    cluster === Cluster.Custom ? `&customUrl=${clusterUrl}` : ''
                }`;
            }
        }
    }

    return (
        <div className="card">
            <div className="card-header align-items-center">
                <h3 className="card-header-title">Overview</h3>
                <Link className="btn btn-white btn-sm me-2" href={inspectPath}>
                    <Settings className="align-text-top me-2" size={13} />
                    Inspect
                </Link>
                {autoRefresh === AutoRefresh.Active ? (
                    <span className="spinner-grow spinner-grow-sm"></span>
                ) : (
                    <button className="btn btn-white btn-sm" onClick={() => fetchStatus(signature)}>
                        <RefreshCw className="align-text-top me-2" size={13} />
                        Refresh
                    </button>
                )}
            </div>

            <TableCardBody>
                <tr>
                    <td className="card-header-slot">Signature</td>
                    <td className="text-lg-end card-header-title">
                        <Signature signature={signature} alignRight />
                    </td>
                </tr>

                <tr>
                    <td className="card-header-slot">Result</td>
                    <td className="text-lg-end card-header-title">
                        <h3 className="mb-0">
                            <span className={`badge bg-${statusClass}-soft`}>{statusText}</span>
                        </h3>
                    </td>
                </tr>

                {errorReason !== undefined && (
                    <tr>
                        <td className="card-header-slot">Error</td>
                        <td className="text-lg-end card-header-title">
                            <h3 className="mb-0">
                                {errorLink !== undefined ? (
                                    <Link href={errorLink}>
                                        <span className={`badge bg-${statusClass}-soft`}>{errorReason}</span>
                                    </Link>
                                ) : (
                                    <span className={`badge bg-${statusClass}-soft`}>{errorReason}</span>
                                )}
                            </h3>
                        </td>
                    </tr>
                )}

                <tr>
                    <td className="card-header-slot">
                        {tokenTransferData ? (
                            <span className="d-inline-flex align-items-center gap-2">
                                <span>Transfer Amount</span>
                                <span className="d-inline-flex align-items-center gap-2">
                                    <span>({tokenSymbol ?? 'Tokens'})</span>
                                </span>
                            </span>
                        ) : (
                            'Transfer Amount (ROX)'
                        )}
                    </td>
                    <td className="text-lg-end card-header-title">
                        {tokenTransferData ? (
                            <span>
                                {formattedTransferAmount ?? tokenTransferData.amountUiString}
                                {tokenLogoUri ? (
                                    <img
                                        alt={`${tokenSymbol ?? 'Token'} logo`}
                                        src={tokenLogoUri}
                                        className="rounded-circle border border-body ms-2"
                                        style={{ width: 24, height: 24, objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Identicon
                                        address={tokenTransferData.mint}
                                        className="rounded-circle border border-body identicon-wrapper"
                                        style={{ width: 24, height: 24 }}
                                    />
                                )}
                            </span>
                        ) : (
                            <SolBalance
                                lamports={
                                    (
                                        details?.data?.transactionWithMeta?.transaction?.message?.instructions?.find(
                                            ix => ix.programId.toString() === '11111111111111111111111111111111'
                                        ) as any
                                    )?.parsed?.info?.lamports ?? 0
                                }
                            />
                        )}
                    </td>
                </tr>

                {fee !== undefined && (
                    <tr>
                        <td className="card-header-slot">Fee (ROX)</td>
                        <td className="text-lg-end card-header-title">
                            <SolBalance lamports={fee} />
                        </td>
                    </tr>
                )}

                <tr>
                    <td className="card-header-slot">Timestamp</td>
                    <td className="text-lg-end card-header-title">
                        {info.timestamp !== 'unavailable' ? (
                            <span className="font-monospace">{displayTimestamp(info.timestamp * 1000)}</span>
                        ) : (
                            <InfoTooltip bottom right text="Timestamps are only available for confirmed blocks">
                                Unavailable
                            </InfoTooltip>
                        )}
                    </td>
                </tr>

                {/* <tr>
                    <td>Confirmation Status</td>
                    <td className="text-lg-end text-uppercase">{info.confirmationStatus || 'Unknown'}</td>
                </tr> */}

                {/* <tr>
                    <td>Confirmations</td>
                    <td className="text-lg-end text-uppercase">{info.confirmations}</td>
                </tr> */}

                <tr>
                    <td className="card-header-slot">Slot</td>
                    <td className="text-lg-end card-header-title">
                        <Slot slot={info.slot} link />
                    </td>
                </tr>

                {blockhash && (
                    <tr>
                        <td className="card-header-slot">
                            Recent Blockhash
                            {/* {isNonce ? (
                                'Nonce'
                            ) : (
                                <InfoTooltip text="Transactions use a previously confirmed blockhash as a nonce to prevent double spends">
                                    Recent Blockhash
                                </InfoTooltip>
                            )} */}
                        </td>
                        <td className="text-lg-end card-header-title">{blockhash}</td>
                    </tr>
                )}

                {costUnits !== undefined && (
                    <tr>
                        <td className="card-header-slot">Transaction cost</td>
                        <td className="text-lg-end card-header-title">{costUnits.toLocaleString('en-US')}</td>
                    </tr>
                )}
            </TableCardBody>
        </div>
    );
}

function DetailsSection({ signature }: SignatureProps) {
    const details = useTransactionDetails(signature);
    const fetchDetails = useFetchTransactionDetails();
    const status = useTransactionStatus(signature);
    const transactionWithMeta = details?.data?.transactionWithMeta;
    const transaction = transactionWithMeta?.transaction;
    const message = transaction?.message;
    const { status: clusterStatus } = useCluster();
    const refreshDetails = () => fetchDetails(signature);

    // Fetch details on load
    useEffect(() => {
        if (!details && clusterStatus === ClusterStatus.Connected && status?.status === FetchStatus.Fetched) {
            fetchDetails(signature);
        }
    }, [signature, clusterStatus, status]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!status?.data?.info) {
        return null;
    } else if (!details || details.status === FetchStatus.Fetching) {
        return <LoadingCard />;
    } else if (details.status === FetchStatus.FetchFailed) {
        return <ErrorCard retry={refreshDetails} text="Failed to fetch details" />;
    } else if (!transactionWithMeta || !message) {
        return <ErrorCard text="Details are not available" />;
    }

    return (
        <>
            <AccountsCard signature={signature} />
            <TokenBalancesCard signature={signature} />
            <InstructionsSection signature={signature} />
            {/* <ProgramLogSection signature={signature} /> */}
        </>
    );
}

function AccountsCard({ signature }: SignatureProps) {
    const details = useTransactionDetails(signature);

    const transactionWithMeta = details?.data?.transactionWithMeta;
    if (!transactionWithMeta) {
        return null;
    }

    const { meta, transaction } = transactionWithMeta;
    const { message } = transaction;

    if (!meta) {
        return <ErrorCard text="Transaction metadata is missing" />;
    }

    const accountRows = message.accountKeys.slice(0, 2).map((account, index) => {
        const pre = meta.preBalances[index];
        const post = meta.postBalances[index];
        const pubkey = account.pubkey;
        const key = account.pubkey.toBase58();
        const delta = new BigNumber(post).minus(new BigNumber(pre));

        return (
            <tr key={key}>
                <td className="card-header-slot">{index + 1}</td>
                <td>
                    <Address pubkey={pubkey} link fetchTokenLabelInfo />
                </td>
                <td>
                    <BalanceDelta delta={delta} isSol />
                </td>
                <td className="text-lg-center card-header-title">
                    <SolBalance lamports={post} />
                </td>
                <td>
                    {index === 0 && <span className="badge e-bg-blue-950 me-1">Fee Payer</span>}
                    {account.signer && <span className="badge e-bg-blue-950 me-1">Signer</span>}
                    {account.writable && <span className="badge e-bg-blue-950 me-1">Writable</span>}
                    {message.instructions.find(ix => ix.programId.equals(pubkey)) && (
                        <span className="badge bg-warning-soft me-1">Program</span>
                    )}
                    {account.source === 'lookupTable' && (
                        <span className="badge bg-gray-soft me-1">Address Table Lookup</span>
                    )}
                </td>
            </tr>
        );
    });

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-header-title">Breakdown</h3>
            </div>
            <div className="table-responsive mb-0">
                <table className="table table-sm table-nowrap card-table">
                    <thead>
                        <tr>
                            <th className="text-muted card-header-white">#</th>
                            <th className="text-muted card-header-white">Address</th>
                            <th className="text-muted card-header-white">Change (ROX)</th>
                            <th className="text-muted card-header-white">Post Balance (ROX)</th>
                            <th className="text-muted card-header-white">Details</th>
                        </tr>
                    </thead>
                    <tbody className="list">{accountRows}</tbody>
                </table>
            </div>
        </div>
    );
}
