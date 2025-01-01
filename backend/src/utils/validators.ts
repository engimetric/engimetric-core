import { LLMSettings, IntegrationSettings, integrationMetadata } from '../models/Settings';

/**
 * Validate LLM settings object.
 *
 * @param settings LLM settings object
 * @returns True if settings are valid, false otherwise
 * @example
 * const settings = { provider: 'openai', model: 'gpt-3.5-turbo', apiKey: 'abc123', enabled: true };
 * const isValid = validateLLMSettings(settings);
 * if (!isValid) {
 *   console.error('Invalid settings');
 * }
 */
export const validateLLMSettings = (settings: LLMSettings): boolean => {
    const providerValid = ['openai', 'local', 'llama'].includes(settings.provider);
    const modelValid = typeof settings.model === 'string' && settings.model.trim().length > 0;
    const apiKeyValid = typeof settings.apiKey === 'string' && settings.apiKey.trim().length > 0;

    if (!providerValid) console.error('Invalid LLM provider');
    if (!modelValid) console.error('Model name is required');
    if (!apiKeyValid) console.error('API Key is required');

    return providerValid && modelValid && apiKeyValid;
};

/**
 * Validate integration settings for a given integration name and settings object.
 *
 * @param integrationName Integration name
 * @param settings Integration settings object
 * @returns True if settings are valid, false otherwise
 * @example
 * const settings = { enabled: true, token: 'abc123', org: 'my-org' };
 * const isValid = validateIntegrationSettings('github', settings);
 * if (!isValid) {
 *    console.error('Invalid settings');
 * }
 */
export const validateIntegrationSettings = (
    integrationName: string,
    settings: IntegrationSettings,
): boolean => {
    const metadata = integrationMetadata.find((meta) => meta.integrationName === integrationName);
    if (!metadata) return false;

    for (const field of metadata.fields) {
        if (field.required && !(field.key in settings)) {
            console.error(`Missing required field: ${field.key}`);
            return false;
        }
    }
    return true;
};
