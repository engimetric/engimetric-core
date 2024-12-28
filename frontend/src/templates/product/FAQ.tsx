import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Section } from '@/features/landing/Section';

export const FAQ = () => {
    return (
        <Section>
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What integrations are supported?</AccordionTrigger>
                    <AccordionContent>
                        Currently, GitHub is supported as a proof of concept. Future integrations include
                        Jira, Zoom, and more.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Section>
    );
};
