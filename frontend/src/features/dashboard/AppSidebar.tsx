'use client';

import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebarNav } from '@/features/dashboard/AppSidebarNav';
import { Logo } from '@/templates/Logo';

import { Building2, CreditCard, Home, LifeBuoy, Send, Settings, Users } from 'lucide-react';

export const AppSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="pt-5">
                <div className="flex justify-center pb-3">
                    <Logo />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <AppSidebarNav
                    label="Dashboard"
                    items={[
                        {
                            title: 'Dashboard',
                            url: '/dashboard',
                            icon: Home,
                        },
                    ]}
                />
                <AppSidebarNav
                    label="Team Management"
                    items={[
                        {
                            title: 'Billing',
                            url: '/billing',
                            icon: CreditCard,
                        },
                        {
                            title: 'Team Members',
                            url: '/members',
                            icon: Users,
                        },
                        {
                            title: 'Settings',
                            url: '/settings',
                            icon: Settings,
                        },
                    ]}
                />
                <AppSidebarNav
                    label="User Management"
                    items={[
                        {
                            title: 'Teams',
                            url: '/team',
                            icon: Building2,
                        },
                    ]}
                />
                <AppSidebarNav
                    items={[
                        {
                            title: 'Support',
                            url: 'mailto:contact@engimetric.com',
                            icon: LifeBuoy,
                        },
                        {
                            title: 'Feedback',
                            url: 'mailto:contact@engimetric.com',
                            icon: Send,
                        },
                    ]}
                    className="mt-auto"
                />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
};
