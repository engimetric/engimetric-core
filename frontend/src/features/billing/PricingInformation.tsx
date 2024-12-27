import { PricingCard } from '@/features/billing/PricingCard';
import { PricingFeature } from '@/features/billing/PricingFeature';
import { PricingPlanList } from '@/utils/AppConfig';

export const PricingInformation = (props: { buttonList: Record<string, React.ReactNode> }) => {
    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 @3xl:grid-cols-3">
            {Object.values(PricingPlanList).map((plan) => (
                <PricingCard
                    key={plan.id}
                    name={plan.name}
                    price={plan.price}
                    interval={plan.interval}
                    description={plan.description}
                    button={props.buttonList[plan.id]}
                >
                    <PricingFeature>{`${plan.features.capabilities} Capabilities`}</PricingFeature>

                    <PricingFeature>{`${plan.features.hosting} Hosting`}</PricingFeature>

                    <PricingFeature>{`${plan.features.support} Support`}</PricingFeature>
                </PricingCard>
            ))}
        </div>
    );
};
