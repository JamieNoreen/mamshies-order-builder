import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  iconName: string;
  className?: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  iconName,
  className,
  actionButton,
}) => {
  const IconComponent = (LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>) || LucideIcons.Inbox;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border border-dashed border-secondary/15 rounded-2xl bg-surface/10', className)}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface text-primary/70 mb-4">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="font-fraunces font-bold text-xl text-text-charcoal mb-2">{title}</h3>
      <p className="font-manrope font-normal text-sm text-secondary/60 max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionButton}
    </div>
  );
};
