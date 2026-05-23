import { Box, Card, CardContent, Typography, Chip, Button, Rating } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WifiIcon from '@mui/icons-material/Wifi';
import PoolIcon from '@mui/icons-material/Pool';
import SpaIcon from '@mui/icons-material/Spa';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import type { Hotel } from '../../lib/agents/tools';

interface Props {
    hotel: Hotel;
    agentSessionId: string;
    onBook: (hotel: Hotel) => void;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
    wifi: <WifiIcon sx={{ fontSize: 12 }} />,
    pool: <PoolIcon sx={{ fontSize: 12 }} />,
    'infinity-pool': <PoolIcon sx={{ fontSize: 12 }} />,
    spa: <SpaIcon sx={{ fontSize: 12 }} />,
    restaurant: <RestaurantIcon sx={{ fontSize: 12 }} />,
    gym: <FitnessCenterIcon sx={{ fontSize: 12 }} />,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    'ultra-luxury': { bg: '#FFF8E1', text: '#F57F17' },
    luxury:         { bg: '#E8F5E9', text: '#1B5E20' },
    boutique:       { bg: '#E3F2FD', text: '#0D47A1' },
    premium:        { bg: '#F3E5F5', text: '#4A148C' },
};

export default function HotelResultCard({ hotel, agentSessionId, onBook }: Props) {
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    const catColor = CATEGORY_COLORS[hotel.category] || CATEGORY_COLORS.premium;
    const displayAmenities = hotel.amenities.slice(0, 5);
    const enriched = hotel as any;

    return (
        <Card
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 2,
                '&:hover': { borderColor: '#6A1B9A', boxShadow: '0 2px 12px rgba(106,27,154,0.12)' },
                transition: 'all 0.2s'
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25, flexWrap: 'wrap' }}>
                            <Chip
                                label={hotel.category}
                                size="small"
                                sx={{ backgroundColor: catColor.bg, color: catColor.text, fontWeight: 600, fontSize: '0.65rem', textTransform: 'capitalize' }}
                            />
                            {enriched.top_pick && (
                                <Chip icon={<AutoAwesomeIcon sx={{ fontSize: 11 }} />} label="Top Pick" size="small"
                                    sx={{ bgcolor: '#F3E5F5', color: '#4A148C', fontWeight: 700, fontSize: '0.6rem' }} />
                            )}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                            {hotel.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <LocationOnIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                {hotel.neighbourhood} · {hotel.distanceFromAirport} from airport
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="secondary.main" fontWeight={700} lineHeight={1}>
                            {formatPrice(hotel.pricePerNight)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">/night</Typography>
                    </Box>
                </Box>

                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={hotel.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="caption" fontWeight={600}>{hotel.rating.toFixed(1)}</Typography>
                    <Typography variant="caption" color="text.secondary">({hotel.reviewCount.toLocaleString()} reviews)</Typography>
                </Box>

                {/* Agent match reason */}
                {enriched.match_reason ? (
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start', mb: 1, p: 1, borderRadius: 1.5, bgcolor: '#FAF0FF', border: '1px solid #E1BEE7' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 13, color: '#6A1B9A', mt: 0.1, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#4A148C', lineHeight: 1.4 }}>{enriched.match_reason}</Typography>
                    </Box>
                ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.4 }}>
                        {hotel.description.substring(0, 120)}...
                    </Typography>
                )}

                {/* Amenities + CTA */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {displayAmenities.map(a => (
                            <Chip
                                key={a}
                                icon={AMENITY_ICONS[a] as any}
                                label={a.replace(/-/g, ' ')}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 20, textTransform: 'capitalize' }}
                            />
                        ))}
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => onBook(hotel)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 2,
                            whiteSpace: 'nowrap',
                            borderColor: '#6A1B9A',
                            color: '#6A1B9A',
                            '&:hover': { backgroundColor: '#F3E5F5', borderColor: '#4A148C' }
                        }}
                    >
                        Book Hotel →
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
