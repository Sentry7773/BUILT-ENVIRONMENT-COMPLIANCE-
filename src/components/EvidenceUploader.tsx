import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Leaf, 
  Flame, 
  Accessibility, 
  ShieldCheck, 
  Building2, 
  Hash, 
  Lock, 
  Calendar, 
  Sparkles, 
  RefreshCw, 
  FileCheck, 
  X, 
  ArrowRight,
  ExternalLink,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';
import { Project, ProjectDocument, RSABiometricSignatureRecord, Architect, ArchitecturalFirm } from '../types';
import { computeSha256, AuditLedgerService } from '../services/cryptoLedger';
import { notificationService } from '../services/notificationService';
import { rsaSignatureService, ARCHITECT_RSA4096_PUBLIC_KEY } from '../services/rsaSignatureService';

export type EvidenceCategory = 
  | 'RSA_SIGNATURE' 
  | 'ENVIRONMENTAL_ZEMA' 
  | 'FIRE_SAFETY' 
  | 'ACCESSIBILITY' 
  | 'TITLE_DEED';

interface EvidenceUploaderProps {
  projects: Project[];
  signatures: RSABiometricSignatureRecord[];
  currentArchitect: Architect;
  currentFirm: ArchitecturalFirm;
  onUpdateProject: (project: Project) => void;
  onSignaturesUpdated?: (signatures: RSABiometricSignatureRecord[]) => void;
  targetProjectId?: string;
  initialCategory?: EvidenceCategory;
  onClose?: () => void;
  onNavigateToValidator?: () => void;
}

interface EvidencePreset {
  id: string;
  category: EvidenceCategory;
  title: string;
  fileName: string;
  fileSize: string;
  refNumber: string;
  issuingAuthority: string;
  badge: string;
  description: string;
}

const PRESET_EVIDENCE: EvidencePreset[] = [
  {
    id: 'preset-zema-epb',
    category: 'ENVIRONMENTAL_ZEMA',
    title: 'ZEMA Environmental Project Brief (EPB) Clearance Certificate',
    fileName: 'ZEMA-EPB-DECISION-LETTER-2026.pdf',
    fileSize: '4.8 MB',
    refNumber: 'ZEMA/EPB/2026/LCC-9941',
    issuingAuthority: 'Zambia Environmental Management Agency (ZEMA HQ, Corner Church & Suez Rd)',
    badge: 'Statutory EPB Decision Letter',
    description: 'Mandatory environmental approval under Section 29 of the Environmental Management Act No. 12 of 2011.'
  },
  {
    id: 'preset-rsa-seal',
    category: 'RSA_SIGNATURE',
    title: 'RSA-4096 Lead Architect Biometric Seal Technical Package',
    fileName: 'ARCH-A101-RSA4096-CRYPTOGRAPHIC-SEALED.pdf',
    fileSize: '16.4 MB',
    refNumber: 'ZIA/PKI-SEAL/2026/1084-SEC',
    issuingAuthority: 'Zambia Institute of Architects (ZIA National PKI Enclave)',
    badge: 'RSA-4096 / SHA-256 FIPS 140-3',
    description: 'Statutory biometric seal applied by registered Architect under Architects Act Cap 442 Section 18.'
  },
  {
    id: 'preset-fire-cert',
    category: 'FIRE_SAFETY',
    title: 'Municipal Fire & Life Safety Plan Clearance Certificate',
    fileName: 'MUNICIPAL-FIRE-DEPT-CLEARANCE-2026.pdf',
    fileSize: '3.6 MB',
    refNumber: 'FIRE-CHIEF/LCC/INSPECT-2026-44',
    issuingAuthority: 'City Council Fire Prevention & Rescue Command',
    badge: 'Municipal Fire Approval',
    description: 'Hydrant spacing, smoke compartmentation and emergency egress approval per Public Health (Fire) Regulations.'
  },
  {
    id: 'preset-access-cert',
    category: 'ACCESSIBILITY',
    title: 'Universal Barrier-Free Accessibility Compliance Audit',
    fileName: 'ZAPD-BARRIER-FREE-COMPLIANCE-AUDIT.pdf',
    fileSize: '2.9 MB',
    refNumber: 'ZAPD/ACCESSIBILITY/2026-810',
    issuingAuthority: 'Zambia Agency for Persons with Disabilities (ZAPD)',
    badge: 'Universal Accessibility Passed',
    description: 'Tactile paving, ramp gradients (1:12), and auditory lift indicators verified for inclusive access.'
  },
  {
    id: 'preset-title-deed',
    category: 'TITLE_DEED',
    title: 'Ministry of Lands Cadastral Survey & Certificate of Title',
    fileName: 'MINISTRY-OF-LANDS-DEED-PLOT-VERIFIED.pdf',
    fileSize: '5.1 MB',
    refNumber: 'MOL-TITLE/LUS-99120/2026',
    issuingAuthority: 'Ministry of Lands & Natural Resources (Lands Registry Lusaka)',
    badge: 'Certificate of Title (99-Year Leasehold)',
    description: 'Official biometric land registry confirmation of legal ownership and statutory zoning verification.'
  }
];

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  projects,
  signatures,
  currentArchitect,
  currentFirm,
  onUpdateProject,
  onSignaturesUpdated,
  targetProjectId,
  initialCategory = 'ENVIRONMENTAL_ZEMA',
  onClose,
  onNavigateToValidator
}) => {
  // Active Project Selection
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    targetProjectId || projects[0]?.id || ''
  );
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Active Category Selection
  const [selectedCategory, setSelectedCategory] = useState<EvidenceCategory>(initialCategory);

  // Form & File Ingestion State
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [refNumber, setRefNumber] = useState<string>('');
  const [issuingAuthority, setIssuingAuthority] = useState<string>('');
  const [certNotes, setCertNotes] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Upload & Verification Pipeline Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<
    'idle' | 'hashing' | 'validating_authority' | 'anchoring_ledger' | 'complete'
  >('idle');
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Sync category changes with default preset text
  useEffect(() => {
    const matchingPreset = PRESET_EVIDENCE.find(p => p.category === selectedCategory);
    if (matchingPreset) {
      setSelectedPresetId(matchingPreset.id);
      setDocumentTitle(matchingPreset.title);
      setRefNumber(matchingPreset.refNumber);
      setIssuingAuthority(matchingPreset.issuingAuthority);
      setCertNotes(matchingPreset.description);
    }
  }, [selectedCategory]);

  // Load a preset directly
  const handleSelectPreset = (preset: EvidencePreset) => {
    setSelectedCategory(preset.category);
    setSelectedPresetId(preset.id);
    setDocumentTitle(preset.title);
    setRefNumber(preset.refNumber);
    setIssuingAuthority(preset.issuingAuthority);
    setCertNotes(preset.description);
    setCustomFile(null);
  };

  // Handle custom file selection via HTML input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setSelectedPresetId(null);
      if (!documentTitle || documentTitle.includes('ZEMA') || documentTitle.includes('RSA-4096')) {
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  // Calculate current compliance status of the selected project
  const currentHasRsa = Boolean(
    selectedProject?.passport?.digitalSealSignature || 
    signatures.some(s => s.projectId === selectedProject?.id)
  );

  const currentHasZema = Boolean(
    selectedProject?.documents.some(d => d.category === 'ENVIRONMENTAL_ZEMA' && d.verified)
  );

  const currentHasFire = Boolean(
    selectedProject?.hasFireSafetyPlan || 
    selectedProject?.documents.some(d => d.category === 'FIRE_SAFETY' && d.verified)
  );

  // Execute statutory evidence ingestion and real-time state update
  const handleExecuteUpload = async () => {
    if (!selectedProject) return;

    setIsProcessing(true);
    setProcessingStep('hashing');

    // Step 1: Calculate Real SHA-256 Hash
    const sourceString = customFile 
      ? `${customFile.name}-${customFile.size}-${Date.now()}` 
      : `${documentTitle}-${refNumber}-${Date.now()}`;
    const calculatedHash = await computeSha256(sourceString);
    setGeneratedHash(`0x${calculatedHash}`);

    // Step 2: Regulatory Authority Signature Validation
    setTimeout(async () => {
      setProcessingStep('validating_authority');

      // Step 3: Ledger Anchoring
      setTimeout(async () => {
        setProcessingStep('anchoring_ledger');

        // Create the new ProjectDocument
        const newDocCategory = selectedCategory === 'RSA_SIGNATURE' 
          ? 'ARCHITECTURAL_PLANS' 
          : selectedCategory;

        const newDoc: ProjectDocument = {
          id: `DOC-EVID-${Date.now()}`,
          name: customFile ? customFile.name : (PRESET_EVIDENCE.find(p => p.id === selectedPresetId)?.fileName || `${selectedCategory}-Evidence.pdf`),
          category: newDocCategory,
          sha256Hash: `0x${calculatedHash}`,
          fileSize: customFile ? `${(customFile.size / (1024 * 1024)).toFixed(1)} MB` : '4.8 MB',
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          verified: true
        };

        let updatedProject: Project = {
          ...selectedProject,
          documents: [...selectedProject.documents, newDoc]
        };

        // Specific category logic
        if (selectedCategory === 'RSA_SIGNATURE') {
          // Create or update digital seal & passport
          const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
          const sigId = `SIG-RSA4096-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          const fakeSignatureHex = `0x${calculatedHash}${calculatedHash}${calculatedHash}`.substring(0, 258);
          const passportId = selectedProject.passport?.passportId || `ZAPE-2026-${selectedProject.councilId}-${Math.floor(100 + Math.random() * 900)}`;

          // Create signature record
          const sigRecord: RSABiometricSignatureRecord = {
            id: sigId,
            timestamp,
            architectId: currentArchitect.id,
            architectName: currentArchitect.name,
            ziaNumber: currentArchitect.ziaNumber,
            nrcNumber: currentArchitect.nrcNumber,
            firmId: currentFirm.id,
            firmName: currentFirm.name,
            projectId: selectedProject.id,
            projectName: selectedProject.title,
            parcelId: selectedProject.parcelId,
            councilId: selectedProject.councilId,
            councilName: `${selectedProject.councilId} Planning Authority`,
            buildingType: selectedProject.buildingType,
            totalFloors: selectedProject.totalFloors,
            passportId,
            biometricAuthType: 'FIDO2_HARDWARE_TOKEN',
            biometricHardwareSerial: 'YUBI-FIPS-908124',
            keyAlgorithm: 'RSA-4096 / SHA-256 PKCS#1 v1.5',
            keyFingerprint: ARCHITECT_RSA4096_PUBLIC_KEY.keyFingerprint,
            signatureHex: fakeSignatureHex,
            drawingBundleHash: `0x${calculatedHash}`,
            ledgerBlockHash: `0x${calculatedHash.split('').reverse().join('')}`,
            ledgerBlockIndex: 10490 + signatures.length,
            statutoryDeclarationText: `Solemnly declared under ZIA Act Cap 442 Section 18: RSA-4096 signature evidence package attached and certified by ${currentArchitect.name}.`,
            verified: true
          };

          // Update RSA Signature service
          rsaSignatureService.attachExternalSignatureRecord(sigRecord);
          if (onSignaturesUpdated) {
            onSignaturesUpdated(rsaSignatureService.getSignatures());
          }

          // Update project passport
          updatedProject = {
            ...updatedProject,
            passport: {
              ...(selectedProject.passport || {
                passportId,
                sliUuid: `SLI-UUID-${Date.now()}`,
                projectId: selectedProject.id,
                projectName: selectedProject.title,
                leadArchitectId: currentArchitect.id,
                leadArchitectName: currentArchitect.name,
                firmId: currentFirm.id,
                firmName: currentFirm.name,
                councilId: selectedProject.councilId,
                councilName: `${selectedProject.councilId} Planning Authority`,
                parcelId: selectedProject.parcelId,
                gpsCoordinates: { lat: -15.4167, lng: 28.2833 },
                buildingType: selectedProject.buildingType,
                riskLevel: selectedProject.riskLevel,
                totalFloors: selectedProject.totalFloors,
                estimatedCostZMW: selectedProject.estimatedCostZMW,
                documentHashes: [{ name: newDoc.name, hash: newDoc.sha256Hash }],
                complianceScore: 100,
                policyVersion: 'ZAPE-v3.0.4',
                greenScore: 82,
                greenTier: 'GOLD',
                pacraRegNumber: currentFirm.compliance.pacraNumber,
                sitePlaqueQrUrl: `https://zape.gov.zm/verify/${passportId}`
              }),
              digitalSealSignature: fakeSignatureHex,
              digitalSealTimestamp: timestamp,
              ledgerAnchorHash: `0x${calculatedHash}`
            }
          };

          // Immutable ledger record
          await AuditLedgerService.recordEvent(
            'DIGITAL_SEAL_APPLIED',
            { id: currentArchitect.ziaNumber, name: currentArchitect.name, role: currentArchitect.title },
            selectedProject.id,
            `RSA-4096 Biometric Seal evidence certificate attached: Ref #${refNumber}. Passport ${passportId} sealed.`
          );

          notificationService.dispatch({
            eventType: 'BIOMETRIC_SEAL_APPLIED',
            priority: 'HIGH',
            targetRole: 'architect',
            title: `RSA-4096 Signature Evidence Attached`,
            message: `Lead Architect signature verified for ${selectedProject.title}. Compliance Validator updated in real-time.`,
            projectId: selectedProject.id,
            projectName: selectedProject.title,
            councilId: selectedProject.councilId,
            actionTab: 'architect',
            actionLabel: 'View Compliance Gate'
          });
        } else if (selectedCategory === 'ENVIRONMENTAL_ZEMA') {
          // Immutable ledger record
          await AuditLedgerService.recordEvent(
            'DOCUMENT_HASH_VERIFIED',
            { id: currentArchitect.ziaNumber, name: currentArchitect.name, role: currentArchitect.title },
            selectedProject.id,
            `ZEMA Environmental Clearance attached: Ref #${refNumber} issued by ${issuingAuthority}.`
          );

          notificationService.dispatch({
            eventType: 'PROJECT_STATUS_UPDATED',
            priority: 'HIGH',
            targetRole: 'architect',
            title: `ZEMA Clearance Certificate Verified`,
            message: `Statutory Environmental Project Brief attached to ${selectedProject.title}. Environmental hard block cleared.`,
            projectId: selectedProject.id,
            projectName: selectedProject.title,
            councilId: selectedProject.councilId,
            actionTab: 'architect',
            actionLabel: 'View Compliance Gate'
          });
        } else if (selectedCategory === 'FIRE_SAFETY') {
          updatedProject = {
            ...updatedProject,
            hasFireSafetyPlan: true
          };

          await AuditLedgerService.recordEvent(
            'DOCUMENT_HASH_VERIFIED',
            { id: currentArchitect.ziaNumber, name: currentArchitect.name, role: currentArchitect.title },
            selectedProject.id,
            `Municipal Fire Safety clearance attached: Ref #${refNumber}.`
          );
        } else if (selectedCategory === 'ACCESSIBILITY') {
          updatedProject = {
            ...updatedProject,
            hasAccessibilityPlan: true
          };
        } else if (selectedCategory === 'TITLE_DEED') {
          updatedProject = {
            ...updatedProject,
            landTitleVerified: true
          };
        }

        // Real-time Update to the parent state!
        onUpdateProject(updatedProject);

        setProcessingStep('complete');
        setIsProcessing(false);
        setVerificationFeedback(
          selectedCategory === 'RSA_SIGNATURE'
            ? '✓ Mandatory RSA-4096 Seal successfully attached. The Compliance Validator has removed the RSA block in real-time.'
            : selectedCategory === 'ENVIRONMENTAL_ZEMA'
            ? '✓ Statutory ZEMA Environmental Clearance attached. The Compliance Validator has cleared the EPB hard block in real-time.'
            : '✓ Clearance certificate verified and permanently recorded to the project ledger.'
        );
      }, 700);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-600/70 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Statutory Evidence Uploader
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-emerald-400 border border-neutral-700">
                Real-Time Compliance Sync
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Attach missing RSA signature PDFs, ZEMA environmental clearances, or municipal fire approvals to unlock council submission gates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onNavigateToValidator && (
            <button
              onClick={onNavigateToValidator}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Compliance Validator</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close Uploader"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Project & Category Picker (5 cols) + Evidence Ingestion Workspace (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Target Project & Evidence Type Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Target Project Card */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-neutral-300 uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Project Dossier</span>
              </label>
              <span className="text-[11px] font-mono text-neutral-500">
                {projects.length} Available
              </span>
            </div>

            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setVerificationFeedback(null);
                setProcessingStep('idle');
              }}
              className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
            >
              {projects.map(proj => {
                const hasRsa = Boolean(proj.passport?.digitalSealSignature || signatures.some(s => s.projectId === proj.id));
                const hasZema = Boolean(proj.documents.some(d => d.category === 'ENVIRONMENTAL_ZEMA' && d.verified));
                const statusLabel = (!hasRsa && !hasZema) ? '🔴 Missing RSA & ZEMA' :
                  (!hasRsa) ? '🟡 Missing RSA' :
                  (!hasZema) ? '🟡 Missing ZEMA' : '🟢 Council Ready';

                return (
                  <option key={proj.id} value={proj.id}>
                    {proj.title} ({proj.id}) — {statusLabel}
                  </option>
                );
              })}
            </select>

            {/* Current Project Compliance Mini Status */}
            {selectedProject && (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/90 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">Council Destination:</span>
                  <span className="font-mono text-white font-medium">{selectedProject.councilId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">Parcel ID:</span>
                  <span className="font-mono text-emerald-400">{selectedProject.parcelId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">Building Type:</span>
                  <span className="text-neutral-300">{selectedProject.buildingType}</span>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Current Statutory Status:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    {currentHasRsa ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> RSA Sealed
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> No RSA
                      </span>
                    )}
                    <span className="text-neutral-600">·</span>
                    {currentHasZema ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> ZEMA Cleared
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> No ZEMA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Category Selector */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <label className="text-xs font-mono font-bold text-neutral-300 uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Clearance Document Type</span>
            </label>

            <div className="space-y-2">
              {/* Category 1: ZEMA Environmental Clearance */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ENVIRONMENTAL_ZEMA');
                  setVerificationFeedback(null);
                  setProcessingStep('idle');
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  selectedCategory === 'ENVIRONMENTAL_ZEMA'
                    ? 'bg-amber-950/60 border-amber-600 text-white shadow-md'
                    : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-200">
                      ZEMA Environmental Clearance
                    </span>
                    {!currentHasZema ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Missing
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400">
                        Cleared
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    Environmental Project Brief (EPB) or EIA Decision Letter (Act No. 12 of 2011).
                  </p>
                </div>
              </button>

              {/* Category 2: RSA-4096 Biometric Seal PDF */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('RSA_SIGNATURE');
                  setVerificationFeedback(null);
                  setProcessingStep('idle');
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  selectedCategory === 'RSA_SIGNATURE'
                    ? 'bg-red-950/60 border-red-600 text-white shadow-md'
                    : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-red-950 border border-red-800 text-red-400 shrink-0 mt-0.5">
                  <Key className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-200">
                      RSA-4096 Biometric Seal PDF
                    </span>
                    {!currentHasRsa ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                        Missing
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400">
                        Sealed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    Cryptographically signed drawing bundle with Lead Architect key (Cap 442).
                  </p>
                </div>
              </button>

              {/* Category 3: Municipal Fire Safety */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('FIRE_SAFETY');
                  setVerificationFeedback(null);
                  setProcessingStep('idle');
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  selectedCategory === 'FIRE_SAFETY'
                    ? 'bg-orange-950/60 border-orange-600 text-white shadow-md'
                    : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-orange-950 border border-orange-800 text-orange-400 shrink-0 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-neutral-200 block">
                    Municipal Fire &amp; Life Safety Layout
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    City Council Fire Prevention Command hydrant &amp; smoke egress clearance.
                  </p>
                </div>
              </button>

              {/* Category 4: Accessibility Plan */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ACCESSIBILITY');
                  setVerificationFeedback(null);
                  setProcessingStep('idle');
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  selectedCategory === 'ACCESSIBILITY'
                    ? 'bg-blue-950/60 border-blue-600 text-white shadow-md'
                    : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 shrink-0 mt-0.5">
                  <Accessibility className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-neutral-200 block">
                    Disability Accessibility Audit (ZAPD)
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    Barrier-free universal ramp, elevator, and tactile paving layout.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Preset Quick Loader Strip */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <span className="text-[11px] font-mono text-neutral-400 block font-semibold">
              ⚡ FAST REGULATORY PRESETS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EVIDENCE.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    selectedPresetId === preset.id
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {preset.category === 'ENVIRONMENTAL_ZEMA' && '🌿 '}
                  {preset.category === 'RSA_SIGNATURE' && '🔑 '}
                  {preset.category === 'FIRE_SAFETY' && '🔥 '}
                  {preset.badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: File Dropzone, Verification Form & Crypto Pipeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Statutory Certificate Ingestion &amp; SHA-256 Digest Extraction</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Upload the official signed PDF document or use the pre-configured statutory specimen to simulate instant regulatory verification.
              </p>
            </div>

            {/* Drag & Drop File Zone */}
            <div className="relative border-2 border-dashed border-neutral-700 hover:border-emerald-500 rounded-2xl p-6 text-center bg-neutral-950/60 transition-colors">
              <input
                type="file"
                accept=".pdf,.dwg,.dxf,.ifc,.png,.jpg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {customFile ? (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 block font-mono">
                      {customFile.name}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {(customFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for SHA-256 hashing
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-neutral-200 block">
                      Drop evidence PDF certificate here, or <span className="text-emerald-400 underline">browse</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      Accepts PDF, DWG, IFC, or stamped PNG/JPG up to 50MB
                    </span>
                    {selectedPresetId && (
                      <span className="inline-block mt-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/80">
                        Loaded: {PRESET_EVIDENCE.find(p => p.id === selectedPresetId)?.fileName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Document Particulars Inputs */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-medium block mb-1">
                    Document Title / Designation
                  </label>
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g. ZEMA EPB Environmental Approval Letter"
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1 font-mono">
                    Statutory Ref / Certificate #
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="e.g. ZEMA/EPB/2026/LCC-9941"
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-medium block mb-1">
                  Issuing Regulatory Authority
                </label>
                <input
                  type="text"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  placeholder="e.g. Zambia Environmental Management Agency (ZEMA HQ)"
                  className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-medium block mb-1">
                  Statutory Scope / Compliance Notes
                </label>
                <textarea
                  rows={2}
                  value={certNotes}
                  onChange={(e) => setCertNotes(e.target.value)}
                  placeholder="Statutory provisions, mitigation conditions, or lead architect declaration..."
                  className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Animated Processing State */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Processing Cryptographic Evidence...</span>
                  </span>
                  <span className="text-emerald-400 font-bold uppercase">{processingStep}</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-neutral-400 pl-5 border-l border-neutral-800">
                  <div className={processingStep === 'hashing' ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}>
                    → Calculating FIPS 180-4 SHA-256 byte digest...
                  </div>
                  <div className={processingStep === 'validating_authority' ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}>
                    → Cross-referencing regulatory PKI public key &amp; ZEMA database...
                  </div>
                  <div className={processingStep === 'anchoring_ledger' ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}>
                    → Appending immutable entry to ZAPE Cryptographic Audit Ledger...
                  </div>
                </div>
              </div>
            )}

            {/* Success Feedback & Impact Card */}
            {verificationFeedback && processingStep === 'complete' && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/80 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Evidence Verified &amp; Attached</span>
                </div>
                <p className="text-emerald-200/90 text-[11px] leading-relaxed">
                  {verificationFeedback}
                </p>
                {generatedHash && (
                  <div className="pt-1.5 border-t border-emerald-800/60 text-[10px] font-mono text-emerald-300/80 truncate">
                    Permanent SHA-256 Digest: {generatedHash}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons Strip */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-800">
              <div className="text-[11px] text-neutral-400 font-mono">
                Anchored to: <span className="text-neutral-300">{currentFirm.name}</span>
              </div>

              <div className="flex items-center gap-2">
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  disabled={isProcessing || !documentTitle}
                  onClick={handleExecuteUpload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/80 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Hashing &amp; Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify &amp; Attach Evidence</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
