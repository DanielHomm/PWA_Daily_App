import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'Supabase PWA',
  description: 'A small PWA with Supabase and Tailwind 4',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <Header />
        {children}
      </body>
    </html>
  );
}
