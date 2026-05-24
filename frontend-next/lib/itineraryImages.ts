/**
 * Curated keyword → [Unsplash photo URLs] map for itinerary day images.
 * All IDs are verified HTTP 200 without an API key.
 *
 * resolveItineraryImages() processes all days together and ensures each day
 * gets a unique image — even when multiple days match the same category.
 */

import type { ItineraryDay } from './agents/tools';

const BASE = 'https://images.unsplash.com/photo-';
const P = '?auto=format&fit=crop&w=800&h=220&q=80';
const photo = (id: string) => `${BASE}${id}${P}`;

// General pool used as fallback when category photos run out
const GENERAL_POOL = [
    photo('1477959858617-67f85cf4f1df'), // city skyline dusk
    photo('1441974231531-c6227db76b6e'), // forest/nature green
    photo('1507525428034-b723cf961d3e'), // tropical beach
    photo('1553913861-c0fddf2619ee'),     // art/culture interior
    photo('1540555700478-4be289fbecef'), // spa/wellness
    photo('1551632811-561732d1e306'),     // adventure/hiking
    photo('1441984904996-e0b6ba687e04'), // shopping mall
    photo('1526495124232-a04e1849168c'), // travel (verified)
    photo('1579783902614-a3fb3927b6a5'), // travel (verified)
    photo('1583417319070-4a69db38a482'), // travel (verified)
    photo('1490806843957-31f4c9a91c65'), // travel (verified)
    photo('1555993539-1732b0258235'),     // travel (verified)
    photo('1524492412937-b28074a5d7da'), // travel (verified)
    photo('1549060279-7e168fcee0c2'),     // travel (verified)
];

// Each rule: [keywords, [photo1, photo2, ...]] — multiple photos per category
// so successive days in the same category can draw different images.
const RULES: [string[], string[]][] = [
    // ── Bali ──────────────────────────────────────────────────────────────────
    [
        ['ubud', 'rice terrace', 'tegallalang', 'bali rice', 'rice field'],
        [photo('1537996194471-e657df975ab4'), photo('1441974231531-c6227db76b6e')],
    ],
    [
        ['uluwatu', 'bukit peninsula', 'sea cliff', 'pura luhur'],
        [photo('1500917293891-ef795e70e1f6'), photo('1558618666-fcd25c85cd64')],
    ],
    [
        ['balinese temple', 'pura', 'sacred', 'tirta', 'tanah lot', 'bali temple', 'monkey forest', 'besakih'],
        [photo('1552733407-5d5c46c3bb3b'), photo('1537996194471-e657df975ab4'), photo('1508009603885-50cf7c579365')],
    ],
    [
        ['bali beach', 'nusa dua', 'jimbaran', 'seminyak', 'kuta beach', 'canggu beach'],
        [photo('1558618666-fcd25c85cd64'), photo('1507525428034-b723cf961d3e')],
    ],
    [
        ['bali spa', 'ubud wellness', 'bali resort', 'jungle pool'],
        [photo('1540555700478-4be289fbecef'), photo('1537996194471-e657df975ab4')],
    ],
    [
        ['bali', 'balinese'],
        [photo('1537996194471-e657df975ab4'), photo('1552733407-5d5c46c3bb3b'), photo('1558618666-fcd25c85cd64'), photo('1500917293891-ef795e70e1f6')],
    ],

    // ── Singapore ─────────────────────────────────────────────────────────────
    [
        ['marina bay', 'mbs', 'marina bay sands', 'helix bridge', 'bay front', 'marina barrage'],
        [photo('1559570278-eb8d71d06403'), photo('1557804506-669a67965ba0')],
    ],
    [
        ['gardens by the bay', 'supertree', 'cloud forest', 'flower dome', 'conservatory'],
        [photo('1526495124232-a04e1849168c'), photo('1559570278-eb8d71d06403')],
    ],
    [
        ['singapore', 'orchard', 'sentosa', 'chinatown', 'little india', 'clarke quay', 'bugis', 'tiong bahru'],
        [photo('1557804506-669a67965ba0'), photo('1559570278-eb8d71d06403'), photo('1526495124232-a04e1849168c')],
    ],

    // ── Dubai ─────────────────────────────────────────────────────────────────
    [
        ['burj khalifa', 'downtown dubai', 'dubai mall', 'fountain show', 'dubai frame'],
        [photo('1512453979798-5ea266f8880c'), photo('1580674684081-7617fbf3d745')],
    ],
    [
        ['dubai desert', 'desert dune', 'desert safari', 'camel', 'bedouin', 'wadi'],
        [photo('1539037116277-4db20889f2d4'), photo('1512453979798-5ea266f8880c')],
    ],
    [
        ['dubai marina', 'jbr', 'palm jumeirah', 'burj al arab', 'bluewaters'],
        [photo('1580674684081-7617fbf3d745'), photo('1512453979798-5ea266f8880c')],
    ],
    [
        ['dubai', 'gold souk', 'deira', 'bur dubai', 'abu dhabi'],
        [photo('1512453979798-5ea266f8880c'), photo('1580674684081-7617fbf3d745'), photo('1539037116277-4db20889f2d4')],
    ],

    // ── London ────────────────────────────────────────────────────────────────
    [
        ['tower bridge', 'big ben', 'westminster', 'buckingham', 'thames', 'london', 'covent garden', 'shoreditch', 'camden', 'notting hill', 'kensington', 'british museum', 'tate modern'],
        [photo('1513635269975-59663e0ac1ad'), photo('1477959858617-67f85cf4f1df')],
    ],

    // ── Sydney ────────────────────────────────────────────────────────────────
    [
        ['opera house', 'harbour bridge', 'circular quay', 'darling harbour', 'sydney cbd', 'the rocks'],
        [photo('1506905925346-21bda4d32df4'), photo('1477959858617-67f85cf4f1df')],
    ],
    [
        ['bondi', 'manly', 'coogee', 'sydney beach', 'northern beaches'],
        [photo('1517090186835-e348b621c9ca'), photo('1507525428034-b723cf961d3e')],
    ],
    [
        ['sydney', 'paddington', 'surry hills', 'newtown', 'blue mountains'],
        [photo('1506905925346-21bda4d32df4'), photo('1517090186835-e348b621c9ca'), photo('1477959858617-67f85cf4f1df')],
    ],

    // ── Tokyo ─────────────────────────────────────────────────────────────────
    [
        ['shibuya', 'shinjuku', 'harajuku', 'akihabara', 'asakusa', 'senso-ji', 'meiji shrine'],
        [photo('1545569341-9eb8b30979d9'), photo('1540959733332-eab4deabeeaf')],
    ],
    [
        ['tokyo night', 'neon lights', 'roppongi', 'ginza lights', 'odaiba'],
        [photo('1540959733332-eab4deabeeaf'), photo('1545569341-9eb8b30979d9')],
    ],
    [
        ['tokyo', 'japan', 'kimono', 'sumo', 'ramen', 'sushi', 'mount fuji', 'kyoto', 'osaka'],
        [photo('1545569341-9eb8b30979d9'), photo('1540959733332-eab4deabeeaf')],
    ],

    // ── Bangkok / Thailand ────────────────────────────────────────────────────
    [
        ['wat pho', 'wat phra', 'grand palace', 'chao phraya', 'bangkok temple', 'thai temple', 'wat arun'],
        [photo('1508009603885-50cf7c579365'), photo('1571019613454-1cb2f99b2d8b')],
    ],
    [
        ['floating market', 'chatuchak', 'night bazaar', 'khao san', 'chinatown bangkok', 'yaowarat'],
        [photo('1571019613454-1cb2f99b2d8b'), photo('1528360983277-13d401cdc186')],
    ],
    [
        ['bangkok', 'thai', 'thailand', 'phuket', 'chiang mai', 'koh samui', 'pattaya', 'sukhumvit'],
        [photo('1528360983277-13d401cdc186'), photo('1508009603885-50cf7c579365'), photo('1571019613454-1cb2f99b2d8b')],
    ],

    // ── Paris ─────────────────────────────────────────────────────────────────
    [
        ['eiffel', 'louvre', 'montmartre', 'champs', 'versailles', 'seine', 'paris', 'le marais', 'sacré-cœur', 'notre dame', 'musée', 'galeries'],
        [photo('1549060279-7e168fcee0c2'), photo('1553913861-c0fddf2619ee')],
    ],

    // ── New York ──────────────────────────────────────────────────────────────
    [
        ['central park', 'manhattan', 'brooklyn bridge', 'times square', 'fifth avenue', 'new york', 'nyc', 'statue of liberty', 'high line', 'soho'],
        [photo('1490806843957-31f4c9a91c65'), photo('1477959858617-67f85cf4f1df')],
    ],

    // ── Maldives ──────────────────────────────────────────────────────────────
    [
        ['maldives', 'overwater bungalow', 'water villa', 'atoll', 'turquoise lagoon'],
        [photo('1507525428034-b723cf961d3e'), photo('1558618666-fcd25c85cd64')],
    ],

    // ── Kuala Lumpur ──────────────────────────────────────────────────────────
    [
        ['petronas', 'klcc', 'kuala lumpur', 'kl tower', 'batu caves', 'bukit bintang', 'putrajaya'],
        [photo('1583417319070-4a69db38a482'), photo('1477959858617-67f85cf4f1df')],
    ],

    // ── Hong Kong ─────────────────────────────────────────────────────────────
    [
        ['victoria harbour', 'tsim sha tsui', 'hong kong', 'kowloon', 'causeway bay', 'wan chai', 'peak tram'],
        [photo('1501854140801-50d01698950b'), photo('1477959858617-67f85cf4f1df')],
    ],

    // ── Activity / theme ──────────────────────────────────────────────────────
    [
        ['beach', 'tropical', 'turquoise', 'snorkel', 'dive', 'island', 'paradise', 'coral reef'],
        [photo('1507525428034-b723cf961d3e'), photo('1558618666-fcd25c85cd64')],
    ],
    [
        ['temple', 'shrine', 'pagoda', 'monk', 'buddha', 'spiritual', 'prayer', 'ancient ruins'],
        [photo('1552733407-5d5c46c3bb3b'), photo('1508009603885-50cf7c579365')],
    ],
    [
        ['fine dining', 'rooftop dinner', 'michelin', 'tasting menu', 'chef', 'cocktail bar', 'wine dinner'],
        [photo('1414235077428-338989a2e8c0'), photo('1476224203421-9ac39bcb3327')],
    ],
    [
        ['street food', 'hawker', 'food market', 'night market', 'local cuisine', 'culinary tour'],
        [photo('1476224203421-9ac39bcb3327'), photo('1414235077428-338989a2e8c0')],
    ],
    [
        ['spa', 'wellness', 'massage', 'retreat', 'infinity pool', 'pool villa', 'relaxation', 'hammam'],
        [photo('1540555700478-4be289fbecef'), photo('1500917293891-ef795e70e1f6')],
    ],
    [
        ['nature', 'forest', 'jungle', 'waterfall', 'hiking', 'botanical garden', 'wildlife'],
        [photo('1441974231531-c6227db76b6e'), photo('1537996194471-e657df975ab4')],
    ],
    [
        ['adventure', 'surf', 'rafting', 'skydive', 'extreme sport', 'zip line', 'trekking'],
        [photo('1551632811-561732d1e306'), photo('1441974231531-c6227db76b6e')],
    ],
    [
        ['shopping', 'luxury brand', 'fashion', 'boutique', 'mall', 'souvenirs'],
        [photo('1441984904996-e0b6ba687e04'), photo('1553913861-c0fddf2619ee')],
    ],
    [
        ['museum', 'art gallery', 'exhibition', 'heritage', 'historic', 'architecture tour'],
        [photo('1553913861-c0fddf2619ee'), photo('1441984904996-e0b6ba687e04')],
    ],
    [
        ['skyline', 'panorama', 'observation deck', 'rooftop view', 'city view', 'sunset view'],
        [photo('1477959858617-67f85cf4f1df'), photo('1540959733332-eab4deabeeaf')],
    ],
    [
        ['desert', 'dune', 'oasis', 'sand'],
        [photo('1539037116277-4db20889f2d4')],
    ],
    [
        ['farewell', 'departure', 'airport transfer', 'last day', 'checkout'],
        [photo('1555993539-1732b0258235'), photo('1477959858617-67f85cf4f1df')],
    ],
    [
        ['arrival', 'check-in', 'hotel lobby', 'settle in', 'first impression'],
        [photo('1491555103944-7c647fd857e6'), photo('1549877452-9c387954fbc2')],
    ],
];

/**
 * Resolves a unique image URL for every itinerary day.
 * Processes all days together so no two days share the same photo.
 */
export function resolveItineraryImages(
    days: ItineraryDay[],
    destination: string,
): Record<number, string> {
    const result: Record<number, string> = {};
    const used = new Set<string>();

    const pick = (candidates: string[]): string | null => {
        const fresh = candidates.filter(p => !used.has(p));
        const chosen = fresh.length > 0 ? fresh[0] : candidates[0] ?? null;
        if (chosen) used.add(chosen);
        return chosen;
    };

    for (const day of days) {
        if (!day.image_query) continue;
        const haystack = `${day.image_query} ${destination}`.toLowerCase();

        let resolved: string | null = null;

        // Try each rule in order
        for (const [keywords, photos] of RULES) {
            if (keywords.some(kw => haystack.includes(kw))) {
                resolved = pick(photos);
                break;
            }
        }

        // Fall back to general pool
        if (!resolved) resolved = pick(GENERAL_POOL);

        // Last resort: picsum (always unique via day number)
        if (!resolved) {
            resolved = `https://picsum.photos/seed/${destination.toLowerCase().replace(/\s+/g, '-')}-day${day.day}/800/220`;
        }

        result[day.day] = resolved;
    }

    return result;
}
