import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: number;
  className?: string;
  text?: string;
}

export function Loading({ size = 24, className = '', text }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className="animate-spin" size={size} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
