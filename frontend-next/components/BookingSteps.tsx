import { Box, Stepper, Step, StepLabel, useTheme, useMediaQuery } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface BookingStepsProps {
    currentStep?: 'details' | 'addons' | 'payment' | 'review';
    activeStep?: number; // Legacy support
}

const BookingSteps = ({ currentStep, activeStep: legacyStep }: BookingStepsProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const steps = [
        { label: 'Traveller Details', short: 'Details', id: 'details' },
        { label: 'Add-ons', short: 'Add-ons', id: 'addons' },
        { label: 'Payment', short: 'Payment', id: 'payment' },
        { label: 'Review', short: 'Review', id: 'review' }
    ];

    // Determine active step index
    let activeStep = 0;
    if (currentStep) {
        activeStep = steps.findIndex(s => s.id === currentStep);
    } else if (typeof legacyStep === 'number') {
        activeStep = legacyStep;
    }

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: 'background.paper',
                py: { xs: 2, md: 3 },
                px: { xs: 2, md: 4 },
                borderBottom: '2px solid',
                borderColor: 'primary.light',
                position: 'sticky',
                top: 64, // Below navbar
                zIndex: 999,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
            <Stepper
                activeStep={activeStep}
                alternativeLabel={!isMobile}
                sx={{
                    '& .MuiStepLabel-root .Mui-completed': {
                        color: 'success.main',
                    },
                    '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                        color: 'text.secondary',
                    },
                    '& .MuiStepLabel-root .Mui-active': {
                        color: 'primary.main',
                    },
                    '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
                        color: 'primary.main',
                        fontWeight: 600,
                    },
                    '& .MuiStepLabel-label': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    },
                    '& .MuiStep-root': {
                        px: { xs: 0.5, sm: 1 },
                    }
                }}
            >
                {steps.map((step, index) => {
                    const stepProps: any = {};

                    if (index < activeStep) {
                        stepProps.completed = true;
                    }

                    return (
                        <Step key={step.label} {...stepProps}>
                            <StepLabel
                                StepIconComponent={index < activeStep ? CheckCircleIcon : undefined}
                            >
                                {isMobile ? step.short : step.label}
                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            {/* Progress Bar */}
            <Box
                sx={{
                    mt: 2,
                    height: 4,
                    bgcolor: 'grey.200',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: { xs: 'block', md: 'none' } // Only show on mobile
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        bgcolor: 'primary.main',
                        width: `${((activeStep + 1) / steps.length) * 100}%`,
                        transition: 'width 0.3s ease-in-out'
                    }}
                />
            </Box>
        </Box>
    );
};

// Custom icon for completed steps
const CheckCircleIcon = (props: any) => {
    return <CheckCircle {...props} sx={{ color: 'success.main' }} />;
};

export default BookingSteps;

