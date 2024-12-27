import type { Metadata } from 'next';
import { routing } from '@/libs/i18nNavigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { notFound } from 'next/navigation';
import '../styles/globals.css';

export const metadata: Metadata = {
    icons: [
        {
            rel: 'apple-touch-icon',
            url: '/apple-touch-icon.png',
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            url: '/favicon-32x32.png',
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            url: '/favicon-16x16.png',
        },
        {
            rel: 'icon',
            url: '/favicon.ico',
        },
    ],
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await props.params;

    if (!routing.locales.includes(locale)) {
        //notFound();
    }

    setRequestLocale(locale);

    // Using internationalization in Client Components
    const messages = await getMessages();

    // The `suppressHydrationWarning` in <html> is used to prevent hydration errors caused by `next-themes`.
    // Solution provided by the package itself: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app

    // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
    // which dynamically adds a `style` attribute to the body tag.
    return (
        <html lang={locale} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        {props.children}
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
