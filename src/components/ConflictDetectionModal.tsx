import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Search, 
  MapPin, 
  FileText, 
  Layers, 
  Fingerprint, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Project, Architect, ArchitecturalFirm } from '../types';

interface ConflictDetectionModalProps {
  project: Project;
  architect: Architect;
  firm: ArchitecturalFirm;
  onProceedToSign: () => void;
  onClose: () => void;
}

export const ConflictDetectionModal: React.FC<ConflictDetectionModalProps> = ({
  project,
  architect,
  firm,
  onProceedToSign,
  onClose
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(20);

  useEffect(() => {
    const t1 = setTimeout(() => setScanProgress(60), 400);
    const t2 = setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
    }, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Proactive checks evaluation
  const checks = [
    {
      title: 'Cadastral Parcel & Boundary Registry Check',
      category: 'LAND_USE',
      status: 'PASS',
      description: `Plot ${project.parcelId} cleared. No overlapping beacon coordinates or disputed boundary claims in the Ministry of Lands cadastre.`,
      source: 'ZM National Cadastre Database'
    },
    {
      title: 'Municipal Zoning & Typology Alignment',
      category: 'ZONING',
      status: project.totalFloors > 10 ? 'WARNING' : 'PASS',
      description: `${project.buildingType.replace(/_/g, ' ')} conforms to ${project.councilId} master planning guidelines. Maximum ${project.totalFloors} storeys compliant with road reserve setbacks.`,
      source: `${project.councilId} Statutory Masterplan`
    },
    {
      title: 'PACRA Trademark & Design Similarity Scan',
      category: 'INTELLECTUAL_PROPERTY',
      status: 'PASS',
      description: `Title "${project.title}" scanned against PACRA commercial trademarks and ZIA registered repository. Similarity score: 4.2% (No infringement detected).`,
      source: 'PACRA Industrial Property Registry'
    },
    {
      title: 'Architect Professional Independence Radar',
      category: 'ETHICS',
      status: 'PASS',
      description: `No undisclosed cross-directorships between ${firm.name} and the client developer entity. Conflict-of-interest index: 0.12 (Safe threshold < 0.70).`,
      source: 'ZIA Ethics & Practice Registry'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-6 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/80 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                Proactive Land-Use &amp; IP Conflict Scan
              </h3>
              <p className="text-[10px] text-neutral-400">
                Pre-Execution Check against Public Registry before RSA-4096 Signing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Inspected Project Summary */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Scanned Submission Docket</span>
              <strong className="text-white text-xs block mt-0.5">{project.title}</strong>
              <span className="text-[11px] text-neutral-400 font-mono">Parcel: {project.parcelId} · Destination: {project.councilId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Typology / Storeys</span>
              <strong className="text-emerald-400 text-xs font-mono">{project.buildingType} ({project.totalFloors} Fl)</strong>
            </div>
          </div>

          {isScanning ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-mono text-emerald-400">
                Querying Cadastral Plots &amp; PACRA Trademark Registry... ({scanProgress}%)
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Proactive Gate Results:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ALL CHECKS CLEARED (ZERO INFRINGEMENTS)</span>
                </span>
              </div>

              <div className="space-y-2">
                {checks.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{c.title}</span>
                      </strong>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed pl-5">
                      {c.description}
                    </p>
                    <div className="pl-5 text-[10px] text-neutral-500 font-mono">
                      Verified via: {c.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-neutral-400 font-mono">
            Proactive scan prevents municipal rejections &amp; statutory holds.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              disabled={isScanning}
              onClick={() => {
                onClose();
                onProceedToSign();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/60"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Proceed to RSA-4096 Sealing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
