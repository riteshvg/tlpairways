import { Box, Card, CardContent, Typography, Chip, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { CreateItineraryResult } from '../../lib/agents/tools';

interface Props {
    itinerary: CreateItineraryResult;
}

const ACTIVITY_COLORS: Record<string, string> = {
    accommodation: '#1565C0',
    exploration:   '#2E7D32',
    dining:        '#F57F17',
    culture:       '#6A1B9A',
    nature:        '#2E7D32',
    spiritual:     '#E65100',
    adventure:     '#D84315',
    shopping:      '#283593',
    transport:     '#37474F',
    business:      '#004D40',
    entertainment: '#AD1457',
    landscape:     '#0277BD',
};

const PURPOSE_LABELS: Record<string, string> = {
    vacation:         '🏖️ Leisure',
    business:         '💼 Business',
    business_leisure: '✈️ Bleisure',
    honeymoon:        '💍 Honeymoon',
    adventure:        '🧗 Adventure',
};

export default function ItineraryCard({ itinerary }: Props) {
    return (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: '#2E7D32', borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CalendarMonthIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={700}>{itinerary.destination}</Typography>
                    <Chip label={`${itinerary.duration_days} days`} size="small" sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.65rem' }} />
                    <Chip label={PURPOSE_LABELS[itinerary.travel_purpose] || itinerary.travel_purpose} size="small" sx={{ backgroundColor: '#E3F2FD', color: '#1565C0', fontSize: '0.65rem' }} />
                </Box>

                {/* Budget estimate */}
                <Box sx={{ mb: 1.5, p: 1, bgcolor: '#E8F5E9', borderRadius: 1, border: '1px solid #A5D6A7' }}>
                    <Typography variant="caption">💰 <strong>Budget estimate:</strong> {itinerary.budget_estimate}</Typography>
                </Box>

                {/* Day-by-day stepper */}
                <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { borderColor: '#A5D6A7', minHeight: 16 } }}>
                    {itinerary.itinerary.map((day) => (
                        <Step key={day.day} active>
                            <StepLabel
                                StepIconProps={{ style: { color: '#2E7D32' } }}
                                sx={{ py: 0.5, '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.8rem' } }}
                            >
                                Day {day.day} — {day.title}
                            </StepLabel>
                            <StepContent sx={{ borderLeft: '2px solid #A5D6A7', ml: 1.5 }}>
                                <Box sx={{ pb: 1 }}>
                                    {day.activities.map((act, i) => (
                                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 45 }}>
                                                <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{act.time}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        label={act.type}
                                                        size="small"
                                                        sx={{ fontSize: '0.55rem', height: 14, backgroundColor: `${ACTIVITY_COLORS[act.type] || '#37474F'}15`, color: ACTIVITY_COLORS[act.type] || '#37474F', textTransform: 'capitalize' }}
                                                    />
                                                    <Typography variant="caption" fontWeight={600}>{act.activity}</Typography>
                                                </Box>
                                                {act.tip && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.15 }}>
                                                        💡 {act.tip}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>

                {/* Packing tips */}
                {itinerary.packing_tips.length > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>🎒 Practical Tips</Typography>
                        {itinerary.packing_tips.map((tip, i) => (
                            <Typography key={i} variant="caption" color="text.secondary" display="block">• {tip}</Typography>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
