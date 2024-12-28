import { CTA } from '@/templates/home/CTA';
import { FAQ } from '@/templates/home/FAQ';
import { Features } from '@/templates/home/Features';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/home/Hero';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/home/Pricing';

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
