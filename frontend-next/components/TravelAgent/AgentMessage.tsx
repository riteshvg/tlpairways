import { Box, Avatar, Typography, CircularProgress } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import ExploreIcon from '@mui/icons-material/Explore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type AgentId =
    | 'orchestrator'
    | 'flight-agent'
    | 'hotel-agent'
    | 'destination-agent'
    | 'itinerary-agent'
    | 'profile-agent'
    | 'weather-agent'
    | 'summary-agent'
    | 'user';

interface AgentConfig {
    label: string;
    color: string;
    bgColor: string;
    bubbleBg: string;
    icon: React.ReactNode;
}

const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
    orchestrator:        { label: 'Travel Agent',      color: '#1565C0', bgColor: '#1565C0', bubbleBg: '#F0F7FF', icon: <AutoAwesomeIcon sx={{ fontSize: 15 }} /> },
    'flight-agent':      { label: 'Flight Agent',      color: '#00695C', bgColor: '#00695C', bubbleBg: '#F0FAFA', icon: <FlightIcon sx={{ fontSize: 15 }} /> },
    'hotel-agent':       { label: 'Hotel Agent',       color: '#6A1B9A', bgColor: '#6A1B9A', bubbleBg: '#FAF0FF', icon: <HotelIcon sx={{ fontSize: 15 }} /> },
    'destination-agent': { label: 'Destination Agent', color: '#BF360C', bgColor: '#BF360C', bubbleBg: '#FFF8F0', icon: <ExploreIcon sx={{ fontSize: 15 }} /> },
    'itinerary-agent':   { label: 'Itinerary Agent',   color: '#2E7D32', bgColor: '#2E7D32', bubbleBg: '#F0FFF2', icon: <CalendarMonthIcon sx={{ fontSize: 15 }} /> },
    'profile-agent':     { label: 'Profile Agent',     color: '#37474F', bgColor: '#37474F', bubbleBg: '#F5F7F8', icon: <PersonIcon sx={{ fontSize: 15 }} /> },
    'weather-agent':     { label: 'Weather Agent',     color: '#1565C0', bgColor: '#1565C0', bubbleBg: '#EFF5FF', icon: <WbSunnyIcon sx={{ fontSize: 15 }} /> },
    'summary-agent':     { label: 'Summary Agent',     color: '#AD1457', bgColor: '#AD1457', bubbleBg: '#FFF0F5', icon: <SummarizeIcon sx={{ fontSize: 15 }} /> },
    user:                { label: 'You',               color: '#FFFFFF', bgColor: '#00695C', bubbleBg: '#00695C', icon: <PersonIcon sx={{ fontSize: 15 }} /> },
};

interface Props {
    agent: AgentId;
    content: string;
    isLoading?: boolean;
    isStreaming?: boolean;
}

function TypingDots({ color }: { color: string }) {
    return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', py: 0.5 }}>
            {[0, 1, 2].map(i => (
                <Box
                    key={i}
                    sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: color,
                        opacity: 0.7,
                        animation: 'bounce 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                        '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
                            '40%': { transform: 'scale(1)', opacity: 1 },
                        }
                    }}
                />
            ))}
        </Box>
    );
}

export default function AgentMessage({ agent, content, isLoading, isStreaming }: Props) {
    const config = AGENT_CONFIGS[agent] || AGENT_CONFIGS.orchestrator;
    const isUser = agent === 'user';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 1,
                mb: 2.5,
            }}
        >
            {/* Avatar */}
            <Avatar
                sx={{
                    width: 30,
                    height: 30,
                    bgcolor: config.bgColor,
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
            >
                {config.icon}
            </Avatar>

            <Box sx={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                {/* Agent label */}
                {!isUser && (
                    <Typography
                        variant="caption"
                        sx={{ color: config.bgColor, fontWeight: 700, fontSize: '0.68rem', mb: 0.4, ml: 0.5, letterSpacing: 0.3 }}
                    >
                        {config.label}
                    </Typography>
                )}

                {/* Bubble */}
                <Box
                    sx={{
                        px: 2,
                        py: isLoading ? 1.5 : 1.5,
                        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                        background: isUser
                            ? 'linear-gradient(135deg, #00695C 0%, #00897B 100%)'
                            : config.bubbleBg,
                        border: isUser ? 'none' : `1px solid ${config.bgColor}22`,
                        boxShadow: isUser
                            ? '0 2px 12px rgba(0,105,92,0.3)'
                            : '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                >
                    {isLoading ? (
                        <TypingDots color={config.bgColor} />
                    ) : (
                        <Box
                            sx={{
                                color: isUser ? 'white' : 'text.primary',
                                fontSize: '0.875rem',
                                lineHeight: 1.65,
                                '& p': { m: 0, mb: 0.8 },
                                '& p:last-child': { mb: 0 },
                                '& ul, & ol': { pl: 2.5, my: 0.5 },
                                '& li': { mb: 0.3 },
                                '& strong': { fontWeight: 700, color: isUser ? 'white' : config.bgColor },
                                '& h1, & h2, & h3': { mt: 1, mb: 0.5, fontWeight: 700, lineHeight: 1.3 },
                                '& h3': { fontSize: '0.9rem' },
                                '& code': {
                                    backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : `${config.bgColor}18`,
                                    borderRadius: 1,
                                    px: 0.5,
                                    fontSize: '0.8rem',
                                    fontFamily: 'monospace',
                                },
                                '& hr': { border: 'none', borderTop: `1px solid ${config.bgColor}30`, my: 1 },
                            }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                            {isStreaming && (
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'inline-block',
                                        width: 2,
                                        height: '1em',
                                        backgroundColor: config.bgColor,
                                        ml: 0.3,
                                        verticalAlign: 'text-bottom',
                                        animation: 'blink 1s step-end infinite',
                                        '@keyframes blink': {
                                            '0%, 100%': { opacity: 1 },
                                            '50%': { opacity: 0 },
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
