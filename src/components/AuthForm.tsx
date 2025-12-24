import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

const AuthForm = () => {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  
  // Mapeo de traducciones para la UI de Auth
  const i18nMap = {
    en: {
      sign_in: {
        email_label: t('auth.email_label'),
        password_label: t('auth.password_label'),
        button_label: t('auth.sign_in_button'),
        social_provider_text: t('auth.social_provider_text'),
        link_text: t('auth.forgot_password'),
        no_account: t('auth.no_account'),
        sign_up_link: t('auth.sign_up_link'),
      },
      sign_up: {
        email_label: t('auth.email_label'),
        password_label: t('auth.password_label'),
        button_label: t('auth.sign_up_button'),
        social_provider_text: t('auth.social_provider_text'),
        link_text: t('auth.already_have_account'),
        sign_in_link: t('auth.sign_in_link'),
      },
      forgotten_password: {
        email_label: t('auth.email_label'),
        button_label: t('auth.reset_password_button'),
        link_text: t('auth.back_to_login'),
      },
      update_password: {
        password_label: t('auth.new_password_label'),
        button_label: t('auth.update_password_button'),
      },
    },
    es: {
      sign_in: {
        email_label: t('auth.email_label'),
        password_label: t('auth.password_label'),
        button_label: t('auth.sign_in_button'),
        social_provider_text: t('auth.social_provider_text'),
        link_text: t('auth.forgot_password'),
        no_account: t('auth.no_account'),
        sign_up_link: t('auth.sign_up_link'),
      },
      sign_up: {
        email_label: t('auth.email_label'),
        password_label: t('auth.password_label'),
        button_label: t('auth.sign_up_button'),
        social_provider_text: t('auth.social_provider_text'),
        link_text: t('auth.already_have_account'),
        sign_in_link: t('auth.sign_in_link'),
      },
      forgotten_password: {
        email_label: t('auth.email_label'),
        button_label: t('auth.reset_password_button'),
        link_text: t('auth.back_to_login'),
      },
      update_password: {
        password_label: t('auth.new_password_label'),
        button_label: t('auth.update_password_button'),
      },
    }
  };

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      providers={[]} // Deshabilitamos proveedores sociales
      localization={{
        variables: i18nMap[i18n.language as 'en' | 'es'] || i18nMap.en,
      }}
      view="sign_in"
      showLinks={true}
      redirectTo={window.location.origin}
      magicLink={true}
    />
  );
};

export default AuthForm;