import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, ArrowRight } from "lucide-react";
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageDrawer } from '@/components/settings/LanguageDrawer';

const TERMS_URL = "https://www.calorel.online/termsandconditions";
const PRIVACY_URL = "https://www.calorel.online/privacypolicy";

type AuthView = 'welcome' | 'sign_in' | 'sign_up';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<AuthView>('welcome');
  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSwitchToSignIn = () => setView('sign_in');
  const handleSwitchToSignUp = () => setView('sign_up');

  // Obtener código de idioma actual y su bandera correspondiente
  const currentLangCode = i18n.language.substring(0, 2).toUpperCase();
  const currentFlag = i18n.language.startsWith('es') ? '/es-flag.png' : '/us-flag.png';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Botón de idioma flotante */}
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsLanguageDrawerOpen(true)} 
          className="rounded-full shrink-0 gap-2 px-3 pl-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
        >
          <img 
            src={currentFlag} 
            alt={currentLangCode} 
            className="w-5 h-5 rounded-full object-cover shadow-sm"
          />
          <span className="text-xs font-bold tracking-wide">{currentLangCode}</span>
        </Button>
      </div>

      {/* Fondo decorativo sutil */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {view === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8 py-10 flex flex-col min-h-[80vh] justify-center"
            >
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 p-6 rounded-3xl shadow-xl shadow-primary/10">
                    <Leaf className="w-20 h-20 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    <Trans i18nKey="login.hello_calorel">
                      Welcome to <span className="text-primary font-black">Calorel</span>
                    </Trans>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {t('login.tagline')}
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-4 px-4 pb-8">
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/20"
                    onClick={() => setView('sign_up')}
                  >
                    {t('login.start_now')} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full h-14 text-lg rounded-2xl hover:bg-transparent hover:text-primary"
                    onClick={() => setView('sign_in')}
                  >
                    {t('login.have_account')}
                  </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground px-8 leading-tight opacity-70">
                  <Trans
                    i18nKey="login.terms_privacy"
                    components={{
                      1: (
                        <a
                          href={TERMS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline cursor-pointer"
                          onClick={(e) => { e.preventDefault(); openLink(TERMS_URL); }}
                        />
                      ),
                      3: (
                        <a
                          href={PRIVACY_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline cursor-pointer"
                          onClick={(e) => { e.preventDefault(); openLink(PRIVACY_URL); }}
                        />
                      ),
                    }}
                  />
                </p>
              </div>
            </motion.div>
          )}

          {(view === 'sign_in' || view === 'sign_up') && (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm min-h-[300px] flex flex-col justify-center">
                <CardContent className="px-6 sm:px-8 py-8">
                  {view === 'sign_in' ? (
                    <SignInForm onSwitchToSignUp={handleSwitchToSignUp} />
                  ) : (
                    <SignUpForm onSwitchToSignIn={handleSwitchToSignIn} />
                  )}
                </CardContent>
              </Card>
              
              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setView('welcome')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t('login.back_to_home')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <LanguageDrawer isOpen={isLanguageDrawerOpen} onClose={() => setIsLanguageDrawerOpen(false)} />
    </div>
  );
}