import { IntegrationSettings } from '../models/Settings';

export const defaultIntegrationSettings: Record<string, IntegrationSettings> = {
    GitHub: {
        enabled: false,
        token: '',
        org: '',
    },
    Jira: {
        enabled: false,
        domain: '',
        token: '',
    },
    Google: {
        enabled: false,
        clientId: '',
        clientSecret: '',
    },
    Zoom: {
        enabled: false,
        apiKey: '',
        apiSecret: '',
    },
};
