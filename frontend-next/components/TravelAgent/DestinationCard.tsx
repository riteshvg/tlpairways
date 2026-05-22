import { Box, Card, CardContent, Typography, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlaceIcon from '@mui/icons-material/Place';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LanguageIcon from '@mui/icons-material/Language';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import type { DestinationInfo } from '../../lib/agents/tools';

interface Props {
    destination: DestinationInfo;
}

const HIGHLIGHT_COLORS: Record<string, string> = {
    spiritual:   '#E65100',
    nature:      '#2E7D32',
    landscape:   '#1565C0',
    beach:       '#00838F',
    culture:     '#6A1B9A',
    landmark:    '#37474F',
    adventure:   '#D84315',
    food:        '#F57F17',
    entertainment: '#AD1457',
    shopping:    '#283593',
    experience:  '#00695C',
    historical:  '#4E342E',
    nightlife:   '#4527A0',
    attraction:  '#0277BD',
};

export default function DestinationCard({ destination }: Props) {
    return (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: '#E65100', borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header */}
                <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PlaceIcon sx={{ color: '#E65100', fontSize: 18 }} />
                        <Typography variant="h6" fontWeight={700}>{destination.name}</Typography>
                        <Typography variant="caption" color="text.secondary">· {destination.country}</Typography>
                        <Chip label={destination.tagline} size="small" sx={{ backgroundColor: '#FFF3E0', color: '#E65100', fontSize: '0.65rem', fontStyle: 'italic' }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {destination.description}
                    </Typography>
                </Box>

                {/* Quick facts */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WbSunnyIcon sx={{ fontSize: 13, color: '#F57F17' }} />
                        <Typography variant="caption" color="text.secondary"><strong>Best time:</strong> {destination.bestTimeToVisit}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CurrencyExchangeIcon sx={{ fontSize: 13, color: '#1565C0' }} />
                        <Typography variant="caption" color="text.secondary"><strong>Currency:</strong> {destination.currency}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LanguageIcon sx={{ fontSize: 13, color: '#2E7D32' }} />
                        <Typography variant="caption" color="text.secondary"><strong>Language:</strong> {destination.language}</Typography>
                    </Box>
                </Box>

                {/* Visa */}
                <Box sx={{ mb: 1.5, p: 1, bgcolor: '#FFF8E1', borderRadius: 1, border: '1px solid #FFE082' }}>
                    <Typography variant="caption" fontWeight={600}>🛂 Visa: </Typography>
                    <Typography variant="caption">{destination.visaRequirements}</Typography>
                </Box>

                {/* Highlights */}
                <Accordion elevation={0} disableGutters sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0 } }}>
                        <Typography variant="caption" fontWeight={700}>🌟 Top Highlights ({destination.highlights.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        {destination.highlights.map((h, i) => (
                            <Box key={i} sx={{ mb: 1, pb: 1, borderBottom: i < destination.highlights.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                                    <Chip
                                        label={h.type}
                                        size="small"
                                        sx={{ fontSize: '0.6rem', height: 16, backgroundColor: `${HIGHLIGHT_COLORS[h.type] || '#37474F'}15`, color: HIGHLIGHT_COLORS[h.type] || '#37474F', textTransform: 'capitalize' }}
                                    />
                                    <Typography variant="caption" fontWeight={700}>{h.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">· {h.entryFee}</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>{h.description}</Typography>
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>

                {/* Tips */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                    <TipsAndUpdatesIcon sx={{ fontSize: 14, color: '#F57F17', mt: 0.25 }} />
                    <Box>
                        <Typography variant="caption" fontWeight={700} display="block">Local Tips</Typography>
                        {destination.tips.slice(0, 2).map((tip, i) => (
                            <Typography key={i} variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>• {tip}</Typography>
                        ))}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
