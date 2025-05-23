'use client';

import { useEffect, useState } from 'react';
import { SMS } from '@/types/sms';

export default function Home() {
  const [messages, setMessages] = useState<SMS[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Poll API every 5 seconds to fetch new messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/sms');
        if (!res.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await res.json();
        setMessages(data.messages || []);
        setError(null);
      } catch (err) {
        setError('Error fetching messages');
      }
    };

    fetchMessages(); // Initial fetch
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s

    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SMS Messages from Arduino</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {messages.length === 0 ? (
        <p>No messages received yet.</p>
      ) : (
        <ul className="list-disc pl-5">
          {messages.map((msg) => (
            <li key={msg._id} className="mb-2">
              <strong>Message:</strong> {msg.message} <br />
              <span className="text-gray-500 text-sm">
                Received: {new Date(msg.receivedAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}