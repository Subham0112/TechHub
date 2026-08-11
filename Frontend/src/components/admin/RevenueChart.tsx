import React, { useMemo, useRef, useState } from 'react'

export interface RevenuePoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

const fmtShort = (n: number): string => {
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(1)}k`
  return `Rs. ${n}`
}

const fmtMonthDay = (iso: string): string => {
  const [, m, d] = iso.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[Number(m) - 1]} ${Number(d)}`
}

// round max up to a "nice" axis ceiling (1 / 2 / 5 × 10^n)
const niceCeil = (v: number): number => {
  if (v <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return f * pow
}

const W = 760
const H = 250
const PAD = { top: 18, right: 14, bottom: 30, left: 52 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

const RevenueChart: React.FC<{ data: RevenuePoint[] }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const max = niceCeil(Math.max(...data.map((d) => d.revenue), 0))

  const x = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * INNER_W
  const y = (v: number) => PAD.top + INNER_H - (v / max) * INNER_H

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(d.revenue).toFixed(2)}`)
    .join(' ')

  const areaPath = `${linePath} L${x(data.length - 1).toFixed(2)},${(PAD.top + INNER_H).toFixed(2)} L${PAD.left},${(PAD.top + INNER_H).toFixed(2)} Z`

  const gridTicks = useMemo(() => {
    const ticks = []
    for (let t = 0; t <= 4; t++) {
      const value = (max / 4) * t
      ticks.push({ value, y: y(value) })
    }
    return ticks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max])

  const xLabelStep = data.length <= 7 ? 1 : Math.ceil(data.length / 6)

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg || data.length === 0) return
    const rect = svg.getBoundingClientRect()
    const px = e.clientX - rect.left
    const ratio = (px - PAD.left) / INNER_W
    const i = Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1))))
    setHover(i)
  }

  const hovered = hover !== null ? data[hover] : null

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5B8DEF" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5B8DEF" />
            <stop offset="100%" stopColor="#7BA3F5" />
          </linearGradient>
        </defs>

        {gridTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={t.y}
              y2={t.y}
              stroke="#232F49"
              strokeOpacity="0.6"
              strokeDasharray={i === 0 ? '0' : '3 4'}
            />
            <text x={PAD.left - 8} y={t.y + 3} textAnchor="end" fontSize="9.5" fill="#5C6270" fontFamily="monospace">
              {fmtShort(t.value)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#revArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#revLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) =>
          i % xLabelStep === 0 || i === data.length - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={H - PAD.bottom + 16}
              textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
              fontSize="9.5"
              fill="#5C6270"
              fontFamily="monospace"
            >
              {fmtMonthDay(d.date)}
            </text>
          ) : null
        )}

        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + INNER_H}
              stroke="#FFB238"
              strokeOpacity="0.5"
              strokeDasharray="3 3"
            />
            <circle
              cx={x(hover)}
              cy={y(data[hover].revenue)}
              r="5"
              fill="#FFB238"
              stroke="#121A2E"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {hovered && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 bg-[#0A0E1A] border border-[#2A3752] rounded-lg px-3 py-2 shadow-xl"
          style={{
            left: `calc(${((x(hover) / W) * 100).toFixed(2)}% + 10px)`,
            top: `calc(${((y(data[hover].revenue) / H) * 100).toFixed(2)}% - 46px)`,
            transform: x(hover) > W - 120 ? 'translateX(-110%)' : undefined,
          }}
        >
          <p className="text-[10px] font-mono text-[#5C6270] uppercase tracking-widest">
            {hovered.label}, {fmtMonthDay(hovered.date)}
          </p>
          <p className="text-sm font-mono font-bold text-[#FFB238] mt-0.5">
            {fmtShort(hovered.revenue)}
          </p>
          <p className="text-[10px] font-mono text-[#5C6270] mt-0.5">{hovered.orders} order{hovered.orders === 1 ? '' : 's'}</p>
        </div>
      )}
    </div>
  )
}

export default RevenueChart
