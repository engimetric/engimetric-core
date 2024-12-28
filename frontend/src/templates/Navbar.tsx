import { DarkModeToggle } from '@/components/DarkModeToggle';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';
import Link from 'next/link';

import { Logo } from './Logo';

export const Navbar = () => {
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
                            <Link href="/login">Log In</Link>
                        </li>
                        <li>
                            <Link className={buttonVariants()} href="/register">
                                Register
                            </Link>
                        </li>
                    </>
                }
            >
                <li>
                    <Link href="/product">Product</Link>
                </li>

                <li>
                    <Link href="https://github.com/engimetric/engimetric-core/wiki">Documentation</Link>
                </li>

                <li>
                    <Link href="https://github.com/engimetric/engimetric-core/discussions">Community</Link>
                </li>

                <li>
                    <Link href="/about">About Us</Link>
                </li>
            </CenteredMenu>
        </Section>
    );
};
