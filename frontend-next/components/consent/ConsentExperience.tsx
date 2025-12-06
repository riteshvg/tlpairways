'use client';

import React from 'react';
import ConsentBanner from './ConsentBanner';
import ConsentModal from './ConsentModal';
import ConsentLauncher from './ConsentLauncher';

/**
 * ConsentExperience Component
 * 
 * Renders all consent UI components:
 * - Banner (if no consent decision)
 * - Modal (for granular preferences)
 * - Launcher (floating button to reopen)
 */
export default function ConsentExperience() {
    return (
        <>
            <ConsentBanner />
            <ConsentModal />
            <ConsentLauncher />
        </>
    );
}
