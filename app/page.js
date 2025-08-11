import MessagesList from '../components/MessagesList';

export default function HomePage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Supabase PWA</h1>
      <MessagesList />
    </main>
  );
}
