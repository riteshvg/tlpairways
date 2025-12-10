/**
 * Email Service
 * Handles sending booking confirmation emails via backend API
 */

// Get API URL from environment variable or use default
const API_BASE_URL = (() => {
    // If NEXT_PUBLIC_API_URL is explicitly set, use it
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Development fallback
    return 'http://localhost:3001/api';
})();

export interface BookingEmailData {
    // Passenger Information
    passengerName: string;
    email: string;
    phone?: string;

    // Booking Reference
    bookingId: string;
    pnr: string;
    bookingDate?: string;
    bookingStatus?: string;
    tripType?: string;

    // Flight Details
    flightNumber: string;
    airline?: string;
    aircraftType?: string;

    // Route Information
    from: string;
    fromCity?: string;
    fromAirport?: string;
    fromTerminal?: string;
    to: string;
    toCity?: string;
    toAirport?: string;
    toTerminal?: string;
    route: string;

    // Timing
    travelDate: string;
    departureTime: string;
    arrivalTime?: string | null;
    duration?: string | null;

    // Return Flight (if round trip)
    returnFlight?: {
        flightNumber: string;
        from: string;
        fromCity?: string;
        fromAirport?: string;
        fromTerminal?: string;
        to: string;
        toCity?: string;
        toAirport?: string;
        toTerminal?: string;
        route: string;
        travelDate: string;
        departureTime: string;
        arrivalTime?: string | null;
        duration?: string | null;
        travelClass?: string;
    } | null;

    // Passengers
    adults: number;
    children?: number;
    infants?: number;
    totalPassengers: number;
    passengers?: Array<{
        name: string;
        type: string;
        age?: number | null;
        seatNumber?: string | null;
        mealPreference?: string | null;
    }>;

    // Class & Fare
    travelClass: string;
    fareType?: string;

    // Pricing
    baseFare: number;
    taxes: number;
    totalAmount: number;
    currency?: string;
    paymentMethod?: string;
    paymentStatus?: string;

    // Baggage
    cabinBaggage?: string;
    checkinBaggage?: string;

    // Check-in Information
    webCheckinOpens?: string | null;
    reportingTime?: string | null;
    gateClosingTime?: string | null;

    // Links
    bookingUrl?: string | null;
    checkinUrl?: string | null;
    eTicketUrl?: string | null;
    manageBookingUrl?: string | null;
}

export interface EmailResponse {
    success: boolean;
    messageId?: string;
    message?: string;
    error?: string;
    weatherIncluded?: boolean;
}

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (
    bookingData: BookingEmailData
): Promise<EmailResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/email/send-booking-confirmation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send email');
        }

        return {
            success: true,
            messageId: data.messageId,
            message: data.message,
            weatherIncluded: data.weatherIncluded
        };
    } catch (error: any) {
        console.error('❌ Email send error:', error);
        return {
            success: false,
            error: error.message || 'Failed to send email'
        };
    }
};

/**
 * Check email service status
 */
export const checkEmailStatus = async (): Promise<{
    configured: boolean;
    message?: string;
}> => {
    try {
        const response = await fetch(`${API_BASE_URL}/email/status`);
        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('❌ Email status check error:', error);
        return {
            configured: false,
            message: error.message || 'Failed to check email service status'
        };
    }
};

export default {
    sendBookingConfirmationEmail,
    checkEmailStatus
};
