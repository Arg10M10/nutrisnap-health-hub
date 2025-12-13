import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useTheme } from 'next-themes';

const AppTutorial = () => {
  const { t } = useTranslation();
  const [run, setRun] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage('has_seen_tutorial_v1', false);
  const { theme } = useTheme();

  useEffect(() => {
    // Small delay to ensure everything is rendered
    const timer = setTimeout(() => {
      if (!hasSeenTutorial) {
        setRun(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasSeenTutorial]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      setHasSeenTutorial(true);
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: t('tutorial.welcome_content'),
      title: t('tutorial.welcome_title'),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#daily-summary-carousel',
      content: t('tutorial.carousel_content'),
      title: t('tutorial.carousel_title'),
      placement: 'bottom',
    },
    {
      target: '#scan-action-button',
      content: t('tutorial.scanner_content'),
      title: t('tutorial.scanner_title'),
      placement: 'top',
    },
    {
      target: '#nav-progress',
      content: t('tutorial.progress_content'),
      title: t('tutorial.progress_title'),
      placement: 'top',
    },
    {
      target: '#nav-settings',
      content: t('tutorial.settings_content'),
      title: t('tutorial.settings_title'),
      placement: 'top',
    },
  ];

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(150 70% 45%)', // App Primary Green
          backgroundColor: isDark ? 'hsl(220 15% 10%)' : '#fff',
          textColor: isDark ? '#fff' : '#333',
          arrowColor: isDark ? 'hsl(220 15% 10%)' : '#fff',
          zIndex: 1000,
        },
        buttonNext: {
          borderRadius: '9999px',
          padding: '8px 16px',
          fontWeight: 600,
        },
        buttonBack: {
          marginRight: 10,
          color: isDark ? '#ccc' : '#666',
        },
        buttonSkip: {
          color: isDark ? '#ccc' : '#666',
        },
      }}
      locale={{
        back: t('ai_suggestions.back'),
        close: t('analysis.close'),
        last: t('tutorial.finish'),
        next: t('diets_onboarding.next'),
        skip: t('subscribe.buttons.skip'),
      }}
    />
  );
};

export default AppTutorial;