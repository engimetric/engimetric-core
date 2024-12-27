import type { LocalePrefixMode } from 'node_modules/next-intl/dist/types/src/routing/types';
import { BILLING_INTERVAL, type PricingPlan } from '@/types/Subscription';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
    name: 'Engimetric',
    locales: [
        {
            id: 'en',
            name: 'English',
        },
    ],
    sidebarCookieName: 'sidebar:state',
    defaultLocale: 'en',
    localePrefix,
};

export const AllLocales = AppConfig.locales.map((locale) => locale.id);

export const PLAN_ID = {
    SELF_HOSTED: 'self_hosted',
    HOSTED: 'hosted',
    ENTERPRISE: 'enterprise',
} as const;

export const PricingPlanList: Record<string, PricingPlan> = {
    [PLAN_ID.SELF_HOSTED]: {
        id: PLAN_ID.SELF_HOSTED,
        price: 0,
        interval: BILLING_INTERVAL.MONTH,
        testPriceId: '',
        devPriceId: '',
        prodPriceId: '',
        features: {
            capabilities: 'All',
            hosting: 'Self-Managed',
            support: 'Community',
        },
    },
    [PLAN_ID.HOSTED]: {
        id: PLAN_ID.HOSTED,
        price: 9,
        interval: BILLING_INTERVAL.MONTH,
        testPriceId: 'price_hosted_test', // Use for testing
        // FIXME: Update the price ID, you can create it after running `npm run stripe:setup-price`
        devPriceId: 'price_1PNksvKOp3DEwzQlHOSTED123',
        prodPriceId: '',
        features: {
            capabilities: 'All',
            hosting: 'Fully-Managed',
            support: 'Priority',
        },
    },
    [PLAN_ID.ENTERPRISE]: {
        id: PLAN_ID.ENTERPRISE,
        price: 99,
        interval: BILLING_INTERVAL.MONTH,
        testPriceId: 'price_enterprise_test', // Use for testing
        // FIXME: Update the price ID, you can create it after running `npm run stripe:setup-price`
        devPriceId: 'price_1PNksvKOp3DEwzQlENTERPRISE123',
        prodPriceId: 'price_123',
        features: {
            capabilities: 'All',
            hosting: 'Dedicated-Instance',
            support: 'SLA-Backed',
        },
    },
};
