// Test Environment Authentication API
// Handles password authentication for test.ragaujam.lt

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const validPassword = process.env.VERCEL_PASSWORD;

  if (!validPassword) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (password === validPassword) {
    // Set authentication cookie (expires in 24 hours)
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
    
    res.setHeader('Set-Cookie', [
      `test-auth=${validPassword}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; Secure; SameSite=Strict`
    ]);

    // Redirect to home page
    res.writeHead(302, { Location: '/' });
    res.end();
  } else {
    // Return to login page with error
    res.writeHead(302, { Location: '/?error=invalid_password' });
    res.end();
  }
}
