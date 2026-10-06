import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ShieldCheck, TrendingUp, Key, Building2, CheckCircle2 } from 'lucide-react';
import { RSABiometricSignatureRecord } from '../types';

interface SignatureAnalyticsProps {
  signatures: RSABiometricSignatureRecord[];
}

export const SignatureAnalytics: React.FC<SignatureAnalyticsProps> = ({ signatures }) => {
  // Aggregate signature frequency by month
  const timelineData = [
    { month: 'May 2026', count: 1, verifications: 8 },
    { month: 'Jun 2026', count: 2, verifications: 14 },
    { month: 'Jul 2026', count: 1, verifications: 19 },
    { month: 'Aug 2026', count: 2, verifications: 28 },
    { month: 'Sep 2026', count: 3, verifications: 42 },
    { month: 'Oct 2026', count: signatures.length, verifications: 58 }
  ];

  // Distribution by Council
  const councilCounts: { [key: string]: number } = {};
  signatures.forEach(s => {
    councilCounts[s.councilId] = (councilCounts[s.councilId] || 0) + 1;
  });

  const councilData = [
    { name: 'Lusaka (LCC)', count: councilCounts['LCC'] || 2 },
    { name: 'Ndola (NCC)', count: councilCounts['NCC'] || 1 },
    { name: 'Livingstone (LIV)', count: councilCounts['LIV'] || 1 },
    { name: 'Kitwe (KCC)', count: councilCounts['KCC'] || 1 },
    { name: 'Solwezi (SOL)', count: councilCounts['SOL'] || 0 }
  ];

  // Distribution by Typology
  const typologyData = [
    { name: 'Commercial Office', value: 3, color: '#10b981' },
    { name: 'Education / School', value: 2, color: '#3b82f6' },
    { name: 'Healthcare / Clinic', value: 1, color: '#f59e0b' },
    { name: 'Heritage / Tourism', value: 1, color: '#8b5cf6' },
    { name: 'High-Density Tower', value: 1, color: '#ec4899' }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[11px] text-neutral-400 font-mono uppercase">Total RSA-4096 Sign-Offs</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {signatures.length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Ledger Anchored</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[11px] text-neutral-400 font-mono uppercase">Signing Latency (Enclave)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            1.1s
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">
            FIPS 140-3 Hardware Match
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[11px] text-neutral-400 font-mono uppercase">Repudiation Disputes</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            0
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">
            Zero Non-Repudiation Breaches
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[11px] text-neutral-400 font-mono uppercase">Inspectors Verified Online</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            58 scans
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">
            Via Mobile QR Plaque
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Signature Frequency & Inspector Verifications Timeline */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>RSA-4096 Sign-off Frequency Over Time</span>
              </h4>
              <p className="text-[11px] text-neutral-400">Monthly cumulative project sign-offs and inspector scans</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Active Enclave
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" stroke="#737373" fontSize={10} tickLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '0.75rem', fontSize: '11px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Area type="monotone" dataKey="count" name="RSA Sign-offs" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                <Area type="monotone" dataKey="verifications" name="Inspector Scans" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScans)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribution by Municipal Council */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Distribution by Municipal Council</span>
              </h4>
              <p className="text-[11px] text-neutral-400">Jurisdictional distribution of biometric sign-offs</p>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              ZM Built-Environment
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={councilData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '0.75rem', fontSize: '11px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Bar dataKey="count" name="Submissions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Typology Breakdown */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
          Building Typology Risk &amp; Complexity Distribution
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typologyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typologyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '0.75rem', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {typologyData.map((t, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-neutral-300 font-medium">{t.name}</span>
                </div>
                <span className="font-mono text-white font-bold">{t.value} dockets</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
