import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
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
            sizes: '96x96',
            url: '/favicon-96x96.png',
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '192x192',
            url: '/favicon-192x192.png',
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '512x512',
            url: '/favicon-512x512.png',
        },
        {
            rel: 'icon',
            type: 'image/svg+xml',
            url: '/favicon.svg',
        },
        {
            rel: 'shortcut icon',
            url: '/favicon.ico',
        },
    ],
};

export default async function RootLayout(props: { children: React.ReactNode }) {
    // The `suppressHydrationWarning` in <html> is used to prevent hydration errors caused by `next-themes`.
    // Solution provided by the package itself: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app

    // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
    // which dynamically adds a `style` attribute to the body tag.
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {props.children}
                </ThemeProvider>
            </body>
        </html>
    );
}
