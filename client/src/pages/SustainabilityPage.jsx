import React, { useState, useEffect } from 'react';
import { Leaf, Recycle, Trees, TrendingUp, Info, ArrowUpRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const SustainabilityPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-charcoal-muted">Computing campus sustainability metrics...</p>
      </div>
    );
  }

  const { stats, environmentalImpact, categoryDistribution, monthlyTrends } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
          <Leaf className="w-3.5 h-3.5" />
          Campus Circular Economy & Impact Report
        </div>
        <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">
          Campus Sustainability & Reuse Analytics
        </h1>
        <p className="text-sm text-charcoal-muted mt-2 leading-relaxed">
          Tracking the cumulative environmental and economic benefit achieved through peer-to-peer exchanges and textbook circulations across our university.
        </p>
      </div>

      {/* Big Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-white border border-charcoal-border rounded-card space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">CO2 Emissions Avoided</span>
            <Leaf className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-charcoal">
            {environmentalImpact?.kgCo2Saved || 0} <span className="text-sm font-medium text-charcoal-muted">kg CO2e</span>
          </div>
          <p className="text-xs text-charcoal-muted">
            Equivalent to planting ~{environmentalImpact?.treesEquivalent || 0} urban trees for a year
          </p>
        </div>

        <div className="p-6 bg-white border border-charcoal-border rounded-card space-y-2">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-xs font-bold uppercase tracking-wider">Landfill Waste Diverted</span>
            <Recycle className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-charcoal">
            {environmentalImpact?.kgWasteDiverted || 0} <span className="text-sm font-medium text-charcoal-muted">kg</span>
          </div>
          <p className="text-xs text-charcoal-muted">
            Solid student waste and electronics diverted from municipal disposal
          </p>
        </div>

        <div className="p-6 bg-white border border-charcoal-border rounded-card space-y-2">
          <div className="flex items-center justify-between text-primary">
            <span className="text-xs font-bold uppercase tracking-wider">Student Savings</span>
            <span className="text-base font-bold">₹</span>
          </div>
          <div className="text-3xl font-extrabold text-charcoal">
            ₹{environmentalImpact?.estimatedStudentSavingsInr ? environmentalImpact.estimatedStudentSavingsInr.toLocaleString() : '0'}
          </div>
          <p className="text-xs text-charcoal-muted">
            Direct economic savings by purchasing pre-loved items over retail
          </p>
        </div>

        <div className="p-6 bg-white border border-charcoal-border rounded-card space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Items Circulated</span>
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-charcoal">
            {stats?.completedExchanges || 0}
          </div>
          <p className="text-xs text-charcoal-muted">
            Including {stats?.itemsDonated || 0} 100% free peer donations
          </p>
        </div>
      </div>

      {/* Category Breakdown & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown */}
        <div className="p-6 bg-white border border-charcoal-border rounded-card space-y-4">
          <h3 className="text-base font-bold text-charcoal">Campus Category Distribution</h3>
          <p className="text-xs text-charcoal-muted">
            Breakdown of items circulating in the university reuse ecosystem
          </p>

          <div className="space-y-3 pt-2">
            {categoryDistribution?.map((cat) => {
              const total = stats?.totalListings || 1;
              const percent = Math.round((cat.count / total) * 100);
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal">{cat.category}</span>
                    <span className="text-charcoal-muted">
                      {cat.count} items ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Exchange Trends */}
        <div className="p-6 bg-white border border-charcoal-border rounded-card space-y-4">
          <h3 className="text-base font-bold text-charcoal">Exchange Momentum</h3>
          <p className="text-xs text-charcoal-muted">
            Recent verified physical handovers recorded across campus
          </p>

          {monthlyTrends && monthlyTrends.length > 0 ? (
            <div className="space-y-3 pt-2">
              {monthlyTrends.map((trend) => (
                <div
                  key={trend.month}
                  className="p-3 bg-[#F8F9F6] border border-charcoal-border rounded-card flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-charcoal">{trend.month}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary block">
                      {trend.completedExchanges} Handover{trend.completedExchanges === 1 ? '' : 's'}
                    </span>
                    <span className="text-[11px] text-charcoal-muted">
                      {trend.totalReservations} total bookings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-charcoal-muted">
              Monthly trend data will populate as student handovers are completed.
            </div>
          )}
        </div>

      </div>

      {/* Transparent Lifecycle Assumptions & Documentation */}
      <div className="p-6 bg-white border border-charcoal-border rounded-card space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>Transparent Carbon Lifecycle Model & Assumptions</span>
        </div>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          Environmental metrics are calculated using validated lifecycle analysis (LCA) standards for collegiate equipment reuse and municipal solid waste reduction:
        </p>
        <ul className="list-disc pl-5 text-xs text-charcoal-muted space-y-1.5 pt-1">
          {environmentalImpact?.assumptions?.map((asm, idx) => (
            <li key={idx} className="leading-relaxed">
              {asm}
            </li>
          ))}
          <li className="leading-relaxed">
            Trees equivalent conversion: 1 mature tree sequestering approximately 21.7 kg of atmospheric CO2 annually (US EPA Greenhouse Gas Equivalencies model).
          </li>
        </ul>
      </div>

    </div>
  );
};

export default SustainabilityPage;

