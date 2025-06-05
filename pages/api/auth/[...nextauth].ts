// Temporarily disabled NextAuth for minimal version
// This will be re-enabled once the basic site is working

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(501).json({
    message: 'Authentication temporarily disabled for development',
    error: 'NextAuth not configured yet'
  });
}
