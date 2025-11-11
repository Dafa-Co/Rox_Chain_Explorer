import { MetaplexNFTHeader } from '@components/account/MetaplexNFTHeader';
import { isNFTokenAccount } from '@components/account/nftoken/isNFTokenAccount';
import { NFTokenAccountHeader } from '@components/account/nftoken/NFTokenAccountHeader';
import { Identicon } from '@components/common/Identicon';
import { Account, isTokenProgramData, TokenProgramData, useMintAccountInfo } from '@providers/accounts';
import isMetaplexNFT from '@providers/accounts/utils/isMetaplexNFT';
import { MetadataPointer, TokenMetadata } from '@validators/accounts/token-extension';
import React, { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { create } from 'superstruct';

import { CompressedNftAccountHeader } from '@/app/components/account/CompressedNftCard';
import { getProxiedUri } from '@/app/features/metadata/utils';
import { useMetadataJsonLink } from '@/app/providers/compressed-nft';
import { FullTokenInfo, isRedactedTokenAddress } from '@/app/utils/token-info';
import { MintAccountInfo } from '@/app/validators/accounts/token';

const IDENTICON_WIDTH = 64;

export function AccountHeader({
    address,
    account,
    tokenInfo,
    isTokenInfoLoading,
}: {
    address: string;
    account?: Account;
    tokenInfo?: FullTokenInfo;
    isTokenInfoLoading: boolean;
}) {
    const mintInfo = useMintAccountInfo(address);

    const parsedData = account?.data.parsed;
    const isToken = parsedData && isTokenProgramData(parsedData) && parsedData?.parsed.type === 'mint';

    if (isMetaplexNFT(parsedData, mintInfo) && parsedData.nftData) {
        return <MetaplexNFTHeader nftData={parsedData.nftData} address={address} />;
    }

    const nftokenNFT = account && isNFTokenAccount(account);
    if (nftokenNFT && account) {
        return <NFTokenAccountHeader account={account} />;
    }

    if (isToken && !isTokenInfoLoading) {
        if (isRedactedTokenAddress(address)) {
            return (
                <TokenMintHeader address={address} mintInfo={mintInfo} parsedData={undefined} tokenInfo={undefined} />
            );
        }
        return <TokenMintHeader address={address} mintInfo={mintInfo} parsedData={parsedData} tokenInfo={tokenInfo} />;
    }

    const fallback = (
        <div className="e-flex e-flex-col">
            <h6 className="header-pretitle card-header-slot">Details</h6>
            <h2 className="header-title card-header-title">Account</h2>
        </div>
    );
    if (account) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Suspense fallback={fallback}>
                    <CompressedNftAccountHeader account={account} />
                </Suspense>
            </ErrorBoundary>
        );
    }
    return fallback;
}

function TokenMintHeader({
    address,
    tokenInfo,
    mintInfo,
    parsedData,
}: {
    address: string;
    tokenInfo?: FullTokenInfo;
    mintInfo?: MintAccountInfo;
    parsedData?: TokenProgramData;
}): JSX.Element {
    const metadataExtension = mintInfo?.extensions?.find(
        ({ extension }: { extension: string }) => extension === 'tokenMetadata'
    );
    const metadataPointerExtension = mintInfo?.extensions?.find(
        ({ extension }: { extension: string }) => extension === 'metadataPointer'
    );

    const defaultCard = useMemo(
        () => (
            <TokenMintHeaderCard
                token={tokenInfo ? tokenInfo : { logoURI: undefined, name: undefined }}
                address={address}
                unverified={false}
            />
        ),
        [address, tokenInfo]
    );

    if (metadataPointerExtension && metadataExtension) {
        return (
            <>
                <ErrorBoundary fallback={defaultCard}>
                    <Suspense fallback={defaultCard}>
                        <Token22MintHeader
                            address={address}
                            metadataExtension={metadataExtension as any}
                            metadataPointerExtension={metadataPointerExtension as any}
                        />
                    </Suspense>
                </ErrorBoundary>
            </>
        );
    }
    // Fall back to legacy token list when there is stub metadata (blank uri), updatable by default by the mint authority
    else if (!parsedData?.nftData?.metadata.data.uri && tokenInfo) {
        return defaultCard;
    } else if (parsedData?.nftData) {
        const token = {
            logoURI: parsedData?.nftData?.json?.image,
            name: parsedData?.nftData?.json?.name ?? parsedData?.nftData.metadata.data.name,
            symbol: parsedData?.nftData?.metadata.data.symbol,
        };
        return <TokenMintHeaderCard token={token} address={address} unverified={false} />;
    } else if (tokenInfo) {
        return defaultCard;
    }
    return defaultCard;
}

function Token22MintHeader({
    address,
    metadataExtension,
    metadataPointerExtension,
}: {
    address: string;
    metadataExtension: { extension: 'tokenMetadata'; state?: any };
    metadataPointerExtension: { extension: 'metadataPointer'; state?: any };
}) {
    const tokenMetadata = create(metadataExtension.state, TokenMetadata);
    const { metadataAddress } = create(metadataPointerExtension.state, MetadataPointer);
    const metadata = useMetadataJsonLink(getProxiedUri(tokenMetadata.uri), { suspense: true });

    const headerTokenMetadata = {
        logoURI: '',
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
    };
    if (metadata) {
        headerTokenMetadata.logoURI = metadata.image;
    }

    // Handles the basic case where MetadataPointer is referencing the Token Metadata extension directly
    // Does not handle the case where MetadataPointer is pointing at a separate account.
    if (metadataAddress?.toString() === address) {
        return <TokenMintHeaderCard address={address} token={headerTokenMetadata} unverified={false} />;
    }
    throw new Error('Metadata loading for non-token 2022 programs is not yet supported');
}

function TokenMintHeaderCard({
                                 address,
                                 token,
                                 unverified,
                             }: {
    address: string;
    token: { name?: string | undefined; logoURI?: string | undefined; symbol?: string | undefined };
    unverified: boolean;
}) {
    return (
        <div className="row align-items-center">
            {unverified && (
                <div className="alert alert-warning alert-scam" role="alert">
                    Warning! Token names and logos are not unique. This token may have spoofed its name and logo to look
                    like another token. Verify the token&apos;s mint address to ensure it is correct. If you are the
                    token creator, please verify your token on{' '}
                    <a
                        href="https://support.coingecko.com/hc/en-us/articles/23725417857817-Verification-Guide-for-Listing-Update-Requests-on-CoinGecko"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'white', textDecoration: 'underline' }}
                    >
                        Coingecko
                    </a>{' '}
                    or on{' '}
                    <a
                        href="https://verify.jup.ag/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'white', textDecoration: 'underline' }}
                    >
                        Jupiter
                    </a>
                    .
                </div>
            )}

            <div className="col-auto">
                <div className="avatar avatar-lg header-avatar-top">
                    {token?.logoURI ? (
                        <img
                            alt="token logo"
                            className="avatar-img rounded-circle border border-4 border-body"
                            height={16}
                            src={token.logoURI}
                            width={16}
                        />
                    ) : (
                        <Identicon
                            address={address}
                            className="avatar-img rounded-circle border border-body identicon-wrapper"
                            style={{ width: 64 }}
                        />
                    )}
                </div>
            </div>

            <div className="col ms-n3 ms-md-n2">
                <h6 className="header-pretitle">Token</h6>

                <h2 className="card-header-title ms-1 d-flex align-items-center gap-2 no-overflow-with-ellipsis">
                    {token?.name || 'Unknown Token'}

                    {/* ✅ Circular Verified Badge */}
                    {!unverified && (
                        <span title="Verified Token" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="12" cy="12" r="10" fill="#4CAF50" />
                                <path
                                    d="M16 9.5L10.75 14.75L8 12"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    )}
                </h2>

                <div className="header-pretitle ms-1 mt-1 no-overflow-with-ellipsis">
                    {token?.symbol ? token.symbol : 'No Symbol was found'}
                </div>
            </div>
        </div>
    );
}

