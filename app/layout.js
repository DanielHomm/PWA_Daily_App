import './globals.css';
import ClientProviderLayout from './client-layout';

export const metadata = {
  title: 'Supabase PWA',
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <ClientProviderLayout>{children}</ClientProviderLayout>
      </body>
    </html>
  );
}
