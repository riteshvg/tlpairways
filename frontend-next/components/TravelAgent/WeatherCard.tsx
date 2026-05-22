import { Box, Typography, Chip } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import type { WeatherForecast } from '../../lib/agents/tools';

interface Props {
    forecast: WeatherForecast;
}

const UV_COLORS: Record<string, string> = {
    'Low': '#4CAF50', 'Moderate': '#FF9800', 'High': '#F44336',
    'Very High': '#9C27B0', 'Extreme': '#B71C1C',
};
const HUMIDITY_COLORS: Record<string, string> = {
    'Low': '#4CAF50', 'Moderate': '#FF9800', 'High': '#F44336', 'Very High': '#9C27B0',
};

export default function WeatherCard({ forecast }: Props) {
    return (
        <Box>
            {/* Header */}
            <Box sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)', color: 'white', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>{forecast.destination}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>{forecast.travel_period}</Typography>
                <Box sx={{ mt: 1 }}>
                    <Chip label={forecast.season} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem', mr: 0.75 }} />
                </Box>
                <Typography variant="body2" sx={{ mt: 1.5, opacity: 0.9, lineHeight: 1.5 }}>{forecast.overview}</Typography>
                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                    <Box>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>Avg High</Typography>
                        <Typography variant="h5" fontWeight={700}>{forecast.avg_high}°C</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>Avg Low</Typography>
                        <Typography variant="h5" fontWeight={700}>{forecast.avg_low}°C</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {[
                    { label: 'Humidity', value: forecast.humidity_level, color: HUMIDITY_COLORS[forecast.humidity_level] || '#757575' },
                    { label: 'UV Index', value: forecast.uv_index, color: UV_COLORS[forecast.uv_index] || '#757575' },
                    { label: 'Rain Chance', value: forecast.rainfall_chance, color: '#1565C0' },
                ].map(stat => (
                    <Box key={stat.label} sx={{ flex: 1, minWidth: 90, p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">{stat.label}</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Daily forecast */}
            {forecast.daily?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        Daily Forecast
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5 }}>
                        {forecast.daily.map((day, i) => (
                            <Box key={i} sx={{
                                minWidth: 72, p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                                bgcolor: 'background.paper', textAlign: 'center', flexShrink: 0,
                            }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>
                                    {day.label}
                                </Typography>
                                <Typography sx={{ fontSize: '1.4rem', lineHeight: 1.4 }}>{day.icon}</Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', display: 'block', mb: 0.25 }}>
                                    {day.condition}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
                                    {day.high}° <Typography component="span" variant="caption" color="text.secondary">{day.low}°</Typography>
                                </Typography>
                                {day.note && (
                                    <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'primary.main', display: 'block', mt: 0.25 }}>
                                        {day.note}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Best time of day */}
            {forecast.best_time_of_day && (
                <Box sx={{ mb: 2, p: 1.25, borderRadius: 2, bgcolor: '#FFF8E1', border: '1px solid #FFE082', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <WbSunnyIcon sx={{ fontSize: 16, color: '#F9A825', mt: 0.1, flexShrink: 0 }} />
                    <Typography variant="caption" color="text.primary">{forecast.best_time_of_day}</Typography>
                </Box>
            )}

            {/* Packing tips */}
            {forecast.packing_tips?.length > 0 && (
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        🎒 Weather Packing Tips
                    </Typography>
                    {forecast.packing_tips.map((tip, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5, p: 1, borderRadius: 1.5, bgcolor: '#F3F4F6' }}>
                            <Typography sx={{ fontSize: '0.75rem' }}>•</Typography>
                            <Typography variant="caption">{tip}</Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
