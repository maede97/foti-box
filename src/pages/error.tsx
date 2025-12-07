'use client';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import LogoPage from './logo-page';

const ErrorPage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <LogoPage>
      <span className="text-error text-center text-lg">Fehler {message}</span>

      <span className="text-sm tracking-wide uppercase">
        Brauchen Sie hilfe?{' '}
        <Link
          href="mailto:mieten@foti-box.com"
          target="_blank"
          className="text-secondary hover:text-accent inline-flex items-center gap-1 underline"
        >
          hilfe@foti-box.com <ExternalLink className="size-4" />
        </Link>
      </span>
    </LogoPage>
  );
};

export default ErrorPage;
