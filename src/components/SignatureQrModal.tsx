import React from 'react';
import { 
  Key, 
  ShieldCheck, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Smartphone,
  Copy,
  ExternalLink
} from 'lucide-react';
import { RSABiometricSignatureRecord } from '../types';
import { SiteQrCode } from './SiteQrCode';

interface SignatureQrModalProps {
  signature: RSABiometricSignatureRecord;
  onClose: () => void;
}

export const SignatureQrModal: React.FC<SignatureQrModalProps> = ({
  signature,
  onClose
}) => {
  // Offline-verifiable cryptographic payload containing signature & project particulars
  const offlineInspectorPayload = JSON.stringify({
    sig_id: signature.id,
    passport_id: signature.passportId,
    project: signature.projectName,
    plot: signature.parcelId,
    architect: signature.architectName,
    zia: signature.ziaNumber,
    nrc: signature.nrcNumber,
    timestamp: signature.timestamp,
    key_alg: signature.keyAlgorithm,
    sha256_bundle: signature.drawingBundleHash.substring(0, 18),
    sig_hex: signature.signatureHex.substring(0, 32),
    block: signature.ledgerBlockIndex
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-6 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                Verifiable Signature QR
              </h3>
              <p className="text-[10px] text-neutral-400">
                Direct RSA-4096 Binding for Offline Municipal Inspections
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
          {/* Main Scannable QR Code Canvas */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
            <div className="p-3 bg-white rounded-xl shadow-lg border border-neutral-300">
              <SiteQrCode
                value={offlineInspectorPayload}
                size={180}
                darkColor="#0a0a0a"
                lightColor="#ffffff"
                includeControls={true}
                downloadFilename={`rsa-signature-qr-${signature.id}`}
              />
            </div>

            <div className="mt-3 text-xs font-mono font-bold text-emerald-400">
              {signature.id}
            </div>
            <div className="text-[11px] text-neutral-300 mt-0.5">
              {signature.projectName}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
              Direct offline parsing for municipal tablet scanners
            </div>
          </div>

          {/* Cryptographic Specifications */}
          <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5 text-xs font-mono text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-500">Signatory:</span>
              <strong className="text-white">{signature.architectName} ({signature.ziaNumber})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">National Registration:</span>
              <span className="text-white">NRC #{signature.nrcNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Algorithm:</span>
              <span className="text-emerald-400">{signature.keyAlgorithm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Blockchain Block:</span>
              <span className="text-emerald-400">Block #{signature.ledgerBlockIndex}</span>
            </div>
            <div className="pt-1 border-t border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">RSA-4096 Signature:</span>
              <span className="text-[10px] text-emerald-400 break-all">{signature.signatureHex}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-mono">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encodes offline cryptographic signature verification payload.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
