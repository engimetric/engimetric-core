import { buttonVariants } from '@/components/ui/buttonVariants';
import { PricingInformation } from '@/features/billing/PricingInformation';
import { Section } from '@/features/landing/Section';
import { PLAN_ID } from '@/utils/AppConfig';
import Link from 'next/link';

export const Pricing = () => {
    return (
        <Section
            subtitle="Flexible Plans"
            title="Choose Your Setup"
            description="Use Engimetric on your own servers or opt for a hosted version with seamless support."
        >
            <PricingInformation
                buttonList={{
                    [PLAN_ID.SELF_HOSTED]: (
                        <Link
                            className={buttonVariants({
                                size: 'sm',
                                className: 'mt-5 w-full',
                            })}
                            href="https://www.github.com/engimetric/engimetric-core"
                        >
                            Start Now
                        </Link>
                    ),
                    [PLAN_ID.HOSTED]: (
                        <Link
                            className={buttonVariants({
                                size: 'sm',
                                className: 'mt-5 w-full',
                            })}
                            href="/register"
                        >
                            Start Now
                        </Link>
                    ),
                    [PLAN_ID.ENTERPRISE]: (
                        <Link
                            className={buttonVariants({
                                size: 'sm',
                                className: 'mt-5 w-full',
                            })}
                            href="/contact"
                        >
                            Start Now
                        </Link>
                    ),
                }}
            />
        </Section>
    );
};
