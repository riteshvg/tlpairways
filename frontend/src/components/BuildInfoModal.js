import React, { useState, useEffect } from 'react';
import { Box, IconButton, Modal, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

/**
 * BuildInfoModal - Displays build and deployment information
 * Fetches commit info from GitHub API at runtime to work on any platform
 */
const BuildInfoModal = () => {
    const [open, setOpen] = useState(false);
    const [commitInfo, setCommitInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Build info from environment (build time)
    const buildInfo = {
        buildTime: process.env.REACT_APP_BUILD_TIME || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.REACT_APP_VERSION || '1.0.0'
    };

    // Fetch commit info from GitHub API when modal opens
    useEffect(() => {
        if (open && !commitInfo && !loading) {
            fetchCommitInfo();
        }
    }, [open]);

    const fetchCommitInfo = async () => {
        setLoading(true);
        try {
            // Fetch the latest commit from the main branch
            const response = await fetch(
                'https://api.github.com/repos/riteshvg/tlpairways/commits/main',
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setCommitInfo({
                    sha: data.sha,
                    shortSha: data.sha.substring(0, 7),
                    message: data.commit.message.split('\n')[0], // First line only
                    author: data.commit.author.name,
                    date: new Date(data.commit.author.date).toLocaleString(),
                    branch: 'main'
                });
            } else {
                console.warn('Failed to fetch commit info from GitHub');
                setCommitInfo({
                    sha: 'unknown',
                    shortSha: 'unknown',
                    message: 'Unable to fetch commit info',
                    author: 'unknown',
                    date: 'unknown',
                    branch: 'unknown'
                });
            }
        } catch (error) {
            console.error('Error fetching commit info:', error);
            setCommitInfo({
                sha: 'unknown',
                shortSha: 'unknown',
                message: 'Error fetching commit info',
                author: 'unknown',
                date: 'unknown',
                branch: 'unknown'
            });
        } finally {
            setLoading(false);
        }
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

                        {/* Loading State */}
                        {loading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2" color="text.secondary">
                                    Fetching latest commit info...
                                </Typography>
                            </Box>
                        )}

                        {/* Commit Info */}
                        {commitInfo && !loading && (
                            <>
                                {/* Commit Hash */}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Latest Commit
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            {commitInfo.shortSha}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ({commitInfo.sha.substring(0, 12)}...)
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Commit Message */}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Commit Message
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                        "{commitInfo.message}"
                                    </Typography>
                                </Box>

                                {/* Author & Date */}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Author & Date
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {commitInfo.author} • {commitInfo.date}
                                    </Typography>
                                </Box>

                                {/* Branch */}
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Branch
                                    </Typography>
                                    <Chip
                                        label={commitInfo.branch}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                            </>
                        )}

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
                        {commitInfo && commitInfo.sha !== 'unknown' && (
                            <Box sx={{ mt: 2 }}>
                                <a
                                    href={`https://github.com/riteshvg/tlpairways/commit/${commitInfo.sha}`}
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
                        This information is fetched from GitHub in real-time to show the latest deployed commit.
                    </Typography>
                </Paper>
            </Modal>
        </>
    );
};

export default BuildInfoModal;
