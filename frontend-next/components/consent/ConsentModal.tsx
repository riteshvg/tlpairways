'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormGroup,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Divider
} from '@mui/material';
import { useConsent } from '../../lib/consent/ConsentContext';
import { CONSENT_CATEGORIES, ConsentPreferences } from '../../lib/consent/consentConfig';

export default function ConsentModal() {
    const { isModalOpen, closeManager, saveGranularPreferences, preferences } = useConsent();
    const [localPreferences, setLocalPreferences] = useState<ConsentPreferences>(preferences);

    const handleToggle = (category: keyof ConsentPreferences) => {
        setLocalPreferences(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleSave = () => {
        saveGranularPreferences(localPreferences);
    };

    return (
        <Dialog
            open={isModalOpen}
            onClose={closeManager}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                    Manage Cookie Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Choose which cookies you want to allow. You can change these settings at any time.
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <FormGroup>
                    {CONSENT_CATEGORIES.map((category, index) => (
                        <Box key={category.id}>
                            {index > 0 && <Divider sx={{ my: 2 }} />}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={localPreferences[category.id]}
                                        onChange={() => handleToggle(category.id)}
                                        disabled={category.required}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {category.label}
                                            {category.required && (
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    sx={{ ml: 1, color: 'text.secondary' }}
                                                >
                                                    (Required)
                                                </Typography>
                                            )}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {category.description}
                                        </Typography>
                                    </Box>
                                }
                                sx={{
                                    alignItems: 'flex-start',
                                    mb: 1,
                                    '& .MuiFormControlLabel-label': {
                                        mt: 0.5
                                    }
                                }}
                            />
                        </Box>
                    ))}
                </FormGroup>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={closeManager} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save Preferences
                </Button>
            </DialogActions>
        </Dialog>
    );
}
