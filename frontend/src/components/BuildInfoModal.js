import React, { useState } from 'react';
import { Box, IconButton, Modal, Typography, Paper, Chip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

/**
 * BuildInfoModal - Displays build and deployment information
 * Shows commit hash, build time, and environment details
 */
const BuildInfoModal = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Build info injected at build time
    const buildInfo = {
        commitHash: process.env.REACT_APP_COMMIT_HASH || 'unknown',
        commitShort: process.env.REACT_APP_COMMIT_HASH?.substring(0, 7) || 'unknown',
        buildTime: process.env.REACT_APP_BUILD_TIME || 'unknown',
        branch: process.env.REACT_APP_BRANCH || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.REACT_APP_VERSION || '1.0.0'
    };

    return (
        <>
            {/* Floating Info Button */}
            <IconButton
                onClick={handleOpen}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                    boxShadow: 3,
                    zIndex: 1000,
                }}
                aria-label="Build Information"
            >
                <InfoIcon />
            </IconButton>

            {/* Build Info Modal */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="build-info-modal"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    sx={{
                        position: 'relative',
                        width: { xs: '90%', sm: 500 },
                        maxHeight: '80vh',
                        overflow: 'auto',
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Header */}
                    <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                        🚀 Build Information
                    </Typography>

                    {/* Build Details */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Environment */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Environment
                            </Typography>
                            <Chip
                                label={buildInfo.environment.toUpperCase()}
                                color={buildInfo.environment === 'production' ? 'success' : 'warning'}
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                        </Box>

                        {/* Version */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Version
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                {buildInfo.version}
                            </Typography>
                        </Box>

                        {/* Commit Hash */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Git Commit
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                    {buildInfo.commitShort}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ({buildInfo.commitHash})
                                </Typography>
                            </Box>
                        </Box>

                        {/* Branch */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Branch
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                {buildInfo.branch}
                            </Typography>
                        </Box>

                        {/* Build Time */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Build Time
                            </Typography>
                            <Typography variant="body1">
                                {buildInfo.buildTime !== 'unknown'
                                    ? new Date(buildInfo.buildTime).toLocaleString()
                                    : 'unknown'}
                            </Typography>
                        </Box>

                        {/* GitHub Link */}
                        {buildInfo.commitHash !== 'unknown' && (
                            <Box sx={{ mt: 2 }}>
                                <a
                                    href={`https://github.com/riteshvg/tlpairways/commit/${buildInfo.commitHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                    }}
                                >
                                    View on GitHub →
                                </a>
                            </Box>
                        )}
                    </Box>

                    {/* Footer Note */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
                        This information helps identify which version of the code is currently deployed.
                    </Typography>
                </Paper>
            </Modal>
        </>
    );
};

export default BuildInfoModal;
