import { buttonVariants } from '@/components/ui/buttonVariants';
import { CTABanner } from '@/features/landing/CTABanner';
import { Section } from '@/features/landing/Section';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';

export const CTA = () => {
    const t = useTranslations('CTA');

    return (
        <Section>
            <CTABanner
                title={t('title')}
                description={t('description')}
                buttons={
                    <a
                        className={buttonVariants({
                            variant: 'outline',
                            size: 'lg',
                            className: 'whitespace-pre-line',
                        })}
                        href="/register"
                    >
                        {t('button_text')}

                        <ArrowRightIcon className="ml-1 size-5" />
                    </a>
                }
            />
        </Section>
    );
};
