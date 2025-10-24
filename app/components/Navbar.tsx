'use client';

import roxLogo from '@img/logos-solana/rox-chain.svg';
import Logo from '@img/logos-solana/light-explorer-logo.svg';
import { useDisclosure } from '@mantine/hooks';
import { useClusterPath } from '@utils/url';
import Image from 'next/image';
import Link from 'next/link';
// import { useSelectedLayoutSegment, useSelectedLayoutSegments } from 'next/navigation';
import React, { ReactNode } from 'react';
import { ClusterStatusButton } from './ClusterStatusButton';

export interface INavbarProps {
    children?: ReactNode;
}

export function Navbar({ children }: INavbarProps) {
    // const [navOpened, navHandlers] = useDisclosure(false);
    const [_, navHandlers] = useDisclosure(false);
    const homePath = useClusterPath({ pathname: '/' });
    // const supplyPath = useClusterPath({ pathname: '/supply' });
    // const inspectorPath = useClusterPath({ pathname: '/tx/inspector' });
    // const selectedLayoutSegment = useSelectedLayoutSegment();
    // const selectedLayoutSegments = useSelectedLayoutSegments();

    return (
        <nav className="navbar navbar-expand-lg navbar-light">
            <div className="navbar-container">
                <div className="navbar-main-row">
                    <div className="navbar-left-section">
                        <Link href={homePath}>
                            <Image alt="Rox Explorer" height={42} src={Logo} width={164} />
                        </Link>

                        <span className="navbar-price-badge">
                            <Image alt="Rox Explorer" height={18} src={roxLogo} width={18} />
                            <p className="navbar-price-text text-white">
                                <span style={{ fontWeight: 600 }}> $ROX = $1.00</span>{' '}
                                <span style={{ color: '#169452', fontWeight: 600 }}>0.00%</span> | Txn fee:{' '}
                                <span style={{ fontWeight: 600 }} className="text-white">
                                    0.000005 ROX
                                </span>{' '}
                                per signature
                            </p>
                        </span>
                    </div>

                    <div className="navbar-right-section flex-shrink-0 ms-1">
                        <a href="https://roxcustody.io/" target="_blank" rel="noopener noreferrer">
                            <p className="navbar-link-text text-white">Rox Custody</p>
                        </a>

                        <a href="https://documentation.roxcustody.io" target="_blank" rel="noopener noreferrer">
                            <p className="navbar-link-text text-white">Documentation</p>
                        </a>

                        <ClusterStatusButton />
                    </div>
                </div>

                <div className="px-4 w-75">
                    <p className="navbar-subtitle">Explorer RoxChain</p>

                    <div className="navbar-children-container  d-none d-lg-block">{children}</div>
                </div>
            </div>
        </nav>
    );
}
