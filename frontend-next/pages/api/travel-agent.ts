/**
 * Travel Agent SSE Streaming API Route
 *
 * POST /api/travel-agent
 * Body: { messages: ConversationMessage[] }
 *
 * Streams SSE events as the orchestrator processes the request:
 *   data: {"type":"text","agent":"orchestrator","content":"..."}
 *   data: {"type":"agent_start","agent":"flight-agent","query":{...}}
 *   data: {"type":"agent_result","agent":"flight-agent","data":{...}}
 *   data: {"type":"done"}
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { runOrchestrator, ConversationMessage } from '../../lib/agents/orchestrator';

export const config = {
    api: { bodyParser: true }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const hasAzure = !!process.env.AZURE_OPENAI_API_KEY && !!process.env.AZURE_OPENAI_ENDPOINT;
    if (!hasAzure) {
        return res.status(500).json({ error: 'No LLM credentials configured. Set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in .env.local.' });
    }

    const { messages } = req.body as { messages: ConversationMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    function writeSSE(data: Record<string, any>) {
        try {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            // Force flush on Node.js writable streams
            const writable = res as any;
            if (typeof writable.flush === 'function') writable.flush();
            else if (typeof writable.flushHeaders === 'function') writable.flushHeaders();
        } catch {
            // Client disconnected
        }
    }

    // Handle client disconnect
    req.on('close', () => {
        res.end();
    });

    try {
        const usage = await runOrchestrator(messages, writeSSE);
        writeSSE({ type: 'done', usage });
    } catch (err: any) {
        console.error('Orchestrator error:', err);
        writeSSE({ type: 'error', message: err.message || 'Internal error' });
    } finally {
        res.end();
    }
}
