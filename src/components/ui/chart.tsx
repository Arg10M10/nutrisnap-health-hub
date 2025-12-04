"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: { CSS_VARIABLE: COLOR } }
const THEMES = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 47.4% 11.2%)",
    muted: "hsl(210 40% 96.1%)",
    mutedForeground: "hsl(215.4 16.3% 46.9%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(222.2 47.4% 11.2%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(222.2 47.4% 11.2%)",
    border: "hsl(214.3 31.8% 91.4%)",
    input: "hsl(214.3 31.8% 91.4%)",
    primary: "hsl(222.2 47.4% 11.2%)",
    primaryForeground: "hsl(210 40% 98%)",
    secondary: "hsl(210 40% 96.1%)",
    secondaryForeground: "hsl(222.2 47.4% 11.2%)",
    accent: "hsl(210 40% 96.1%)",
    accentForeground: "hsl(222.2 47.4% 11.2%)",
    destructive: "hsl(0 100% 50%)",
    destructiveForeground: "hsl(210 40% 98%)",
    ring: "hsl(215 20.2% 65.1%)",
    radius: "0.5rem",
  },
  dark: {
    background: "hsl(224 71% 4%)",
    foreground: "hsl(213 31% 91%)",
    muted: "hsl(223 47% 11%)",
    mutedForeground: "hsl(215.4 16.3% 56.9%)",
    popover: "hsl(224 71% 4%)",
    popoverForeground: "hsl(213 31% 91%)",
    card: "hsl(224 71% 4%)",
    cardForeground: "hsl(213 31% 91%)",
    border: "hsl(216 34% 17%)",
    input: "hsl(216 34% 17%)",
    primary: "hsl(210 40% 98%)",
    primaryForeground: "hsl(222.2 47.4% 1.2%)",
    secondary: "hsl(222.2 47.4% 11.2%)",
    secondaryForeground: "hsl(210 40% 98%)",
    accent: "hsl(216 34% 17%)",
    accentForeground: "hsl(210 40% 98%)",
    destructive: "hsl(0 63% 31%)",
    destructiveForeground: "hsl(210 40% 98%)",
    ring: "hsl(216 34% 17%)",
    radius: "0.5rem",
  },
} as const

type Theme = keyof typeof THEMES

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    color?: string
    icon?: React.ComponentType
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve]:stroke-primary [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer[stroke-width='0']]:stroke-transparent [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle]:fill-primary [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector]:stroke-primary [&_.recharts-sector[path='']:stroke-transparent [&_.recharts-surface]:outline-none [&_.recharts-tooltip-cursor]:fill-muted/50 [&_.recharts-tooltip-wrapper]:rounded-lg [&_.recharts-tooltip-wrapper]:border-border [&_.recharts-tooltip-wrapper]:bg-background [&_.recharts-tooltip-wrapper]:shadow-lg",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip>["content"] &
    ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      name,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !label) {
        return null
      }

      if (labelFormatter) {
        return labelFormatter(label)
      }

      if (typeof label === "number") {
        return new Date(label).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      }

      return label
    }, [label, labelFormatter, hideLabel])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && payload[0].name

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && tooltipLabel ? (
          <div className={cn("font-medium", labelClassName)}>{tooltipLabel}</div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item, i) => {
            const key = `${name || item.name || item.dataKey || "value"}`
            const itemConfig = config[key]
            const indicatorColor = color || item.color || itemConfig?.color

            return (
              <div
                key={item.key || `item-${i}`}
                className="flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                {itemConfig?.icon ? (
                  <itemConfig.icon />
                ) : (
                  !hideIndicator && (
                    <div
                      className={cn(
                        "shrink-0 rounded-[2px] border-[1px] border-solid",
                        indicator === "dot" && "h-2.5 w-2.5 rounded-full",
                        indicator === "line" && "h-2.5 w-1",
                        indicator === "dashed" && "my-0.5 h-1.5 w-1 border-dashed"
                      )}
                      style={{
                        background: indicatorColor,
                        borderColor: indicatorColor,
                      }}
                    />
                  )
                )}
                <div
                  className={cn(
                    "flex flex-1 justify-between leading-none",
                    nestLabel ? "items-end" : "items-center"
                  )}
                >
                  <div className="grid gap-1.5">
                    {nestLabel ? (
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    ) : null}
                    <span className="font-medium text-foreground">
                      {formatter
                        ? formatter(item.value, item.name, item, i, payload)
                        : item.value}
                    </span>
                  </div>
                  {!nestLabel ? (
                    <span className="font-medium text-foreground">
                      {itemConfig?.label || item.name}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "verticalAlign"> & {
      payload?: RechartsPrimitive.LegendProps["payload"]
      hideIcon?: boolean
    }
>(({ className, hideIcon = false, payload, verticalAlign }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-4" : "pt-4",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${item.dataKey || "value"}`
        const itemConfig = config[key]

        return (
          <div
            key={item.value}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

// TODO: In progress
// Expose more parts of the chart components
const ChartArea = RechartsPrimitive.Area
const ChartBar = RechartsPrimitive.Bar
const ChartLine = RechartsPrimitive.Line
const ChartPie = RechartsPrimitive.Pie
const ChartRadar = RechartsPrimitive.Radar
const ChartRadialBar = RechartsPrimitive.RadialBar

const ChartXAxis = RechartsPrimitive.XAxis
const ChartYAxis = RechartsPrimitive.YAxis
const ChartCartesianGrid = RechartsPrimitive.CartesianGrid

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartArea,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartRadar,
  ChartRadialBar,
  ChartXAxis,
  ChartYAxis,
  ChartCartesianGrid,
}