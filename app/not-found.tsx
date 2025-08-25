import { ErrorCard } from '@components/common/ErrorCard';

export default function NotFoundPage() {
    return (
        <div className="container">
            <ErrorCard text="Page not found" />
        </div>
    );
}
