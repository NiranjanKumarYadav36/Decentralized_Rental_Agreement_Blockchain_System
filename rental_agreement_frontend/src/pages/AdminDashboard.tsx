/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  getAllPropertiesAdmin,
  deletePropertyAdmin,
  getAllAgreementsAdmin,
  getActiveDisputes,
  resolveDisputeAdmin,
} from "@/services/adminApi";

// ─── helpers ─────────────────────────────────────
const fmt = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n);

const statusColor: Record<string, string> = {
  active: "#10b981",
  pending: "#f59e0b",
  approved: "#06b6d4",
  expired: "#6b7280",
  terminated: "#ef4444",
};

type Tab = "overview" | "users" | "properties" | "agreements" | "disputes" | "analytics";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "overview",    icon: "⬡",  label: "Overview"          },
  { id: "users",       icon: "👥", label: "User Management"   },
  { id: "properties",  icon: "🏠", label: "Property Oversight"},
  { id: "agreements",  icon: "📋", label: "Agreement Control" },
  { id: "disputes",    icon: "⚠️", label: "Dispute Monitor"   },
  { id: "analytics",   icon: "📊", label: "Analytics"         },
];

// ─── STYLES ──────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.4);border-radius:99px;}

.ad-root{display:flex;min-height:100vh;background:#060612;font-family:'Inter',sans-serif;color:#e2e8f0;}

/* ── Sidebar ── */
.ad-sidebar{
  width:240px;min-width:240px;
  background:#0a0a1a;
  border-right:1px solid rgba(124,58,237,0.15);
  display:flex;flex-direction:column;
  padding:0 0 24px 0;
  position:sticky;top:0;height:100vh;overflow:hidden;
}
.ad-sidebar-logo{
  padding:28px 24px 20px;
  border-bottom:1px solid rgba(124,58,237,0.1);
  margin-bottom:16px;
}
.ad-logo-badge{
  display:flex;align-items:center;gap:10px;
}
.ad-logo-icon{
  width:36px;height:36px;
  background:linear-gradient(135deg,#7c3aed,#5b21b6);
  border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;
  box-shadow:0 4px 12px rgba(124,58,237,0.4);
}
.ad-logo-text{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:#fff;}
.ad-logo-sub{font-size:10px;color:#6b7280;margin-top:1px;letter-spacing:0.05em;}

.ad-nav{flex:1;padding:0 12px;overflow-y:auto;}
.ad-nav-item{
  display:flex;align-items:center;gap:12px;
  padding:11px 14px;border-radius:10px;
  cursor:pointer;font-size:13.5px;font-weight:500;color:#6b7280;
  transition:all 0.18s;margin-bottom:3px;
  border:1px solid transparent;
  user-select:none;
}
.ad-nav-item:hover{background:rgba(124,58,237,0.08);color:#a78bfa;}
.ad-nav-item.active{
  background:rgba(124,58,237,0.15);
  border-color:rgba(124,58,237,0.3);
  color:#c4b5fd;
}
.ad-nav-icon{font-size:16px;width:20px;text-align:center;}

.ad-sidebar-footer{padding:16px 24px 0;border-top:1px solid rgba(124,58,237,0.1);margin-top:auto;}
.ad-admin-info{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.ad-admin-avatar{
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,#7c3aed,#06b6d4);
  display:flex;align-items:center;justify-content:center;
  font-size:14px;font-weight:700;color:#fff;
}
.ad-admin-name{font-size:13px;font-weight:600;color:#e2e8f0;}
.ad-admin-role{font-size:10px;color:#7c3aed;font-family:'JetBrains Mono',monospace;letter-spacing:0.05em;}
.ad-logout-btn{
  width:100%;padding:9px;
  background:rgba(239,68,68,0.08);
  border:1px solid rgba(239,68,68,0.2);
  border-radius:8px;color:#f87171;
  font-size:12.5px;cursor:pointer;
  font-family:'Inter',sans-serif;
  transition:all 0.2s;
}
.ad-logout-btn:hover{background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4);}

/* ── Main ── */
.ad-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow-y:auto;}
.ad-topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 32px;
  border-bottom:1px solid rgba(124,58,237,0.1);
  background:rgba(6,6,18,0.8);
  backdrop-filter:blur(10px);
  position:sticky;top:0;z-index:20;
}
.ad-breadcrumb{font-family:'JetBrains Mono',monospace;font-size:12px;color:#6b7280;}
.ad-breadcrumb span{color:#a78bfa;}
.ad-topbar-right{display:flex;align-items:center;gap:16px;}
.ad-live-dot{
  display:flex;align-items:center;gap:6px;
  font-size:12px;color:#10b981;
  font-family:'JetBrains Mono',monospace;
}
.ad-live-pulse{
  width:7px;height:7px;border-radius:50%;background:#10b981;
  box-shadow:0 0 8px #10b981;
  animation:adPulse 2s ease-in-out infinite;
}
@keyframes adPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.7);}}

.ad-content{padding:28px 32px;flex:1;}
.ad-page-title{font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:4px;}
.ad-page-sub{font-size:13px;color:#6b7280;margin-bottom:28px;}

/* ── Stat cards ── */
.ad-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:28px;}
.ad-stat-card{
  background:rgba(13,13,26,0.8);
  border:1px solid rgba(124,58,237,0.12);
  border-radius:14px;padding:20px;
  transition:border-color 0.2s,transform 0.2s;
  position:relative;overflow:hidden;
}
.ad-stat-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--sc),transparent);
}
.ad-stat-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-2px);}
.ad-stat-icon{font-size:22px;margin-bottom:12px;}
.ad-stat-value{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;color:#f1f5f9;}
.ad-stat-label{font-size:12px;color:#6b7280;margin-top:4px;}
.ad-stat-sub{font-size:11px;color:#4b5563;margin-top:6px;font-family:'JetBrains Mono',monospace;}

/* ── Tables ── */
.ad-card{
  background:rgba(13,13,26,0.8);
  border:1px solid rgba(124,58,237,0.12);
  border-radius:14px;overflow:hidden;margin-bottom:24px;
}
.ad-card-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 22px;border-bottom:1px solid rgba(124,58,237,0.08);
}
.ad-card-title{font-size:15px;font-weight:600;color:#e2e8f0;}
.ad-card-count{
  font-family:'JetBrains Mono',monospace;font-size:12px;
  color:#7c3aed;background:rgba(124,58,237,0.1);
  padding:3px 10px;border-radius:99px;
}
.ad-table-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;}
th{
  padding:12px 18px;text-align:left;
  font-size:11px;letter-spacing:0.07em;
  color:#6b7280;text-transform:uppercase;
  border-bottom:1px solid rgba(124,58,237,0.08);
  font-weight:500;white-space:nowrap;
}
td{
  padding:13px 18px;font-size:13px;color:#cbd5e1;
  border-bottom:1px solid rgba(124,58,237,0.05);
  vertical-align:middle;
}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(124,58,237,0.04);}
.ad-mono{font-family:'JetBrains Mono',monospace;font-size:12px;}

/* ── Badges ── */
.ad-badge{
  display:inline-block;padding:3px 10px;border-radius:99px;
  font-size:11px;font-weight:500;letter-spacing:0.04em;font-family:'JetBrains Mono',monospace;
}
.ad-badge-active{background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.25);}
.ad-badge-inactive{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);}
.ad-badge-pending{background:rgba(245,158,11,0.12);color:#f59e0b;border:1px solid rgba(245,158,11,0.25);}
.ad-badge-approved{background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2);}
.ad-badge-expired{background:rgba(107,114,128,0.12);color:#9ca3af;border:1px solid rgba(107,114,128,0.2);}
.ad-badge-terminated{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);}
.ad-badge-dispute{background:rgba(245,158,11,0.12);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);}

/* ── Action buttons ── */
.ad-btn{
  padding:6px 14px;border-radius:7px;font-size:12px;
  font-weight:500;cursor:pointer;border:none;
  transition:all 0.18s;font-family:'Inter',sans-serif;
}
.ad-btn-danger{background:rgba(239,68,68,0.12);color:#f87171;border:1px solid rgba(239,68,68,0.25);}
.ad-btn-danger:hover{background:rgba(239,68,68,0.22);}
.ad-btn-warn{background:rgba(245,158,11,0.12);color:#f59e0b;border:1px solid rgba(245,158,11,0.25);}
.ad-btn-warn:hover{background:rgba(245,158,11,0.22);}
.ad-btn-success{background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.25);}
.ad-btn-success:hover{background:rgba(16,185,129,0.22);}
.ad-btn-purple{background:rgba(124,58,237,0.15);color:#a78bfa;border:1px solid rgba(124,58,237,0.3);}
.ad-btn-purple:hover{background:rgba(124,58,237,0.25);}

/* ── Search / Filters ── */
.ad-search-row{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;}
.ad-search{
  flex:1;min-width:200px;
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(124,58,237,0.15);
  border-radius:9px;padding:10px 14px;
  color:#e2e8f0;font-size:13px;
  font-family:'Inter',sans-serif;outline:none;
  transition:border-color 0.2s;
}
.ad-search:focus{border-color:#7c3aed;}
.ad-search::placeholder{color:#4b5563;}
.ad-select{
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(124,58,237,0.15);
  border-radius:9px;padding:10px 14px;
  color:#e2e8f0;font-size:13px;
  font-family:'Inter',sans-serif;outline:none;cursor:pointer;
}
.ad-select option{background:#1a1a2e;color:#e2e8f0;}

/* ── Analytics bars ── */
.ad-analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
@media(max-width:900px){.ad-analytics-grid{grid-template-columns:1fr;}}
.ad-bar-row{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.ad-bar-label{font-size:12px;color:#9ca3af;width:90px;flex-shrink:0;}
.ad-bar-outer{flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;}
.ad-bar-inner{height:100%;border-radius:99px;transition:width 0.8s cubic-bezier(.25,.46,.45,.94);}
.ad-bar-val{font-family:'JetBrains Mono',monospace;font-size:11px;color:#a78bfa;width:40px;text-align:right;}

/* ── Monthly chart ── */
.ad-chart{display:flex;align-items:flex-end;gap:8px;height:120px;padding:0 4px;}
.ad-chart-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;}
.ad-chart-bar{
  width:100%;border-radius:4px 4px 0 0;
  background:linear-gradient(180deg,#7c3aed,#5b21b6);
  transition:height 0.8s cubic-bezier(.25,.46,.45,.94);
  min-height:4px;
}
.ad-chart-month{font-size:10px;color:#6b7280;font-family:'JetBrains Mono',monospace;}

/* ── Empty state ── */
.ad-empty{text-align:center;padding:48px;color:#4b5563;}
.ad-empty-icon{font-size:36px;margin-bottom:12px;opacity:0.5;}
.ad-empty-msg{font-size:14px;}

/* ── Loading ── */
.ad-loading{display:flex;align-items:center;justify-content:center;padding:60px;color:#6b7280;gap:12px;}
.ad-spinner{width:20px;height:20px;border:2px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:adSpin 0.7s linear infinite;}
@keyframes adSpin{to{transform:rotate(360deg);}}

.ad-refresh-btn{
  background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);
  border-radius:8px;padding:8px 14px;color:#a78bfa;font-size:12px;
  cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;
}
.ad-refresh-btn:hover{background:rgba(124,58,237,0.2);}

.ad-wallet-mono{font-family:'JetBrains Mono',monospace;font-size:11px;color:#7c3aed;}
`;

// ─── OVERVIEW TAB ─────────────────────────────────
function OverviewTab({ stats }: { stats: any }) {
  if (!stats) return <div className="ad-loading"><span className="ad-spinner"/><span>Loading stats…</span></div>;

  const cards = [
    { icon: "👥", label: "Total Users",       value: fmt(stats.users.total),       sub: `${stats.users.landlords}L · ${stats.users.tenants}T`, color: "#7c3aed" },
    { icon: "🏠", label: "Properties",        value: fmt(stats.properties.total),  sub: `${stats.properties.available} available`,            color: "#06b6d4" },
    { icon: "📋", label: "Agreements",        value: fmt(stats.agreements.total),  sub: `${stats.agreements.active} active`,                  color: "#10b981" },
    { icon: "⚡", label: "Pending",           value: fmt(stats.agreements.pending),sub: "Awaiting approval",                                  color: "#f59e0b" },
    { icon: "⚠️", label: "Active Disputes",   value: fmt(stats.agreements.disputes),sub:"Need resolution",                                   color: "#ef4444" },
    { icon: "💰", label: "Est. Revenue (₹)",  value: fmt(stats.revenue),           sub: "All-time rent total",                                color: "#a78bfa" },
  ];

  const maxMonth = Math.max(...(stats.monthlyData?.map((m: any) => m.count) || [1]), 1);
  const monthNames = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <>
      <div className="ad-stats-grid">
        {cards.map((c) => (
          <div className="ad-stat-card" key={c.label} style={{ "--sc": c.color } as any}>
            <div className="ad-stat-icon">{c.icon}</div>
            <div className="ad-stat-value">{c.value}</div>
            <div className="ad-stat-label">{c.label}</div>
            <div className="ad-stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="ad-card">
          <div className="ad-card-header">
            <span className="ad-card-title">Platform Breakdown</span>
          </div>
          <div style={{ padding: "20px 22px" }}>
            {[
              { label: "Landlords", val: stats.users.landlords, total: stats.users.total, color: "#7c3aed" },
              { label: "Tenants",   val: stats.users.tenants,   total: stats.users.total, color: "#06b6d4" },
              { label: "Occupied",  val: stats.properties.occupied, total: stats.properties.total, color: "#10b981" },
              { label: "Disputes",  val: stats.agreements.disputes, total: stats.agreements.total, color: "#ef4444" },
            ].map((r) => (
              <div className="ad-bar-row" key={r.label}>
                <span className="ad-bar-label">{r.label}</span>
                <div className="ad-bar-outer">
                  <div className="ad-bar-inner" style={{ width: `${r.total ? (r.val / r.total) * 100 : 0}%`, background: r.color }} />
                </div>
                <span className="ad-bar-val">{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <span className="ad-card-title">Agreements / Month</span>
          </div>
          <div style={{ padding: "20px 22px" }}>
            {stats.monthlyData?.length > 0 ? (
              <div className="ad-chart">
                {stats.monthlyData.map((m: any) => (
                  <div className="ad-chart-bar-wrap" key={`${m._id.year}-${m._id.month}`}>
                    <div className="ad-chart-bar" style={{ height: `${(m.count / maxMonth) * 100}px` }} title={`${m.count} agreements`} />
                    <span className="ad-chart-month">{monthNames[m._id.month]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ad-empty"><div className="ad-empty-icon">📊</div><div className="ad-empty-msg">No monthly data yet</div></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── USERS TAB ───────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers({ search, role: roleFilter, status: statusFilter });
      setUsers(res.data);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      await toggleUserStatus(id, { isActive: !current });
      setUsers((u) => u.map((x) => x._id === id ? { ...x, isActive: !current } : x));
    } catch { /* silent */ }
    setToggling(null);
  };

  return (
    <>
      <div className="ad-search-row">
        <input id="user-search" className="ad-search" placeholder="🔍  Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select id="user-role-filter" className="ad-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="landlord">Landlord</option>
          <option value="tenant">Tenant</option>
        </select>
        <select id="user-status-filter" className="ad-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="ad-refresh-btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="ad-card">
        <div className="ad-card-header">
          <span className="ad-card-title">All Users</span>
          <span className="ad-card-count">{users.length} total</span>
        </div>
        {loading ? (
          <div className="ad-loading"><span className="ad-spinner"/><span>Loading…</span></div>
        ) : users.length === 0 ? (
          <div className="ad-empty"><div className="ad-empty-icon">👥</div><div className="ad-empty-msg">No users found</div></div>
        ) : (
          <div className="ad-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Wallet</th><th>Agreements</th><th>Properties</th><th>Joined</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`ad-badge ${u.role === "landlord" ? "ad-badge-approved" : "ad-badge-purple"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.walletAddress
                        ? <span className="ad-wallet-mono">{u.walletAddress.slice(0,6)}…{u.walletAddress.slice(-4)}</span>
                        : <span style={{ color: "#4b5563", fontSize: 11 }}>—</span>}
                    </td>
                    <td className="ad-mono">{u.agreementCount}</td>
                    <td className="ad-mono">{u.propertyCount || "—"}</td>
                    <td style={{ fontSize: 11, color: "#6b7280" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`ad-badge ${u.isActive === false ? "ad-badge-inactive" : "ad-badge-active"}`}>
                        {u.isActive === false ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        id={`user-toggle-${u._id}`}
                        className={`ad-btn ${u.isActive === false ? "ad-btn-success" : "ad-btn-danger"}`}
                        onClick={() => handleToggle(u._id, u.isActive !== false)}
                        disabled={toggling === u._id}
                      >
                        {toggling === u._id ? "…" : u.isActive === false ? "Activate" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ─── PROPERTIES TAB ──────────────────────────────
function PropertiesTab() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [availFilter, setAvailFilter] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { search };
      if (availFilter !== "all") params.available = availFilter === "available";
      const res = await getAllPropertiesAdmin(params);
      setProperties(res.data);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, availFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Remove property "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deletePropertyAdmin(id);
      setProperties((p) => p.filter((x) => x._id !== id));
    } catch { /* silent */ }
    setDeleting(null);
  };

  return (
    <>
      <div className="ad-search-row">
        <input id="prop-search" className="ad-search" placeholder="🔍  Search by title or location…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select id="prop-avail-filter" className="ad-select" value={availFilter} onChange={(e) => setAvailFilter(e.target.value)}>
          <option value="all">All Properties</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>
        <button className="ad-refresh-btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="ad-card">
        <div className="ad-card-header">
          <span className="ad-card-title">All Properties</span>
          <span className="ad-card-count">{properties.length} total</span>
        </div>
        {loading ? (
          <div className="ad-loading"><span className="ad-spinner"/><span>Loading…</span></div>
        ) : properties.length === 0 ? (
          <div className="ad-empty"><div className="ad-empty-icon">🏠</div><div className="ad-empty-msg">No properties found</div></div>
        ) : (
          <div className="ad-table-wrap">
            <table>
              <thead>
                <tr><th>Property</th><th>Landlord</th><th>Type</th><th>Rent (₹)</th><th>Deposit (₹)</th><th>Status</th><th>Tenant</th><th>Action</th></tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>📍 {p.location}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{p.landlord?.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{p.landlord?.email}</div>
                    </td>
                    <td><span className="ad-badge ad-badge-approved">{p.roomType}</span></td>
                    <td className="ad-mono">{p.rentAmount?.toLocaleString()}</td>
                    <td className="ad-mono">{p.depositAmount?.toLocaleString()}</td>
                    <td>
                      <span className={`ad-badge ${p.isAvailable ? "ad-badge-active" : "ad-badge-inactive"}`}>
                        {p.isAvailable ? "Available" : "Occupied"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#9ca3af" }}>
                      {p.currentTenant ? p.currentTenant.name : "—"}
                    </td>
                    <td>
                      <button
                        id={`prop-delete-${p._id}`}
                        className="ad-btn ad-btn-danger"
                        onClick={() => handleDelete(p._id, p.title)}
                        disabled={deleting === p._id}
                      >
                        {deleting === p._id ? "…" : "🗑 Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ─── AGREEMENTS TAB ──────────────────────────────
function AgreementsTab() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAgreementsAdmin({ status: statusFilter, search });
      setAgreements(res.data);
    } catch { /* silent */ }
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="ad-search-row">
        <input id="agree-search" className="ad-search" placeholder="🔍  Search by property or user…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select id="agree-status-filter" className="ad-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="terminated">Terminated</option>
        </select>
        <button className="ad-refresh-btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="ad-card">
        <div className="ad-card-header">
          <span className="ad-card-title">All Agreements</span>
          <span className="ad-card-count">{agreements.length} total</span>
        </div>
        {loading ? (
          <div className="ad-loading"><span className="ad-spinner"/><span>Loading…</span></div>
        ) : agreements.length === 0 ? (
          <div className="ad-empty"><div className="ad-empty-icon">📋</div><div className="ad-empty-msg">No agreements found</div></div>
        ) : (
          <div className="ad-table-wrap">
            <table>
              <thead>
                <tr><th>Property</th><th>Landlord</th><th>Tenant</th><th>Rent (₹)</th><th>Deposit (₹)</th><th>Status</th><th>Dispute</th><th>Contract</th><th>Date</th></tr>
              </thead>
              <tbody>
                {agreements.map((a) => {
                  const badgeCls = `ad-badge ad-badge-${a.status}`;
                  return (
                    <tr key={a._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{a.property?.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{a.property?.location}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{a.landlord?.name}</td>
                      <td style={{ fontSize: 12 }}>{a.tenant?.name}</td>
                      <td className="ad-mono">{a.rentAmount?.toLocaleString()}</td>
                      <td className="ad-mono">{a.depositAmount?.toLocaleString()}</td>
                      <td>
                        <span className={badgeCls} style={{ background: `${statusColor[a.status]}18`, color: statusColor[a.status], borderColor: `${statusColor[a.status]}40` }}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        {a.disputeActive
                          ? <span className="ad-badge ad-badge-dispute">⚠ Active</span>
                          : <span style={{ color: "#4b5563", fontSize: 11 }}>None</span>}
                      </td>
                      <td>
                        {a.contractAddress
                          ? <span className="ad-wallet-mono">{a.contractAddress.slice(0,6)}…{a.contractAddress.slice(-4)}</span>
                          : <span style={{ color: "#4b5563", fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ fontSize: 11, color: "#6b7280" }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ─── DISPUTES TAB ─────────────────────────────────
function DisputesTab() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getActiveDisputes();
      setDisputes(res.data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id: string) => {
    if (!window.confirm("Mark this dispute as resolved?")) return;
    setResolving(id);
    try {
      await resolveDisputeAdmin(id);
      setDisputes((d) => d.filter((x) => x._id !== id));
    } catch { /* silent */ }
    setResolving(null);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="ad-refresh-btn" onClick={load}>↻ Refresh</button>
      </div>

      {disputes.length > 0 && (
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13, color: "#fbbf24" }}>
            <strong>{disputes.length}</strong> active dispute{disputes.length !== 1 ? "s" : ""} require attention
          </span>
        </div>
      )}

      <div className="ad-card">
        <div className="ad-card-header">
          <span className="ad-card-title">Active Disputes</span>
          <span className="ad-card-count" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{disputes.length}</span>
        </div>
        {loading ? (
          <div className="ad-loading"><span className="ad-spinner"/><span>Loading…</span></div>
        ) : disputes.length === 0 ? (
          <div className="ad-empty">
            <div className="ad-empty-icon">✅</div>
            <div className="ad-empty-msg" style={{ color: "#10b981" }}>No active disputes — all clear!</div>
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table>
              <thead>
                <tr><th>Property</th><th>Landlord</th><th>Tenant</th><th>Dispute Reason</th><th>Agreement Status</th><th>Raised</th><th>Action</th></tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{d.property?.title}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{d.property?.location}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{d.landlord?.name}</div>
                      <div className="ad-wallet-mono">{d.landlord?.walletAddress?.slice(0,6)}…</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{d.tenant?.name}</div>
                      <div className="ad-wallet-mono">{d.tenant?.walletAddress?.slice(0,6)}…</div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 220, fontSize: 12, color: "#fbbf24", background: "rgba(245,158,11,0.08)", padding: "6px 10px", borderRadius: 6 }}>
                        {d.disputeReason || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={`ad-badge ad-badge-${d.status}`} style={{ background: `${statusColor[d.status]}18`, color: statusColor[d.status], borderColor: `${statusColor[d.status]}40` }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: "#6b7280" }}>{new Date(d.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        id={`dispute-resolve-${d._id}`}
                        className="ad-btn ad-btn-success"
                        onClick={() => handleResolve(d._id)}
                        disabled={resolving === d._id}
                      >
                        {resolving === d._id ? "…" : "✔ Resolve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ─── ANALYTICS TAB ───────────────────────────────
function AnalyticsTab({ stats }: { stats: any }) {
  if (!stats) return <div className="ad-loading"><span className="ad-spinner"/><span>Loading…</span></div>;

  const monthNames = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const maxMonth = Math.max(...(stats.monthlyData?.map((m: any) => m.count) || [1]), 1);

  return (
    <>
      <div className="ad-analytics-grid">
        <div className="ad-card">
          <div className="ad-card-header"><span className="ad-card-title">User Distribution</span></div>
          <div style={{ padding: "20px 22px" }}>
            {[
              { label: "Landlords", val: stats.users.landlords, total: stats.users.total, color: "#7c3aed" },
              { label: "Tenants",   val: stats.users.tenants,   total: stats.users.total, color: "#06b6d4" },
            ].map((r) => (
              <div key={r.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: r.color }}>{r.val} / {r.total}</span>
                </div>
                <div className="ad-bar-outer" style={{ height: 10, marginBottom: 16 }}>
                  <div className="ad-bar-inner" style={{ width: `${r.total ? (r.val/r.total)*100 : 0}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header"><span className="ad-card-title">Agreement Status Breakdown</span></div>
          <div style={{ padding: "20px 22px" }}>
            {[
              { label: "Active",     val: stats.agreements.active,  color: "#10b981" },
              { label: "Pending",    val: stats.agreements.pending, color: "#f59e0b" },
              { label: "Disputes",   val: stats.agreements.disputes,color: "#ef4444" },
            ].map((r) => (
              <div key={r.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: r.color }}>{r.val} / {stats.agreements.total}</span>
                </div>
                <div className="ad-bar-outer" style={{ height: 10, marginBottom: 16 }}>
                  <div className="ad-bar-inner" style={{ width: `${stats.agreements.total ? (r.val/stats.agreements.total)*100 : 0}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-card" style={{ gridColumn: "1 / -1" }}>
          <div className="ad-card-header"><span className="ad-card-title">Monthly Agreement Volume (last 6 months)</span></div>
          <div style={{ padding: "28px 24px" }}>
            {stats.monthlyData?.length > 0 ? (
              <>
                <div className="ad-chart" style={{ height: 160 }}>
                  {stats.monthlyData.map((m: any) => (
                    <div className="ad-chart-bar-wrap" key={`${m._id.year}-${m._id.month}`}>
                      <div
                        className="ad-chart-bar"
                        style={{
                          height: `${(m.count / maxMonth) * 140}px`,
                          background: "linear-gradient(180deg,#a78bfa,#7c3aed)",
                        }}
                        title={`${m.count} agreements`}
                      />
                      <span className="ad-chart-month">{monthNames[m._id.month]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
                  {stats.monthlyData.map((m: any) => (
                    <div key={`stat-${m._id.year}-${m._id.month}`} style={{ background: "rgba(124,58,237,0.06)", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{monthNames[m._id.month]} {m._id.year}</div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: "#a78bfa" }}>{m.count}</div>
                      <div style={{ fontSize: 10, color: "#4b5563" }}>agreements</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="ad-empty"><div className="ad-empty-icon">📊</div><div className="ad-empty-msg">No monthly data available yet</div></div>
            )}
          </div>
        </div>
      </div>

      <div className="ad-card">
        <div className="ad-card-header"><span className="ad-card-title">Revenue Summary</span></div>
        <div style={{ padding: "24px 22px", display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Estimated Total Revenue", value: `₹ ${stats.revenue?.toLocaleString() || 0}`, color: "#a78bfa" },
            { label: "Active Agreements",        value: stats.agreements.active,                      color: "#10b981" },
            { label: "Properties Occupied",      value: `${stats.properties.occupied} / ${stats.properties.total}`, color: "#06b6d4" },
          ].map((item) => (
            <div key={item.label} style={{ flex: 1, minWidth: 140, background: "rgba(124,58,237,0.05)", borderRadius: 10, padding: "16px 20px", border: "1px solid rgba(124,58,237,0.1)" }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!admin) { navigate("/admin/login"); return; }
    getPlatformStats().then((r) => setStats(r.data)).catch(() => {});
  }, [admin, navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const tabTitles: Record<Tab, { title: string; sub: string }> = {
    overview:   { title: "Platform Overview",    sub: "Real-time snapshot of the entire platform" },
    users:      { title: "User Management",      sub: "View, search and moderate all landlords & tenants" },
    properties: { title: "Property Oversight",   sub: "Monitor and remove flagged property listings" },
    agreements: { title: "Agreement Control",    sub: "Full view of all agreements across the platform" },
    disputes:   { title: "Dispute Monitor",      sub: "Review and resolve active agreement disputes" },
    analytics:  { title: "Platform Analytics",   sub: "Usage stats, revenue overview and growth charts" },
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ad-root">

        {/* ── Sidebar ── */}
        <aside className="ad-sidebar">
          <div className="ad-sidebar-logo">
            <div className="ad-logo-badge">
              <div className="ad-logo-icon">⬡</div>
              <div>
                <div className="ad-logo-text">RentChain</div>
                <div className="ad-logo-sub">ADMIN PANEL</div>
              </div>
            </div>
          </div>

          <nav className="ad-nav">
            {NAV.map((item) => (
              <div
                key={item.id}
                id={`sidebar-${item.id}`}
                className={`ad-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="ad-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          <div className="ad-sidebar-footer">
            <div className="ad-admin-info">
              <div className="ad-admin-avatar">
                {admin?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <div className="ad-admin-name">{admin?.name || "Admin"}</div>
                <div className="ad-admin-role">SUPER ADMIN</div>
              </div>
            </div>
            <button id="admin-logout-btn" className="ad-logout-btn" onClick={handleLogout}>
              ⏻  Logout
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="ad-main">
          <div className="ad-topbar">
            <div className="ad-breadcrumb">
              Admin / <span>{tabTitles[activeTab].title}</span>
            </div>
            <div className="ad-topbar-right">
              <div className="ad-live-dot">
                <div className="ad-live-pulse" />
                LIVE
              </div>
              <span style={{ fontSize: 12, color: "#4b5563", fontFamily: "'JetBrains Mono',monospace" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>
          </div>

          <div className="ad-content">
            <h1 className="ad-page-title">{tabTitles[activeTab].title}</h1>
            <p className="ad-page-sub">{tabTitles[activeTab].sub}</p>

            {activeTab === "overview"   && <OverviewTab    stats={stats} />}
            {activeTab === "users"      && <UsersTab />}
            {activeTab === "properties" && <PropertiesTab />}
            {activeTab === "agreements" && <AgreementsTab />}
            {activeTab === "disputes"   && <DisputesTab />}
            {activeTab === "analytics"  && <AnalyticsTab   stats={stats} />}
          </div>
        </main>
      </div>
    </>
  );
}
