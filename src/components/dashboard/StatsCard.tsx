import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className 
}: StatsCardProps) {
  return (
    <Card className={cn(
      "bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300",
      "hover:scale-[1.02] cursor-pointer",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center text-xs font-medium",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}