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
        // Nuevo campo para el nombre completo
        full_name_label: t('auth.full_name_label'),
      },
      forgotten_password: {
        email_label: t('auth.email_label'),
        button_label: t('auth.reset_password_button'),
        link_text: t('auth.sign_in_link'), 
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
        // Nuevo campo para el nombre completo
        full_name_label: t('auth.full_name_label'),
      },
      forgotten_password: {
        email_label: t('auth.email_label'),
        button_label: t('auth.reset_password_button'),
        link_text: t('auth.sign_in_link'), 
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
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: 'hsl(var(--primary))',
              brandAccent: 'hsl(var(--primary))',
              // Fondo de los inputs
              inputBackground: 'hsl(var(--muted))',
              inputBorder: 'hsl(var(--border))',
              // Color del texto en modo oscuro
              inputText: resolvedTheme === 'dark' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
            },
            radii: {
              borderRadiusButton: '1.5rem', // Botones redondeados (lg)
              inputBorderRadius: '0.75rem', // Inputs redondeados (xl)
            },
            space: {
              buttonPadding: '12px 20px', // Aumentar padding de botones
            }
          },
        },
        style: {
          button: {
            height: '56px', // Botones más altos
            fontSize: '18px',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          input: {
            height: '52px', // Inputs más altos
            fontSize: '16px',
          },
          anchor: {
            color: 'hsl(var(--primary))',
            fontWeight: '600',
            fontSize: '16px',
            textDecoration: 'none',
            transition: 'color 0.2s',
          },
          label: {
            fontWeight: '600',
            fontSize: '16px',
            marginBottom: '8px',
          }
        }
      }}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      providers={[]}
      localization={{
        variables: i18nMap[i18n.language as 'en' | 'es'] || i18nMap.en,
      }}
      view="sign_in"
      showLinks={true}
      redirectTo={window.location.origin}
      magicLink={false}
      // Configuración para mostrar el campo de nombre completo en el registro
      fields={[
        {
          name: 'full_name',
          label: t('auth.full_name_label'),
          placeholder: t('auth.full_name_placeholder'),
          type: 'text',
          required: true,
        },
      ]}
    />
  );
};

export default AuthForm;