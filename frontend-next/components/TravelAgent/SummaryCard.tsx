import { Box, Card, CardContent, Typography, Chip, LinearProgress, Divider } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { TripSummary } from '../../lib/agents/tools';

interface Props {
    summary: TripSummary;
}

const PURPOSE_LABELS: Record<string, string> = {
    vacation:         '🏖️ Leisure',
    business:         '💼 Business',
    business_leisure: '✈️ Bleisure',
    honeymoon:        '💍 Honeymoon',
    adventure:        '🧗 Adventure',
    family:           '👨‍👩‍👧 Family',
    leisure:          '🏖️ Leisure',
};

function ReadinessGauge({ score }: { score: number }) {
    const color = score >= 90 ? '#2E7D32' : score >= 70 ? '#1565C0' : '#F57F17';
    const label = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair';
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">Trip Readiness</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color }}>{score}</Typography>
                    <Typography variant="caption" color="text.secondary">/100</Typography>
                    <Chip label={label} size="small" sx={{ fontSize: '0.6rem', height: 16, bgcolor: `${color}18`, color }} />
                </Box>
            </Box>
            <LinearProgress
                variant="determinate"
                value={score}
                sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#E0E0E0',
                    '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                }}
            />
        </Box>
    );
}

export default function SummaryCard({ summary }: Props) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

            {/* Executive Summary */}
            <Card elevation={0} sx={{ border: '1px solid #AD145730', borderRadius: 2, bgcolor: '#FFF0F5' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <AutoAwesomeIcon sx={{ color: '#AD1457', fontSize: 16, mt: 0.1, flexShrink: 0 }} />
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                <Typography variant="caption" fontWeight={800} sx={{ color: '#AD1457', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                                    Trip Brief
                                </Typography>
                                <Chip
                                    label={PURPOSE_LABELS[summary.travel_purpose] || summary.travel_purpose}
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 16, bgcolor: '#AD145718', color: '#AD1457' }}
                                />
                                <Chip
                                    label={`${summary.duration_days} days`}
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 16, bgcolor: '#E3F2FD', color: '#1565C0' }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ lineHeight: 1.65, color: 'text.primary' }}>
                                {summary.executive_summary}
                            </Typography>
                        </Box>
                    </Box>
                    {summary.personalized_for && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #AD145720' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                ✨ Personalised for: <strong>{summary.personalized_for}</strong>
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Readiness score */}
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                    <ReadinessGauge score={summary.readiness_score ?? 85} />
                </CardContent>
            </Card>

            {/* Trip Highlights grid */}
            {summary.trip_highlights?.length > 0 && (
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        🌟 Trip at a Glance
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        {summary.trip_highlights.map((h, i) => (
                            <Card key={i} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{h.icon}</Typography>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                            {h.label}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" fontWeight={700} display="block" sx={{ lineHeight: 1.3, mb: 0.25 }}>
                                        {h.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.4 }}>
                                        {h.detail}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Budget */}
            {summary.total_estimate && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#E8F5E9', border: '1px solid #A5D6A7' }}>
                    <Typography variant="caption" fontWeight={700} color="#2E7D32" display="block" sx={{ mb: 0.25 }}>
                        💰 Budget Estimate
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="text.primary">{summary.total_estimate}</Typography>
                </Box>
            )}

            {/* Top Recommendations */}
            {summary.top_recommendations?.length > 0 && (
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        💡 Agent Recommendations
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {summary.top_recommendations.map((rec, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 1, p: 1.25, borderRadius: 1.5, bgcolor: '#FFFDE7', border: '1px solid #FFF9C4' }}>
                                <Typography sx={{ fontSize: '0.75rem', color: '#F9A825', fontWeight: 800, flexShrink: 0, lineHeight: 1.6 }}>{i + 1}</Typography>
                                <Typography variant="caption" color="text.primary" sx={{ lineHeight: 1.55 }}>{rec}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            <Divider />

            {/* Next Steps */}
            {summary.next_steps?.length > 0 && (
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        🚀 Next Steps
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {summary.next_steps.map((step, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <CheckCircleIcon sx={{ fontSize: 14, color: '#2E7D32', mt: 0.15, flexShrink: 0 }} />
                                <Typography variant="caption" fontWeight={600} sx={{ lineHeight: 1.55, flex: 1 }}>{step}</Typography>
                                <ArrowForwardIcon sx={{ fontSize: 12, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
