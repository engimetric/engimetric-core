import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export const Hero = () => {
    return (
        <Section className="py-36">
            <>
                <CenteredHero
                    title={
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Streamline Your <span className="font-bold">Engineering Metrics</span> with
                            Precision
                        </span>
                    }
                    description="Open-source platform with a hosted option. Monitor team metrics, integrate seamlessly, and generate insightful summaries with AI-powered reporting."
                    buttons={
                        <>
                            <Link className={buttonVariants({ size: 'lg' })} href="/register">
                                Get Started
                            </Link>

                            <a
                                className={buttonVariants({ variant: 'outline', size: 'lg' })}
                                href="https://www.github.com/engimetric/engimetric-core/wiki"
                            >
                                Explore Documentation
                                <ArrowRightIcon className="ml-1 size-5" />
                            </a>
                        </>
                    }
                />
            </>
        </Section>
    );
};
