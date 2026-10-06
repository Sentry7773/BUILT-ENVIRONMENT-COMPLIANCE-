import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building, 
  Users, 
  AlertTriangle, 
  FileCheck, 
  Scale, 
  Sliders, 
  CheckCircle2, 
  Award,
  Search,
  ExternalLink,
  Ban
} from 'lucide-react';
import { Architect, ArchitecturalFirm } from '../types';
import { AuditLedgerService } from '../services/cryptoLedger';

interface ZiaGovernanceProps {
  architects: Architect[];
  firms: ArchitecturalFirm[];
  onUpdateArchitect: (arch: Architect) => void;
  onUpdateFirm: (firm: ArchitecturalFirm) => void;
}

export const ZiaGovernance: React.FC<ZiaGovernanceProps> = ({
  architects,
  firms,
  onUpdateArchitect,
  onUpdateFirm
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'practitioners' | 'firms' | 'policies' | 'ethics'>('practitioners');
  const [searchQuery, setSearchQuery] = useState('');

  // Sanction Modal
  const [selectedArchForSanction, setSelectedArchForSanction] = useState<Architect | null>(null);
  const [sanctionReason, setSanctionReason] = useState('');

  const filteredArchitects = architects.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ziaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.firmName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplySanction = async () => {
    if (!selectedArchForSanction || !sanctionReason.trim()) return;

    const updated: Architect = {
      ...selectedArchForSanction,
      status: 'SUSPENDED',
      disciplinaryHistory: [
        {
          date: new Date().toISOString().substring(0, 10),
          description: sanctionReason.trim(),
          sanction: 'Immediate License Suspension & Statutory Disciplinary Hearing'
        },
        ...selectedArchForSanction.disciplinaryHistory
      ]
    };

    await AuditLedgerService.recordEvent(
      'DISCIPLINARY_ACTION',
      { id: 'ZIA-REGISTRAR', name: 'ZIA Registrar General', role: 'Statutory Regulator' },
      'DISC-' + selectedArchForSanction.ziaNumber,
      `License SUSPENSION enacted for ${selectedArchForSanction.name} (${selectedArchForSanction.ziaNumber}). Reason: ${sanctionReason.trim()}`
    );

    onUpdateArchitect(updated);
    setSelectedArchForSanction(null);
    setSanctionReason('');
  };

  const handleReactivateLicense = async (arch: Architect) => {
    const updated: Architect = {
      ...arch,
      status: 'ACTIVE'
    };

    await AuditLedgerService.recordEvent(
      'DISCIPLINARY_ACTION',
      { id: 'ZIA-REGISTRAR', name: 'ZIA Registrar General', role: 'Statutory Regulator' },
      'REINSTATE-' + arch.ziaNumber,
      `License REINSTATED for ${arch.name} (${arch.ziaNumber}) after ethics review.`
    );

    onUpdateArchitect(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: ZIA Statutory Oversight Header */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Zambia Institute of Architects (ZIA) Registrar</h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              Statutory Authority Cap 442
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Governing national architectural standards, practice licenses, continuous professional development (CPD), and firm health scores.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveSubTab('practitioners')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'practitioners' ? 'bg-neutral-800 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Professionals ({architects.length})
          </button>
          <button
            onClick={() => setActiveSubTab('firms')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'firms' ? 'bg-neutral-800 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Firms OS ({firms.length})
          </button>
          <button
            onClick={() => setActiveSubTab('policies')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'policies' ? 'bg-neutral-800 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Policy-as-Code
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PRACTITIONERS REGISTRY */}
      {activeSubTab === 'practitioners' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ZIA #, or firm..."
                className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="text-xs font-mono text-neutral-400">
              Mandatory Annual CPD Threshold: <span className="text-emerald-400 font-bold">30.0 Credits</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredArchitects.map(arch => (
              <div 
                key={arch.id}
                className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-300">
                    {arch.name.split(' ').pop()?.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{arch.name}</h4>
                      <span className="text-xs font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                        {arch.ziaNumber}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        arch.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                        arch.status === 'SUSPENDED' ? 'bg-red-950 text-red-300 border border-red-800/60' :
                        'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}>
                        {arch.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>{arch.title}</span>
                      <span>·</span>
                      <span>Firm: <strong className="text-neutral-200">{arch.firmName}</strong></span>
                      <span>·</span>
                      <span>NRC: <strong className="text-neutral-300 font-mono">{arch.nrcNumber}</strong></span>
                      <span>·</span>
                      <span>Reg: <strong className="text-neutral-300 font-mono">{arch.registrationDate}</strong></span>
                    </div>

                    {/* Verifiable Credentials Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {arch.credentials.map((cred, idx) => (
                        <span key={idx} className="text-[10px] bg-neutral-950 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[11px] text-neutral-400">CPD Accrual (2026)</div>
                    <div className={`text-sm font-bold font-mono ${
                      arch.cpdCredits >= arch.cpdRequired ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {arch.cpdCredits} / {arch.cpdRequired} pts
                    </div>
                  </div>

                  {arch.status === 'ACTIVE' ? (
                    <button
                      onClick={() => setSelectedArchForSanction(arch)}
                      className="px-3 py-1.5 bg-red-950 text-red-300 hover:bg-red-900 border border-red-800/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Sanction / Suspend</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivateLicense(arch)}
                      className="px-3 py-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reactivate License</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FIRM COMPLIANCE OPERATING SYSTEM */}
      {activeSubTab === 'firms' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-400">
            Firms must maintain an active PACRA company filing, valid ZRA Tax Clearance, NAPSA employer compliance, WCFCB certification, and Professional Indemnity Insurance with minimum statutory cover.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {firms.map(firm => (
              <div key={firm.id} className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{firm.name}</h3>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                        firm.verificationBadge === 'PLATINUM' ? 'bg-purple-950 text-purple-300 border border-purple-800/60' :
                        firm.verificationBadge === 'GOLD' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                        'bg-red-950 text-red-300 border border-red-800/60'
                      }`}>
                        {firm.verificationBadge} BADGE
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {firm.address} · {firm.city}, {firm.province} · {firm.contactEmail}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-neutral-400">Firm Health Score</div>
                    <div className={`text-2xl font-bold font-mono tabular-nums ${
                      firm.compliance.healthScore >= 90 ? 'text-emerald-400' :
                      firm.compliance.healthScore >= 70 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {firm.compliance.healthScore}%
                    </div>
                  </div>
                </div>

                {/* Statutory Integrations Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-3 border-t border-neutral-800">
                  <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[11px]">PACRA Registry</span>
                    <strong className="text-emerald-400 font-mono block mt-0.5">{firm.compliance.pacraNumber}</strong>
                    <span className="text-[10px] text-neutral-400">Active Good Standing</span>
                  </div>

                  <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[11px]">ZRA Tax Clearance</span>
                    <strong className={`font-mono block mt-0.5 ${firm.compliance.zraTaxClear ? 'text-emerald-400' : 'text-red-400'}`}>
                      {firm.compliance.zraTaxClear ? 'CLEARED' : 'TAX ARREARS'}
                    </strong>
                    <span className="text-[10px] text-neutral-400 truncate block">Exp: {firm.compliance.zraExpiry}</span>
                  </div>

                  <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[11px]">NAPSA Employer</span>
                    <strong className={`font-mono block mt-0.5 ${firm.compliance.napsaCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
                      {firm.compliance.napsaCompliant ? 'COMPLIANT' : 'DEFICIT ALERT'}
                    </strong>
                    <span className="text-[10px] text-neutral-400 truncate block">{firm.compliance.napsaNumber}</span>
                  </div>

                  <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[11px]">Workers Comp (WCFCB)</span>
                    <strong className={`font-mono block mt-0.5 ${firm.compliance.workersCompCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
                      {firm.compliance.workersCompCompliant ? 'CERTIFIED' : 'EXPIRED'}
                    </strong>
                    <span className="text-[10px] text-neutral-400 truncate block">{firm.compliance.workersCompNumber}</span>
                  </div>

                  <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block text-[11px]">PII Insurance</span>
                    <strong className={`font-mono block mt-0.5 ${firm.compliance.piiActive ? 'text-emerald-400' : 'text-red-400'}`}>
                      ZMW {(firm.compliance.piiCoverageZMW/1000000).toFixed(0)}M
                    </strong>
                    <span className="text-[10px] text-neutral-400 truncate block">Exp: {firm.compliance.piiExpiry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: POLICY-AS-CODE RULES REPOSITORY */}
      {activeSubTab === 'policies' && (
        <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Active Statutory Policy-as-Code Ruleset (v2.1)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                New regulations, bylaws, or statutory instruments take effect instantaneously across all submissions without platform rebuilds.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded">
              ZAPE-ENGINE-POL-2026.2
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">architect_registration_active</span>
                <span className="text-neutral-400 block text-[11px] mt-0.5">Condition: architect.status == 'ACTIVE'</span>
              </div>
              <span className="bg-red-950 text-red-300 border border-red-800/60 px-2 py-0.5 rounded text-[10px]">HARD_BLOCK</span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">cpd_minimum_accrual</span>
                <span className="text-neutral-400 block text-[11px] mt-0.5">Condition: architect.cpdCredits &gt;= 30.0</span>
              </div>
              <span className="bg-amber-950 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded text-[10px]">REMEDIATE</span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">firm_zra_tax_clearance</span>
                <span className="text-neutral-400 block text-[11px] mt-0.5">Condition: firm.compliance.zraTaxClear == true (via ZRA Live API)</span>
              </div>
              <span className="bg-red-950 text-red-300 border border-red-800/60 px-2 py-0.5 rounded text-[10px]">HARD_BLOCK</span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">school_fire_and_accessibility</span>
                <span className="text-neutral-400 block text-[11px] mt-0.5">Condition: project.buildingType == 'SCHOOL' =&gt; fireSafety &amp;&amp; accessibilityPlan</span>
              </div>
              <span className="bg-amber-950 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded text-[10px]">REMEDIATE</span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">green_building_fee_discount</span>
                <span className="text-neutral-400 block text-[11px] mt-0.5">Condition: project.greenScore &gt;= 35.0 =&gt; apply 5% - 25% discount incentive</span>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">INCENTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* DISCIPLINARY SANCTION MODAL */}
      {selectedArchForSanction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Issue Statutory Disciplinary Sanction</h3>
            </div>

            <p className="text-xs text-neutral-300">
              You are preparing to SUSPEND the professional architectural license of:
              <strong className="block text-white mt-1">{selectedArchForSanction.name} ({selectedArchForSanction.ziaNumber})</strong>
            </p>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Official Sanction Reason & Charge</label>
              <textarea
                value={sanctionReason}
                onChange={(e) => setSanctionReason(e.target.value)}
                placeholder="e.g. Failure to maintain supervisory oversight; unauthorized plan signature..."
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedArchForSanction(null)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!sanctionReason.trim()}
                onClick={handleApplySanction}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg"
              >
                Enact License Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
