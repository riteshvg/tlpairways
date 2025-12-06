import React from 'react';
import { Box, Typography, Grid, Paper, Tooltip, styled } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';

// Types
interface SeatConfig {
    name: string;
    total_rows: number;
    classes: {
        [key: string]: {
            start_row: number;
            end_row: number;
            seats_per_row: number;
            layout: Array<{ type: string; count: number }>;
            exit_rows?: number[];
            extra_legroom_rows?: number[];
            preferred_rows?: number[];
            standard_rows?: number[];
        }
    };
    seat_pricing: {
        standard: number;
        exit_row: number;
        extra_legroom: number;
        preferred: number;
    };
}

interface SeatMapProps {
    config: SeatConfig;
    cabinClass: string;
    selectedSeat: string | null;
    occupiedSeats?: string[];
    onSeatSelect: (seat: { number: string; type: string; price: number }) => void;
}

const SeatButton = styled(Box)(({ theme }) => ({
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'scale(1.1)',
        zIndex: 1,
    },
}));

const SeatMap: React.FC<SeatMapProps> = ({ config, cabinClass, selectedSeat, occupiedSeats = [], onSeatSelect }) => {
    // Determine the active class config based on the passenger's class
    // Fallback to economy if specific class config not found (shouldn't happen with correct data)
    const classConfig = config.classes[cabinClass] || config.classes['economy'];

    // Generate seat letters map (A, B, C...)
    const getSeatLetter = (index: number) => String.fromCharCode(65 + index);

    const renderRow = (rowNum: number) => {
        let seatIndex = 0;
        const seats: React.ReactNode[] = [];

        // Determine row type for pricing/styling
        let rowType = 'standard';
        let rowPrice = 0;

        if (classConfig.exit_rows?.includes(rowNum)) { rowType = 'exit_row'; rowPrice = config.seat_pricing.exit_row; }
        else if (classConfig.extra_legroom_rows?.includes(rowNum)) { rowType = 'extra_legroom'; rowPrice = config.seat_pricing.extra_legroom; }
        else if (classConfig.preferred_rows?.includes(rowNum)) { rowType = 'preferred'; rowPrice = config.seat_pricing.preferred; }

        // Iterate through layout groups (e.g. Window group, Middle group)
        classConfig.layout.forEach((group, groupIdx) => {
            // Add aisle spacer if it's not the first group and not adjacent to previous
            // Simplified: The layout array implicitly defines aisles between groups usually? 
            // Actually JSON structure is: W(1), M(2), A(1) -> Aisle -> A(1), M(2), W(1)
            // Let's assume layout items are contiguous blocks of seats, and we might add a gap between them if needed.
            // But looking at the layout, it seems to describe the seats from left to right.
            // E.g. B737 economy: W (1), M (2), A (1), A (1), M (2), W (1). Total 8 items?
            // Wait: 1+2+1 + 1+2+1 = 8? 
            // Looking at B737 layout in file:
            // {"type": "W", "count": 1}, {"type": "M", "count": 2}, {"type": "A", "count": 1}, 
            // {"type": "A", "count": 1}, {"type": "M", "count": 2}, {"type": "W", "count": 1}
            // That is 1+2+1 = 4 (left side), and 1+2+1 = 4 (right side). Total 8 seats per row?
            // "seats_per_row": 6 says the JSON. 
            // Ah, maybe the JSON in Step 44 defines the VISUAL layout.
            // B737 Economy: W(1), M(2), A(1) ... A(1), M(2), W(1)?
            // seat_per_row 6 usually means 3-3. 
            // JSON: W(1), M(2) -> Wait, M is count 2? That would be W, M, M.
            // Standard B737 is 3-3. Usually A,B,C - D,E,F.
            // Let's respect the visual layout from render, but seat letters need to constitute A,B,C... consecutively.

            // Render seats in this group
            for (let i = 0; i < group.count; i++) {
                const letter = getSeatLetter(seatIndex);
                const seatNumber = `${rowNum}${letter}`;
                const isOccupied = occupiedSeats.includes(seatNumber);
                const isSelected = selectedSeat === seatNumber;

                // Seat Type Override (e.g. specific seat type like Window/Aisle from JSON)
                // But row type dictates price mostly in this model + seat type bonus?
                // The prompt/JSON has 'seat_pricing' by row type. 
                // The ancillary page logic had specific prices for Window/Aisle. 
                // Let's stick to the JSON 'seat_pricing' for row-based upgrades, 
                // and maybe adding a small fee for Window/Aisle if not standard row?
                // For simplicity, let's use the JSON pricing for the seat map.

                // Add a gap for aisles. Usually aisles are between groups?
                // Let's check the JSON again. B737: W, M, A, A, M, W. 
                // W(1), M(2) is a block of 3? No, M(2) means 2 middle seats?
                // B737 is usually 3-3. 
                // Let's assume layout chunks describe visual blocks separated by aisle.
                // Actually, looking at the JSON: 
                //   type: W, count: 1
                //   type: M, count: 2
                //   type: A, count: 1
                // This sums to 4. 
                // If seats_per_row is 6, the JSON might be slightly weird or I'm misinterpreting 
                // "M count 2" -> Middle, Middle?
                // Let's just iterate and assign letters. 
                // And add a gap in the middle of the generated seats?

                seats.push(
                    <Tooltip key={seatNumber} title={`${seatNumber} - ${rowType} - ₹${rowPrice}${isOccupied ? ' (Occupied)' : ''}`}>
                        <SeatButton
                            onClick={() => !isOccupied && onSeatSelect({ number: seatNumber, type: rowType, price: rowPrice })}
                            sx={{
                                bgcolor: isSelected ? 'primary.main' : isOccupied ? 'action.disabledBackground' :
                                    rowType === 'exit_row' ? '#e3f2fd' :
                                        rowType === 'extra_legroom' ? '#f3e5f5' :
                                            rowType === 'preferred' ? '#fff3e0' : 'white',
                                color: isSelected ? 'white' : isOccupied ? 'text.disabled' :
                                    rowType !== 'standard' ? 'text.primary' : 'text.secondary',
                                borderColor: isSelected ? 'primary.main' :
                                    rowType === 'exit_row' ? '#90caf9' :
                                        rowType === 'extra_legroom' ? '#ce93d8' :
                                            rowType === 'preferred' ? '#ffcc80' : '#e0e0e0',
                                pointerEvents: isOccupied ? 'none' : 'auto',
                                mr: 0.5,
                                mb: 0.5
                            }}
                        >
                            {isSelected ? <EventSeatIcon fontSize="small" /> : <Typography variant="caption" fontWeight="bold">{letter}</Typography>}
                        </SeatButton>
                    </Tooltip>
                );

                seatIndex++;
            }

            // Add Aisle Gap if not last group
            // Heuristic: If we are halfway through seats_per_row, add a gap?
            // Or just trust the groups represent chunks? 
            // If the JSON is W, M(2), A ... A, M(2), W
            // It suggests: [W, M, M, A] [A, M, M, W] -> 4-4? That's 8.
            // B737 economy seat_per_row is 6.
            // Let's just enforce a gap after seat C (index 3) for B737?
            // Logic: if seatIndex % (seats_per_row / 2) === 0, add gap? (Assuming 2 aisles or 1 centered aisle)
        });

        // Simplified Visuals: Just break after every 3 seats for narrow body (6 across), 
        // and 3-3-3 or 3-4-3 for wide body.
        // Let's construct the visual row with manual gaps based on cabin class seats_per_row

        const finalRow: React.ReactNode[] = [];
        const seatsPerRow = classConfig.seats_per_row;
        let aisleIndices: number[] = [];

        if (seatsPerRow === 6) aisleIndices = [3]; // 3-3
        if (seatsPerRow === 4) aisleIndices = [2]; // 2-2
        if (seatsPerRow === 9) aisleIndices = [3, 6]; // 3-3-3
        if (seatsPerRow === 10) aisleIndices = [3, 7]; // 3-4-3

        for (let i = 0; i < seats.length; i++) {
            finalRow.push(seats[i]);
            if (aisleIndices.includes(i + 1) && i < seats.length - 1) {
                finalRow.push(<Box key={`aisle-${rowNum}-${i}`} sx={{ width: 20 }} />);
            }
        }

        return (
            <Box key={rowNum} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ width: 24, textAlign: 'center', mr: 2, color: 'text.secondary' }}>{rowNum}</Typography>
                {finalRow}
            </Box>
        );
    };

    return (
        <Paper elevation={3} sx={{ p: 2, bgcolor: '#fafafa', maxHeight: '600px', overflowY: 'auto' }}>
            <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>Front of Aircraft</Typography>
                <Box sx={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '10px solid #bdbdbd', margin: '0 auto' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {Array.from({ length: classConfig.end_row - classConfig.start_row + 1 }, (_, i) => classConfig.start_row + i).map(renderRow)}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: 'white', border: '1px solid #ddd', borderRadius: 1 }} />
                    <Typography variant="caption">Standard</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 1 }} />
                    <Typography variant="caption">Exit Row</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: 1 }} />
                    <Typography variant="caption">Extra Legroom</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
                    <Typography variant="caption">Selected</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default SeatMap;
