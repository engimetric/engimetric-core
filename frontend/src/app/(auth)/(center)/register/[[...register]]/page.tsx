import { getI18nPath } from '@/utils/Helpers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import RegisterForm from '@/components/auth/RegisterForm';

type IRegisterPageProps = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IRegisterPageProps) {
    const { locale } = await props.params;
    const t = await getTranslations({
        locale,
        namespace: 'Register',
    });

    return {
        title: t('meta_title'),
        description: t('meta_description'),
    };
}

export default async function RegisterPage(props: IRegisterPageProps) {
    const { locale } = await props.params;
    setRequestLocale(locale);

    return <RegisterForm path={getI18nPath('/register', locale)} />;
}
