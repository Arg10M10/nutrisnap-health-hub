import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface SettingsCategoryProps {
  title: string;
  children: ReactNode;
}

export const SettingsCategory = ({ title, children }: SettingsCategoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col divide-y">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};