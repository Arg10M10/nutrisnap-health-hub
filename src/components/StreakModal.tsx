import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import StreakCalendar from "./StreakCalendar";
import AnimatedNumber from "./AnimatedNumber";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  streakDays: string[];
}

const StreakModal = ({ isOpen, onClose, streak, streakDays }: StreakModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Añadido !rounded-[32px] para bordes extra redondeados y modernos */}
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-card border-none shadow-2xl !rounded-[32px] w-[90vw] max-w-[380px]">
        <div className="bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-transparent p-8 pb-4 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-30 rounded-full scale-150 animate-pulse" />
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20 shadow-inner">
              <Flame className="w-20 h-20 text-orange-500 fill-current relative z-10 drop-shadow-lg" />
            </div>
          </div>
          <DialogHeader className="mb-1">
            <DialogTitle className="text-center text-3xl font-black text-foreground tracking-tight">
              {t('streak_modal.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-1">
              <span className="text-7xl font-black text-foreground tracking-tighter tabular-nums drop-shadow-sm">
                <AnimatedNumber value={streak} />
              </span>
            </div>
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-xs">
              {streak === 1 ? t('progress.day_streak') : t('progress.day_streaks')}
            </p>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="bg-muted/40 rounded-3xl p-5 border border-border/50 shadow-sm">
            <StreakCalendar streakDays={streakDays} />
          </div>
          
          <div className="text-center space-y-6">
            <p className="text-base text-muted-foreground leading-relaxed px-2 font-medium">
              {t('streak_modal.subtitle', { streak })}
            </p>
            <Button 
              onClick={onClose} 
              size="lg" 
              className="w-full rounded-2xl font-bold h-14 text-lg shadow-xl shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('streak_modal.keep_it_up')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakModal;