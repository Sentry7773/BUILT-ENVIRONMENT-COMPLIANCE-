import React, { useState } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Users, 
  Lock, 
  Plus, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { DeveloperEntity, ArchitecturalFirm } from '../types';
import { MOCK_DEVELOPERS } from '../data/mockDatabase';
import { AuditLedgerService } from '../services/cryptoLedger';

interface DeveloperGovernanceProps {
  firms: ArchitecturalFirm[];
}

export const DeveloperGovernance: React.FC<DeveloperGovernanceProps> = ({ firms }) => {
  const [developers, setDevelopers] = useState<DeveloperEntity[]>(MOCK_DEVELOPERS);
  const [selectedDeveloper, setSelectedDeveloper] = useState<DeveloperEntity | null>(developers[0] || null);

  // New Developer Registration modal state
  const [isRegistering, setIsRegistering] = useState(false);
  const [devName, setDevName] = useState('');
  const [devPacra, setDevPacra] = useState('');
  const [pathway, setPathway] = useState<DeveloperEntity['authorizedPathway']>('JOINT_VENTURE');
  const [linkedFirmId, setLinkedFirmId] = useState('FIRM-001');
  const [directorName, setDirectorName] = useState('');
  const [hasIndependenceDec, setHasIndependenceDec] = useState(true);
  const [sharesInFirm, setSharesInFirm] = useState(false);

  const handleRegisterDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName.trim() || !devPacra.trim()) return;

    const firm = firms.find(f => f.id === linkedFirmId) || firms[0];
    const conflictScore = sharesInFirm ? 0.78 : 0.28;
    const certId = `DAC-ZIA-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newDev: DeveloperEntity = {
      id: `DEV-00${developers.length + 1}`,
      companyName: devName.trim(),
      pacraNumber: devPacra.trim(),
      directors: [directorName || 'Executive Managing Director'],
      zraTaxClear: true,
      authorizedPathway: pathway,
      registeredArchitecturalFirmLink: `${firm.name} (${firm.id})`,
      professionalIndependenceDeclaration: hasIndependenceDec,
      conflictOfInterestScore: conflictScore,
      authorizationCertificateId: certId,
      activeProjectsCount: 1,
      advertisingComplianceStatus: 'COMPLIANT'
    };

    await AuditLedgerService.recordEvent(
      'DEVELOPER_AUTHORIZED',
      { id: newDev.pacraNumber, name: newDev.companyName, role: 'Real Estate Development Entity' },
      newDev.id,
      `Developer Authorization Certificate ${certId} issued. Linked practice: ${firm.name}. Conflict Score: ${(conflictScore*100).toFixed(0)}%.`
    );

    setDevelopers([newDev, ...developers]);
    setSelectedDeveloper(newDev);
    setIsRegistering(false);
    setDevName('');
    setDevPacra('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>MODULE 19 · NON-ARCHITECT FIRMS &amp; DEVELOPER CORPORATE PRACTICE CONTROL</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Real Estate Developer Governance &amp; Corporate Practice Firewall
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            Real estate developers cannot unlawfully perform reserved architectural services, pressure employed architects to compromise safety, or directly seal municipal submissions without registered architectural firm linkage.
          </p>

          <div className="mt-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              <strong>CORPORATE PRACTICE FIREWALL:</strong> Architectural liability cannot be subordinated to commercial profit · Unlawful design advertising strictly prohibited · Conflict-of-interest radar enforced.
            </span>
          </div>
        </div>
      </div>

      {/* 4 Lawful Pathways Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="font-mono text-emerald-400 text-[10px] font-bold block">PATHWAY 1</span>
          <strong className="text-white block">Independent Contract</strong>
          <p className="text-neutral-400 text-[11px]">Developer engages an independent registered architectural firm as lead designer.</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="font-mono text-emerald-400 text-[10px] font-bold block">PATHWAY 2</span>
          <strong className="text-white block">Architectural Subsidiary</strong>
          <p className="text-neutral-400 text-[11px]">Separate PACRA entity controlled by registered architects with distinct PII insurance.</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="font-mono text-emerald-400 text-[10px] font-bold block">PATHWAY 3</span>
          <strong className="text-white block">Project Joint Venture</strong>
          <p className="text-neutral-400 text-[11px]">Formal JV with registered practice holding design responsibility of record.</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="font-mono text-emerald-400 text-[10px] font-bold block">PATHWAY 4</span>
          <strong className="text-white block">Standardized Template</strong>
          <p className="text-neutral-400 text-[11px]">Multi-unit developer license with mandatory registered architect site adaptation.</p>
        </div>
      </div>

      {/* Main Developer Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Developers Docket (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Monitored Developer Entities ({developers.length})
            </h3>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Developer</span>
            </button>
          </div>

          <div className="space-y-3">
            {developers.map(dev => (
              <div
                key={dev.id}
                onClick={() => setSelectedDeveloper(dev)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedDeveloper?.id === dev.id
                    ? 'bg-neutral-800/90 border-orange-500 shadow-md'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white">{dev.companyName}</h4>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    dev.conflictOfInterestScore <= 0.7 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                      : 'bg-red-950 text-red-300 border border-red-800/60'
                  }`}>
                    Conflict: {(dev.conflictOfInterestScore * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="text-xs text-neutral-400 font-mono">
                  {dev.pacraNumber} · Pathway: <span className="text-neutral-200">{dev.authorizedPathway.replace(/_/g, ' ')}</span>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>Linked: <strong className="text-neutral-300">{dev.registeredArchitecturalFirmLink}</strong></span>
                  <span className={`font-mono text-[10px] ${dev.advertisingComplianceStatus === 'COMPLIANT' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {dev.advertisingComplianceStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Developer Detail & Conflict-of-Interest Radar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDeveloper ? (
            <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-orange-400 uppercase">
                    Developer Authorization Certificate: {selectedDeveloper.authorizationCertificateId}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedDeveloper.companyName}</h3>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    PACRA: <strong className="font-mono text-neutral-200">{selectedDeveloper.pacraNumber}</strong> · Directors: {selectedDeveloper.directors.join(', ')}
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                  selectedDeveloper.conflictOfInterestScore <= 0.7 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80' 
                    : 'bg-red-950 text-red-300 border border-red-800/80'
                }`}>
                  {selectedDeveloper.conflictOfInterestScore <= 0.7 ? 'AUTHORIZED STATUS' : 'FIREWALL VIOLATION'}
                </span>
              </div>

              {/* Conflict of Interest Radar Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-mono uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    Conflict-of-Interest Risk Radar
                  </span>
                  <span className="font-mono text-xs font-bold text-orange-400">
                    Risk Index: {(selectedDeveloper.conflictOfInterestScore * 100).toFixed(0)}% / 100%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      selectedDeveloper.conflictOfInterestScore > 0.7 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedDeveloper.conflictOfInterestScore * 100}%` }}
                  />
                </div>

                <div className="text-[11px] text-neutral-300 leading-relaxed">
                  {selectedDeveloper.conflictOfInterestScore > 0.7 ? (
                    <span className="text-red-400 font-semibold">
                      CRITICAL RISK: Developer attempts architectural submission without independent architectural practice of record. Potential coercion of professional judgment detected. Independent peer review mandated.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">
                      COMPLIANT RISK PROFILE: Architect maintains independent design authority under registered practice. Professional indemnity isolated from commercial development risk.
                    </span>
                  )}
                </div>
              </div>

              {/* Statutory Firewall Declarations */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">Registered Architectural Practice Linked:</span>
                  <span className="font-mono font-semibold text-emerald-400">{selectedDeveloper.registeredArchitecturalFirmLink}</span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">Professional Independence Declaration:</span>
                  <span className={`font-mono font-semibold ${selectedDeveloper.professionalIndependenceDeclaration ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedDeveloper.professionalIndependenceDeclaration ? 'SIGNED & BINDING' : 'MISSING / REFUSED'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-300">Advertising &amp; Touting Compliance:</span>
                  <span className={`font-mono font-semibold ${selectedDeveloper.advertisingComplianceStatus === 'COMPLIANT' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedDeveloper.advertisingComplianceStatus === 'COMPLIANT' ? 'VERIFIED COMPLIANT' : 'FLAGGED: UNLAWFUL CLAIMS'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-500">
              Select a developer entity from the left list.
            </div>
          )}

          {/* New Enrollment Modal Form */}
          {isRegistering && (
            <form onSubmit={handleRegisterDeveloper} className="p-5 rounded-xl bg-neutral-900 border border-orange-800/80 space-y-4 text-xs">
              <h4 className="font-bold text-white font-mono uppercase text-orange-300">
                Enroll Developer &amp; Issue Authorization Certificate
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Developer Corporate Name</label>
                  <input
                    type="text"
                    required
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="e.g. Copperbelt Urban Estates Ltd"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">PACRA Registration Number</label>
                  <input
                    type="text"
                    required
                    value={devPacra}
                    onChange={(e) => setDevPacra(e.target.value)}
                    placeholder="PACRA-DEV-1202..."
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Authorized Pathway</label>
                  <select
                    value={pathway}
                    onChange={(e) => setPathway(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                  >
                    <option value="JOINT_VENTURE">Pathway 3: Joint Venture with Architectural Firm</option>
                    <option value="INDEPENDENT_CONTRACT">Pathway 1: Independent Architectural Contract</option>
                    <option value="ARCHITECTURAL_SUBSIDIARY">Pathway 2: Developer-Owned Architectural Subsidiary</option>
                    <option value="TEMPLATE_LICENSING">Pathway 4: Standardized Template Licensing</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Linked Registered Architectural Practice</label>
                  <select
                    value={linkedFirmId}
                    onChange={(e) => setLinkedFirmId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                  >
                    {firms.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.compliance.pacraNumber})</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-neutral-200">
                <input
                  type="checkbox"
                  checked={sharesInFirm}
                  onChange={(e) => setSharesInFirm(e.target.checked)}
                  className="mt-0.5 rounded bg-neutral-800 border-neutral-600 text-orange-600"
                />
                <span>
                  Developer holds common shares or directorship in architectural practice (Triggers High Conflict-of-Interest Radar review).
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg"
                >
                  Issue Developer Authorization Certificate
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
