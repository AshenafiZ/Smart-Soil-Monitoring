import { NextApiRequest, NextApiResponse } from 'next';

type MessagePayload = {
  message: string;
};

type ResponseData = {
  status?: string;
  message?: string;
  error?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method === 'POST') {
    const { message } = req.body as MessagePayload;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Log the message (you can save to a database here)
    console.log('Received message:', message);

    // Respond with success
    return res.status(200).json({ status: 'Message received', message });
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}