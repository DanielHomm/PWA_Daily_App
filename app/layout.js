import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
import Header from '../components/Header';

export const metadata = {
  title: 'Supabase PWA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <AuthProvider>
          <Header />
          <main className="p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
