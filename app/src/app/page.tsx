import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-700">Solawi Manager</div>
          <div className="flex gap-4">
            <Link href="/about">
              <Button variant="ghost">Ueber uns</Button>
            </Link>
            <Link href="/distribution-centers">
              <Button variant="ghost">Verteilpunkte</Button>
            </Link>
            <Link href="/login">
              <Button>Anmelden</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Willkommen bei der Solidarischen Landwirtschaft
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gemeinsam fuer nachhaltige, regionale Ernaehrung. Werde Teil unserer
            Gemeinschaft und erhalte woechentlich frisches Gemuese direkt vom Feld.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="text-lg px-8">
                Jetzt bewerben
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Mehr erfahren
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Frisches Gemuese</h3>
            <p className="text-gray-600">
              Woechentlich frisches, saisonales Gemuese direkt vom Feld zu deinem Verteilpunkt.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gemeinschaft</h3>
            <p className="text-gray-600">
              Teil einer aktiven Gemeinschaft sein, die gemeinsam nachhaltige Landwirtschaft unterstuetzt.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparenz</h3>
            <p className="text-gray-600">
              Wisse genau, woher dein Essen kommt und wie es angebaut wird.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Solawi Manager. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
