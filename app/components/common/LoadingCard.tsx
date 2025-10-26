import React from 'react';

export function LoadingCard({ message }: { message?: string }) {
    return (
        <div className="card">
            <div className="card-body text-center card-header-title">
                <span className="align-text-top spinner-grow spinner-grow-sm me-2"></span>
                {message || 'Loading'}
            </div>
        </div>
    );
}
