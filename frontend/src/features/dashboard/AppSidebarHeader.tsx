import { DarkModeToggle } from '@/components/DarkModeToggle';

import { SidebarTrigger } from '@/components/ui/sidebar';

export const AppSidebarHeader = () => (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-2">
        <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
        </div>

        <ul className="flex items-center gap-x-1.5 [&_li[data-fade]:hover]:opacity-100 [&_li[data-fade]]:opacity-60">
            <li data-fade>
                <DarkModeToggle />
            </li>
        </ul>
    </header>
);
