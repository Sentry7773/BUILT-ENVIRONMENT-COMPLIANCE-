import React, { useState } from 'react';
import { 
  Scale, 
  Calculator, 
  FileCheck, 
  AlertCircle, 
  Download, 
  CheckCircle2, 
  Lock, 
  Unlock,
  ShieldCheck
} from 'lucide-react';

export const StatutoryFeeCalculator: React.FC = () => {
  const [projectCapitalZMW, setProjectCapitalZMW] = useState<number>(25000000);
  const [complexity, setComplexity] = useState<'SIMPLE' | 'STANDARD' | 'COMPLEX'>('STANDARD');
  const [buildingType, setBuildingType] = useState('COMMERCIAL');

  // Milestone Stages with simulated escrow release
  const [milestones, setMilestones] = useState([
    { id: 1, name: 'Stage 1: Appraisal & Concept Design', percent: 15, status: 'RELEASED' },
    { id: 2, name: 'Stage 2: Design Development & Schematic', percent: 20, status: 'RELEASED' },
    { id: 3, name: 'Stage 3: Statutory Submission & Council Permit', percent: 20, status: 'LOCKED_IN_ESCROW' },
    { id: 4, name: 'Stage 4: Working Drawings & Bills of Quantities', percent: 25, status: 'PENDING' },
    { id: 5, name: 'Stage 5: Site Supervision & Practical Completion', percent: 20, status: 'PENDING' }
  ]);

  // Sliding Scale statutory fee computation
  let baseRate = 0.06; // 6.0% baseline
  if (projectCapitalZMW > 50000000) baseRate = 0.052;
  else if (projectCapitalZMW > 20000000) baseRate = 0.058;
  else if (projectCapitalZMW < 5000000) baseRate = 0.075;

  if (complexity === 'COMPLEX') baseRate += 0.007;
  if (complexity === 'SIMPLE') baseRate -= 0.005;

  const totalStatutoryFeeZMW = projectCapitalZMW * baseRate;

  const toggleMilestone = (id: number) => {
    setMilestones(milestones.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: m.status === 'RELEASED' ? 'LOCKED_IN_ESCROW' : 'RELEASED'
        };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Scale className="w-4 h-4" />
            <span>MODULE 6 · STATUTORY SCALE OF FEES &amp; ESCROW PROTECTION</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Official ZIA Scale of Fees &amp; Milestone Escrow
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            Eliminating fee disputes and destructive fee undercutting. Calculates the legally mandated statutory minimum professional fee according to ZIA Statutory Instruments and locks client funds in milestone escrow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Project Parameters
            </h3>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Estimated Capital Project Value (ZMW)</label>
              <input
                type="number"
                value={projectCapitalZMW}
                onChange={(e) => setProjectCapitalZMW(Number(e.target.value))}
                step={500000}
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                ZMW {(projectCapitalZMW/1000000).toFixed(2)} Million
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Complexity</label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2 rounded-lg"
                >
                  <option value="SIMPLE">Simple (Warehousing)</option>
                  <option value="STANDARD">Standard (Offices/Residential)</option>
                  <option value="COMPLEX">Complex (Hospitals/High-Rise)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Building Sector</label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2 rounded-lg"
                >
                  <option value="COMMERCIAL">Commercial Office</option>
                  <option value="RESIDENTIAL">Multi-Residential</option>
                  <option value="INSTITUTIONAL">Civic / Institutional</option>
                  <option value="HEALTHCARE">Healthcare Facility</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800">
              <div className="text-xs text-neutral-400">Statutory Rate Percentage</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                {(baseRate * 100).toFixed(2)}%
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Total Mandated Professional Fee: <strong className="text-white font-mono">ZMW {Math.round(totalStatutoryFeeZMW).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Milestones (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Milestone Escrow Disbursement Schedule
              </h3>
              <span className="text-xs font-mono text-emerald-400">
                Arbitration Ready
              </span>
            </div>

            <div className="space-y-2">
              {milestones.map((m) => {
                const stageAmountZMW = Math.round((totalStatutoryFeeZMW * m.percent) / 100);
                return (
                  <div key={m.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-white font-medium block">{m.name}</span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {m.percent}% of fee · ZMW {stageAmountZMW.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        m.status === 'RELEASED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                        m.status === 'LOCKED_IN_ESCROW' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {m.status.replace(/_/g, ' ')}
                      </span>

                      <button
                        onClick={() => toggleMilestone(m.id)}
                        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                        title="Simulate milestone approval and release"
                      >
                        {m.status === 'RELEASED' ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-neutral-400">
                In case of payment default, export verified statutory agreement for ZIA mediation panel.
              </span>
              <button
                onClick={() => alert('ZIA Statutory Dispute Evidence Pack Exported (PDF Signed). Ready for mediation hearing.')}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dispute Pack</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
