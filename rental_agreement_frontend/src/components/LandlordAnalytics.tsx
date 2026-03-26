/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/LandlordAnalytics.tsx
// Drop this inside LandlordDashboard where the analytics tab renders

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp, Home, FileCheck2, AlertCircle,
  DollarSign, BarChart3, PieChartIcon, Activity,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
interface Props {
  agreements: any[];
  properties: any[];
}

// ── Helpers ────────────────────────────────────────────────────
const ETH_PER_AGREEMENT = 0.01; // rent per agreement in ETH

function getMonthLabel(dateStr: string | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
}

// ── Custom Tooltip ─────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
        <p className="text-purple-300 font-semibold mb-1">{label}</p>
        <p className="text-white">
          <span className="text-purple-400">Rent Collected: </span>
          {payload[0].value} ETH
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
        <p className="text-white font-semibold">{payload[0].name}</p>
        <p className="text-purple-300">{payload[0].value} agreement{payload[0].value !== 1 ? "s" : ""}</p>
      </div>
    );
  }
  return null;
};

// ── Main Component ─────────────────────────────────────────────
export default function LandlordAnalytics({ agreements, properties }: Props) {

  // ── Computed stats ─────────────────────────────────────────────
  const activeAgreements     = agreements.filter(a => a.status === "active");
  const pendingAgreements    = agreements.filter(a => a.status === "pending");
  const approvedAgreements   = agreements.filter(a => a.status === "approved");
  const terminatedAgreements = agreements.filter(a => a.status === "terminated");

  const totalProperties  = properties.length;
  const occupiedProps    = properties.filter(p => !p.isAvailable).length;
  const availableProps   = properties.filter(p => p.isAvailable).length;
  const occupancyRate    = totalProperties > 0
    ? Math.round((occupiedProps / totalProperties) * 100)
    : 0;

  // Rent earned this month: count active agreements whose startDate is this month
  const now = new Date();
  const thisMonthActive = activeAgreements.filter(a => {
    const d = new Date(a.startDate || a.createdAt || "");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  // All active agreements earn rent every month
  const rentThisMonth    = (activeAgreements.length * ETH_PER_AGREEMENT).toFixed(3);
  const totalRentEarned  = (agreements.filter(a =>
    a.status === "active" || a.status === "terminated"
  ).length * ETH_PER_AGREEMENT).toFixed(3);

  // ── Donut chart data ────────────────────────────────────────────
  const statusData = [
    { name: "Active",     value: activeAgreements.length,     color: "#10B981" },
    { name: "Pending",    value: pendingAgreements.length,     color: "#F59E0B" },
    { name: "Approved",   value: approvedAgreements.length,    color: "#3B82F6" },
    { name: "Terminated", value: terminatedAgreements.length,  color: "#6B7280" },
  ].filter(d => d.value > 0);

  // ── Bar chart: monthly rent by month of agreement start ─────────
  const monthlyMap: Record<string, number> = {};
  agreements
    .filter(a => a.status === "active" || a.status === "terminated")
    .forEach(a => {
      const label = getMonthLabel(a.startDate || a.createdAt);
      if (label) {
        monthlyMap[label] = (monthlyMap[label] || 0) + ETH_PER_AGREEMENT;
      }
    });

  // Sort by date and keep last 6 months
  const monthlyData = Object.entries(monthlyMap)
    .map(([month, rent]) => ({ month, rent: parseFloat(rent.toFixed(3)) }))
    .slice(-6);

  // ── Stat cards config ───────────────────────────────────────────
  const statCards = [
    {
      title: "Rent This Month",
      value: `${rentThisMonth} ETH`,
      sub: `${activeAgreements.length} active agreement${activeAgreements.length !== 1 ? "s" : ""}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      glow: "via-green-500/40",
    },
    {
      title: "Active Agreements",
      value: activeAgreements.length,
      sub: `${approvedAgreements.length} awaiting tenant signature`,
      icon: FileCheck2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      glow: "via-blue-500/40",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      sub: `${occupiedProps} of ${totalProperties} properties occupied`,
      icon: Home,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      glow: "via-purple-500/40",
    },
    {
      title: "Total Rent Earned",
      value: `${totalRentEarned} ETH`,
      sub: `Across all agreements`,
      icon: TrendingUp,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      glow: "via-orange-500/40",
    },
  ];

  // ── Pending alerts ──────────────────────────────────────────────
  const hasPending = pendingAgreements.length > 0;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <BarChart3 className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Dashboard Analytics</h3>
          <p className="text-purple-300 text-sm">Overview of your rental portfolio performance</p>
        </div>
      </div>

      {/* PENDING ALERT */}
      {hasPending && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-yellow-300 text-sm">
            You have <span className="font-bold">{pendingAgreements.length}</span> pending
            agreement request{pendingAgreements.length !== 1 ? "s" : ""} waiting for your approval.
          </p>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className={`${card.bg} ${card.border} border relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${card.glow} to-transparent`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-purple-300 font-medium leading-tight">{card.title}</p>
                <div className={`p-1.5 ${card.bg} rounded-lg border ${card.border}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
              <p className="text-xs text-white/40">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* DONUT — Agreement Status */}
        <Card className="bg-white/5 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-purple-400" />
              Agreement Status Breakdown
            </CardTitle>
            <p className="text-purple-300 text-xs">Distribution of all agreements by current status</p>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-purple-300 text-sm">
                <p className="text-3xl mb-3">📋</p>
                No agreements yet
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex flex-col gap-2.5 flex-1">
                  {statusData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-purple-300">{entry.name}</span>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: entry.color }}
                      >
                        {entry.value}
                      </span>
                    </div>
                  ))}
                  <div className="mt-1 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-purple-300">Total</span>
                    <span className="text-sm font-bold text-white">{agreements.length}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BAR — Monthly Rent */}
        <Card className="bg-white/5 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Monthly Rent Collection
            </CardTitle>
            <p className="text-purple-300 text-xs">ETH collected per month (0.01 ETH per agreement)</p>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-purple-300 text-sm">
                <p className="text-3xl mb-3">📊</p>
                No rent data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94A3B8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
                  <Bar
                    dataKey="rent"
                    name="ETH"
                    radius={[6, 6, 0, 0]}
                    fill="url(#barGrad)"
                  />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OCCUPANCY RATE + PROPERTY BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* OCCUPANCY PROGRESS */}
        <Card className="bg-white/5 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              Occupancy Rate
            </CardTitle>
            <p className="text-purple-300 text-xs">Percentage of your properties currently occupied</p>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Big number */}
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-white tabular-nums">{occupancyRate}</span>
              <span className="text-2xl text-purple-300 mb-1">%</span>
              <span className={`mb-2 text-sm font-semibold px-2 py-0.5 rounded-full ${
                occupancyRate >= 75
                  ? "bg-green-500/20 text-green-400"
                  : occupancyRate >= 50
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
              }`}>
                {occupancyRate >= 75 ? "Good" : occupancyRate >= 50 ? "Fair" : "Low"}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${occupancyRate}%`,
                    background: occupancyRate >= 75
                      ? "linear-gradient(90deg, #10B981, #34D399)"
                      : occupancyRate >= 50
                        ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
                        : "linear-gradient(90deg, #EF4444, #F87171)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-purple-300">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Property split */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{availableProps}</p>
                <p className="text-xs text-green-300 mt-0.5">Available</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{occupiedProps}</p>
                <p className="text-xs text-blue-300 mt-0.5">Occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AGREEMENT SUMMARY TABLE */}
        <Card className="bg-white/5 border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-orange-400" />
              Agreement Summary
            </CardTitle>
            <p className="text-purple-300 text-xs">Quick breakdown of all your agreements</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Active",     count: activeAgreements.length,     color: "bg-green-500",  text: "text-green-400",  badge: "bg-green-500/10 border-green-500/20" },
                { label: "Pending",    count: pendingAgreements.length,     color: "bg-yellow-500", text: "text-yellow-400", badge: "bg-yellow-500/10 border-yellow-500/20" },
                { label: "Approved",   count: approvedAgreements.length,    color: "bg-blue-500",   text: "text-blue-400",   badge: "bg-blue-500/10 border-blue-500/20" },
                { label: "Terminated", count: terminatedAgreements.length,  color: "bg-gray-500",   text: "text-gray-400",   badge: "bg-gray-500/10 border-gray-500/20" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                    <span className="text-sm text-white">{row.label}</span>
                  </div>
                  <div className={`px-3 py-0.5 rounded-full border text-sm font-bold ${row.badge} ${row.text}`}>
                    {row.count}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl mt-1">
                <span className="text-sm font-semibold text-purple-300">Total Agreements</span>
                <span className="text-sm font-bold text-white px-3 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                  {agreements.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}