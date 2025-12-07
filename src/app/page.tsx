import IconList from '@/components/ui/icon-list';
import { ExternalLink } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Willkommen | foti-box.com`,
  description: `foti-box.com | Miete die Foti-Box für deinen Event`,
};

const HomePage: React.FC = () => {
  return (
    <div className="absolute flex size-full flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
        <Image
          src="/foti-box.png"
          alt="Foti Box"
          width={350}
          height={350}
          className="rounded-2xl shadow-md"
        />

        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <h1 className="mb-4 text-4xl font-semibold tracking-wide uppercase">foti-box.com</h1>

          <span className="text-sm tracking-wide uppercase">
            Box Mieten?{' '}
            <Link
              href="mailto:mieten@foti-box.com"
              target="_blank"
              className="text-secondary hover:text-accent inline-flex items-center gap-1 underline"
            >
              mieten@foti-box.com <ExternalLink className="size-4" />
            </Link>
          </span>

          <span className="text-sm tracking-wide">
            Mieten Sie die Foti-Box für Ihren nächsten Anlass.
          </span>

          <hr />

          <span className="text-sm tracking-wide">Wieso unsere Foti-Box:</span>
          <IconList
            iconSrc="/favicon.ico"
            items={[
              'Online-Galerie mit Passwort',
              'Logo auf jedem Bild (optional)',
              'Gute Kameraqualität',
              'Gäste können eigene Fotos hochladen (optional)',
            ]}
            className="text-left text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
