import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../api/axios";
import "./AdminAnalytics.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie, 
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [daysInput, setDaysInput] = useState("");
  const [days, setDays] = useState(7); 
  const [avgResolution, setAvgResolution] = useState(null);
  const [alertDays, setAlertDays] = useState(5);
  const [pendingAlerts, setPendingAlerts] = useState(null);





  // SUMMARY STATS
  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/api/analytics/summary");
      setStats(res.data);
    };
    fetchStats();
  }, []);

  // CATEGORY DATA
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await api.get("/api/analytics/categories");
      setCategories(res.data);
    };
    fetchCategories();
  }, []);

  // TRENDS DATA
 useEffect(() => {
  const fetchTrends = async () => {
    try {
      const res = await api.get("/api/analytics/trends", {
        params: { days },
      });
      setTrends(res.data);
    } catch (err) {
      console.error("Failed to load trends");
    }
  };

  fetchTrends();
}, [days]);

useEffect(() => {
  const fetchAvgResolution = async () => {
    const res = await api.get(
      "/api/analytics/average-resolution-time"
    );
    setAvgResolution(res.data.averageTimeInDays);
  };

  fetchAvgResolution();
}, []);

useEffect(() => {
  const fetchPendingAlerts = async () => {
    try {
      const res = await api.get("/api/analytics/pending-alerts", {
        params: { days: alertDays },
      });
      setPendingAlerts(res.data);
    } catch (err) {
      console.error("Failed to load pending alerts");
    }
  };

  fetchPendingAlerts();
}, [alertDays]);


  if (!stats) {
    return (
      <>
        <Navbar />
        <p style={{ padding: "2rem" }}>Loading analytics...</p>
      </>
    );
  }

 
  return (
    <>
      <Navbar />

      <div className="analytics-container">
        {/* PAGE HEADER */}
        <div className="page-header">
          <h1>Analytics Overview</h1>
          <p>Monitor complaint statistics, categories, and trends over time.</p>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <StatCard title="Total Complaints" value={stats.total} type="total" />
          <StatCard title="Pending" value={stats.pending} type="pending" />
          <StatCard title="In Progress" value={stats.inProgress} type="progress" />
          <StatCard title="Resolved" value={stats.resolved} type="resolved" />
        </div>

<div className="avg-resolution-card">
  <h4>Avg Resolution Time</h4>

  {avgResolution ? (
    <div className="avg-value">
      ⏱ {avgResolution} hours
    </div>
  ) : (
    <div className="avg-empty">
    No resolved complaints yet
    </div>
  )}
</div>

 <h2 className="analytics-subtitle">Pending Alerts</h2>

<div className="alert-filter">
  <span>Show pending more than</span>
  <input
    type="number"
    min={1}
    max={30}
    value={alertDays}
    onChange={(e) => setAlertDays(Number(e.target.value))}
  />
  <span>days</span>
</div>

{pendingAlerts && pendingAlerts.count === 0 ? (
  <div className="empty-trend">
    ✅ No long pending complaints
  </div>
) : (
  <div className="alert-list">
    {pendingAlerts?.complaints.map((c) => (
      <div className="alert-card" key={c.id}>
        <strong>{c.title}</strong>
        <p>
          {c.category} • ⏱ {c.daysPending} days pending
        </p>
      </div>
    ))}
  </div>
)}


        {/* CATEGORY */}
        <SectionTitle title="Complaints by Category" />

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categories}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {categories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TRENDS */}
        <SectionTitle title="Daily Complaints Count" />

        <div className="trend-filter">
          <label>Show last</label>
          <input
            type="number"
            placeholder="e.g. 7"
            min={1}
            max={30}
            value={daysInput}
            onChange={(e) => setDaysInput(e.target.value)}
          />
          <span>days</span>
          <button
            onClick={() => {
              if (!daysInput || daysInput < 1 || daysInput > 30) {
                alert("Enter days between 1 and 30");
                return;
              }
              setDays(Number(daysInput));
            }}
          >
            Apply
          </button>
        </div>

        {trends.length === 0 ? (
          <div className="empty-trend">
            No complaints found
            <p>System activity is stable during this period.</p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={340}>
  <LineChart
    data={trends}
    margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
  >
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

    {/* X AXIS */}
    <XAxis
      dataKey="_id"
      tickFormatter={(date) =>
        new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      }
      label={{
        value: "Dates",
        position: "insideBottom",
        offset: -20,
      }}
    />

    {/* Y AXIS — FIXED */}
    <YAxis
      allowDecimals={false}
      label={{
        value: "Number of Complaints",
        angle: -90,
        position: "outsideLeft",
        offset: 10,
      }}
    />

    <Tooltip />
    <Line
      type="monotone"
      dataKey="count"
      stroke="#2563eb"
      strokeWidth={3}
      dot={{ r: 4 }}
    />
  </LineChart>
</ResponsiveContainer>

          </div>
        )}
      </div>
    </>
  );
}

function SectionTitle({ title }) {
  return <h2 className="section-title">{title}</h2>;
}

function StatCard({ title, value, type }) {
  return (
    <div className={`stat-card ${type}`}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

export default AdminAnalytics;

