import { Footer } from '@/templates/Footer';
import { Navbar } from '@/templates/Navbar';
import { Hero } from '@/templates/product/Hero';
import { ProblemStatement } from '@/templates/product/ProblemStatement';
import { Features } from '@/templates/product/Features';
import { Demo } from '@/templates/product/Demo';
import { Integrations } from '@/templates/product/Integrations';
import { Testimonials } from '@/templates/product/Testimonials';
import { Pricing } from '@/templates/product/Pricing';
import { FAQ } from '@/templates/product/FAQ';
import { CTA } from '@/templates/product/CTA';

export default function ProductPage() {
    return (
        <>
            <Navbar />
            <Hero />
            <ProblemStatement />
            <Features />
            <Demo />
            <Integrations />
            <Testimonials />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
        </>
    );
}
