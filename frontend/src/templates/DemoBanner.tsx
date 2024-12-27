import { StickyBanner } from '@/features/landing/StickyBanner';
import Link from 'next/link';

export const DemoBanner = () => (
    <StickyBanner>
        Live Demo of Engimetric - <Link href="/demo">Explore the User Dashboard</Link>
    </StickyBanner>
);
