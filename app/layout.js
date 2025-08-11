import './globals.css';

export const metadata = {
  title: 'Supabase PWA',
  description: 'A small PWA with Supabase and Tailwind 4',
  manifest: '/manifest.json',
};

// ✅ New viewport export
export const viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
