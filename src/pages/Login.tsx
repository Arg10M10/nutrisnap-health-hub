import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from 'sonner';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const signInWithProvider = async (provider: 'google') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-2.5 pb-6 pt-8">
            <Leaf className="w-16 h-16 text-primary" />
            <div className="space-y-1.5 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Welcome to NutriSnap
              </h2>
              <p className="text-muted-foreground px-4">
                Your smart health companion. Start your journey with a single click.
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8 space-y-4">
            <Button 
              variant="outline"
              className="w-full h-16 text-lg rounded-full" 
              onClick={() => signInWithProvider('google')} 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  <img src="/google-logo.png" alt="Google logo" className="mr-3 h-6 w-6" />
                  Continue with Google
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center !py-6 mt-4">
            <p className="text-center text-xs text-muted-foreground px-4">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}