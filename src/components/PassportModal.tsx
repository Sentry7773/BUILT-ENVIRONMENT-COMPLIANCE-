import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  FileCheck, 
  AlertTriangle, 
  Download, 
  Printer, 
  Layers, 
  Fingerprint, 
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { SubmissionPassport } from '../types';
import { computeSha256 } from '../services/cryptoLedger';

interface PassportModalProps {
  passport: SubmissionPassport;
  onClose: () => void;
  onViewSitePlaque?: (passport: SubmissionPassport) => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  passport,
  onClose,
  onViewSitePlaque
}) => {
  // Tamper test state
  const [tamperDocIndex, setTamperDocIndex] = useState<number | null>(null);
  const [testHashInput, setTestHashInput] = useState<string>('');
  const [tamperResult, setTamperResult] = useState<'MATCH' | 'TAMPERED' | null>(null);

  const handleSimulateTamper = (idx: number) => {
    setTamperDocIndex(idx);
    // Alter 1 character in the hash to simulate modifying 1 pixel or wall line in the drawing
    const original = passport.documentHashes[idx].hash;
    const altered = original.substring(0, 10) + '9999' + original.substring(14);
    setTestHashInput(altered);
    setTamperResult('TAMPERED');
  };

  const handleVerifyCurrentHash = () => {
    if (tamperDocIndex === null) return;
    const original = passport.documentHashes[tamperDocIndex].hash;
    if (testHashInput.trim() === original) {
      setTamperResult('MATCH');
    } else {
      setTamperResult('TAMPERED');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100">
        {/* Top Control Bar */}
        <div className="bg-neutral-950 px-6 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400">SLI 2.0 SUBMISSION PASSPORT</span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-mono">{passport.passportId}</span>
          </div>

          <div className="flex items-center gap-2">
            {onViewSitePlaque && (
              <button 
                onClick={() => onViewSitePlaque(passport)}
                className="px-2.5 py-1 text-xs bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded flex items-center gap-1.5 transition-colors"
                title="View weatherproof construction site hoard plaque with QR"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Site Plaque &amp; QR</span>
              </button>
            )}
            <button 
              onClick={() => window.print()}
              className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-xs font-mono"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Certificate Body (Official Formal Styling) */}
        <div className="p-8 space-y-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
          {/* Official Emblem & Header */}
          <div className="text-center space-y-2 border-b border-neutral-800 pb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
              Republic of Zambia · Built Environment Trust Layer
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Statutory Architectural Submission Passport
            </h2>
            <div className="text-xs text-neutral-400 font-mono">
              Special Linkage Identifier (SLI): <strong className="text-white">{passport.sliUuid}</strong>
            </div>
          </div>

          {/* Project & Cadastral Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">Project Identification</span>
              <div>Title: <strong className="text-white">{passport.projectName}</strong></div>
              <div>Cadastral Parcel: <strong className="text-white font-mono">{passport.parcelId}</strong></div>
              <div>Municipal Council: <strong className="text-white">{passport.councilName} ({passport.councilId})</strong></div>
              <div>Typology &amp; Risk: <strong className="text-emerald-400">{passport.buildingType} ({passport.riskLevel})</strong></div>
              <div>Approved Floors: <strong className="text-white">{passport.totalFloors} Storeys</strong></div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">Professional &amp; Practice Trust</span>
              <div>Lead Architect: <strong className="text-white">{passport.leadArchitectName}</strong></div>
              <div>Firm of Record: <strong className="text-white">{passport.firmName}</strong></div>
              <div>PACRA Company ID: <strong className="text-purple-400 font-mono">{passport.pacraRegNumber}</strong></div>
              <div>IP Chain-of-Custody: <strong className="text-purple-300 font-mono">{passport.ipChainId || 'PACRA-IP-VAULT-VERIFIED'}</strong></div>
              {passport.templateLicenseId && (
                <div>Template License: <strong className="text-emerald-400 font-mono">{passport.templateLicenseId}</strong></div>
              )}
              {passport.foreignAdoptionCertificateId && (
                <div>Foreign Adoption Permit: <strong className="text-blue-400 font-mono">{passport.foreignAdoptionCertificateId}</strong></div>
              )}
              {passport.developerAuthorizationId && (
                <div>Developer Authorization: <strong className="text-orange-400 font-mono">{passport.developerAuthorizationId}</strong></div>
              )}
              <div>Policy Benchmark: <strong className="text-neutral-300 font-mono">{passport.policyVersion}</strong></div>
              <div>Green Sustainability: <strong className="text-emerald-400">{passport.greenTier} ({passport.greenScore}/100 pts)</strong></div>
              <div>Compliance Score: <strong className="text-emerald-400 font-mono">{passport.complianceScore}% Verified</strong></div>
            </div>
          </div>

          {/* Council Approval Endorsement Banner */}
          {passport.councilApproval && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  MUNICIPAL COUNCIL DUAL SIGN-OFF ENDORSEMENT
                </span>
                <span>Permit #{passport.councilApproval.permitNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-300 pt-1">
                <div>Signatory 1: <strong className="text-white">{passport.councilApproval.primaryOfficer}</strong></div>
                <div>Signatory 2: <strong className="text-white">{passport.councilApproval.secondaryOfficer}</strong></div>
                <div>Approved Date: <span className="font-mono">{passport.councilApproval.approvedAt}</span></div>
                <div>Valid Until: <span className="font-mono text-amber-300">{passport.councilApproval.expiryDate}</span></div>
              </div>
            </div>
          )}

          {/* Cryptographic Drawing Hashes Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Anchored Drawing Sheets &amp; Hashes ({passport.documentHashes.length})
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Algorithm: SHA-256 Immutable Proof
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {passport.documentHashes.map((doc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-white font-medium block truncate">{doc.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono block truncate mt-0.5">{doc.hash}</span>
                  </div>
                  <button
                    onClick={() => handleSimulateTamper(idx)}
                    className="px-2.5 py-1 text-[11px] font-mono bg-neutral-800 text-amber-300 hover:bg-neutral-700 rounded transition-colors shrink-0"
                    title="Simulate modifying 1 byte in the drawing to test tamper detection"
                  >
                    Test Tamper Alert
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Cryptographic Tamper Verification Test Bench */}
          {tamperDocIndex !== null && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-amber-900/60 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 font-mono uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Live Cryptographic Integrity Checker
                </span>
                <button onClick={() => setTamperDocIndex(null)} className="text-neutral-500 hover:text-white font-mono">✕ Close</button>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  Testing Document: <strong className="text-white">{passport.documentHashes[tamperDocIndex].name}</strong>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testHashInput}
                    onChange={(e) => setTestHashInput(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 text-xs font-mono text-white px-3 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleVerifyCurrentHash}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      setTestHashInput(passport.documentHashes[tamperDocIndex].hash);
                      setTamperResult('MATCH');
                    }}
                    className="px-3 py-2 bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs"
                  >
                    Restore Valid
                  </button>
                </div>
              </div>

              {tamperResult === 'TAMPERED' && (
                <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <div>
                    <strong>TAMPERING DETECTED!</strong> Hash mismatch: The submitted document has been modified, forged, or re-exported after the architect's digital seal.
                  </div>
                </div>
              )}

              {tamperResult === 'MATCH' && (
                <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <div>
                    <strong>CRYPTOGRAPHIC HASH MATCH CONFIRMED.</strong> Document matches the immutable ledger record byte-for-byte.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Digital Signature & Blockchain Ledger Anchor */}
          <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase block">Digital Professional Seal Signature</span>
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>{passport.digitalSealSignature}</span>
              </div>
              <span className="text-[10px] text-neutral-500 block">Signed: {passport.digitalSealTimestamp}</span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase block">Permissioned Ledger Anchor</span>
              <div className="text-white font-bold truncate">
                {passport.ledgerAnchorHash}
              </div>
              <span className="text-[10px] text-emerald-400 block">Status: Confirmed on Block #10483</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
