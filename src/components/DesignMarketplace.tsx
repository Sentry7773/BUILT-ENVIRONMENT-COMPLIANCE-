import React, { useState } from 'react';
import { 
  Building, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Download, 
  FileCheck, 
  AlertTriangle, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StandardizedTemplate, Architect } from '../types';
import { MOCK_STANDARDIZED_TEMPLATES } from '../data/mockDatabase';
import { AuditLedgerService } from '../services/cryptoLedger';

interface DesignMarketplaceProps {
  architects: Architect[];
}

export const DesignMarketplace: React.FC<DesignMarketplaceProps> = ({ architects }) => {
  const [templates, setTemplates] = useState<StandardizedTemplate[]>(MOCK_STANDARDIZED_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [adaptingTemplate, setAdaptingTemplate] = useState<StandardizedTemplate | null>(null);

  // License & Site Adaptation form state
  const [licenseType, setLicenseType] = useState<'SINGLE_USE' | 'MULTI_DEVELOPER'>('SINGLE_USE');
  const [selectedArchitectId, setSelectedArchitectId] = useState<string>('ARC-001');
  const [targetParcelId, setTargetParcelId] = useState('LUS-CHONG-4091/C');
  const [targetCouncilId, setTargetCouncilId] = useState('LCC');
  const [soilOrientationConfirmed, setSoilOrientationConfirmed] = useState(false);
  const [adaptationSuccess, setAdaptationSuccess] = useState<string | null>(null);

  const filteredTemplates = templates.filter(t => 
    selectedCategory === 'ALL' || t.category === selectedCategory
  );

  const handleIssueSiteAdaptation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adaptingTemplate || !soilOrientationConfirmed) return;

    const architect = architects.find(a => a.id === selectedArchitectId) || architects[0];
    const certId = `SAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    await AuditLedgerService.recordEvent(
      'TEMPLATE_TYPE_APPROVED',
      { id: architect.ziaNumber, name: architect.name, role: 'Site Adapting Architect' },
      certId,
      `Site Adaptation Certificate ${certId} issued for ${adaptingTemplate.name} on parcel ${targetParcelId}. Mandatory statutory requirements met.`
    );

    setAdaptationSuccess(certId);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Building className="w-4 h-4" />
            <span>MODULE 17 · NATIONAL STANDARDIZED DESIGN REPOSITORY</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Regulated Architectural Typologies &amp; Site Adaptation
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            Statutory, type-approved architectural designs for affordable housing, rural clinics, and classroom blocks. Neutral presentation governed by strict anti-advertising and non-touting statutory rules.
          </p>

          {/* Anti-Advertising Statutory Invariant */}
          <div className="mt-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>STATUTORY CONDUCT RULE:</strong> Zero fee undercutting · Zero paid promotional ranking · Mandatory registered architect site-adaptation required before construction.
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCategory === 'ALL' ? 'bg-neutral-800 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Typologies ({templates.length})
          </button>
          <button
            onClick={() => setSelectedCategory('AFFORDABLE_HOUSING')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCategory === 'AFFORDABLE_HOUSING' ? 'bg-neutral-800 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Affordable Housing
          </button>
          <button
            onClick={() => setSelectedCategory('COMMUNITY_CLINIC')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCategory === 'COMMUNITY_CLINIC' ? 'bg-neutral-800 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Health Clinics
          </button>
          <button
            onClick={() => setSelectedCategory('RURAL_SCHOOL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedCategory === 'RURAL_SCHOOL' ? 'bg-neutral-800 text-emerald-300' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Classroom Blocks
          </button>
        </div>

        <span className="text-xs text-neutral-500 font-mono">
          Governed by ZIA Typology Committee
        </span>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map(tmpl => (
          <div 
            key={tmpl.id}
            className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-600/60 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  {tmpl.typeApprovalStatus.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {tmpl.version}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{tmpl.name}</h3>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Author: <strong className="text-neutral-200">{tmpl.authorArchitect} ({tmpl.authorZiaNumber})</strong>
                </div>
                <div className="text-[11px] text-neutral-500">
                  Firm: {tmpl.firmName} · {tmpl.pacraFirmId}
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {tmpl.description}
              </p>

              {/* Technical Specifications Matrix */}
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] space-y-1 font-mono text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Climate Zones:</span>
                  <span className="text-neutral-200">{tmpl.suitableClimateZones.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Min Plot Size:</span>
                  <span className="text-neutral-200">{tmpl.minPlotSizeSqM} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Est. Build Cost:</span>
                  <span className="text-emerald-400">ZMW {(tmpl.estimatedBuildCostZMW/1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>

            {/* License & Adaptation Action */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-500 block">Single-Use License</span>
                <strong className="text-xs font-mono text-white">
                  ZMW {tmpl.singleUseLicenseFeeZMW.toLocaleString()}
                </strong>
              </div>

              <button
                onClick={() => {
                  setAdaptingTemplate(tmpl);
                  setAdaptationSuccess(null);
                  setSoilOrientationConfirmed(false);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>License &amp; Adapt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MANDATORY SITE ADAPTATION MODAL */}
      {adaptingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Mandatory Site Adaptation Protocol</h3>
              </div>
              <button onClick={() => setAdaptingTemplate(null)} className="text-neutral-400 hover:text-white text-xs font-mono">
                ✕ Close
              </button>
            </div>

            {adaptationSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Site Adaptation Certificate Issued!</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Certificate ID: <strong className="text-emerald-400 font-mono">{adaptationSuccess}</strong>
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg text-xs text-neutral-300 font-mono text-left">
                  <div>Template: {adaptingTemplate.name}</div>
                  <div>Cadastral Parcel: {targetParcelId}</div>
                  <div>Adapting Architect: Arc. Mwansa Phiri (ZIA 1084)</div>
                  <div>Council Destination: {targetCouncilId} Planning Unit</div>
                </div>
                <button
                  onClick={() => setAdaptingTemplate(null)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                >
                  Return to Repository
                </button>
              </div>
            ) : (
              <form onSubmit={handleIssueSiteAdaptation} className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                  <div className="font-bold text-white">{adaptingTemplate.name} ({adaptingTemplate.version})</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">Author: {adaptingTemplate.authorArchitect} · {adaptingTemplate.firmName}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">License Scope</label>
                    <select
                      value={licenseType}
                      onChange={(e) => setLicenseType(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                    >
                      <option value="SINGLE_USE">Single Household (ZMW {adaptingTemplate.singleUseLicenseFeeZMW.toLocaleString()})</option>
                      <option value="MULTI_DEVELOPER">Multi-Unit Developer (ZMW {adaptingTemplate.multiUnitDeveloperLicenseFeeZMW.toLocaleString()})</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Target Municipal Council</label>
                    <select
                      value={targetCouncilId}
                      onChange={(e) => setTargetCouncilId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                    >
                      <option value="LCC">Lusaka City Council (LCC)</option>
                      <option value="NCC">Ndola City Council (NCC)</option>
                      <option value="KCC">Kitwe City Council (KCC)</option>
                      <option value="SOL">Solwezi Municipal Council</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Cadastral Parcel Number</label>
                    <input
                      type="text"
                      required
                      value={targetParcelId}
                      onChange={(e) => setTargetParcelId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Supervising Local Architect</label>
                    <select
                      value={selectedArchitectId}
                      onChange={(e) => setSelectedArchitectId(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                    >
                      {architects.filter(a => a.status === 'ACTIVE').map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.ziaNumber})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200 space-y-1">
                  <div className="font-bold text-[11px] uppercase font-mono text-amber-300">
                    Mandatory Site Adaptation Invariant
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Under ZIA Regulations, standardized plans cannot be built without local architect site adaptation verifying soil bearing capacity, solar orientation, and municipal road setback compliance.
                  </p>
                </div>

                <label className="flex items-start gap-2 cursor-pointer text-neutral-200">
                  <input
                    type="checkbox"
                    checked={soilOrientationConfirmed}
                    onChange={(e) => setSoilOrientationConfirmed(e.target.checked)}
                    className="mt-0.5 rounded bg-neutral-800 border-neutral-600 text-emerald-600"
                  />
                  <span>
                    I confirm that a registered architect has conducted site pegging, soil review, and orientation adjustments for parcel <strong>{targetParcelId}</strong>.
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdaptingTemplate(null)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!soilOrientationConfirmed}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg"
                  >
                    Issue Site Adaptation Certificate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
