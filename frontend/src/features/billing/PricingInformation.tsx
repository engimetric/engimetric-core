import { PricingCard } from '@/features/billing/PricingCard';
import { PricingFeature } from '@/features/billing/PricingFeature';
import { PricingPlanList } from '@/utils/AppConfig';
import { useTranslations } from 'next-intl';

export const PricingInformation = (props: { buttonList: Record<string, React.ReactNode> }) => {
    const t = useTranslations('PricingPlan');

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 @3xl:grid-cols-3">
            {Object.values(PricingPlanList).map((plan) => (
                <PricingCard
                    key={plan.id}
                    planId={plan.id}
                    price={plan.price}
                    interval={plan.interval}
                    button={props.buttonList[plan.id]}
                >
                    <PricingFeature>
                        {t('feature_capabilities', {
                            string: plan.features.capabilities,
                        })}
                    </PricingFeature>

                    <PricingFeature>
                        {t('feature_hosting', {
                            string: plan.features.hosting,
                        })}
                    </PricingFeature>

                    <PricingFeature>
                        {t('feature_support', {
                            string: plan.features.support,
                        })}
                    </PricingFeature>
                </PricingCard>
            ))}
        </div>
    );
};
