import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Check,
  X,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate, timeAgo } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User search/filter
  const [userSearch, setUserSearch] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      if (res.data.success) {
        setOverview(res.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?search=${encodeURIComponent(userSearch)}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const handleToggleVerifyUser = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isVerified: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user verification');
    }
  };

  const handleResolveReport = async (reportId, status, removeListing = false) => {
    try {
      await api.put(`/admin/reports/${reportId}`, {
        status,
        resolutionNotes: `Processed by administrator on ${new Date().toLocaleDateString()}`,
        removeListing,
      });
      alert(`Report marked as ${status}`);
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to update report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-charcoal">Campus Administration Portal</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-charcoal-muted mt-1">
            Moderation, verification, and oversight of student listings and exchanges
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-2 bg-charcoal-light p-1 rounded-card text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-card font-medium transition-all ${
              activeTab === 'overview' ? 'bg-white text-charcoal shadow-subtle' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-card font-medium transition-all ${
              activeTab === 'users' ? 'bg-white text-charcoal shadow-subtle' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-card font-medium transition-all ${
              activeTab === 'reports' ? 'bg-white text-charcoal shadow-subtle' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Moderation Reports
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-charcoal-border rounded-card">
              <div className="flex items-center justify-between text-charcoal-muted mb-2">
                <span className="text-xs font-semibold uppercase">Total Users</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-charcoal">{overview?.totalUsers || 0}</p>
              <p className="text-[11px] text-charcoal-muted mt-1">
                {overview?.verifiedUsers || 0} verified university accounts
              </p>
            </div>

            <div className="p-5 bg-white border border-charcoal-border rounded-card">
              <div className="flex items-center justify-between text-charcoal-muted mb-2">
                <span className="text-xs font-semibold uppercase">Total Listings</span>
                <Package className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-charcoal">{overview?.totalListings || 0}</p>
              <p className="text-[11px] text-charcoal-muted mt-1">
                {overview?.activeListings || 0} currently active on campus
              </p>
            </div>

            <div className="p-5 bg-white border border-charcoal-border rounded-card">
              <div className="flex items-center justify-between text-charcoal-muted mb-2">
                <span className="text-xs font-semibold uppercase">Completed Exchanges</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-charcoal">{overview?.completedExchanges || 0}</p>
              <p className="text-[11px] text-charcoal-muted mt-1">
                {overview?.donatedListings || 0} free student donations completed
              </p>
            </div>

            <div className="p-5 bg-white border border-charcoal-border rounded-card">
              <div className="flex items-center justify-between text-charcoal-muted mb-2">
                <span className="text-xs font-semibold uppercase">Pending Reports</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-bold text-charcoal">{overview?.pendingReports || 0}</p>
              <p className="text-[11px] text-charcoal-muted mt-1">
                Flags requiring administrative review
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-charcoal">Registered Campus Members</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, or hostel..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="px-3 py-1.5 text-xs rounded-card border border-charcoal-border bg-white w-full sm:w-64"
              />
              <button onClick={fetchUsers} className="btn-secondary text-xs py-1.5 px-3">
                Search
              </button>
            </div>
          </div>

          <div className="bg-white border border-charcoal-border rounded-card overflow-hidden">
            <table className="min-w-full divide-y divide-charcoal-border text-xs">
              <thead className="bg-[#F8F9F6]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-charcoal">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-charcoal">College Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-charcoal">Residence</th>
                  <th className="px-4 py-3 text-left font-semibold text-charcoal">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-charcoal">Verification</th>
                  <th className="px-4 py-3 text-right font-semibold text-charcoal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-charcoal-light/50">
                    <td className="px-4 py-3 font-semibold text-charcoal flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-[10px]">
                        {u.name?.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted">{u.email}</td>
                    <td className="px-4 py-3 text-charcoal-muted">{u.campusHostelOrBlock || 'Campus'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.role === 'admin' ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-charcoal'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isVerified ? (
                        <span className="badge-verified text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-primary" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleVerifyUser(u._id, u.isVerified)}
                        className="text-[11px] font-medium text-primary hover:underline"
                      >
                        {u.isVerified ? 'Revoke Status' : 'Verify Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-charcoal">Moderation Reports & Item Flags</h2>

          {reports.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No reports filed"
              description="Campus community is running smoothly with no active moderation flags."
            />
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => (
                <div key={rep._id} className="p-5 bg-white border border-charcoal-border rounded-card space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-border">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {rep.reason}
                      </span>
                      <StatusBadge status={rep.status} />
                    </div>
                    <span className="text-[11px] text-charcoal-muted">
                      Reported {timeAgo(rep.createdAt)} by {rep.reporter?.name}
                    </span>
                  </div>

                  <div>
                    {rep.reportedListing && (
                      <div className="p-3 bg-charcoal-light rounded-card text-xs mb-2">
                        <span className="text-charcoal-muted block">Reported Listing:</span>
                        <Link
                          to={`/listings/${rep.reportedListing._id}`}
                          className="font-bold text-charcoal hover:text-primary flex items-center gap-1 mt-0.5"
                          target="_blank"
                        >
                          {rep.reportedListing.title} <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                    {rep.details && (
                      <p className="text-xs text-charcoal leading-relaxed">
                        <strong>Details:</strong> "{rep.details}"
                      </p>
                    )}
                  </div>

                  {rep.status === 'Pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-charcoal-border">
                      <button
                        onClick={() => handleResolveReport(rep._id, 'Dismissed')}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Dismiss Flag
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep._id, 'Resolved', true)}
                        className="btn-primary text-xs py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Listing & Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;

