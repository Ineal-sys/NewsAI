'use client';

import React from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Button from '@mui/material/Button';
import Link from 'next/link';
import SyncIcon from '@mui/icons-material/Sync'; // Example icon
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'; // Example icon

export default function ToggleReadFilterButton() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentIncludeRead = searchParams.get('includeRead') === 'true';

    // Create a new URLSearchParams object to preserve existing parameters
    const newSearchParams = new URLSearchParams(Array.from(searchParams.entries()));

    let buttonText: string;
    let buttonIcon: React.ReactElement;

    if (currentIncludeRead) {
        // If currently showing all, create link to show only unread
        buttonText = "Voir uniquement les articles non lus";
        buttonIcon = <VisibilityOffIcon sx={{ mr: 1 }} />;
        newSearchParams.delete('includeRead'); // Remove the parameter
    } else {
        // If currently showing only unread, create link to show all
        buttonText = "Voir tous les articles";
        buttonIcon = <SyncIcon sx={{ mr: 1 }} />;
        newSearchParams.set('includeRead', 'true'); // Add the parameter
    }

    // Construct the href using const
    const href = `${pathname}?${newSearchParams.toString()}`;

    return (
        <Button
            variant="outlined"
            size="small"
            href={href}
            component={Link} // Use Next.js Link for client-side navigation
            sx={{ my: 2 }} // Add some margin
        >
            {buttonIcon}
            {buttonText}
        </Button>
    );
}
