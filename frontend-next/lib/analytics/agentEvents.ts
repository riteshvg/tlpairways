/**
 * AEP Web SDK (alloy.js) event wrappers for Travel Agent interactions.
 *
 * These send XDM-formatted events directly to the Adobe Edge Network,
 * complementing the existing adobeDataLayer push-based approach.
 *
 * Two-track strategy:
 *   Track 1 → adobeDataLayer.push() (existing, for Tags/Launch)
 *   Track 2 → alloy("sendEvent", ...) (new, for Edge Network + Real-Time Profile)
 *
 * Identity stitching: every event carries an identityMap with ECID (managed by
 * alloy automatically) plus the hashed email when the user is authenticated.
 */

declare global {
    interface Window {
        alloy?: (command: string, options?: Record<string, any>) => Promise<any>;
        _tlAgentEcid?: string;
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAlloy(): ((cmd: string, opts?: Record<string, any>) => Promise<any>) | null {
    if (typeof window === 'undefined') return null;
    return window.alloy ?? null;
}

async function hashString(value: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) return value;
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getAuthenticatedEmail(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem('tlpairways_userData');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.isAuthenticated && parsed?.userEmail ? parsed.userEmail : null;
    } catch {
        return null;
    }
}

async function buildIdentityMap(): Promise<Record<string, any>> {
    const identityMap: Record<string, any> = {};
    const email = getAuthenticatedEmail();
    if (email) {
        const hashed = await hashString(email.toLowerCase().trim());
        identityMap['Email'] = [{ id: hashed, authenticatedState: 'authenticated', primary: false }];
    }
    return identityMap;
}

// ─── Core send wrapper ────────────────────────────────────────────────────────

async function sendAgentEvent(eventType: string, payload: Record<string, any>): Promise<void> {
    const alloy = getAlloy();
    if (!alloy) {
        console.warn('⚠️ alloy not available — Web SDK event not sent:', eventType);
        return;
    }

    const identityMap = await buildIdentityMap();

    const xdm: Record<string, any> = {
        eventType,
        timestamp: new Date().toISOString(),
        identityMap,
        _tlairways: {
            travelAgent: payload
        }
    };

    try {
        await alloy('sendEvent', { xdm });
        console.log(`✅ AEP Web SDK → ${eventType}`, payload);
        // Emit a DOM event so the AepEventsPanel component can pick it up reactively
        window.dispatchEvent(new CustomEvent('tlp:aep:event', { detail: { eventType, payload } }));
    } catch (err) {
        console.warn('⚠️ alloy sendEvent failed:', err);
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function trackAgentSessionStarted(data: {
    agentSessionId: string;
    userPrompt: string;
    intentType: string;
}): Promise<void> {
    await sendAgentEvent('travel.agent.sessionStarted', {
        agentSessionId: data.agentSessionId,
        userPrompt: data.userPrompt,
        intentType: data.intentType
    });
}

export async function trackAgentIntentClassified(data: {
    agentSessionId: string;
    intentType: string;
    destination?: string;
    travelPurpose?: string;
    agentsActivated: string[];
}): Promise<void> {
    await sendAgentEvent('travel.agent.intentClassified', data);
}

export async function trackFlightAgentSearched(data: {
    agentSessionId: string;
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    resultsCount: number;
}): Promise<void> {
    await sendAgentEvent('travel.agent.flightAgentSearched', data);
}

export async function trackHotelAgentSearched(data: {
    agentSessionId: string;
    destination: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    resultsCount: number;
}): Promise<void> {
    await sendAgentEvent('travel.agent.hotelAgentSearched', data);
}

export async function trackDestinationQueried(data: {
    agentSessionId: string;
    destinationCode: string;
    destinationName: string;
}): Promise<void> {
    await sendAgentEvent('travel.agent.destinationQueried', data);
}

export async function trackItineraryGenerated(data: {
    agentSessionId: string;
    destination: string;
    durationDays: number;
    travelPurpose: string;
}): Promise<void> {
    await sendAgentEvent('travel.agent.itineraryGenerated', data);
}

export async function trackAgentResultSelected(data: {
    agentSessionId: string;
    resultType: 'flight' | 'hotel';
    resultId: string;
    resultName: string;
    price?: number;
    destination?: string;
}): Promise<void> {
    await sendAgentEvent('travel.agent.resultSelected', data);
}

export async function trackAgentBookingHandoff(data: {
    agentSessionId: string;
    bookingType: 'flight' | 'hotel';
    destinationCode: string;
    targetPage: string;
}): Promise<void> {
    await sendAgentEvent('travel.agent.bookingHandoff', data);
}
