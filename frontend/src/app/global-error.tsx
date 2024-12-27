'use client';

import { routing } from '@/libs/i18nNavigation';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError(props: { error: Error & { digest?: string } }) {
    useEffect(() => {
        console.log(props.error);
    }, [props.error]);

    return (
        <html lang={routing.defaultLocale}>
            <body>
                {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
                <NextError statusCode={0} />
            </body>
        </html>
    );
}
