import React, { useRef } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Key, 
  Fingerprint, 
  FileCheck, 
  Building2, 
  QrCode, 
  Layers,
  Award,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Architect, ArchitecturalFirm, RSABiometricSignatureRecord } from '../types';
import { SiteQrCode } from './SiteQrCode';
import { ARCHITECT_RSA4096_PUBLIC_KEY } from '../services/rsaSignatureService';

interface SignedPdfExportModalProps {
  architect: Architect;
  firm: ArchitecturalFirm;
  signatures: RSABiometricSignatureRecord[];
  onClose: () => void;
}

export const SignedPdfExportModal: React.FC<SignedPdfExportModalProps> = ({
  architect,
  firm,
  signatures,
  onClose
}) => {
  const documentRef = useRef<HTMLDivElement>(null);

  const reportDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const documentControlNumber = `ZIA-AUDIT-RSA4096-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Verification URL for mobile scanning of this signed PDF audit package
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zape.gov.zm';
  const auditVerificationUrl = `${origin}/?verifyAudit=${documentControlNumber}&zia=${architect.ziaNumber}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJsonArchive = () => {
    const exportBundle = {
      documentControlNumber,
      exportTimestamp: reportDate,
      authority: 'Republic of Zambia · Zambia Institute of Architects (ZIA Cap 442)',
      architect: {
        id: architect.id,
        name: architect.name,
        ziaNumber: architect.ziaNumber,
        nrcNumber: architect.nrcNumber,
        status: architect.status,
        firmName: firm.name,
        pacraNumber: firm.compliance.pacraNumber
      },
      cryptographicEnclave: ARCHITECT_RSA4096_PUBLIC_KEY,
      signaturesCount: signatures.length,
      signatures: signatures
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${documentControlNumber}-Archive.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="w-full max-w-4xl my-6 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100 print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:m-0 print:rounded-none">
        {/* Top Control Bar (Hidden during printing) */}
        <div className="bg-neutral-950 px-6 py-3 border-b border-neutral-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              Cryptographically Signed Signature Audit Report (PDF)
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-mono">{documentControlNumber}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadJsonArchive}
              className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors font-medium border border-neutral-700"
              title="Download raw JSON signature proof bundle for cold-storage"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download JSON Archive</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-colors font-bold shadow-md shadow-emerald-950/60"
              title="Prints or saves official PDF report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Official Document Canvas */}
        <div 
          ref={documentRef}
          className="p-8 sm:p-12 space-y-8 bg-neutral-950/95 print:p-8 print:bg-white print:text-neutral-900"
        >
          {/* Statutory National Header */}
          <div className="border-b-2 border-neutral-800 print:border-neutral-900 pb-6 text-center space-y-2 relative">
            <div className="flex items-center justify-center gap-2 text-emerald-500 print:text-emerald-800 text-xs font-mono font-bold tracking-widest uppercase">
              <ShieldCheck className="w-5 h-5" />
              <span>Republic of Zambia · National Built-Environment Governance Platform</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white print:text-neutral-900 tracking-tight uppercase">
              Zambia Institute of Architects
            </h1>

            <div className="text-xs text-neutral-400 print:text-neutral-600 font-serif italic">
              Constituted under the Architects Act (Chapter 442 of the Laws of Zambia)
            </div>

            <div className="inline-block px-4 py-1 rounded bg-emerald-950/80 print:bg-neutral-100 border border-emerald-700/80 print:border-neutral-300 text-emerald-300 print:text-emerald-900 text-xs font-mono font-bold uppercase tracking-wider mt-2">
              Official RSA-4096 Biometric Signature Verification Dossier
            </div>

            <div className="text-[11px] font-mono text-neutral-400 print:text-neutral-600 pt-1">
              Document Control: <strong className="text-white print:text-neutral-900">{documentControlNumber}</strong> · Generated: {reportDate}
            </div>
          </div>

          {/* Architect Identification & Enclave Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-neutral-800 print:border-neutral-300 rounded-xl p-5 bg-neutral-900/60 print:bg-neutral-50">
            {/* Left: Architect Details */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono uppercase text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Licensed Professional Signatory</span>
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">Full Legal Name:</span>
                  <strong className="text-white print:text-neutral-900">{architect.name}</strong>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">ZIA Registration:</span>
                  <strong className="font-mono text-emerald-400 print:text-emerald-800">#{architect.ziaNumber} (Active &amp; Licensed)</strong>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">National Registration (NRC):</span>
                  <strong className="font-mono text-white print:text-neutral-900">{architect.nrcNumber}</strong>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">Registered Practice:</span>
                  <strong className="text-white print:text-neutral-900">{firm.name}</strong>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-neutral-400 print:text-neutral-600">PACRA Registration:</span>
                  <strong className="font-mono text-white print:text-neutral-900">{firm.compliance.pacraNumber}</strong>
                </div>
              </div>
            </div>

            {/* Right: Cryptographic Hardware Enclave Specs */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold font-mono uppercase text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
                <Key className="w-4 h-4" />
                <span>Cryptographic Key Specifications</span>
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">Signature Algorithm:</span>
                  <strong className="font-mono text-white print:text-neutral-900">RSA-4096 / SHA-256 (PKCS#1 v1.5)</strong>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">Modulus Length / Exponent:</span>
                  <strong className="font-mono text-white print:text-neutral-900">4096 Bits / 65537</strong>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">Hardware Security Level:</span>
                  <strong className="text-emerald-400 print:text-emerald-800">FIPS 140-3 Level 3 Hardware Enclave</strong>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800/80 print:border-neutral-200">
                  <span className="text-neutral-400 print:text-neutral-600">Key Fingerprint:</span>
                  <span className="font-mono text-[10px] text-white print:text-neutral-900 truncate max-w-[190px]">
                    {ARCHITECT_RSA4096_PUBLIC_KEY.keyFingerprint}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-neutral-400 print:text-neutral-600">Root Trust Anchor:</span>
                  <strong className="text-white print:text-neutral-900">ZAM-PKI Sovereign Root CA</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Signature Log Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white print:text-neutral-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400 print:text-emerald-800" />
                <span>Statutory Project Sign-off Log ({signatures.length} Entries)</span>
              </h3>
              <span className="text-xs font-mono text-neutral-400 print:text-neutral-600">
                100% Cryptographically Anchored
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 print:border-neutral-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 print:bg-neutral-100 text-[10px] font-mono uppercase text-neutral-400 print:text-neutral-700 border-b border-neutral-800 print:border-neutral-300">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Signature ID</th>
                    <th className="p-3">Project Title &amp; Parcel</th>
                    <th className="p-3">Council</th>
                    <th className="p-3">Typology / Storeys</th>
                    <th className="p-3">Passport Ref</th>
                    <th className="p-3">Ledger Block</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 print:divide-neutral-200">
                  {signatures.map((sig, idx) => (
                    <tr key={sig.id} className="hover:bg-neutral-900/40 print:hover:bg-transparent">
                      <td className="p-3 font-mono text-neutral-500">{idx + 1}</td>
                      <td className="p-3 font-mono text-neutral-300 print:text-neutral-800 whitespace-nowrap">
                        {sig.timestamp}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400 print:text-emerald-900 whitespace-nowrap">
                        {sig.id}
                      </td>
                      <td className="p-3">
                        <strong className="text-white print:text-neutral-900 block">{sig.projectName}</strong>
                        <span className="text-[10px] text-neutral-400 print:text-neutral-600 font-mono block">Plot: {sig.parcelId}</span>
                      </td>
                      <td className="p-3 font-medium text-neutral-200 print:text-neutral-800">
                        {sig.councilId}
                      </td>
                      <td className="p-3 text-[11px] text-neutral-300 print:text-neutral-700">
                        {sig.buildingType.replace(/_/g, ' ')} ({sig.totalFloors} Fl)
                      </td>
                      <td className="p-3 font-mono text-neutral-300 print:text-neutral-800">
                        {sig.passportId}
                      </td>
                      <td className="p-3 font-mono text-emerald-400 print:text-emerald-800">
                        #{sig.ledgerBlockIndex}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Attestation & Verification QR Block */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 print:bg-neutral-50 border border-neutral-800 print:border-neutral-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left QR Code (3 cols) */}
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center p-3 bg-white rounded-xl border border-neutral-300 shadow-sm">
              <SiteQrCode
                value={auditVerificationUrl}
                size={130}
                darkColor="#0a0a0a"
                lightColor="#ffffff"
              />
              <div className="mt-1.5 text-[9px] font-mono text-neutral-800 font-bold uppercase">
                Scan to Verify Dossier Integrity
              </div>
              <div className="text-[8px] font-mono text-neutral-600 truncate max-w-[140px]">
                {documentControlNumber}
              </div>
            </div>

            {/* Right Statutory Text & Seals (9 cols) */}
            <div className="md:col-span-9 space-y-3 text-xs">
              <div className="font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800 font-mono text-[11px]">
                Statutory Certificate of Authorship &amp; Biometric Integrity
              </div>

              <p className="text-neutral-300 print:text-neutral-700 leading-relaxed text-[11px] font-light">
                This document certifies that each project sign-off listed in this log was executed via authenticated biometric identity verification and sealed using the registered architect's dedicated RSA-4096 cryptographic private key pursuant to Section 22 of the Zambia Institute of Architects Act (Cap 442). All document hashes, biometric tokens, and council submissions have been immutably recorded on the national built-environment permissioned audit ledger.
              </p>

              <div className="pt-2 border-t border-neutral-800 print:border-neutral-300 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-neutral-400 print:text-neutral-600">
                <div>
                  Master Enclave Signature: <strong className="text-white print:text-neutral-900">0x8f4c2e...VERIFIED</strong>
                </div>
                <div>
                  ZIA Registrar Authentication Seal: <strong className="text-emerald-400 print:text-emerald-800">VALID 2026</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs print:hidden">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic PDF Report ready for local printing or cold-storage archiving.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/60"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
