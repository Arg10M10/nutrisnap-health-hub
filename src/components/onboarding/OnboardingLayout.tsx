import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  children: ReactNode;
  onContinue: () => void;
  onBack: () => void;
  canContinue: boolean;
  isPending: boolean;
  continueText?: string;
  hideContinueButton?: boolean;
}

export const OnboardingLayout = ({
  step,
  totalSteps,
  title,
  description,
  children,
  onContinue,
  onBack,
  canContinue,
  isPending,
  continueText,
  hideContinueButton = false,
}: OnboardingLayoutProps) => {
  const progressValue = (step / totalSteps) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 pt-8">
        <div className="flex items-center gap-4 mx-auto max-w-xl">
          {step > 1 ? (
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-10 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">
              Step {step} of {totalSteps}
            </p>
            <Progress value={progressValue} className="mt-1 h-2" />
          </div>
          
          {/* Placeholder for the language button to maintain layout */}
          <div className="w-10 shrink-0" />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="text-left">{children}</div>
          {!hideContinueButton && (
            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={onContinue}
              disabled={!canContinue || isPending}
            >
              {continueText || 'Continue'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};