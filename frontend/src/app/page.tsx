import { CTA } from '@/templates/CTA';
import { FAQ } from '@/templates/FAQ';
import { Features } from '@/templates/Features';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IIndexProps = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps) {
    const { locale } = await props.params;
    const t = await getTranslations({
        locale,
        namespace: 'Index',
    });

    return {
        title: t('meta_title'),
        description: t('meta_description'),
    };
}

export default async function Index(props: IIndexProps) {
    const { locale } = await props.params;
    setRequestLocale(locale);

    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
        </>
    );
}
