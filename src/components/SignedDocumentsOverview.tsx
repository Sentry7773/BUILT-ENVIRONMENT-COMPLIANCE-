import React, { useState } from 'react';
import { 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Key, 
  Fingerprint, 
  Eye, 
  ExternalLink,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { RSABiometricSignatureRecord, Project } from '../types';

interface SignedDocumentsOverviewProps {
  signatures: RSABiometricSignatureRecord[];
  projects: Project[];
  onViewPassport: (passportId: string) => void;
  onVerifySignature: (sig: RSABiometricSignatureRecord) => void;
}

export const SignedDocumentsOverview: React.FC<SignedDocumentsOverviewProps> = ({
  signatures,
  projects,
  onViewPassport,
  onVerifySignature
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SIGNED' | 'PENDING' | 'EXPIRED'>('ALL');
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);

  // Derive comprehensive document cards from projects and signatures
  const documentCards = [
    ...signatures.map(sig => ({
      id: sig.id,
      documentTitle: `${sig.projectName} - Statutory Architectural Drawing Package`,
      projectTitle: sig.projectName,
      projectId: sig.projectId,
      parcelId: sig.parcelId,
      councilId: sig.councilId,
      passportId: sig.passportId,
      status: 'SIGNED' as const,
      statusLabel: 'Cryptographically Sealed & Anchored',
      signedAt: sig.timestamp,
      expiresAt: '2028-10-05',
      signatureHex: sig.signatureHex,
      drawingHash: sig.drawingBundleHash,
      biometricMethod: sig.biometricAuthType,
      ledgerBlock: sig.ledgerBlockIndex,
      keyFingerprint: sig.keyFingerprint
    })),
    // Pending documents
    ...projects.filter(p => !p.passport).map(p => ({
      id: `PENDING-${p.id}`,
      documentTitle: `${p.title} - Architectural Plan Package`,
      projectTitle: p.title,
      projectId: p.id,
      parcelId: p.parcelId,
      councilId: p.councilId,
      passportId: 'N/A',
      status: 'PENDING' as const,
      statusLabel: 'Pending Biometric RSA-4096 Seal',
      signedAt: 'Awaiting Sign-off',
      expiresAt: '2026-11-30',
      signatureHex: 'None - Draft Docket',
      drawingHash: p.documents[0]?.sha256Hash || '0xDraftPending',
      biometricMethod: 'N/A',
      ledgerBlock: 0,
      keyFingerprint: 'Pending'
    })),
    // Expired or superseded historical document
    {
      id: 'DOC-EXPIRED-2024-019',
      documentTitle: 'Chilenje Community Clinic (Phase 1 Baseline Structural Plan)',
      projectTitle: 'Chilenje Community Clinic Wing',
      projectId: 'PRJ-LCC-2024-019',
      parcelId: 'LUS-CHIL-901',
      councilId: 'LCC',
      passportId: 'ZAPE-2024-LCC-0112',
      status: 'EXPIRED' as const,
      statusLabel: 'Statutory Validity Expired (Superseded)',
      signedAt: '2024-04-12 11:00:00',
      expiresAt: '2026-04-12',
      signatureHex: '0x12a8bc4...superseded_rsa_signature',
      drawingHash: '0x99a12c8...old_sha256',
      biometricMethod: 'FIDO2_HARDWARE_TOKEN',
      ledgerBlock: 8912,
      keyFingerprint: 'SHA256:4a8f90b2...'
    }
  ];

  const filtered = documentCards.filter(doc => {
    if (filterStatus === 'ALL') return true;
    return doc.status === filterStatus;
  });

  const activeHoveredDoc = documentCards.find(d => d.id === hoveredDocId);

  return (
    <div className="space-y-6">
      {/* Top Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>High-Level Overview of Project Documents</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Hover over any document card to inspect real-time cryptographic signature and ledger metadata
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterStatus === 'ALL' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({documentCards.length})
          </button>
          <button
            onClick={() => setFilterStatus('SIGNED')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              filterStatus === 'SIGNED' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/80' : 'text-neutral-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Signed ({documentCards.filter(d => d.status === 'SIGNED').length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              filterStatus === 'PENDING' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/80' : 'text-neutral-400 hover:text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pending ({documentCards.filter(d => d.status === 'PENDING').length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('EXPIRED')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              filterStatus === 'EXPIRED' ? 'bg-red-950 text-red-300 font-bold border border-red-800/80' : 'text-neutral-400 hover:text-red-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Expired ({documentCards.filter(d => d.status === 'EXPIRED').length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Cards + Hover-to-Preview Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filtered.map(doc => {
            const isHovered = hoveredDocId === doc.id;
            return (
              <div
                key={doc.id}
                onMouseEnter={() => setHoveredDocId(doc.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  doc.status === 'SIGNED'
                    ? isHovered
                      ? 'bg-neutral-900 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                      : 'bg-neutral-900/80 border-emerald-900/60 hover:border-emerald-700/80'
                    : doc.status === 'PENDING'
                    ? isHovered
                      ? 'bg-neutral-900 border-amber-500 shadow-lg shadow-amber-950/40'
                      : 'bg-neutral-900/80 border-amber-900/60 hover:border-amber-700/80'
                    : isHovered
                    ? 'bg-neutral-900 border-red-500 shadow-lg shadow-red-950/40'
                    : 'bg-neutral-900/80 border-red-900/60 hover:border-red-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        doc.status === 'SIGNED' ? 'bg-emerald-400' :
                        doc.status === 'PENDING' ? 'bg-amber-400' : 'bg-red-400'
                      }`} />
                      <span className={`text-[10px] font-mono font-bold uppercase ${
                        doc.status === 'SIGNED' ? 'text-emerald-400' :
                        doc.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {doc.statusLabel}
                      </span>
                      <span className="text-neutral-600 font-mono text-[10px]">·</span>
                      <span className="text-[10px] font-mono text-neutral-400">{doc.councilId}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">
                      {doc.documentTitle}
                    </h4>

                    <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Plot: <strong className="text-neutral-300 font-mono">{doc.parcelId}</strong></span>
                      {doc.passportId !== 'N/A' && (
                        <span>Passport: <strong className="text-emerald-300 font-mono">{doc.passportId}</strong></span>
                      )}
                      <span>Signed: <strong className="text-neutral-300 font-mono">{doc.signedAt}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-neutral-500 font-mono block">Expires</span>
                    <span className={`text-[11px] font-mono font-bold ${
                      doc.status === 'EXPIRED' ? 'text-red-400' : 'text-neutral-300'
                    }`}>
                      {doc.expiresAt}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                  <span className="truncate max-w-[280px]">
                    Hash: {doc.drawingHash.substring(0, 22)}...
                  </span>
                  <span className="text-emerald-400 hover:text-white flex items-center gap-1 font-semibold">
                    <Eye className="w-3 h-3" />
                    <span>Hover to Preview Signature</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Hover-to-Preview Signature Details Inspector Panel (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                  Live Signature Inspector
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                Hover Active
              </span>
            </div>

            {activeHoveredDoc ? (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Inspected Docket</span>
                  <strong className="text-sm text-white block mt-0.5 leading-snug">
                    {activeHoveredDoc.projectTitle}
                  </strong>
                  <span className="text-[11px] text-neutral-400 font-mono">Plot: {activeHoveredDoc.parcelId} · {activeHoveredDoc.councilId} Planning Dept</span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Status:</span>
                    <span className={`font-bold ${
                      activeHoveredDoc.status === 'SIGNED' ? 'text-emerald-400' :
                      activeHoveredDoc.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {activeHoveredDoc.status}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-500">Algorithm:</span>
                    <span className="text-white">RSA-4096 / SHA-256</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-500">Biometric Token:</span>
                    <span className="text-emerald-400">{activeHoveredDoc.biometricMethod}</span>
                  </div>

                  {activeHoveredDoc.ledgerBlock > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Ledger Block:</span>
                      <span className="text-emerald-400">#{activeHoveredDoc.ledgerBlock} (Confirmed)</span>
                    </div>
                  )}

                  <div className="pt-1 border-t border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px]">Drawing Bundle SHA-256 Hash:</span>
                    <span className="text-neutral-300 break-all text-[10px]">
                      {activeHoveredDoc.drawingHash}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px]">RSA-4096 Signature Snippet:</span>
                    <span className="text-emerald-400 break-all text-[10px]">
                      {activeHoveredDoc.signatureHex}
                    </span>
                  </div>
                </div>

                {activeHoveredDoc.passportId !== 'N/A' && (
                  <button
                    onClick={() => onViewPassport(activeHoveredDoc.passportId)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Submission Passport ({activeHoveredDoc.passportId})</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-500 font-mono text-xs">
                Hover over any card on the left to inspect signature parameters and drawing hashes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
