export enum ClusterStatus {
    Connected,
    Connecting,
    Failure,
}

export enum Cluster {
    MainnetBeta,
    Devnet,
    Custom,
}

export const CLUSTERS = [Cluster.MainnetBeta, Cluster.Devnet, Cluster.Custom];

export function clusterSlug(cluster: Cluster): string {
    switch (cluster) {
        case Cluster.MainnetBeta:
            return 'mainnet-beta';
        case Cluster.Devnet:
            return 'devnet';
        case Cluster.Custom:
            return 'custom';
    }
}

export function clusterName(cluster: Cluster): string {
    switch (cluster) {
        case Cluster.MainnetBeta:
            return 'Mainnet Beta';
        case Cluster.Devnet:
            return 'Devnet';
        case Cluster.Custom:
            return 'Custom';
    }
}

export const MAINNET_BETA_URL = 'https://roxchain.roxcustody.io';
export const DEVNET_URL = 'https://roxchain-dev.roxcustody.io';

const modifyUrl = (url: string): string => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return url;
    } else {
        return url.replace('api', 'explorer-api');
    }
};

export function clusterUrl(cluster: Cluster, customUrl: string): string {
    switch (cluster) {
        case Cluster.Devnet:
            return process.env.NEXT_PUBLIC_DEVNET_RPC_URL ?? modifyUrl(DEVNET_URL);
        case Cluster.MainnetBeta:
            return process.env.NEXT_PUBLIC_MAINNET_RPC_URL ?? modifyUrl(MAINNET_BETA_URL);
        case Cluster.Custom:
            return customUrl;
    }
}

export function serverClusterUrl(cluster: Cluster, customUrl: string): string {
    switch (cluster) {
        case Cluster.Devnet:
            return process.env.DEVNET_RPC_URL ?? modifyUrl(DEVNET_URL);
        case Cluster.MainnetBeta:
            return process.env.MAINNET_RPC_URL ?? modifyUrl(MAINNET_BETA_URL);
        case Cluster.Custom:
            return customUrl;
    }
}

export const DEFAULT_CLUSTER = Cluster.MainnetBeta;
