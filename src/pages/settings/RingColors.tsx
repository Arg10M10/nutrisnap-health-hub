import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const ColorRing = ({ color, isDotted = false }: { color: string; isDotted?: boolean }) => (
  <div className="w-10 h-10 rounded-full flex-shrink-0" style={{
    border: isDotted ? `3px dashed ${color}` : `4px solid ${color}`
  }} />
);

const RingColors = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const ringInfo = [
    { color: 'hsl(var(--primary))', title: t('ring_colors.green_title'), description: t('ring_colors.green_desc') },
    { color: '#f59e0b', title: t('ring_colors.yellow_title'), description: t('ring_colors.yellow_desc') },
    { color: 'hsl(var(--destructive))', title: t('ring_colors.red_title'), description: t('ring_colors.red_desc') },
    { color: 'hsl(var(--muted-foreground) / 0.3)', isDotted: true, title: t('ring_colors.dotted_title'), description: t('ring_colors.dotted_desc') },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('ring_colors.title')}</h1>
        </header>

        <Card>
          <CardContent className="p-6 space-y-6">
            <p className="text-muted-foreground text-center">{t('ring_colors.subtitle')}</p>
            <div className="space-y-6">
              {ringInfo.map((item) => (
                <div key={item.title} className="flex items-center gap-6">
                  <ColorRing color={item.color} isDotted={item.isDotted} />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default RingColors;