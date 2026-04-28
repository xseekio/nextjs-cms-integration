import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'xSeek Next.js Starter',
  description: 'Static blog rendered from xSeek-managed content.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: 720,
          margin: '0 auto',
          padding: '40px 24px',
          lineHeight: 1.55,
          color: '#1c1f2a',
        }}
      >
        {children}
      </body>
    </html>
  );
}
