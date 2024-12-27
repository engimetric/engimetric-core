import { DarkModeToggle } from '@/components/DarkModeToggle';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Logo } from './Logo';

export const Navbar = () => {
    const t = useTranslations('Navbar');

    return (
        <Section className="px-3 py-6">
            <CenteredMenu
                logo={<Logo />}
                rightMenu={
                    <>
                        <li data-fade>
                            <DarkModeToggle />
                        </li>
                        {/* <li data-fade>
                            <LocaleSwitcher />
                        </li> */}
                        <li className="ml-1 mr-2.5" data-fade>
                            <Link href="/login">{t('sign_in')}</Link>
                        </li>
                        <li>
                            <Link className={buttonVariants()} href="/register">
                                {t('sign_up')}
                            </Link>
                        </li>
                    </>
                }
            >
                <li>
                    <Link href="/product">{t('product')}</Link>
                </li>

                <li>
                    <Link href="https://www.github.com/engimetric">{t('docs')}</Link>
                </li>

                <li>
                    <Link href="https://www.github.com/engimetric">{t('community')}</Link>
                </li>

                <li>
                    <Link href="/about">{t('company')}</Link>
                </li>
            </CenteredMenu>
        </Section>
    );
};
