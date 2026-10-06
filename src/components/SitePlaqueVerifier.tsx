import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Send, 
  FileText, 
  Building, 
  ExternalLink, 
  Camera, 
  Smartphone, 
  RefreshCw, 
  Download, 
  Printer, 
  Eye, 
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';
import { Project, CitizenReport, SubmissionPassport } from '../types';
import { MOCK_CITIZEN_REPORTS } from '../data/mockDatabase';
import { SiteQrCode } from './SiteQrCode';
import { notificationService } from '../services/notificationService';

interface SitePlaqueVerifierProps {
  projects: Project[];
  onViewPassport: (passportId: string) => void;
  onViewSitePlaque?: (passport: SubmissionPassport) => void;
  initialQuery?: string;
}

export const SitePlaqueVerifier: React.FC<SitePlaqueVerifierProps> = ({
  projects,
  onViewPassport,
  onViewSitePlaque,
  initialQuery
}) => {
  const [plaqueSearchQuery, setPlaqueSearchQuery] = useState<string>(initialQuery || 'ZAPE-2026-LCC-0891');
  const [foundProject, setFoundProject] = useState<Project | null>(() => {
    if (initialQuery) {
      const match = projects.find(p => p.passport?.passportId === initialQuery);
      if (match) return match;
    }
    return projects.find(p => p.passport?.passportId === 'ZAPE-2026-LCC-0891') || projects[0] || null;
  });
  const [isSearched, setIsSearched] = useState(true);

  // Mobile Device Camera Scanner Simulator State
  const [isMobileScannerOpen, setIsMobileScannerOpen] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'decoded' | 'error'>('idle');
  const [decodedBarcode, setDecodedBarcode] = useState<string>('');
  const [scanLaserActive, setScanLaserActive] = useState<boolean>(true);

  // Whistleblower report form
  const [isReporting, setIsReporting] = useState(false);
  const [reportsList, setReportsList] = useState<CitizenReport[]>(MOCK_CITIZEN_REPORTS);
  const [violationType, setViolationType] = useState<CitizenReport['violationType']>('UNAUTHORIZED_HEIGHT');
  const [reportDescription, setReportDescription] = useState('');
  const [reporterPhone, setReporterPhone] = useState('+260 977 000 000');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Handle initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setPlaqueSearchQuery(initialQuery);
      const match = projects.find(p => p.passport?.passportId === initialQuery);
      if (match) {
        setFoundProject(match);
        setIsSearched(true);
      }
    }
  }, [initialQuery, projects]);

  const handleSearch = () => {
    const q = plaqueSearchQuery.trim().toUpperCase();
    const match = projects.find(p => 
      p.passport?.passportId.toUpperCase().includes(q) ||
      p.id.toUpperCase().includes(q) ||
      p.parcelId.toUpperCase().includes(q)
    );
    setFoundProject(match || null);
    setIsSearched(true);
    setReportSuccess(false);
  };

  const handleQuickLookup = (code: string) => {
    setPlaqueSearchQuery(code);
    const match = projects.find(p => p.passport?.passportId === code);
    setFoundProject(match || null);
    setIsSearched(true);
    setReportSuccess(false);
  };

  // Simulate scanning a physical site plaque via smartphone camera
  const handleStartSimulatedScan = (presetId?: string) => {
    setIsMobileScannerOpen(true);
    setScannerStatus('scanning');
    setDecodedBarcode('');
    setScanLaserActive(true);

    const targetCode = presetId || plaqueSearchQuery || 'ZAPE-2026-LCC-0891';

    // Simulate 1.2s camera focus and QR decoding
    setTimeout(() => {
      setDecodedBarcode(targetCode);
      setScannerStatus('decoded');
      setScanLaserActive(false);

      // Complete lookup
      const match = projects.find(p => 
        p.passport?.passportId.toUpperCase() === targetCode.toUpperCase() ||
        p.id.toUpperCase() === targetCode.toUpperCase()
      );

      setPlaqueSearchQuery(targetCode);
      setFoundProject(match || null);
      setIsSearched(true);

      // Play soft feedback notification
      if (match) {
        notificationService.dispatch({
          eventType: 'COUNCIL_PERMIT_GRANTED',
          priority: 'MEDIUM',
          targetRole: 'public_citizen',
          title: `QR Code Verified: ${match.title}`,
          message: `Official permit verified for plot ${match.parcelId}. Approved for ${match.totalFloors} storeys.`,
          projectId: match.id,
          projectName: match.title,
          councilId: match.councilId,
          actionTab: 'site_plaque',
          actionLabel: 'View Site Plaque'
        });
      }
    }, 1400);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    const newRep: CitizenReport = {
      id: `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
      sitePlaqueId: foundProject?.passport?.passportId || plaqueSearchQuery,
      projectName: foundProject?.title || 'Unknown Construction Site',
      siteAddress: foundProject?.siteAddress || 'Lusaka Urban Jurisdiction',
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reporterContact: reporterPhone,
      violationType,
      description: reportDescription.trim(),
      status: 'INVESTIGATING',
      assignedInspector: 'LCC Rapid Response Building Inspectorate'
    };

    setReportsList([newRep, ...reportsList]);
    setReportSuccess(true);
    setReportDescription('');
    setIsReporting(false);

    // High-priority event-driven notification alerting municipal council reviewers and inspectors
    notificationService.dispatch({
      eventType: 'CITIZEN_REPORT_ALERT',
      priority: 'HIGH',
      targetRole: 'council',
      title: `Citizen Safety Alert on ${foundProject?.title || plaqueSearchQuery}`,
      message: `Statutory non-compliance report logged (${violationType.replace(/_/g, ' ')}): "${reportDescription.trim()}". Dispatched to municipal building inspectorate.`,
      projectId: foundProject?.id || 'REP-SITE',
      projectName: foundProject?.title || plaqueSearchQuery,
      councilId: foundProject?.councilId || 'LCC',
      actionTab: 'site_plaque',
      actionLabel: 'Inspect Incident'
    });
  };

  const activePassport = foundProject?.passport;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
            <QrCode className="w-4 h-4" />
            <span>MODULE 13 · CITIZEN SITE VERIFICATION &amp; DIGITAL PLAQUE TRUST LAYER</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Verify Construction Site QR Plaque
          </h2>
          <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
            Every lawful construction site in Zambia is mandated under Cap 442 to visibly mount an official weatherproof QR plaque on its perimeter hoard. Point your mobile phone camera or scan below to verify approved storeys, building typology, and council permit credentials.
          </p>

          {/* Action Row: Mobile Scanner Button + Quick Input */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => handleStartSimulatedScan()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Scan with Mobile Device Camera</span>
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={plaqueSearchQuery}
                onChange={(e) => setPlaqueSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter Plaque ID (e.g. ZAPE-2026-LCC-0891)..."
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-mono shadow-inner"
              />
            </div>

            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-neutral-700 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify Code</span>
            </button>
          </div>

          {/* Quick Demo Plaque Chips */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="text-[11px] font-mono">Test Plaques:</span>
            <button
              onClick={() => handleStartSimulatedScan('ZAPE-2026-LCC-0891')}
              className="text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 text-emerald-300 border border-emerald-900/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>ZAPE-2026-LCC-0891 (Approved 6-Floors)</span>
            </button>
            <button
              onClick={() => handleStartSimulatedScan('ZAPE-2026-NCC-0892')}
              className="text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 text-cyan-300 border border-cyan-900/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3 text-cyan-400" />
              <span>ZAPE-2026-NCC-0892 (STEM School)</span>
            </button>
            <button
              onClick={() => {
                setPlaqueSearchQuery('UNAUTHORIZED-SITE-99');
                setFoundProject(null);
                setIsSearched(true);
              }}
              className="text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 text-red-300 border border-red-900/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>UNAUTHORIZED-SITE-99 (Illegal Demo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DEVICE CAMERA SCANNER SIMULATOR MODAL */}
      {isMobileScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border-2 border-neutral-700 shadow-2xl overflow-hidden flex flex-col text-neutral-100 relative">
            {/* Phone Top Speaker & Notch */}
            <div className="bg-neutral-950 pt-3 pb-2 px-6 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>MOBILE CAMERA SCANNER</span>
              </div>
              <button
                onClick={() => setIsMobileScannerOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Viewfinder Canvas */}
            <div className="relative h-72 bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
              {/* Camera Simulation Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Target Bounding Box */}
              <div className="relative w-48 h-48 rounded-2xl border-2 border-emerald-400/80 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                {/* Crosshairs */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-1 -mr-1 rounded-br" />

                {/* Laser Bar Animation */}
                {scanLaserActive && (
                  <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-bounce" />
                )}

                {/* Mini Preview QR Code */}
                <div className="p-2 bg-white rounded-lg opacity-85 shadow">
                  <SiteQrCode
                    value={decodedBarcode || plaqueSearchQuery || 'ZAPE-2026-LCC-0891'}
                    size={90}
                    darkColor="#0a0a0a"
                    lightColor="#ffffff"
                  />
                </div>
              </div>

              {/* Status Message Overlay */}
              <div className="absolute bottom-3 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-[11px] font-mono text-center">
                {scannerStatus === 'scanning' ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Focusing &amp; Scanning QR Payload...</span>
                  </span>
                ) : (
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Decoded: {decodedBarcode}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Phone Bottom Controls */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-2">
              <div className="text-[11px] text-neutral-400 text-center">
                Point mobile lens at weatherproof site plaque to verify building permit.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartSimulatedScan('ZAPE-2026-LCC-0891')}
                  className="flex-1 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-mono font-medium transition-colors"
                >
                  Scan Site LCC-0891
                </button>
                <button
                  onClick={() => setIsMobileScannerOpen(false)}
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Whistleblower Success Notification */}
      {reportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-xs text-emerald-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white block font-medium">Statutory Whistleblower Report Received &amp; Dispatched.</strong>
              Your confidential discrepancy report has been dispatched to the municipal building inspectorate. High-priority notification sent to council officers.
            </div>
          </div>
          <button onClick={() => setReportSuccess(false)} className="text-emerald-400 hover:text-white font-mono p-1">✕</button>
        </div>
      )}

      {/* Plaque Verification Result Card */}
      {isSearched && (
        <div>
          {foundProject ? (
            <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-6">
              {/* Card Header & Verification Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/90 border border-emerald-600/80 flex items-center justify-center text-emerald-400 shadow-inner">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                      Official Republic of Zambia Built-Environment Registry
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">{foundProject.title}</h3>
                    <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                      <span>Unique Passport ID:</span>
                      <strong className="font-mono text-emerald-300 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {foundProject.passport?.passportId || foundProject.id}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold rounded-lg font-mono flex items-center gap-1.5 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>COUNCIL PERMIT ACTIVE</span>
                  </span>

                  {foundProject.passport && onViewSitePlaque && (
                    <button
                      onClick={() => onViewSitePlaque(foundProject.passport!)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/60"
                      title="Open full statutory weatherproof site notice plaque modal"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View &amp; Print Official Plaque</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Visual Plaque & QR Code Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Scannable Site QR Code Preview Card (4 cols) */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center text-center">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase font-bold mb-3 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Plaque QR Generator</span>
                  </div>

                  <SiteQrCode
                    value={typeof window !== 'undefined' ? `${window.location.origin}/?verify=${foundProject.passport?.passportId || foundProject.id}` : (foundProject.passport?.passportId || foundProject.id)}
                    size={160}
                    darkColor="#050505"
                    lightColor="#ffffff"
                    includeControls={true}
                    downloadFilename={`zape-qr-${foundProject.passport?.passportId || foundProject.id}`}
                  />

                  <div className="mt-3 text-[10px] font-mono text-neutral-400">
                    Encodes: <span className="text-emerald-400 font-bold">{foundProject.passport?.passportId || foundProject.id}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    Error Correction Level H (30% Damage Tolerance)
                  </div>
                </div>

                {/* Right: Key Statutory Parameters (8 cols) */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase block font-mono">Approved Building Use</span>
                      <strong className="text-xs text-white block truncate">{foundProject.buildingType.replace(/_/g, ' ')}</strong>
                      <span className="text-[10px] text-neutral-400">Permitted per C-2 Municipal Zoning</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase block font-mono">Approved Storeys</span>
                      <strong className="text-xs text-emerald-400 font-mono block">
                        {foundProject.totalFloors} Storeys Maximum
                      </strong>
                      <span className="text-[10px] text-neutral-400">Extra floor is statutory violation</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase block font-mono">Council Building Permit</span>
                      <strong className="text-xs text-white font-mono block truncate">
                        {foundProject.passport?.councilApproval?.permitNumber || 'LCC/BP/2026/0419'}
                      </strong>
                      <span className="text-[10px] text-neutral-400">Valid: {foundProject.passport?.councilApproval?.expiryDate || '2028-10-05'}</span>
                    </div>
                  </div>

                  {/* Responsible Professional & Cadastral Details */}
                  <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Lead Architect of Record:</span>
                      <strong className="text-white text-xs block mt-0.5">Arc. Mwansa Phiri (ZIA #1084)</strong>
                      <span className="text-[10px] text-emerald-400 font-mono">ZIA Status: ACTIVE &amp; LICENSED</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Architectural Practice:</span>
                      <strong className="text-white text-xs block mt-0.5">Apex Studio Architects Ltd</strong>
                      <span className="text-[10px] text-neutral-400 font-mono">PACRA #12020004918 · PII Insured</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Cadastral Location:</span>
                      <strong className="text-white text-xs block mt-0.5 truncate">{foundProject.siteAddress}</strong>
                      <span className="text-[10px] text-neutral-400 font-mono">Plot: {foundProject.parcelId}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setIsReporting(!isReporting)}
                      className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>Report Discrepancy or Unsafe Activity</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {foundProject.passport && (
                        <button
                          onClick={() => onViewPassport(foundProject.passport!.passportId)}
                          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Cryptographic Passport</span>
                        </button>
                      )}

                      {foundProject.passport && onViewSitePlaque && (
                        <button
                          onClick={() => onViewSitePlaque(foundProject.passport!)}
                          className="px-4 py-2 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/80 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Official Plaque</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-red-950/20 border border-red-800/60 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-900/40 text-red-400 flex items-center justify-center mx-auto border border-red-700">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Approved Permit Found for this Plaque</h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-md mx-auto">
                  The code <strong className="text-red-400 font-mono">{plaqueSearchQuery}</strong> does not correspond to an active, council-approved building permit in the sovereign Zambian registry.
                </p>
              </div>

              <button
                onClick={() => setIsReporting(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-950/80 transition-colors inline-flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Illegal Construction to Council</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* WHISTLEBLOWER DISCREPANCY REPORT FORM */}
      {isReporting && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-red-900/60 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Lodge Public Safety / Non-Compliance Report</h3>
            </div>
            <button onClick={() => setIsReporting(false)} className="text-neutral-400 hover:text-white text-xs font-mono">
              ✕ Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-medium block mb-1">Violation Category</label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="UNAUTHORIZED_HEIGHT">Unauthorized Height / Extra Floors Built</option>
                  <option value="CHANGED_USE">Unauthorized Change of Building Use</option>
                  <option value="UNSAFE_SCAFFOLDING">Unsafe Scaffolding / Public Falling Debris Hazard</option>
                  <option value="NO_APPROVED_PERMIT">Construction without Approved Plaque / Permit</option>
                  <option value="ENVIRONMENTAL_HAZARD">Pollution / Illegal Wetland Dumping</option>
                  <option value="ENCROACHMENT">Road Reserve / Boundary Encroachment</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">Reporter Contact (Confidential Whistleblower)</label>
                <input
                  type="text"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1">Discrepancy Details &amp; Observations</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe observed violation (e.g. building has 5 storeys erected but permit only allows 3 storeys; protective perimeter fence missing along public road)..."
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-700 text-white p-3 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-neutral-400">
                Protected under Zambian Public Interest Disclosure Whistleblower Protection.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit to Municipal Building Inspectorate</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Public Safety Dispatches */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h4 className="text-xs font-bold text-white font-mono uppercase">
          Live Council Inspection &amp; Whistleblower Incident Log ({reportsList.length})
        </h4>

        <div className="space-y-2 text-xs">
          {reportsList.map(rep => (
            <div key={rep.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{rep.id}</span>
                  <span className="text-neutral-300 font-medium">{rep.projectName}</span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/60 px-1.5 py-0.2 rounded font-mono">
                    {rep.violationType.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-neutral-400 text-[11px] mt-1">{rep.description}</p>
                {rep.councilActionTaken && (
                  <div className="text-[10px] text-amber-300 mt-1">
                    <strong>Action Taken:</strong> {rep.councilActionTaken}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-neutral-500 block">{rep.reportedAt}</span>
                <span className="text-[11px] font-mono text-amber-400 font-semibold">{rep.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
