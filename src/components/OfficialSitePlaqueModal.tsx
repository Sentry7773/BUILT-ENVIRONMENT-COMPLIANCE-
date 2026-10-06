import React, { useRef, useState } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  Smartphone, 
  AlertTriangle,
  Building,
  Layers,
  MapPin,
  ExternalLink,
  Sliders,
  Palette,
  Eye
} from 'lucide-react';
import { SubmissionPassport } from '../types';
import { SiteQrCode } from './SiteQrCode';

interface OfficialSitePlaqueModalProps {
  passport: SubmissionPassport;
  onClose: () => void;
  onSimulateScan: (passportId: string) => void;
}

export const OfficialSitePlaqueModal: React.FC<OfficialSitePlaqueModalProps> = ({
  passport,
  onClose,
  onSimulateScan
}) => {
  const plaqueRef = useRef<HTMLDivElement>(null);
  const [qrFormat, setQrFormat] = useState<'url' | 'raw_id'>('url');
  const [plaqueTheme, setPlaqueTheme] = useState<'acrylic' | 'high_vis'>('acrylic');

  // Verification URL vs Raw Passport ID encoding
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zape.gov.zm';
  const qrEncodedValue = qrFormat === 'url' 
    ? `${origin}/?verify=${passport.passportId}`
    : passport.passportId;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-6 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden text-neutral-100">
        {/* Modal Top Control Bar */}
        <div className="bg-neutral-950 px-6 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              Official Statutory Construction Site Notice Plaque
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-mono">{passport.passportId}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSimulateScan(passport.passportId)}
              className="px-3 py-1 text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center gap-1.5 transition-colors font-medium shadow-sm"
              title="Test real-time camera scanning verification"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulate Mobile Scan</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* QR Code & Display Format Selector */}
        <div className="px-6 py-2.5 bg-neutral-950/70 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-mono">QR Encodes:</span>
            <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800 font-mono text-[11px]">
              <button
                onClick={() => setQrFormat('url')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  qrFormat === 'url' ? 'bg-emerald-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
                title="Encodes direct verification URL: point phone camera to open docket"
              >
                Mobile URL (Direct Link)
              </button>
              <button
                onClick={() => setQrFormat('raw_id')}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  qrFormat === 'raw_id' ? 'bg-emerald-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
                title="Encodes unique Passport ID string only (for handheld scanners)"
              >
                Passport ID ({passport.passportId})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-mono">Plaque Finish:</span>
            <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800 font-mono text-[11px]">
              <button
                onClick={() => setPlaqueTheme('acrylic')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  plaqueTheme === 'acrylic' ? 'bg-neutral-800 text-emerald-400 font-bold' : 'text-neutral-400'
                }`}
              >
                Dark Acrylic
              </button>
              <button
                onClick={() => setPlaqueTheme('high_vis')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  plaqueTheme === 'high_vis' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                High-Vis Yellow
              </button>
            </div>
          </div>
        </div>

        {/* Plaque Canvas - Weatherproof Layout */}
        <div className="p-6 sm:p-8 bg-neutral-950/80">
          <div 
            ref={plaqueRef}
            className={`p-6 sm:p-8 rounded-2xl shadow-2xl relative space-y-6 transition-colors ${
              plaqueTheme === 'acrylic'
                ? 'bg-neutral-900 border-2 border-emerald-500/80 text-neutral-100'
                : 'bg-neutral-900 border-4 border-amber-500 text-neutral-100'
            }`}
          >
            {/* Visual Acrylic Corner Bolts */}
            <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-800 shadow" />
            <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-800 shadow" />
            <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-800 shadow" />
            <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full border border-neutral-600 bg-neutral-800 shadow" />

            {/* Plaque Statutory Header */}
            <div className="text-center space-y-1 border-b-2 border-neutral-800 pb-5">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-emerald-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Republic of Zambia · Statutory Built Environment Trust</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {passport.councilName} Planning Authority
              </h2>
              <div className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold tracking-wider mt-1 ${
                plaqueTheme === 'acrylic'
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/80'
                  : 'bg-amber-400 text-neutral-950 border border-amber-300'
              }`}>
                OFFICIAL APPROVED BUILDING PERMIT SITE PLAQUE
              </div>
            </div>

            {/* Plaque Core Body: QR Code + Statutory Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left: Scannable QR Code (5 cols) */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl shadow-lg border border-neutral-300">
                <SiteQrCode
                  value={qrEncodedValue}
                  size={190}
                  darkColor="#0a0a0a"
                  lightColor="#ffffff"
                  includeControls={true}
                  downloadFilename={`plaque-qr-${passport.passportId}`}
                />

                <div className="mt-2 text-[10px] font-mono text-neutral-800 font-bold uppercase tracking-tight leading-tight">
                  SCAN WITH ANY MOBILE PHONE CAMERA
                </div>
                <div className="text-[9px] font-mono text-neutral-600 mt-0.5 truncate max-w-[200px]">
                  ID: {passport.passportId}
                </div>
              </div>

              {/* Right: Key Statutory Site Identifiers (7 cols) */}
              <div className="sm:col-span-7 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Project Title</span>
                  <strong className="text-sm font-bold text-white block mt-0.5 leading-snug">
                    {passport.projectName}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">Building Permit #</span>
                    <strong className="text-xs font-mono text-emerald-400">
                      {passport.councilApproval?.permitNumber || 'LCC/BP/2026/0419'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">Cadastral Parcel</span>
                    <strong className="text-xs font-mono text-white">
                      {passport.parcelId}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">Approved Building Use</span>
                    <strong className="text-xs text-white">
                      {passport.buildingType.replace(/_/g, ' ')}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono block">Approved Storeys</span>
                    <strong className="text-xs font-mono text-amber-400 font-bold">
                      {passport.totalFloors} STOREYS MAX
                    </strong>
                  </div>
                </div>

                <div className="pt-1 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Lead Architect of Record</span>
                  <strong className="text-xs text-white block mt-0.5">
                    {passport.leadArchitectName}
                  </strong>
                  <div className="text-[11px] text-neutral-400">
                    Firm: <strong className="text-neutral-300">{passport.firmName}</strong> ({passport.pacraRegNumber})
                  </div>
                </div>
              </div>
            </div>

            {/* Plaque Security Footnote */}
            <div className="pt-3 border-t-2 border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 ANCHOR: {passport.ledgerAnchorHash.substring(0, 24)}...</span>
              </div>
              <div className="text-neutral-500">
                DISPLAY MANDATORY ON ALL CONSTRUCTION BOUNDARIES (ZIA CAP 442)
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Encodes {qrFormat === 'url' ? 'mobile-scannable deep link' : 'raw passport string'}: Point your camera or test in the built-in mobile scanner.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSimulateScan(passport.passportId)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulate Mobile Scan</span>
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
