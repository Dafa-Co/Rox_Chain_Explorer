'use client';

import Logo from '@img/logos-solana/light-explorer-logo.svg';
import RoxCustodyLogo from '@img/logos-solana/light-roxcustody-logo.svg';
import roxLogo from '@img/logos-solana/rox-chain.svg';
import roxIcon from '@img/rox-icon.png';
import { useDisclosure } from '@mantine/hooks';
import { useClusterPath } from '@utils/url';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode, useCallback } from 'react';
import { Menu } from 'react-feather';

import { useClusterModal } from '../providers/cluster';
import { ClusterStatusButton } from './ClusterStatusButton';

export interface INavbarProps {
    children?: ReactNode;
}

export function Navbar({ children }: INavbarProps) {
    // const [navOpened, navHandlers] = useDisclosure(false);
    const [_, _navHandlers] = useDisclosure(false);
    const homePath = useClusterPath({ pathname: '/' });
    const pathname = usePathname();
    const isHomePage = pathname === '/' || pathname === homePath;
    // const supplyPath = useClusterPath({ pathname: '/supply' });
    // const inspectorPath = useClusterPath({ pathname: '/tx/inspector' });
    // const selectedLayoutSegment = useSelectedLayoutSegment();
    // const selectedLayoutSegments = useSelectedLayoutSegments();

    const [, setShow] = useClusterModal();

    const onClickHandler = useCallback(() => setShow(true), [setShow]);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="navbar-container px-10">
                    <div className="navbar-main-row">
                        <div className="navbar-left-section">
                            <div className="rox-logo-container">
                                <Link href={homePath}>
                                    <Image alt="Rox Explorer" height={40} src={Logo} />
                                </Link>

                                <Menu className="navbar-menu-icon" onClick={onClickHandler} />
                            </div>

                            <div className="navbar-price-badge">
                                <div className="rox-price-container">
                                    <Image alt="Rox Explorer" height={20} src={roxLogo} width={20} />
                                    <p className="price-value">$ROX = $1.00</p>
                                    <p className="price-change mx-1">0.00%</p>
                                </div>

                                <div className="txn-fee-container">
                                    <span className="txn-fee-separator">|</span>
                                    <p className="txn-fee">
                                        Txn fee: <span className="txn-fee-value">0.000005 ROX</span> per signature
                                    </p>
                                </div>
                            </div>
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

                        <Menu className="outer-navbar-menu-icon" onClick={onClickHandler} />
                    </div>

                    <div className="navbar-search-container">
                        <p className="navbar-subtitle">Explorer RoxChain</p>

                        <div className="navbar-children-container">{children}</div>
                    </div>
                </div>
            </nav>

            {isHomePage && (
                <div className="home-banner">
                    <Image alt="Rox Explorer" height={42} src={RoxCustodyLogo} width={164} />
                    <p className="font-skyline text-center mb-0 home-banner-text">
                        The Institutional-Grade Digital-Asset Platform
                    </p>

                    <Image alt="Rox icon" height={114} src={roxIcon} width={119} className="banner-icon" />
                </div>
            )}
        </>
    );
}
