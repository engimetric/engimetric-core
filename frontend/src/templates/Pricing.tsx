import { buttonVariants } from '@/components/ui/buttonVariants';
import { PricingInformation } from '@/features/billing/PricingInformation';
import { Section } from '@/features/landing/Section';
import { PLAN_ID } from '@/utils/AppConfig';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const Pricing = () => {
    const t = useTranslations('Pricing');

    return (
        <Section
            subtitle={t('section_subtitle')}
            title={t('section_title')}
            description={t('section_description')}
        >
            <PricingInformation
                buttonList={{
                    [PLAN_ID.SELF_HOSTED]: (
                        <Link
                            className={buttonVariants({
                                size: 'sm',
                                className: 'mt-5 w-full',
                            })}
                            href="https://www.github.com/engimetric"
                        >
                            {t('button_text')}
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
                            {t('button_text')}
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
                            {t('button_text')}
                        </Link>
                    ),
                }}
            />
        </Section>
    );
};
