import React from 'react';
import ConsentBanner from './ConsentBanner';
import ConsentManagementModal from './ConsentManagementModal';
import ConsentManagerLauncher from './ConsentManagerLauncher';

const ConsentExperience = () => (
  <>
    <ConsentBanner />
    <ConsentManagerLauncher />
    <ConsentManagementModal />
  </>
);

export default ConsentExperience;

