import SupplyPageClient from './page-client';

export const metadata = {
    description: `Overview of the native token supply on Rox`,
    title: `Supply Overview | Rox`,
};

export default function SupplyPage() {
    return <SupplyPageClient />;
}
