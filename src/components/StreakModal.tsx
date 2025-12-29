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
      <DialogContent className="bg-card border-none shadow-2xl rounded-[32px] w-[90vw] max-w-[350px] p-0 overflow-hidden outline-none">
        <div className="w-full">
          <div className="bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-transparent p-6 pb-2 flex flex-col items-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full scale-125 animate-pulse" />
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full border border-white/20 shadow-inner">
                <Flame className="w-16 h-16 text-orange-500 fill-current relative z-10 drop-shadow-lg" />
              </div>
            </div>
            <DialogHeader className="mb-1 p-0 space-y-0">
              <DialogTitle className="text-center text-2xl font-black text-foreground tracking-tight">
                {t('streak_modal.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="text-center mb-1">
              <div className="flex items-center justify-center gap-1">
                <span className="text-6xl font-black text-foreground tracking-tighter tabular-nums drop-shadow-sm">
                  <AnimatedNumber value={streak} />
                </span>
              </div>
              <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                {streak === 1 ? t('progress.day_streak') : t('progress.day_streaks')}
              </p>
            </div>
          </div>

          <div className="px-5 pb-6 space-y-5">
            <div className="bg-muted/40 rounded-2xl p-3 border border-border/50 shadow-sm">
              <StreakCalendar streakDays={streakDays} />
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed px-2 font-medium">
                {t('streak_modal.subtitle', { streak })}
              </p>
              <Button 
                onClick={onClose} 
                size="lg" 
                className="w-full rounded-xl font-bold h-12 text-base shadow-xl shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('streak_modal.keep_it_up')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakModal;