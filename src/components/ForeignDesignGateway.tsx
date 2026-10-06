import React, { useState } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  ShieldAlert, 
  Layers, 
  Plus, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ForeignDesignPackage, Architect } from '../types';
import { MOCK_FOREIGN_PACKAGES } from '../data/mockDatabase';
import { AuditLedgerService } from '../services/cryptoLedger';

interface ForeignDesignGatewayProps {
  architects: Architect[];
}

export const ForeignDesignGateway: React.FC<ForeignDesignGatewayProps> = ({ architects }) => {
  const [packages, setPackages] = useState<ForeignDesignPackage[]>(MOCK_FOREIGN_PACKAGES);
  const [adoptingPackage, setAdoptingPackage] = useState<ForeignDesignPackage | null>(null);

  // Adoption Form State
  const [selectedArchitectId, setSelectedArchitectId] = useState<string>('ARC-002');
  const [foreignPermitNo, setForeignPermitNo] = useState<string>('FCP-ZIA-2026-024');
  const [localizationReportAttached, setLocalizationReportAttached] = useState(true);
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);

  // New Material Equivalency Entry
  const [originalSpec, setOriginalSpec] = useState('');
  const [localSubstitute, setLocalSubstitute] = useState('');
  const [fireRating, setFireRating] = useState('2-Hour Intumescent Barrier');

  const handleExecuteAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptingPackage || !liabilityAccepted) return;

    const architect = architects.find(a => a.id === selectedArchitectId) || architects[0];

    const updatedPackages = packages.map(pkg => {
      if (pkg.id === adoptingPackage.id) {
        return {
          ...pkg,
          status: 'LOCALIZED_APPROVED' as const,
          localAdoptingArchitectId: architect.id,
          localAdoptingArchitectName: `${architect.name} (${architect.ziaNumber})`,
          localAdoptingArchitectZia: architect.ziaNumber,
          localizationReportApproved: true,
          liabilityDeclarationSigned: true,
          foreignConsultantPermitNo: foreignPermitNo
        };
      }
      return pkg;
    });

    await AuditLedgerService.recordEvent(
      'FOREIGN_DESIGN_LOCALIZED',
      { id: architect.ziaNumber, name: architect.name, role: 'Local Adopting Architect' },
      adoptingPackage.id,
      `Foreign architectural package (${adoptingPackage.projectName} from ${adoptingPackage.originCountry}) lawfully localized and adopted by ${architect.name}. Liability declaration anchored.`
    );

    setPackages(updatedPackages);
    setAdoptingPackage(null);
  };

  const handleAddMaterialEquivalency = (pkgId: string) => {
    if (!originalSpec.trim() || !localSubstitute.trim()) return;

    setPackages(packages.map(pkg => {
      if (pkg.id === pkgId) {
        return {
          ...pkg,
          materialEquivalencyMatrix: [
            ...pkg.materialEquivalencyMatrix,
            {
              originalSpec: originalSpec.trim(),
              zambianSubstitute: localSubstitute.trim(),
              fireRating,
              certifiedByZABS: true
            }
          ]
        };
      }
      return pkg;
    }));

    setOriginalSpec('');
    setLocalSubstitute('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
            <Globe className="w-4 h-4" />
            <span>MODULE 18 · FOREIGN-BASED DRAWINGS LOCALIZATION &amp; ADOPTION GATEWAY</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Foreign Design Adoption &amp; National Sovereignty Gateway
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            Protecting Zambian architectural sovereignty and public safety. Foreign drawings (investor, diaspora, or donor-funded) are legally barred from council approval without local adaptation, code conversion, and statutory liability assumed by a registered ZIA architect.
          </p>

          <div className="mt-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>SOVEREIGNTY CONTROL:</strong> Direct foreign seals are void under Zambian law · Foreign firms require temporary permits · Material equivalency required for non-Zambian specs.
            </span>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono uppercase">
            Foreign-Origin Design Docket ({packages.length})
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            Requires Local Adopting Architect Liability
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{pkg.projectName}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                      ORIGIN: {pkg.originCountry}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      pkg.status === 'LOCALIZED_APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    }`}>
                      {pkg.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Foreign Practice: <strong className="text-neutral-200">{pkg.foreignFirmName}</strong> · Permit: <span className="font-mono text-emerald-400">{pkg.foreignConsultantPermitNo}</span>
                  </div>
                </div>

                {pkg.status === 'PENDING_LOCAL_ADOPTION' ? (
                  <button
                    onClick={() => setAdoptingPackage(pkg)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Adopt &amp; Localize Design</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 block">Zambian Architect of Record</span>
                    <strong className="text-xs text-emerald-400 font-mono">{pkg.localAdoptingArchitectName}</strong>
                    <span className="text-[10px] text-emerald-300 block font-mono">Liability &amp; PII Enacted</span>
                  </div>
                )}
              </div>

              {/* Material Equivalency Matrix Panel */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono uppercase flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    ZABS Material Equivalency Matrix ({pkg.materialEquivalencyMatrix.length} Verified)
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">ZS SANS Performance Benchmarks</span>
                </div>

                {pkg.materialEquivalencyMatrix.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pkg.materialEquivalencyMatrix.map((mat, i) => (
                      <div key={i} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                        <div className="text-[11px] text-red-400 font-mono">
                          Imported: {mat.originalSpec}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold font-mono">
                          → Substituted: {mat.zambianSubstitute}
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-0.5">
                          <span>Fire Rating: {mat.fireRating}</span>
                          <span className="text-emerald-400">✓ ZABS Certified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-950/60 rounded-lg text-neutral-500 text-xs text-center border border-neutral-800">
                    No material equivalency specifications submitted yet.
                  </div>
                )}

                {/* Add Material Substitute */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={originalSpec}
                    onChange={(e) => setOriginalSpec(e.target.value)}
                    placeholder="Foreign material spec (e.g. European Timber Cladding Class D)..."
                    className="flex-1 min-w-[200px] bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={localSubstitute}
                    onChange={(e) => setLocalSubstitute(e.target.value)}
                    placeholder="Zambian equivalent (e.g. Copperbelt Kiln-Dried Teak ZS compliant)..."
                    className="flex-1 min-w-[200px] bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => handleAddMaterialEquivalency(pkg.id)}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    Add Equivalency
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADOPTION & LIABILITY MODAL */}
      {adoptingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Globe className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Foreign Design Statutory Adoption</h3>
              </div>
              <button onClick={() => setAdoptingPackage(null)} className="text-neutral-400 hover:text-white text-xs font-mono">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleExecuteAdoption} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
                <div>Project: <strong className="text-white">{adoptingPackage.projectName}</strong></div>
                <div>Country of Origin: <strong className="text-blue-400">{adoptingPackage.originCountry}</strong></div>
                <div>Foreign Author: {adoptingPackage.foreignFirmName}</div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Local Adopting Architect (Assuming Statutory Liability)</label>
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

              <div>
                <label className="text-neutral-400 block mb-1">Temporary Foreign Consultant Permit Number</label>
                <input
                  type="text"
                  required
                  value={foreignPermitNo}
                  onChange={(e) => setForeignPermitNo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200 space-y-1">
                <div className="font-bold text-[11px] uppercase font-mono text-amber-300">
                  Statutory Liability Transfer Declaration
                </div>
                <p className="text-[11px] leading-relaxed">
                  "As the Local Adopting Architect, I declare that I have reviewed, verified, and localized all drawings to the Zambian Building Regulations, Roads Act setbacks, and ZS standards. I assume full statutory professional indemnity and legal liability for this design before Zambian courts and municipal planning authorities."
                </p>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-neutral-200">
                <input
                  type="checkbox"
                  checked={liabilityAccepted}
                  onChange={(e) => setLiabilityAccepted(e.target.checked)}
                  className="mt-0.5 rounded bg-neutral-800 border-neutral-600 text-blue-600"
                />
                <span>
                  I accept full statutory liability as the Zambian Registered Architect of Record.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdoptingPackage(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!liabilityAccepted}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg"
                >
                  Execute Statutory Adoption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
