import IconList from '@/components/ui/icon-list';
import LogoPage from '@/pages/logo-page';
import { ExternalLink } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Willkommen | foti-box.com`,
  description: `foti-box.com | Miete die Foti-Box für deinen Event`,
};

const HomePage: React.FC = () => {
  return (
    <LogoPage>
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
    </LogoPage>
  );
};

export default HomePage;
