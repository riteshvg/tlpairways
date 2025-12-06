'use client';

import React, { useEffect, useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useConsent } from '../../lib/consent/ConsentContext';

export default function ConsentLauncher() {
    const { openManager } = useConsent();
    const [isMounted, setIsMounted] = useState(false);

    // Only render on client-side to avoid hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Tooltip title="Manage Cookie Preferences" placement="left">
            <Fab
                color="primary"
                aria-label="manage consent"
                onClick={openManager}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    left: 16,
                    zIndex: 1200,
                    boxShadow: '0px 4px 12px rgba(0, 105, 92, 0.3)'
                }}
            >
                <SettingsIcon />
            </Fab>
        </Tooltip>
    );
}
