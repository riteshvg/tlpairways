// Temporarily disabled for Railway deployment
// Auth0 authentication will be configured after successful deployment

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(503).json({
        error: 'Auth0 authentication temporarily disabled',
        message: 'This will be enabled after deployment configuration'
    });
}
