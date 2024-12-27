'use client';

import React, { useState, useEffect } from 'react';
import { startCase } from 'lodash';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface DetailedMetrics {
    [month: string]: {
        [integration: string]: {
            [metric: string]: number;
        };
    };
}

interface TeamMember {
    id: number;
    fullName: string;
    email?: string;
    userId?: number;
    aliases?: string[];
    metrics?: DetailedMetrics; // Optional detailed metrics
}

interface TeamMemberResponse {
    id: number;
    fullName: string;
    [key: string]: unknown; // Allows additional fields without raising errors
}

const TeamMemberMetricsTable = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [expandedMemberId, setExpandedMemberId] = useState<number | null>(null);
    const [months, setMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            await fetchTeamMembers();
            await fetchTeamMemberMetrics();
        };

        loadData();
        generatePast12Months();
    }, []);

    /**
     * Fetch team members (names, IDs, etc.) from the backend.
     */
    const fetchTeamMembers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/members/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch team members');
            const data: TeamMemberResponse[] = await response.json();

            const members: TeamMember[] = data.map((member) => ({
                id: member.id,
                fullName: member.fullName,
            }));
            setTeamMembers(members);
        } catch (error) {
            console.error('Error fetching team members:', error);
        }
    };

    /**
     * Fetch metrics for team members from the backend.
     */
    const fetchTeamMemberMetrics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/members/metrics`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to fetch team metrics');

            const data: {
                teamId: number;
                metrics: {
                    detailedMetrics: Record<string, Record<string, Record<string, number>>>;
                };
            } = await response.json();

            setTeamMembers((prevMembers) =>
                prevMembers.map((member) => {
                    const rawMetrics = data.metrics.detailedMetrics[member.fullName] || {};

                    // Explicit transformation into DetailedMetrics
                    const detailedMetrics: DetailedMetrics = Object.entries(rawMetrics).reduce(
                        (acc, [month, integrations]) => {
                            acc[month] = Object.entries(integrations).reduce(
                                (monthAcc, [integration, metrics]) => {
                                    if (typeof metrics === 'object' && metrics !== null) {
                                        monthAcc[integration] = Object.entries(metrics).reduce(
                                            (metricAcc, [metricKey, value]) => {
                                                if (typeof value === 'number') {
                                                    metricAcc[metricKey] = value;
                                                }
                                                return metricAcc;
                                            },
                                            {} as { [metric: string]: number },
                                        );
                                    }
                                    return monthAcc;
                                },
                                {} as { [integration: string]: { [metric: string]: number } },
                            );
                            return acc;
                        },
                        {} as DetailedMetrics,
                    );

                    return {
                        ...member,
                        metrics: detailedMetrics,
                    };
                }),
            );
        } catch (error) {
            console.error('Error fetching team member metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generate the last 12 months in YYYY-MM format.
     */
    const generatePast12Months = () => {
        const monthsArray: string[] = [];
        const currentDate = new Date();
        for (let i = 1; i <= 12; i++) {
            const date = new Date();
            date.setMonth(currentDate.getMonth() - i);
            monthsArray.push(date.toISOString().slice(0, 7));
        }
        setMonths(monthsArray);
    };

    /**
     * Toggle row expansion for a specific team member.
     */
    const toggleExpandMember = (id: number) => {
        setExpandedMemberId(expandedMemberId === id ? null : id);
    };

    /**
     * Aggregate metrics for display, excluding unwanted metrics like changes.
     */
    const getAggregatedValue = (integrationMetrics: Record<string, Record<string, number>>): number => {
        return Object.entries(integrationMetrics).reduce((total, [, metrics]) => {
            return (
                total +
                Object.entries(metrics)
                    .filter(([key]) => key !== 'changes') // Exclude 'changes' from integration metrics
                    .reduce((sum, [, value]) => sum + value, 0)
            );
        }, 0);
    };

    if (loading) {
        return <div>Loading metrics...</div>;
    }

    return (
        <div className="overflow-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Team Member Metrics</h2>
            <div className="shadow-md rounded-md">
                <table className="min-w-full border border-border bg-card text-card-foreground rounded-md">
                    <thead className="bg-secondary text-secondary-foreground">
                        <tr>
                            <th className="p-2 text-left">Team Member</th>
                            {months.map((month) => (
                                <th key={month} className="p-2 text-center">
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {teamMembers.map((member, i) => (
                            <React.Fragment key={member.id}>
                                <tr
                                    onClick={() => toggleExpandMember(member.id)}
                                    className={`
                        cursor-pointer
                        hover:bg-accent/10
                        ${i % 2 === 0 ? 'bg-muted/20' : ''}
                      `}
                                >
                                    <td className="p-2 font-semibold">{member.fullName}</td>
                                    {months.map((month) => (
                                        <td key={month} className="p-2 text-center">
                                            {member.metrics?.[month]
                                                ? getAggregatedValue(member.metrics[month])
                                                : '-'}
                                        </td>
                                    ))}
                                </tr>

                                {expandedMemberId === member.id && (
                                    <React.Fragment>
                                        {/* 1) Collect all (integration, metric) pairs across all months */}
                                        {(() => {
                                            const allPairs = new Set<string>();

                                            // Gather every integration + metric in the last 12 months
                                            months.forEach((month) => {
                                                const integrationsMap = member.metrics?.[month];
                                                if (integrationsMap) {
                                                    Object.entries(integrationsMap).forEach(
                                                        ([integration, metricObj]) => {
                                                            Object.keys(metricObj).forEach((metricKey) => {
                                                                allPairs.add(`${integration}::${metricKey}`);
                                                            });
                                                        },
                                                    );
                                                }
                                            });

                                            // Convert set into array for mapping
                                            const pairsArray = Array.from(allPairs);

                                            // 2) Render one row per (integration, metric) pair
                                            return pairsArray.map((pair) => {
                                                const [integration, metricKey] = pair.split('::');

                                                return (
                                                    <tr key={pair} className="bg-muted/10">
                                                        {/* First column: integration + metric name */}
                                                        <td className="p-2 pl-6 font-medium">
                                                            {integration} {startCase(metricKey)}
                                                        </td>

                                                        {/* One column per month, filling in the appropriate value or '-' */}
                                                        {months.map((month) => {
                                                            const value =
                                                                member.metrics?.[month]?.[integration]?.[
                                                                    metricKey
                                                                ] ?? '-';
                                                            return (
                                                                <td key={month} className="p-2 text-center">
                                                                    {value}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamMemberMetricsTable;
