import { Box, Card, CardContent, Typography, Chip, Button, Divider } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import LuggageIcon from '@mui/icons-material/Luggage';
import type { Flight } from '../../lib/agents/tools';

interface Props {
    flight: Flight;
    label?: 'Outbound' | 'Return';
    agentSessionId: string;
    onBook: (flight: Flight, label: string) => void;
}

export default function FlightResultCard({ flight, label = 'Outbound', agentSessionId, onBook }: Props) {
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    return (
        <Card
            elevation={0}
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 2,
                '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 12px rgba(0,105,92,0.12)' },
                transition: 'all 0.2s'
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={label}
                            size="small"
                            sx={{ backgroundColor: label === 'Outbound' ? '#E0F2F1' : '#E8F5E9', color: '#00695C', fontWeight: 600, fontSize: '0.65rem' }}
                        />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {flight.flightNumber} · {flight.aircraftType}
                        </Typography>
                    </Box>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                        {formatPrice(flight.price)}
                    </Typography>
                </Box>

                {/* Route + timing */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                        <Typography variant="h6" fontWeight={700} lineHeight={1}>{flight.departureTime}</Typography>
                        <Typography variant="caption" color="text.secondary">{flight.origin}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary" fontSize="0.65rem">{flight.originCity}</Typography>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', px: 1 }}>
                        <Typography variant="caption" color="text.secondary">{flight.duration}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', my: 0.25 }}>
                            <FlightTakeoffIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider', mx: 0.5 }} />
                            <FlightIcon sx={{ fontSize: 14, color: 'primary.main', transform: 'rotate(90deg)' }} />
                            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider', mx: 0.5 }} />
                            <FlightLandIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        </Box>
                        <Chip
                            label={flight.stops.length === 0 ? 'Non-stop' : `${flight.stops.length} stop`}
                            size="small"
                            sx={{ fontSize: '0.6rem', height: 16, bgcolor: flight.stops.length === 0 ? '#E8F5E9' : '#FFF8E1' }}
                        />
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                        <Typography variant="h6" fontWeight={700} lineHeight={1}>{flight.arrivalTime}</Typography>
                        <Typography variant="caption" color="text.secondary">{flight.destination}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary" fontSize="0.65rem">
                            {flight.destinationCity}{flight.destinationCountry ? `, ${flight.destinationCountry}` : ''}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Features + CTA */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        <Chip icon={<AirlineSeatReclineNormalIcon sx={{ fontSize: 12 }} />} label={`${flight.availableSeats} seats`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        <Chip icon={<LuggageIcon sx={{ fontSize: 12 }} />} label={flight.baggage.checked} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        {flight.cabinClass.slice(0, 2).map(c => (
                            <Chip key={c} label={c} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        ))}
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => onBook(flight, label)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', px: 2, whiteSpace: 'nowrap' }}
                    >
                        Book Flight →
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
