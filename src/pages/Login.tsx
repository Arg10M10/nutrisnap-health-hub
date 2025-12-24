import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Button } from '@/components/ui/button';

const TERMS_URL = "https://www.calorel.online/termsandconditions";
const PRIVACY_URL = "https://www.calorel.online/privacypolicy";

export default function Login() {
  const { t } = useTranslation();
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_up');

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
                {view === 'sign_in' ? t('login.welcome') : t('login.create_account')}
              </h2>
              <p className="text-muted-foreground px-4">
                {view === 'sign_in' ? t('login.subtitle') : t('login.create_account_subtitle')}
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8 space-y-4">
            {view === 'sign_in' ? <SignInForm /> : <SignUpForm />}
            
            <div className="relative !mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {view === 'sign_in' ? t('auth.no_account') : t('auth.already_have_account')}
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="lg"
              className="w-full h-14 text-lg" 
              onClick={() => setView(view === 'sign_in' ? 'sign_up' : 'sign_in')}
            >
              {view === 'sign_in' ? t('auth.sign_up_link') : t('auth.sign_in_link')}
            </Button>
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