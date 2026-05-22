import { useState, useEffect } from 'react';
import {
    Box, Typography, Chip, Collapse, IconButton, Badge,
    Table, TableBody, TableCell, TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StreamIcon from '@mui/icons-material/Stream';

interface AepEvent {
    eventType: string;
    payload: Record<string, any>;
    timestamp: string;
}

const EVENT_COLORS: Record<string, string> = {
    'travel.agent.sessionStarted':   '#1565C0',
    'travel.agent.intentClassified': '#6A1B9A',
    'travel.agent.flightAgentSearched': '#00695C',
    'travel.agent.hotelAgentSearched':  '#6A1B9A',
    'travel.agent.destinationQueried':  '#E65100',
    'travel.agent.itineraryGenerated':  '#2E7D32',
    'travel.agent.resultSelected':      '#F57F17',
    'travel.agent.bookingHandoff':      '#D84315',
};

export default function AepEventsPanel() {
    const [events, setEvents] = useState<AepEvent[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [newCount, setNewCount] = useState(0);

    useEffect(() => {
        const handler = (e: CustomEvent<{ eventType: string; payload: Record<string, any> }>) => {
            const newEvent: AepEvent = {
                eventType: e.detail.eventType,
                payload: e.detail.payload,
                timestamp: new Date().toISOString()
            };
            setEvents(prev => [newEvent, ...prev].slice(0, 20));
            if (!expanded) setNewCount(n => n + 1);
        };

        window.addEventListener('tlp:aep:event', handler as EventListener);
        return () => window.removeEventListener('tlp:aep:event', handler as EventListener);
    }, [expanded]);

    const handleToggle = () => {
        setExpanded(e => !e);
        setNewCount(0);
    };

    const shortType = (eventType: string) => eventType.replace('travel.agent.', '');

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: '#1565C020',
                borderRadius: 2,
                backgroundColor: '#F8FBFF',
                overflow: 'hidden',
            }}
        >
            {/* Header toggle */}
            <Box
                onClick={handleToggle}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#EEF4FF' }
                }}
            >
                <StreamIcon sx={{ fontSize: 14, color: '#1565C0' }} />
                <Typography variant="caption" fontWeight={700} color="#1565C0" sx={{ flex: 1 }}>
                    AEP Web SDK Events
                </Typography>
                {events.length > 0 && (
                    <Badge badgeContent={newCount || undefined} color="error" max={99}>
                        <Chip
                            label={`${events.length} sent`}
                            size="small"
                            sx={{ fontSize: '0.6rem', height: 16, backgroundColor: '#E3F2FD', color: '#1565C0' }}
                        />
                    </Badge>
                )}
                {events.length === 0 && (
                    <Typography variant="caption" color="text.disabled" fontSize="0.65rem">
                        Waiting for events...
                    </Typography>
                )}
                <IconButton size="small" sx={{ p: 0 }}>
                    {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ maxHeight: 260, overflowY: 'auto', px: 2, pb: 1.5 }}>
                    {events.length === 0 ? (
                        <Typography variant="caption" color="text.disabled" sx={{ py: 1, display: 'block', fontStyle: 'italic' }}>
                            alloy("sendEvent", ...) calls will appear here as agents run.
                        </Typography>
                    ) : (
                        events.map((ev, i) => (
                            <Box
                                key={i}
                                sx={{
                                    mb: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: `${EVENT_COLORS[ev.eventType] || '#37474F'}20`,
                                    backgroundColor: `${EVENT_COLORS[ev.eventType] || '#37474F'}06`,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                    <Chip
                                        label={shortType(ev.eventType)}
                                        size="small"
                                        sx={{
                                            fontSize: '0.6rem',
                                            height: 16,
                                            backgroundColor: `${EVENT_COLORS[ev.eventType] || '#37474F'}15`,
                                            color: EVENT_COLORS[ev.eventType] || '#37474F',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                    <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                                        {new Date(ev.timestamp).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                                <Table size="small" sx={{ '& td': { py: 0.1, px: 0.5, fontSize: '0.6rem', border: 'none', fontFamily: 'monospace' } }}>
                                    <TableBody>
                                        {Object.entries(ev.payload).slice(0, 4).map(([k, v]) => (
                                            <TableRow key={k}>
                                                <TableCell sx={{ color: '#0D47A1', whiteSpace: 'nowrap', fontWeight: 600 }}>{k}</TableCell>
                                                <TableCell sx={{ color: '#2E7D32', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Typography variant="caption" color="text.disabled" fontSize="0.55rem" sx={{ mt: 0.25, display: 'block' }}>
                                    xdm.identityMap + _tlairways.travelAgent included · sent via alloy()
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>
            </Collapse>
        </Box>
    );
}
