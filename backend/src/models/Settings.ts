/**
 * LLM Metadata Field
 * @typedef {Object} LLMField
 * @property {string} key - Unique identifier
 * @property {'string' | 'boolean' | 'number' | 'select'} type - Data type
 * @property {string} label - For UI display
 * @property {boolean} required - Whether the field is required
 * @property {string | boolean | number} [defaultValue] - Default value
 * @property {{ value: string; label: string }[]} [options] - For select dropdowns
 * @example
 * {
 *   key: 'enabled
 *   type: 'boolean',
 *   label: 'Enable LLM Integration',
 *   required: true,
 *   defaultValue: true
 * }
 */
export interface LLMField {
    key: string;
    type: 'string' | 'boolean' | 'number' | 'select';
    label: string;
    required: boolean;
    defaultValue?: string | boolean | number;
    options?: { value: string; label: string }[]; // For select dropdowns
}

/**
 * LLM Metadata
 * @type {LLMField[]}
 * @example
 * [
 *   {
 *     key: 'provider',
 *     type: 'select',
 *     label: 'LLM Provider',
 *     required: true,
 *     options: [
 *       { value: 'openai', label: 'OpenAI' },
 *       { value: 'local', label: 'Local Server' },
 *       { value: 'llama', label: 'LLaMA' }
 *     ],
 *     defaultValue: 'openai'
 *   },
 * ]
 */
export const llmMetadata: LLMField[] = [
    { key: 'enabled', type: 'boolean', label: 'Enable LLM Integration', required: true, defaultValue: true },
    {
        key: 'provider',
        type: 'select',
        label: 'LLM Provider',
        required: true,
        options: [
            { value: 'openai', label: 'OpenAI' },
            { value: 'local', label: 'Local Server' },
            { value: 'llama', label: 'LLaMA' },
        ],
        defaultValue: 'openai',
    },
    { key: 'model', type: 'string', label: 'Model Name', required: true },
    { key: 'apiKey', type: 'string', label: 'API Key', required: true },
];

/**
 * LLM Settings Field
 * @typedef {Object} LLMSettings
 * @property {'openai' | 'local' | 'llama'} provider - LLM provider
 * @property {string} model - Model name
 * @property {string} apiKey - API key
 * @property {boolean} enabled - Whether the integration is active
 * @example
 * {
 *   provider: 'openai',
 *   model: 'gpt-4',
 *   apiKey: 'abc123',
 *   enabled: true
 * }
 */
export interface LLMSettings {
    provider: 'openai' | 'local' | 'llama';
    model: string; // e.g., "gpt-4" or "llama-2"
    apiKey: string;
    enabled: boolean;
}

/**
 * Integration Metadata Field
 * @typedef {Object} IntegrationField
 * @property {string} key - Unique identifier
 * @property {'string' | 'boolean' | 'number' | 'date'} type - Data type
 * @property {string} label - For UI display
 * @property {boolean} required - Whether the field is required
 * @property {string | boolean | number | Date} [defaultValue] - Default value
 * @example
 * {
 *   key: 'enabled
 *   type: 'boolean',
 *   label: 'Enable Integration',
 *   required: true,
 *   defaultValue: true
 * }
 */
export interface IntegrationField {
    key: string;
    type: 'string' | 'boolean' | 'number' | 'date';
    label: string; // For UI display
    required: boolean;
    defaultValue?: string | boolean | number | Date;
}

/**
 * Integration Metadata Model
 * @typedef {Object} IntegrationMetadata
 * @property {string} integrationName - Unique identifier
 * @property {string} label - For UI display
 * @property {IntegrationField[]} fields - Integration-specific configurations
 * @example
 * {
 *   integrationName: 'github',
 *   label: 'GitHub',
 *   fields: [
 *     {
 *       key: 'enabled
 *       type: 'boolean',
 *       label: 'Enable Integration',
 *       required: true,
 *       defaultValue: true
 *     }
 *   ]
 * }
 */
export interface IntegrationMetadata {
    integrationName: string;
    label: string;
    fields: IntegrationField[];
}

/**
 * Integration Metadata
 * @type {IntegrationMetadata[]}
 */
export const integrationMetadata: IntegrationMetadata[] = [
    {
        integrationName: 'github',
        label: 'GitHub',
        fields: [
            {
                key: 'enabled',
                type: 'boolean',
                label: 'Enable Integration',
                required: true,
                defaultValue: true,
            },
            { key: 'token', type: 'string', label: 'Access Token', required: true },
            { key: 'org', type: 'string', label: 'Organization Name', required: false },
        ],
    },
    {
        integrationName: 'jira',
        label: 'Jira',
        fields: [
            {
                key: 'enabled',
                type: 'boolean',
                label: 'Enable Integration',
                required: true,
                defaultValue: true,
            },
            { key: 'url', type: 'string', label: 'Jira URL', required: true },
            { key: 'projectKey', type: 'string', label: 'Project Key', required: false },
        ],
    },
];

/**
 * Integration settings model
 * @typedef {Object} IntegrationSettings
 * @property {boolean} enabled - Whether the integration is active
 * @property {string | boolean | number | Date} [key] - Integration-specific configurations
 * @example
 * {
 *   enabled: true,
 *   token: 'abc123'
 * }
 */
export interface IntegrationSettings {
    enabled: boolean;
    [key: string]: string | boolean | number | Date;
}

/**
 * Settings model
 * @typedef {Object} Settings
 * @property {number} teamId - Reference to the team
 * @property {Date} createdAt - When the settings were created
 * @property {Date} updatedAt - Last update timestamp
 * @property {Record<string, IntegrationSettings>} integrations - Explicit integrations object
 * @example
 * {
 *   teamId: 1,
 *   createdAt: '2021-08-01T00:00:00.000Z',
 *   updatedAt: '2021-08-01T00:00:00.000Z',
 *   integrations: {
 *     github: {
 *     enabled: true,
 *     token: 'abc123',
 *     org: 'my-org'
 *   },
 *   llm: {
 *     provider: 'openai',
 *     model: 'gpt-4',
 *     apiKey: 'abc123',
 *     enabled: true
 *   }
 * }
 */
export interface Settings {
    teamId: number;
    createdAt: Date;
    updatedAt: Date;
    integrations: Record<string, IntegrationSettings>;
    llm: LLMSettings;
}
