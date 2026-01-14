import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, ArrowRight } from "lucide-react";
import { SignInForm } from '@/components/auth/SignInForm';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const TERMS_URL = "https://www.calorel.online/termsandconditions";
const PRIVACY_URL = "https://www.calorel.online/privacypolicy";

type AuthView = 'welcome' | 'sign_in';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<AuthView>('welcome');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleStartOnboarding = () => {
    navigate('/onboarding');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Decorative background */}
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
                    Welcome to <span className="text-primary font-black">Calorel</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Your health companion in one app.
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-4 px-4 pb-8">
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/20"
                    onClick={handleStartOnboarding}
                  >
                    Start Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full h-14 text-lg rounded-2xl hover:bg-transparent hover:text-primary"
                    onClick={() => setView('sign_in')}
                  >
                    I already have an account
                  </Button>
                </div>

                <p className="text-center text-[10px] text-muted-foreground px-8 leading-tight opacity-70">
                  By continuing, you agree to our{' '}
                  <a
                    href={TERMS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline cursor-pointer"
                    onClick={(e) => { e.preventDefault(); openLink(TERMS_URL); }}
                  >
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a
                    href={PRIVACY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline cursor-pointer"
                    onClick={(e) => { e.preventDefault(); openLink(PRIVACY_URL); }}
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </motion.div>
          )}

          {view === 'sign_in' && (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm min-h-[300px] flex flex-col justify-center">
                <CardContent className="px-6 sm:px-8 py-8">
                  <SignInForm onSwitchToSignUp={() => {}} />
                </CardContent>
              </Card>
              
              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setView('welcome')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Back to home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}