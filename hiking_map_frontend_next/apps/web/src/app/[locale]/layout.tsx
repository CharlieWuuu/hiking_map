import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';

import '../globals.css';

import AppNav from '../../components/AppNav';
import { NAV_COLLAPSED_STORAGE_KEY } from '../../components/AppNav/AppNav.const';
import { routing } from '../../i18n/routing';
import { THEME_STORAGE_KEY } from '../../lib/theme';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if (localStorage.getItem('${THEME_STORAGE_KEY}') === 'light') document.documentElement.classList.add('light');
if (localStorage.getItem('${NAV_COLLAPSED_STORAGE_KEY}') === 'true') document.documentElement.classList.add('nav-collapsed');`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <AppNav />
          <main className="flex-1 p-6 pb-20 lg:p-8 lg:pb-8 lg:pl-[calc(var(--nav-width)+2rem)]">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
