import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface StateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function StateCard({ icon, title, description, action }: StateCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center bg-white border-dashed">
      <CardContent className="flex flex-col items-center pt-6">
        <div className="mb-4 rounded-full bg-secondary p-4 text-muted-foreground flex items-center justify-center">
          {icon}
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground max-w-sm">{description}</p>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}
