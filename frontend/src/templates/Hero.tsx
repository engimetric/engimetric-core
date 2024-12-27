import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredHero } from '@/features/landing/CenteredHero';
import { Section } from '@/features/landing/Section';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const Hero = () => {
    const t = useTranslations('Hero');

    return (
        <Section className="py-36">
            <CenteredHero
                title={t.rich('title', {
                    important: (chunks) => (
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            {chunks}
                        </span>
                    ),
                })}
                description={t('description')}
                buttons={
                    <>
                        <Link className={buttonVariants({ size: 'lg' })} href="/register">
                            {t('primary_button')}
                        </Link>

                        <a
                            className={buttonVariants({ variant: 'outline', size: 'lg' })}
                            href="https://www.github.com/engimetric"
                        >
                            {t('secondary_button')}

                            <ArrowRightIcon className="ml-1 size-5" />
                        </a>
                    </>
                }
            />
        </Section>
    );
};
