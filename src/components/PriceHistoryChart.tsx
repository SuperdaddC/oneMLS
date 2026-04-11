"use client";

import { useState } from "react";

interface PricePoint {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
  currentPrice: number;
}

function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (price >= 1_000) {
    const k = price / 1_000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(0)}K`;
  }
  return `$${price}`;
}

function formatPriceFull(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PriceHistoryChart({
  priceHistory,
  currentPrice,
}: PriceHistoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Build data points: history + current price as last point
  const today = new Date().toISOString().split("T")[0];
  const sorted = [...priceHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // If fewer than 2 history entries, show single-point display
  if (sorted.length < 2) {
    return (
      <div className="rounded-xl border border-[#2a2a3a] bg-[#161620] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#94a3b8]">Listed at</p>
            <p className="mt-1 text-2xl font-bold text-[#c9a962]">
              {formatPriceFull(currentPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#94a3b8]">
              {sorted.length === 1
                ? formatDateFull(sorted[0].date)
                : formatDateFull(today)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Add current price as last point if it differs from last history entry
  const lastEntry = sorted[sorted.length - 1];
  const dataPoints =
    lastEntry.price === currentPrice
      ? sorted
      : [...sorted, { date: today, price: currentPrice }];

  // Chart dimensions
  const width = 600;
  const height = 200;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Price range with padding
  const prices = dataPoints.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pricePad = Math.max((maxPrice - minPrice) * 0.15, maxPrice * 0.02);
  const yMin = minPrice - pricePad;
  const yMax = maxPrice + pricePad;

  // Scales
  const dates = dataPoints.map((d) => new Date(d.date + "T12:00:00").getTime());
  const xMin = dates[0];
  const xMax = dates[dates.length - 1];
  const xRange = xMax - xMin || 1;

  function scaleX(dateStr: string): number {
    const t = new Date(dateStr + "T12:00:00").getTime();
    return padLeft + ((t - xMin) / xRange) * chartW;
  }

  function scaleY(price: number): number {
    return padTop + chartH - ((price - yMin) / (yMax - yMin)) * chartH;
  }

  // Build polyline points
  const linePoints = dataPoints
    .map((d) => `${scaleX(d.date)},${scaleY(d.price)}`)
    .join(" ");

  // Y-axis ticks (4 ticks)
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const price = yMin + ((yMax - yMin) * i) / 3;
    return { price, y: scaleY(price) };
  });

  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#161620] p-4 sm:p-6">
      <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={width - padRight}
                y2={tick.y}
                stroke="#2a2a3a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="system-ui, sans-serif"
              >
                {formatPriceShort(tick.price)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {dataPoints.map((d, i) => (
            <text
              key={i}
              x={scaleX(d.date)}
              y={height - 5}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
            >
              {formatDateShort(d.date)}
            </text>
          ))}

          {/* Area fill */}
          <polygon
            points={`${scaleX(dataPoints[0].date)},${scaleY(dataPoints[0].price)} ${linePoints} ${scaleX(dataPoints[dataPoints.length - 1].date)},${padTop + chartH} ${scaleX(dataPoints[0].date)},${padTop + chartH}`}
            fill="url(#goldGradient)"
            opacity="0.15"
          />

          {/* Line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#c9a962"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((d, i) => {
            const cx = scaleX(d.date);
            const cy = scaleY(d.price);
            const isLast = i === dataPoints.length - 1;
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Invisible larger hit area */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={20}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: "pointer" }}
                />
                {/* Visible dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLast ? 6 : 4}
                  fill={isLast ? "#c9a962" : "#161620"}
                  stroke="#c9a962"
                  strokeWidth="2"
                />
                {/* Current price label on last dot */}
                {isLast && !isHovered && (
                  <text
                    x={cx}
                    y={cy - 14}
                    textAnchor="middle"
                    fill="#c9a962"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    {formatPriceShort(d.price)}
                  </text>
                )}
                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={cx - 65}
                      y={cy - 50}
                      width={130}
                      height={36}
                      rx={6}
                      fill="#1c1c2e"
                      stroke="#2a2a3a"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 34}
                      textAnchor="middle"
                      fill="#c9a962"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {formatPriceFull(d.price)}
                    </text>
                    <text
                      x={cx}
                      y={cy - 20}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="system-ui, sans-serif"
                    >
                      {formatDateFull(d.date)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a962" />
              <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
