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
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-card border-none shadow-2xl">
        <div className="bg-gradient-to-b from-orange-500/10 to-transparent p-6 pb-0 flex flex-col items-center">
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full scale-150 animate-pulse" />
            <Flame className="w-24 h-24 text-orange-500 fill-current relative z-10 drop-shadow-lg" />
          </div>
          <DialogHeader className="mb-2">
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              {t('streak_modal.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center mb-6">
            <span className="text-6xl font-black text-foreground tracking-tighter">
              <AnimatedNumber value={streak} />
            </span>
            <p className="text-muted-foreground font-medium uppercase tracking-wide text-sm mt-1">
              {streak === 1 ? t('progress.day_streak') : t('progress.day_streaks')}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <div className="bg-muted/50 rounded-2xl p-4">
            <StreakCalendar streakDays={streakDays} />
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              {t('streak_modal.subtitle')}
            </p>
            <Button onClick={onClose} size="lg" className="w-full rounded-full font-semibold h-12 text-base shadow-lg shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 text-white border-none">
              {t('streak_modal.keep_it_up')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakModal;