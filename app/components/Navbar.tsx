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
            <div
                className="e-px-4"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    width: '100%',
                }}
            >
                <div
                    className="e-flex e-flex-row e-items-center e-justify-between"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <div
                        className="e-flex e-flex-row e-items-center"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row',
                            width: '100%',
                            gap: '20px',
                        }}
                    >
                        <Link href={homePath}>
                            <Image alt="Rox Explorer" height={40} src={Logo} width={214} />
                        </Link>

                        <span
                            className="e-flex e-flex-row !e-items-center"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'row',
                                gap: '4px',
                                height: '36px',
                                padding: '10px 16px',
                                borderRadius: '99px',
                                background: 'rgba(255, 255, 255, 0.10)',
                            }}
                        >
                            <Image alt="Rox Explorer" height={18} src={roxLogo} width={18} />
                            <p style={{ marginBottom: 0, fontSize: '14px', fontWeight: 500 }} className="text-white">
                                <span style={{ fontWeight: 600 }}> $ROX = $1.00</span>{' '}
                                <span style={{ color: '#169452', fontWeight: 600 }}>0.00%</span> | Txn fee:{' '}
                                <span style={{ fontWeight: 600 }} className="text-white">
                                    0.000005 ROX
                                </span>{' '}
                                per signature
                            </p>
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center !important',
                            flexDirection: 'row',
                            gap: '16px',
                        }}
                        className="flex-shrink-0 ms-1"
                    >
                        <a href="https://roxcustody.io/" target="_blank" rel="noopener noreferrer">
                            <p style={{ marginBottom: 0, fontWeight: 400, fontSize: '14px' }} className="text-white">
                                Rox Custody
                            </p>
                        </a>

                        <a href="https://documentation.roxcustody.io" target="_blank" rel="noopener noreferrer">
                            <p style={{ marginBottom: 0, fontWeight: 400, fontSize: '14px' }} className="text-white">
                                Documentation
                            </p>
                        </a>

                        <ClusterStatusButton />
                    </div>
                </div>

                {/* <button className="navbar-toggler" type="button" onClick={navHandlers.toggle}>
                    <span className="navbar-toggler-icon"></span>
                </button> */}

                <div>
                    <p className="text-white px-4">Explorer RoxChain</p>

                    <div className="navbar-children d-flex align-items-center flex-grow-1 w-50 h-100 d-none d-lg-block">
                        {children}
                    </div>
                </div>

                {/* 
                <div className={`collapse navbar-collapse ms-auto ${navOpened ? 'show' : ''} flex-shrink-0`}>
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link
                                className={`nav-link${selectedLayoutSegment === 'supply' ? ' active' : ''}`}
                                href={supplyPath}
                            >
                                Supply
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link${
                                    selectedLayoutSegments[0] === 'tx' && selectedLayoutSegments[1] === '(inspector)'
                                        ? ' active'
                                        : ''
                                }`}
                                href={inspectorPath}
                            >
                                Inspector
                            </Link>
                        </li>
                    </ul>
                </div> */}

                {/* <div className="d-none d-lg-block flex-shrink-0 ms-1">
                    <ClusterStatusButton />
                </div> */}
            </div>
        </nav>
    );
}
