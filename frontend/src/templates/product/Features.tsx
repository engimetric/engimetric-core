import { Background } from '@/components/Background';
import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Features = () => {
    return (
        <Background>
            <Section
                subtitle="Core Features"
                title="Engineering Insights Made Simple"
                description="Track and analyze team metrics with seamless integrations and AI-generated reports."
            >
                <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">
                    <FeatureCard
                        icon={
                            <svg
                                className="stroke-primary-foreground stroke-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M0 0h24v24H0z" stroke="none" />
                                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                            </svg>
                        }
                        title="Engineering Defined Integrations"
                    >
                        Seamlessly integrate with tools like GitHub, Jira, and Zoom to streamline your
                        team&apos;s workflows and centralize performance data.
                    </FeatureCard>

                    <FeatureCard
                        icon={
                            <svg
                                className="stroke-primary-foreground stroke-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M0 0h24v24H0z" stroke="none" />
                                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                            </svg>
                        }
                        title="Automatic Syncing"
                    >
                        Keep your data up-to-date with automated syncing across all connected integrations,
                        ensuring real-time accuracy.
                    </FeatureCard>

                    <FeatureCard
                        icon={
                            <svg
                                className="stroke-primary-foreground stroke-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M0 0h24v24H0z" stroke="none" />
                                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                            </svg>
                        }
                        title="Expandable Metric Table"
                    >
                        Dive deeper into your data with expandable metric tables, providing granular insights
                        per integration and team member.
                    </FeatureCard>

                    <FeatureCard
                        icon={
                            <svg
                                className="stroke-primary-foreground stroke-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M0 0h24v24H0z" stroke="none" />
                                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                            </svg>
                        }
                        title="On-Prem Deployment"
                    >
                        Deploy Engimetric on your infrastructure for maximum control, data privacy, and
                        customization.
                    </FeatureCard>

                    <FeatureCard
                        icon={
                            <svg
                                className="stroke-primary-foreground stroke-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M0 0h24v24H0z" stroke="none" />
                                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                            </svg>
                        }
                        title="AI-Generated Reports"
                    >
                        Leverage AI-generated summaries to uncover key insights, trends, and actionable
                        recommendations across your team&apos;s performance.
                    </FeatureCard>

                    <FeatureCard
                        icon={
                            <svg
                                className="stroke-primary-foreground stroke-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M0 0h24v24H0z" stroke="none" />
                                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
                            </svg>
                        }
                        title="Scalable Infrastructure"
                    >
                        Built to scale with your team, Engimetric supports growing datasets, multiple
                        integrations, and increased performance demands without compromise.
                    </FeatureCard>
                </div>
            </Section>
        </Background>
    );
};
