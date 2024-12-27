import { CTA } from '@/templates/CTA';
import { FAQ } from '@/templates/FAQ';
import { Features } from '@/templates/Features';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';

export default async function Index() {
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
