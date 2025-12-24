import { useTranslation, Trans } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import AuthForm from '@/components/AuthForm';

const TERMS_URL = "https://sites.google.com/view/calorel/termsandconditions";
const PRIVACY_URL = "https://sites.google.com/view/calorel/privacypolicy";

export default function Login() {
  const { t } = useTranslation();

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-2.5 pb-6 pt-8">
            <Leaf className="w-16 h-16 text-primary" />
            <div className="space-y-1.5 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-foreground">
                {t('login.welcome')}
              </h2>
              <p className="text-muted-foreground px-4">
                {t('login.subtitle')}
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8 space-y-4">
            <AuthForm />
          </CardContent>
          <CardFooter className="flex justify-center !py-6 mt-4">
            <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
              <Trans
                i18nKey="login.terms_privacy"
                components={{
                  1: (
                    <a
                      href={TERMS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        openLink(TERMS_URL);
                      }}
                    />
                  ),
                  3: (
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        openLink(PRIVACY_URL);
                      }}
                    />
                  ),
                }}
              />
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}