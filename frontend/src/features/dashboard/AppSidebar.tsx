'use client';

import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebarNav } from '@/features/dashboard/AppSidebarNav';
import { Logo } from '@/templates/Logo';

import { Building2, CreditCard, Home, LifeBuoy, Send, Settings, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const AppSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
    const t = useTranslations('DashboardLayout');

    return (
        <Sidebar {...props}>
            <SidebarHeader className="pt-5">
                <div className="flex justify-center pb-3">
                    <Logo />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <AppSidebarNav
                    label={t('main_section_label')}
                    items={[
                        {
                            title: t('home'),
                            url: '/dashboard',
                            icon: Home,
                        },
                    ]}
                />
                <AppSidebarNav
                    label={t('organization_section_label')}
                    items={[
                        {
                            title: t('billing'),
                            url: '/billing',
                            icon: CreditCard,
                        },
                        {
                            title: t('members'),
                            url: '/members',
                            icon: Users,
                        },
                        {
                            title: t('settings'),
                            url: '/settings',
                            icon: Settings,
                        },
                        {
                            title: t('teams'),
                            url: '/team',
                            icon: Building2,
                        },
                    ]}
                />
                <AppSidebarNav
                    items={[
                        {
                            title: t('support'),
                            url: 'mailto:contact@engimetric.com',
                            icon: LifeBuoy,
                        },
                        {
                            title: t('feedback'),
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
