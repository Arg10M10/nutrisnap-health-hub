import * as React from "react";
import { Tooltip as RechartsTooltip } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig;
  children: React.ReactNode;
}

export function ChartContainer({
  config,
  className,
  style,
  children,
  ...props
}: ChartContainerProps) {
  const cssVars: React.CSSProperties = { ...style };

  if (config) {
    for (const [key, value] of Object.entries(config)) {
      if (value?.color) {
        (cssVars as any)[`--color-${key}`] = value.color;
      }
    }
  }

  return (
    <div className={cn("w-full", className)} style={cssVars} {...props}>
      {children}
    </div>
  );
}

// Simple passthrough wrapper for Recharts Tooltip to keep API consistent in the app
export function ChartTooltip(props: any) {
  return <RechartsTooltip {...props} />;
}

export interface ChartTooltipContentProps {
  className?: string;
  hideIndicator?: boolean;
  labelClassName?: string;
  labelFormatter?: (label: string | number) => React.ReactNode;
  formatter?: (
    value: number | string | ReadonlyArray<number | string>,
    name: string | number,
    item: any,
    index: number
  ) => React.ReactNode;
  color?: string;
  name?: string;

  // Minimal fields Recharts passes to content renderer
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    color?: string;
    name?: string | number;
    value?: number | string | ReadonlyArray<number | string>;
    dataKey?: string;
    payload?: any;
  }>;
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const title =
    label !== undefined && label !== null
      ? labelFormatter
        ? labelFormatter(label)
        : label
      : null;

  return (
    <div className={cn("rounded-md border bg-card p-3 text-card-foreground shadow-sm", className)}>
      {title !== null && (
        <div className={cn("mb-2 text-sm font-medium", labelClassName)}>{title}</div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry: any, index: number) => {
          const dotColor =
            entry.color || entry.payload?.stroke || "hsl(var(--foreground))";
          const name = entry.name ?? entry.dataKey;
          const value = entry.value;
          const content = formatter
            ? formatter(value, name, entry, index)
            : (value as any);

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {!hideIndicator && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
              )}
              <span className="text-muted-foreground">{String(name)}:</span>
              <span className="font-medium text-foreground">{content}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}