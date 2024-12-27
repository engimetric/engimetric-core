import { buttonVariants } from '@/components/ui/buttonVariants';
import { CTABanner } from '@/features/landing/CTABanner';
import { Section } from '@/features/landing/Section';
import { ArrowRightIcon } from '@radix-ui/react-icons';

import Link from 'next/link';

export const CTA = () => {
    return (
        <Section>
            <CTABanner
                title="Start Tracking Your Engineering Metrics Today"
                description="Set up your team, sync integrations, and start generating insights."
                buttons={
                    <Link
                        className={buttonVariants({
                            variant: 'outline',
                            size: 'lg',
                            className: 'whitespace-pre-line',
                        })}
                        href="/register"
                    >
                        Sign Up Now
                        <ArrowRightIcon className="ml-1 size-5" />
                    </Link>
                }
            />
        </Section>
    );
};
