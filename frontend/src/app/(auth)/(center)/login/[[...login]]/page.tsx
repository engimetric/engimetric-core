import { getI18nPath } from '@/utils/Helpers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LoginForm from '@/components/auth/LoginForm';

type ILoginPageProps = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ILoginPageProps) {
    const { locale } = await props.params;
    const t = await getTranslations({
        locale,
        namespace: 'Login',
    });

    return {
        title: t('meta_title'),
        description: t('meta_description'),
    };
}

export default async function LoginPage(props: ILoginPageProps) {
    const { locale } = await props.params;
    setRequestLocale(locale);

    return (
        <div className="">
            <LoginForm redirectPath={getI18nPath('/dashboard', locale)} />
        </div>
    );
}
