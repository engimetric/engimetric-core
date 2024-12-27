import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Section } from '@/features/landing/Section';
import { useTranslations } from 'next-intl';

export const FAQ = () => {
    const t = useTranslations('FAQ');

    return (
        <Section>
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>{t('question')}</AccordionTrigger>
                    <AccordionContent>{t('answer')}</AccordionContent>
                </AccordionItem>
            </Accordion>
        </Section>
    );
};
