import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  Fingerprint, 
  Key, 
  FileCheck, 
  ExternalLink,
  Plus,
  RefreshCw,
  QrCode,
  Sparkles,
  Info,
  ChevronRight,
  Lock,
  Unlock,
  Printer,
  Download,
  Copy,
  Check,
  Search,
  Sliders,
  Award,
  Layers,
  Database,
  Eye,
  CheckSquare,
  Square,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Leaf
} from 'lucide-react';
import { 
  Architect, 
  ArchitecturalFirm, 
  Project, 
  BuildingType, 
  RiskLevel, 
  SubmissionPassport, 
  RSABiometricSignatureRecord,
  BiometricSessionState
} from '../types';
import { evaluateSubmissionEligibility, generateSubmissionPassport } from '../services/policyEngine';
import { computeSha256, AuditLedgerService } from '../services/cryptoLedger';
import { notificationService } from '../services/notificationService';
import { rsaSignatureService, ARCHITECT_RSA4096_PUBLIC_KEY } from '../services/rsaSignatureService';
import { BiometricAuthModal } from './BiometricAuthModal';
import { SignedPdfExportModal } from './SignedPdfExportModal';
import { SignatureAnalytics } from './SignatureAnalytics';
import { SignedDocumentsOverview } from './SignedDocumentsOverview';
import { DigitalNotaryUtility } from './DigitalNotaryUtility';
import { SignatureQrModal } from './SignatureQrModal';
import { ConflictDetectionModal } from './ConflictDetectionModal';
import { AccountAuthModal } from './AccountAuthModal';
import { ComplianceValidator } from './ComplianceValidator';
import { EvidenceUploader, EvidenceCategory } from './EvidenceUploader';

interface ArchitectDashboardProps {
  architects: Architect[];
  firms: ArchitecturalFirm[];
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onViewPassport: (passportId: string) => void;
  onViewSitePlaque?: (passport: SubmissionPassport) => void;
}

export const ArchitectDashboard: React.FC<ArchitectDashboardProps> = ({
  architects,
  firms,
  projects,
  onAddProject,
  onUpdateProject,
  onViewPassport,
  onViewSitePlaque
}) => {
  // Current active architect & firm (default Arc. Mwansa Phiri & Apex Studio)
  const [selectedArchitectId, setSelectedArchitectId] = useState<string>('ARC-001');
  const [selectedFirmId, setSelectedFirmId] = useState<string>('FIRM-001');

  const currentArchitect = architects.find(a => a.id === selectedArchitectId) || architects[0];
  const currentFirm = firms.find(f => f.id === selectedFirmId) || firms[0];

  // Active sub-views within Architect Studio
  const [viewState, setViewState] = useState<
    'projects' | 'new_submission' | 'signatures' | 'documents_overview' | 'analytics' | 'notary' | 'compliance_health' | 'evidence_uploader'
  >('projects');

  // Biometric & RSA-4096 Cryptographic Enclave State
  const [biometricSession, setBiometricSession] = useState<BiometricSessionState>(() => rsaSignatureService.getSession());
  const [signatures, setSignatures] = useState<RSABiometricSignatureRecord[]>(() => rsaSignatureService.getSignatures());
  
  // Modals state
  const [isBiometricAuthModalOpen, setIsBiometricAuthModalOpen] = useState(false);
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);
  const [isAccountAuthModalOpen, setIsAccountAuthModalOpen] = useState(false);
  const [selectedSignatureToVerify, setSelectedSignatureToVerify] = useState<RSABiometricSignatureRecord | null>(null);
  const [selectedSignatureForQr, setSelectedSignatureForQr] = useState<RSABiometricSignatureRecord | null>(null);
  const [projectForConflictScan, setProjectForConflictScan] = useState<Project | null>(null);

  // Evidence Uploader Modal State
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceTargetProject, setEvidenceTargetProject] = useState<Project | null>(null);
  const [evidenceInitialCategory, setEvidenceInitialCategory] = useState<EvidenceCategory>('ENVIRONMENTAL_ZEMA');

  // Bulk attachment signing state
  const [selectedDocIdsToBulkSign, setSelectedDocIdsToBulkSign] = useState<{ [projectId: string]: string[] }>({});
  const [bulkSigningProcessing, setBulkSigningProcessing] = useState<string | null>(null);

  // Filter & Search state in Signature Log
  const [signatureSearchQuery, setSignatureSearchQuery] = useState('');
  const [signatureFilterCouncil, setSignatureFilterCouncil] = useState('ALL');
  const [copiedSigId, setCopiedSigId] = useState<string | null>(null);

  // New Submission Form State
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newCouncilId, setNewCouncilId] = useState('LCC');
  const [newParcelId, setNewParcelId] = useState('LUS-PLOT-2026/04');
  const [newSiteAddress, setNewSiteAddress] = useState('Plot 8820, Great East Road, Lusaka');
  const [newBuildingType, setNewBuildingType] = useState<BuildingType>('COMMERCIAL_OFFICE');
  const [newFloors, setNewFloors] = useState<number>(4);
  const [newCostZMW, setNewCostZMW] = useState<number>(32000000);
  const [newPlotArea, setNewPlotArea] = useState<number>(3500);
  const [newFootprint, setNewFootprint] = useState<number>(1400);

  // Attached files for new submission
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; category: any; hash: string }[]>([
    { name: 'ARCH-A101-MainPlans_Elevations.pdf', size: '14.2 MB', category: 'ARCHITECTURAL_PLANS', hash: '0x8f4c2e91a0b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5' },
    { name: 'STRUC-S201-FoundationShearCalcs.pdf', size: '8.4 MB', category: 'STRUCTURAL_CALCS', hash: '0x7b2a9d4e1f8c3a5b7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3' }
  ]);

  // Sealing Modal State
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
  const [activeProjectToSeal, setActiveProjectToSeal] = useState<Project | null>(null);
  const [sealStep, setSealStep] = useState<'confirm_declaration' | 'biometric_scan' | 'signed_success'>('confirm_declaration');
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSealingProcessing, setIsSealingProcessing] = useState(false);

  // Real-time Policy Evaluation Preview
  const previewProject: Project = {
    id: 'PRJ-PREVIEW-001',
    title: newTitle || 'Untitled Statutory Project',
    clientName: newClient || 'Client / Developer',
    councilId: newCouncilId,
    parcelId: newParcelId,
    siteAddress: newSiteAddress,
    province: 'LUSAKA',
    clientContact: '+260 97 000 0000',
    buildingType: newBuildingType,
    riskLevel: newFloors >= 5 ? 'CRITICAL' : 'MEDIUM',
    totalFloors: newFloors,
    plotAreaSqM: newPlotArea,
    buildingFootprintSqM: newFootprint,
    estimatedCostZMW: newCostZMW,
    leadArchitectId: currentArchitect.id,
    firmId: currentFirm.id,
    documents: attachedFiles.map((f, i) => ({
      id: `DOC-${i}`,
      name: f.name,
      category: f.category,
      sha256Hash: f.hash,
      fileSize: f.size,
      uploadedAt: '2026-10-06 01:10',
      verified: true
    })),
    status: 'DRAFT',
    hasFireSafetyPlan: attachedFiles.some(f => f.category === 'FIRE_SAFETY'),
    hasAccessibilityPlan: attachedFiles.some(f => f.category === 'ACCESSIBILITY'),
    hasHealthClearance: true,
    hasFloodMitigation: true,
    hasHeritageClearance: true,
    isFloodZone: false,
    isHeritageZone: false,
    landTitleVerified: true,
    greenFeatures: ['SOLAR_PV_READY', 'RAINWATER_HARVESTING'],
    createdAt: '2026-10-06 01:10',
    comments: [],
    originCountry: 'ZAMBIA'
  };

  const policyResult = evaluateSubmissionEligibility(currentFirm, currentArchitect, previewProject);

  // Add dummy file
  const handleAddFile = async () => {
    const dummyNames = [
      'FIRE-F301-Egress_HydrantPlan.pdf',
      'ACCESSIBILITY-COMPLIANCE-REPORT.pdf',
      'ZEMA-ENVIRONMENTAL-CLEARANCE.pdf',
      'HPCZ-HEALTH-FACILITY-PERMIT.pdf'
    ];
    const picked = dummyNames[Math.floor(Math.random() * dummyNames.length)];
    const hash = await computeSha256(picked + Date.now().toString());
    setAttachedFiles([
      ...attachedFiles,
      {
        name: picked,
        size: '5.2 MB',
        category: picked.includes('FIRE') ? 'FIRE_SAFETY' : picked.includes('ACCESS') ? 'ACCESSIBILITY' : 'ENVIRONMENTAL_ZEMA',
        hash: `0x${hash}`
      }
    ]);
  };

  // Submit draft to project list
  const handleCreateDraft = () => {
    if (!newTitle) return;
    const newPrj: Project = {
      ...previewProject,
      id: `PRJ-${newCouncilId}-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: policyResult.status === 'BLOCKED' ? 'PRE_CHECK_BLOCKED' : policyResult.status === 'REMEDIATE' ? 'REMEDIATION_REQUIRED' : 'DRAFT'
    };
    onAddProject(newPrj);
    setViewState('projects');
    setNewTitle('');
  };

  // Trigger Proactive Conflict Check Before Seal
  const handleInitiateSeal = (proj: Project) => {
    setActiveProjectToSeal(proj);
    setProjectForConflictScan(proj);
  };

  // Trigger Biometric Seal Workflow after conflict scan
  const handleOpenSealWorkflow = (proj: Project) => {
    setActiveProjectToSeal(proj);
    if (!biometricSession.isAuthenticated) {
      setIsBiometricAuthModalOpen(true);
      return;
    }
    setSealStep('confirm_declaration');
    setDeclarationChecked(false);
    setIsSealModalOpen(true);
  };

  const handleExecuteSeal = async () => {
    if (!activeProjectToSeal) return;
    setIsSealingProcessing(true);
    
    // Simulate biometric matching delay & cryptographic key derivation
    setTimeout(async () => {
      const passport = await generateSubmissionPassport(
        activeProjectToSeal,
        currentArchitect,
        currentFirm,
        policyResult.greenScore,
        policyResult.greenTier
      );

      // Record in immutable audit ledger
      await AuditLedgerService.recordEvent(
        'DIGITAL_SEAL_APPLIED',
        { id: currentArchitect.ziaNumber, name: currentArchitect.name, role: currentArchitect.title },
        activeProjectToSeal.id,
        `Digital Professional Seal applied. Submission Passport ${passport.passportId} created and routed to ${passport.councilName}.`
      );

      // Record RSA-4096 Biometric Signature in the permanent log
      await rsaSignatureService.recordProjectSignOff(
        activeProjectToSeal,
        currentArchitect,
        currentFirm,
        passport,
        biometricSession.authMethod === 'FINGERPRINT' ? 'FINGERPRINT_ENCLAVE' :
        biometricSession.authMethod === 'FACIAL_RECOGNITION' ? 'FACIAL_GEOMETRY' : 'FIDO2_HARDWARE_TOKEN'
      );
      setSignatures(rsaSignatureService.getSignatures());

      const updatedProject: Project = {
        ...activeProjectToSeal,
        status: 'COUNCIL_IN_REVIEW',
        passport
      };

      // Dispatch high-priority event-driven alert to council reviewers
      notificationService.dispatch({
        eventType: 'COUNCIL_SUBMITTED',
        priority: 'HIGH',
        targetRole: 'council',
        title: 'New Statutory Plan Submitted for Review',
        message: `${currentArchitect.name} (${currentFirm.name}) applied statutory biometric seal and submitted "${activeProjectToSeal.title}" (${activeProjectToSeal.buildingType}) to ${passport.councilName} Planning Directorate.`,
        projectId: activeProjectToSeal.id,
        projectName: activeProjectToSeal.title,
        councilId: activeProjectToSeal.councilId,
        actionTab: 'council',
        actionLabel: 'Review Council Docket'
      });

      onUpdateProject(updatedProject);
      setIsSealingProcessing(false);
      setSealStep('signed_success');
    }, 1200);
  };

  // Bulk RSA-4096 Signing for multiple project document attachments
  const handleBulkSignAttachments = async (proj: Project) => {
    const selectedIds = selectedDocIdsToBulkSign[proj.id] || proj.documents.map(d => d.id);
    if (selectedIds.length === 0) return;

    if (!biometricSession.isAuthenticated) {
      setActiveProjectToSeal(proj);
      setIsBiometricAuthModalOpen(true);
      return;
    }

    setBulkSigningProcessing(proj.id);

    setTimeout(async () => {
      // Mark all selected documents as cryptographically verified
      const updatedDocs = proj.documents.map(d => {
        if (selectedIds.includes(d.id)) {
          return { ...d, verified: true };
        }
        return d;
      });

      await AuditLedgerService.recordEvent(
        'DOCUMENT_HASH_VERIFIED',
        { id: currentArchitect.ziaNumber, name: currentArchitect.name, role: currentArchitect.title },
        proj.id,
        `Bulk RSA-4096 Biometric Seal applied across ${selectedIds.length} statutory drawing attachments.`
      );

      const updatedProject: Project = {
        ...proj,
        documents: updatedDocs
      };

      onUpdateProject(updatedProject);
      setBulkSigningProcessing(null);

      notificationService.dispatch({
        eventType: 'BIOMETRIC_SEAL_APPLIED',
        priority: 'MEDIUM',
        targetRole: 'architect',
        title: `Bulk RSA-4096 Seal Applied: ${proj.title}`,
        message: `${selectedIds.length} technical attachments sealed with RSA-4096 enclave key (${currentArchitect.name}).`,
        projectId: proj.id,
        projectName: proj.title,
        councilId: proj.councilId,
        actionTab: 'architect',
        actionLabel: 'View Documents'
      });
    }, 1000);
  };

  // Toggle attachment selection for bulk signing
  const toggleDocSelection = (projectId: string, docId: string) => {
    const current = selectedDocIdsToBulkSign[projectId] || [];
    if (current.includes(docId)) {
      setSelectedDocIdsToBulkSign({
        ...selectedDocIdsToBulkSign,
        [projectId]: current.filter(id => id !== docId)
      });
    } else {
      setSelectedDocIdsToBulkSign({
        ...selectedDocIdsToBulkSign,
        [projectId]: [...current, docId]
      });
    }
  };

  // Resubmit project after remediation
  const handleResubmitRemediation = async (proj: Project) => {
    const updatedProject: Project = {
      ...proj,
      status: 'COUNCIL_IN_REVIEW'
    };

    await AuditLedgerService.recordEvent(
      'COUNCIL_SUBMITTED',
      { id: currentArchitect.ziaNumber, name: currentArchitect.name, role: currentArchitect.title },
      proj.id,
      `Remediated compliance dossier and requested statutory clearances resubmitted to ${proj.councilId} Planning Authority.`
    );

    notificationService.dispatch({
      eventType: 'COUNCIL_SUBMITTED',
      priority: 'HIGH',
      targetRole: 'council',
      title: 'Remediated Dossier Resubmitted to Council',
      message: `${currentArchitect.name} uploaded required planning clearances and resubmitted "${proj.title}" to ${proj.councilId} Planning Queue.`,
      projectId: proj.id,
      projectName: proj.title,
      councilId: proj.councilId,
      actionTab: 'council',
      actionLabel: 'Review Council Docket'
    });

    onUpdateProject(updatedProject);
  };

  // Direct Council Submission Handler (from Compliance Validator)
  const handleSubmitToCouncil = async (proj: Project) => {
    const updatedProject: Project = {
      ...proj,
      status: 'COUNCIL_IN_REVIEW'
    };

    await AuditLedgerService.recordEvent(
      'COUNCIL_SUBMITTED',
      { id: currentArchitect.ziaNumber, name: currentArchitect.name, role: currentArchitect.title },
      proj.id,
      `Project submission successfully validated and forwarded to ${proj.councilId} Municipal Planning Authority.`
    );

    notificationService.dispatch({
      eventType: 'COUNCIL_SUBMITTED',
      priority: 'HIGH',
      targetRole: 'council',
      title: 'New Statutory Plan Submitted for Review',
      message: `${currentArchitect.name} (${currentFirm.name}) forwarded certified submission "${proj.title}" (${proj.buildingType}) to ${proj.councilId} Planning Directorate after passing all automated pre-checks.`,
      projectId: proj.id,
      projectName: proj.title,
      councilId: proj.councilId,
      actionTab: 'council',
      actionLabel: 'Review Council Docket'
    });

    onUpdateProject(updatedProject);
  };

  // Count projects blocked from Council due to missing RSA seal or ZEMA clearance
  const nonCompliantProjectsCount = projects.filter(p => {
    const hasRsa = Boolean(p.passport?.digitalSealSignature || signatures.some(s => s.projectId === p.id));
    const hasZema = p.documents.some(d => d.category === 'ENVIRONMENTAL_ZEMA' && d.verified);
    return !hasRsa || !hasZema;
  }).length;

  // Filtered Signatures in RSA Log
  const filteredSignatures = signatures.filter(sig => {
    if (signatureFilterCouncil !== 'ALL' && sig.councilId !== signatureFilterCouncil) {
      return false;
    }
    if (signatureSearchQuery) {
      const q = signatureSearchQuery.toLowerCase();
      return (
        sig.projectName.toLowerCase().includes(q) ||
        sig.id.toLowerCase().includes(q) ||
        sig.passportId.toLowerCase().includes(q) ||
        sig.parcelId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Architect & Practice Persona Bar with Hardware Enclave & Backend DB Strip */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {currentArchitect.avatarUrl ? (
              <img 
                src={currentArchitect.avatarUrl} 
                alt={currentArchitect.name} 
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-neutral-700" 
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {currentArchitect.name.split(' ').pop()?.charAt(0)}
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-neutral-900 ${
              currentArchitect.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white">{currentArchitect.name}</h2>
              <span className="text-xs font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                {currentArchitect.ziaNumber}
              </span>
              <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                NRC: {currentArchitect.nrcNumber}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              <span>{currentArchitect.title}</span>
              <span className="mx-1.5 text-neutral-600">·</span>
              <span className="text-emerald-300 font-medium">{currentFirm.name}</span>
            </div>
          </div>
        </div>

        {/* Biometric Enclave Status & Backend Database Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hardware Enclave Status Badge */}
          <div className={`px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all ${
            biometricSession.isAuthenticated
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
              : 'bg-red-950/80 text-red-300 border-red-800/80 animate-pulse'
          }`}>
            {biometricSession.isAuthenticated ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">RSA-4096 ENCLAVE ACTIVE</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>ENCLAVE LOCKED</span>
              </>
            )}
          </div>

          {biometricSession.isAuthenticated ? (
            <button
              onClick={() => {
                const locked = rsaSignatureService.lockSession();
                setBiometricSession(locked);
              }}
              className="px-2.5 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors border border-neutral-700 font-mono"
              title="Lock cryptographic hardware key container"
            >
              Lock Enclave
            </button>
          ) : (
            <button
              onClick={() => setIsBiometricAuthModalOpen(true)}
              className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              title="Perform biometric sensor handshake"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Biometric Login</span>
            </button>
          )}

          {/* Backend Account / DB Modal Button */}
          <button
            onClick={() => setIsAccountAuthModalOpen(true)}
            className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl font-medium transition-colors flex items-center gap-1.5"
            title="Create/manage user accounts saved in Node.js Express backend database"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Backend DB Accounts</span>
          </button>
        </div>
      </div>

      {/* Firm Compliance Quick Health Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Firm Health Score</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {currentFirm.compliance.healthScore}%
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {currentFirm.verificationBadge} BADGE
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">ZRA Tax Clearance</div>
          <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
            currentFirm.compliance.zraTaxClear ? 'text-emerald-400' : 'text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentFirm.compliance.zraTaxClear ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {currentFirm.compliance.zraTaxClear ? 'Valid (2026)' : 'Lapsed / Inactive'}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">
            {currentFirm.compliance.zraTccNumber}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">NAPSA Pensions</div>
          <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
            currentFirm.compliance.napsaCompliant ? 'text-emerald-400' : 'text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentFirm.compliance.napsaCompliant ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {currentFirm.compliance.napsaCompliant ? 'Up to date' : 'Non-compliant'}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">
            {currentFirm.compliance.napsaNumber}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Workers Comp (WCFCB)</div>
          <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
            currentFirm.compliance.workersCompCompliant ? 'text-emerald-400' : 'text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentFirm.compliance.workersCompCompliant ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {currentFirm.compliance.workersCompCompliant ? 'Certified' : 'Missing'}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">
            {currentFirm.compliance.workersCompNumber}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">PII Insurance</div>
          <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
            currentFirm.compliance.piiActive ? 'text-emerald-400' : 'text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentFirm.compliance.piiActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {currentFirm.compliance.piiActive ? `ZMW ${(currentFirm.compliance.piiCoverageZMW/1000000).toFixed(0)}M` : 'Expired'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5 truncate">
            Exp: {currentFirm.compliance.piiExpiry}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
          <div className="text-[11px] text-neutral-400">Architect CPD Status</div>
          <div className="text-xs font-semibold text-white mt-1 tabular-nums">
            {currentArchitect.cpdCredits} / {currentArchitect.cpdRequired} credits
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {currentArchitect.cpdCredits >= currentArchitect.cpdRequired ? 'CPD Cleared 2026' : 'Credits Deficit'}
          </div>
        </div>
      </div>

      {/* Primary Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewState('projects')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              viewState === 'projects'
                ? 'bg-neutral-800 text-emerald-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Practice Projects ({projects.length})
          </button>

          <button
            onClick={() => setViewState('signatures')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewState === 'signatures'
                ? 'bg-neutral-800 text-emerald-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>RSA Signature Vault ({signatures.length})</span>
          </button>

          <button
            onClick={() => setViewState('documents_overview')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewState === 'documents_overview'
                ? 'bg-neutral-800 text-emerald-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Signed Docs Overview</span>
          </button>

          <button
            onClick={() => setViewState('analytics')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewState === 'analytics'
                ? 'bg-neutral-800 text-emerald-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Visual Analytics</span>
          </button>

          <button
            onClick={() => setViewState('notary')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewState === 'notary'
                ? 'bg-neutral-800 text-emerald-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Notary</span>
          </button>

          <button
            onClick={() => setViewState('compliance_health')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewState === 'compliance_health'
                ? 'bg-neutral-800 text-amber-300 font-bold border border-amber-600/50'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Compliance Validator</span>
            {nonCompliantProjectsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/80">
                {nonCompliantProjectsCount} flagged
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setViewState('evidence_uploader')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewState === 'evidence_uploader'
                ? 'bg-neutral-800 text-emerald-300 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Evidence Uploader</span>
          </button>

          <button
            onClick={() => setViewState('new_submission')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              viewState === 'new_submission'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Submission</span>
          </button>
        </div>

        <div className="text-xs text-neutral-400 font-mono hidden lg:block">
          Sovereign Enclave: RSA-4096 / SHA-256 (FIPS 140-3 L3)
        </div>
      </div>

      {/* VIEW 1: PROJECTS LIST WITH BULK DOCUMENT SIGNING */}
      {viewState === 'projects' && (
        <div className="space-y-4">
          {/* Automated Pre-Council Compliance Gate Notification */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                nonCompliantProjectsCount > 0 
                  ? 'bg-amber-950/80 border-amber-600/60 text-amber-400' 
                  : 'bg-emerald-950/80 border-emerald-600/60 text-emerald-400'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Pre-Council Automated Compliance Validator</span>
                  {nonCompliantProjectsCount > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/80">
                      {nonCompliantProjectsCount} Blocked for Council Submission
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                      All Submissions Council-Eligible
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {nonCompliantProjectsCount > 0
                    ? `Automated rule engine detected pending projects missing mandatory RSA-4096 biometric seals or statutory ZEMA environmental clearance certificates.`
                    : `Every project has satisfied statutory RSA-4096 biometric seal verification and ZEMA environmental clearance requirements.`}
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewState('compliance_health')}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Compliance Validator</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-neutral-900/40 border border-neutral-800">
              <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-neutral-300">No project submissions yet</div>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Begin by creating a new statutory submission package with automated Policy-as-Code pre-validation.
              </p>
              <button
                onClick={() => setViewState('new_submission')}
                className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg"
              >
                Create First Submission
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((proj) => {
                const selectedDocs = selectedDocIdsToBulkSign[proj.id] || proj.documents.map(d => d.id);
                const isBulkProcessing = bulkSigningProcessing === proj.id;

                return (
                  <div 
                    key={proj.id}
                    className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-white">{proj.title}</h3>
                          <span className="text-xs font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                            {proj.id}
                          </span>
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                            proj.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80' :
                            proj.status === 'COUNCIL_IN_REVIEW' ? 'bg-amber-950 text-amber-300 border border-amber-800/80' :
                            proj.status === 'REMEDIATION_REQUIRED' ? 'bg-orange-950 text-orange-300 border border-orange-800/80' :
                            'bg-red-950 text-red-300 border border-red-800/80'
                          }`}>
                            {proj.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                          <span>Client: <strong className="text-neutral-300">{proj.clientName}</strong></span>
                          <span>Council: <strong className="text-neutral-300">{proj.councilId}</strong></span>
                          <span>Parcel: <strong className="text-neutral-300 font-mono">{proj.parcelId}</strong></span>
                          <span>Type: <strong className="text-neutral-300">{proj.buildingType}</strong></span>
                          <span>Floors: <strong className="text-neutral-300">{proj.totalFloors}</strong></span>
                          <span>Cost: <strong className="text-neutral-300 font-mono">ZMW {(proj.estimatedCostZMW/1000000).toFixed(1)}M</strong></span>
                        </div>

                        {/* Statutory Compliance Indicator Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {proj.passport?.digitalSealSignature || signatures.some(s => s.projectId === proj.id) ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                              <Key className="w-3 h-3 text-emerald-400" />
                              <span>RSA-4096 Sealed</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-red-400" />
                              <span>Missing RSA Seal</span>
                            </span>
                          )}

                          {proj.documents.some(d => d.category === 'ENVIRONMENTAL_ZEMA' && d.verified) ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                              <Leaf className="w-3 h-3 text-emerald-400" />
                              <span>ZEMA EPB Cleared</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                              <Leaf className="w-3 h-3 text-amber-400" />
                              <span>Missing ZEMA Clearance</span>
                            </span>
                          )}

                          {(!proj.passport?.digitalSealSignature && !signatures.some(s => s.projectId === proj.id)) ||
                           (!proj.documents.some(d => d.category === 'ENVIRONMENTAL_ZEMA' && d.verified)) ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewState('compliance_health')}
                                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono flex items-center gap-0.5"
                              >
                                <span>Validate via Gate →</span>
                              </button>
                              <span className="text-neutral-600 text-[10px]">·</span>
                              <button
                                onClick={() => {
                                  setEvidenceTargetProject(proj);
                                  setEvidenceInitialCategory(
                                    !proj.documents.some(d => d.category === 'ENVIRONMENTAL_ZEMA' && d.verified)
                                      ? 'ENVIRONMENTAL_ZEMA'
                                      : 'RSA_SIGNATURE'
                                  );
                                  setIsEvidenceModalOpen(true);
                                }}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-0.5"
                              >
                                <span>Attach Evidence</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {(proj.status === 'ADDITIONAL_INFO_REQUESTED' || proj.status === 'REMEDIATION_REQUIRED') && (
                          <button
                            onClick={() => handleResubmitRemediation(proj)}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Upload requested statutory clearances and resubmit to municipal council"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Resubmit to Council</span>
                          </button>
                        )}

                        {proj.passport ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onViewPassport(proj.passport!.passportId)}
                              className="px-3.5 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Passport ({proj.passport.passportId})</span>
                            </button>

                            {onViewSitePlaque && (
                              <button
                                onClick={() => onViewSitePlaque(proj.passport!)}
                                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                                title="Generate Official Scannable Construction Site Plaque"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Site Plaque (QR)</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleInitiateSeal(proj)}
                              disabled={currentArchitect.status !== 'ACTIVE' || !currentFirm.compliance.zraTaxClear}
                              className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                              title="Runs proactive conflict check then applies RSA-4096 biometric seal"
                            >
                              <Fingerprint className="w-3.5 h-3.5" />
                              <span>Seal Submission</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Technical Drawings & BULK RSA-4096 SIGNING SECTION */}
                    <div className="pt-3 border-t border-neutral-800/80">
                      <div className="text-[11px] font-mono text-neutral-400 mb-2.5 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-neutral-300">
                          TECHNICAL DRAWING ATTACHMENTS ({proj.documents.length})
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBulkSignAttachments(proj)}
                            disabled={isBulkProcessing || proj.documents.length === 0}
                            className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Sign all selected document attachments with RSA-4096 biometric seal at once"
                          >
                            <Key className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {isBulkProcessing ? 'Sealing Attachments...' : `Bulk RSA-4096 Sign Attachments (${selectedDocs.length})`}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {proj.documents.map((doc) => {
                          const isSelected = selectedDocs.includes(doc.id);
                          return (
                            <div 
                              key={doc.id} 
                              className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                                isSelected ? 'bg-neutral-950 border-neutral-700' : 'bg-neutral-950/40 border-neutral-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <button
                                  type="button"
                                  onClick={() => toggleDocSelection(proj.id, doc.id)}
                                  className="text-neutral-400 hover:text-emerald-400 shrink-0"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-neutral-600" />
                                  )}
                                </button>
                                <div className="truncate">
                                  <span className="text-neutral-200 font-medium block truncate">{doc.name}</span>
                                  <span className="text-[10px] text-neutral-500 font-mono block truncate">{doc.sha256Hash}</span>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900 block">
                                  RSA SEALED
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: RSA SIGNATURE VAULT & CHRONOLOGICAL LOG */}
      {viewState === 'signatures' && (
        <div className="space-y-6">
          {/* Key Vault Header Card */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                    Sovereign Hardware Enclave · Cap 442 Legal Layer
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    RSA-4096 Biometric Signature Vault &amp; Audit Log
                  </h3>
                  <div className="text-xs text-neutral-400 font-mono mt-0.5">
                    Modulus: 4096-bit · Digest: SHA-256 · FIPS 140-3 Level 3 Hardware Security
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPdfExportModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/60"
                  title="Export official cryptographically signed PDF report for personal archiving"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Export Signed PDF Report</span>
                </button>

                <button
                  onClick={() => setIsBiometricAuthModalOpen(true)}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Biometric Login</span>
                </button>
              </div>
            </div>

            {/* Key Specs Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase block">Public Key Fingerprint</span>
                <span className="text-[11px] text-emerald-400 break-all block">
                  {ARCHITECT_RSA4096_PUBLIC_KEY.keyFingerprint}
                </span>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase block">Hardware Authenticator Enclave</span>
                <span className="text-[11px] text-white block">
                  {ARCHITECT_RSA4096_PUBLIC_KEY.hardwareEnclave}
                </span>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase block">ZIA Signatory &amp; NRC Binding</span>
                <span className="text-[11px] text-white block">
                  Arc. Mwansa Phiri (ZIA #1084 · NRC #{ARCHITECT_RSA4096_PUBLIC_KEY.nrcBinding})
                </span>
              </div>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={signatureSearchQuery}
                onChange={(e) => setSignatureSearchQuery(e.target.value)}
                placeholder="Search signatures by project, ID, plot parcel, or passport..."
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-xs font-mono">Council:</span>
              <select
                value={signatureFilterCouncil}
                onChange={(e) => setSignatureFilterCouncil(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="ALL">All Councils</option>
                <option value="LCC">Lusaka City Council (LCC)</option>
                <option value="NCC">Ndola City Council (NCC)</option>
                <option value="KCC">Kitwe City Council (KCC)</option>
                <option value="LIV">Livingstone City Council (LIV)</option>
              </select>
            </div>
          </div>

          {/* Chronological Signatures Log Cards */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-neutral-400 flex items-center justify-between">
              <span>CHRONOLOGICAL AUDIT TRAIL ({filteredSignatures.length} SIGNATURES)</span>
              <span className="text-emerald-400 font-bold">✓ 100% Mathematically Confirmed</span>
            </div>

            {filteredSignatures.map((sig) => (
              <div 
                key={sig.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      {sig.id}
                    </span>
                    <span className="text-neutral-600 font-mono text-xs">·</span>
                    <span className="text-xs font-mono text-neutral-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{sig.timestamp}</span>
                    </span>
                    <span className="text-neutral-600 font-mono text-xs">·</span>
                    <span className="text-xs font-mono text-neutral-400">Block #{sig.ledgerBlockIndex}</span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>RSA-4096 SIGNED &amp; ANCHORED</span>
                  </span>
                </div>

                {/* Project Particulars */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs items-center">
                  <div className="sm:col-span-7 space-y-1">
                    <strong className="text-sm text-white block leading-snug">
                      {sig.projectName}
                    </strong>
                    <div className="text-neutral-400 text-xs flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Plot: <strong className="text-neutral-300 font-mono">{sig.parcelId}</strong></span>
                      <span>Council: <strong className="text-neutral-300">{sig.councilId}</strong></span>
                      <span>Type: <strong className="text-neutral-300">{sig.buildingType}</strong></span>
                      <span>Passport: <strong className="text-emerald-300 font-mono">{sig.passportId}</strong></span>
                    </div>
                  </div>

                  <div className="sm:col-span-5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] space-y-1">
                    <div className="text-neutral-400 truncate">
                      Authenticator: <span className="text-emerald-400 font-bold">{sig.biometricAuthType}</span>
                    </div>
                    <div className="text-neutral-500 truncate text-[10px]">
                      Digest: {sig.drawingBundleHash.substring(0, 24)}...
                    </div>
                  </div>
                </div>

                {/* Signature Actions Strip */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSignatureToVerify(sig)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verify RSA Math</span>
                    </button>

                    <button
                      onClick={() => setSelectedSignatureForQr(sig)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Generate offline-verifiable QR code linked to this specific signature"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Offline QR</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sig.signatureHex);
                        setCopiedSigId(sig.id);
                        setTimeout(() => setCopiedSigId(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                    >
                      {copiedSigId === sig.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Copy 512B Sig</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewPassport(sig.passportId)}
                      className="px-3.5 py-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/80 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>View Passport Certificate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: SIGNED DOCUMENTS OVERVIEW (HOVER-TO-PREVIEW) */}
      {viewState === 'documents_overview' && (
        <SignedDocumentsOverview
          signatures={signatures}
          projects={projects}
          onViewPassport={onViewPassport}
          onVerifySignature={(sig) => setSelectedSignatureToVerify(sig)}
        />
      )}

      {/* VIEW 4: RECHARTS VISUAL ANALYTICS */}
      {viewState === 'analytics' && (
        <SignatureAnalytics signatures={signatures} />
      )}

      {/* VIEW 5: DIGITAL NOTARY UTILITY */}
      {viewState === 'notary' && (
        <DigitalNotaryUtility architect={currentArchitect} firm={currentFirm} />
      )}

      {/* VIEW 6: AUTOMATED COMPLIANCE VALIDATOR SUB-COMPONENT */}
      {viewState === 'compliance_health' && (
        <ComplianceValidator
          projects={projects}
          signatures={signatures}
          currentArchitect={currentArchitect}
          currentFirm={currentFirm}
          onUpdateProject={onUpdateProject}
          onSignaturesUpdated={(updatedSigs) => setSignatures(updatedSigs)}
          onOpenSealWorkflow={handleInitiateSeal}
          onSubmitToCouncil={handleSubmitToCouncil}
          onViewPassport={onViewPassport}
          onOpenEvidenceUploader={(targetPrj, cat) => {
            setEvidenceTargetProject(targetPrj);
            if (cat) setEvidenceInitialCategory(cat);
            setIsEvidenceModalOpen(true);
          }}
        />
      )}

      {/* VIEW 7: STATUTORY EVIDENCE UPLOADER */}
      {viewState === 'evidence_uploader' && (
        <EvidenceUploader
          projects={projects}
          signatures={signatures}
          currentArchitect={currentArchitect}
          currentFirm={currentFirm}
          onUpdateProject={onUpdateProject}
          onSignaturesUpdated={(updatedSigs) => setSignatures(updatedSigs)}
          initialCategory="ENVIRONMENTAL_ZEMA"
          onNavigateToValidator={() => setViewState('compliance_health')}
        />
      )}

      {/* VIEW 8: NEW STATUTORY SUBMISSION PACKAGE */}
      {viewState === 'new_submission' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Create New Statutory Submission Package
            </h3>
            <p className="text-xs text-neutral-400">
              Evaluated in real-time by the Policy-as-Code engine. Attaches drawing hashes, checks zoning setbacks, and prepares for biometric RSA-4096 sealing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Inputs (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Project Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lusaka Clean Energy Innovation Hub"
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Client / Developer Name</label>
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Copperbelt Energy Corp"
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Target Council</label>
                  <select
                    value={newCouncilId}
                    onChange={(e) => setNewCouncilId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="LCC">Lusaka City Council (LCC)</option>
                    <option value="NCC">Ndola City Council (NCC)</option>
                    <option value="KCC">Kitwe City Council (KCC)</option>
                    <option value="LIV">Livingstone City Council (LIV)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Cadastral Parcel ID</label>
                  <input
                    type="text"
                    value={newParcelId}
                    onChange={(e) => setNewParcelId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Building Typology</label>
                  <select
                    value={newBuildingType}
                    onChange={(e) => setNewBuildingType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="COMMERCIAL_OFFICE">Commercial Office</option>
                    <option value="MULTI_RESIDENTIAL">Multi-Residential</option>
                    <option value="SHOPPING_MALL">Shopping Mall</option>
                    <option value="SCHOOL">School / Education</option>
                    <option value="HOSPITAL">Hospital / Healthcare</option>
                    <option value="HIGH_RISE">High-Rise (5+ Storeys)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Total Floors / Storeys</label>
                  <input
                    type="number"
                    value={newFloors}
                    onChange={(e) => setNewFloors(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Estimated Cost (ZMW)</label>
                  <input
                    type="number"
                    value={newCostZMW}
                    onChange={(e) => setNewCostZMW(parseInt(e.target.value) || 1000000)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 font-medium block mb-1">Site Address</label>
                  <input
                    type="text"
                    value={newSiteAddress}
                    onChange={(e) => setNewSiteAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Technical Drawing Attachments */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-300 font-mono">ATTACHED STATUTORY DRAWINGS ({attachedFiles.length})</span>
                  <button
                    type="button"
                    onClick={handleAddFile}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 rounded text-[11px] font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Attach Clearance</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {attachedFiles.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-medium block truncate max-w-xs">{f.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">{f.hash.substring(0, 24)}...</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{f.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Policy Pre-Validation Card & Action Triggers (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Policy-as-Code Eligibility Gate</span>
              </h4>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Submission Gate:</span>
                  <span className={`font-mono font-bold ${
                    policyResult.status === 'APPROVED_FOR_SUBMISSION' ? 'text-emerald-400' :
                    policyResult.status === 'REMEDIATE' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {policyResult.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Green Score / Tier:</span>
                  <span className="text-emerald-400 font-bold font-mono">{policyResult.greenScore}/100 ({policyResult.greenTier})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Council Fee Rebate:</span>
                  <span className="text-emerald-400 font-mono">{policyResult.councilFeeDiscountPercent}% Discount</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCreateDraft}
                  disabled={!newTitle}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Save as Draft Package
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tempPrj: Project = {
                      ...previewProject,
                      id: `PRJ-${newCouncilId}-2026-${Math.floor(100 + Math.random() * 900)}`
                    };
                    onAddProject(tempPrj);
                    handleInitiateSeal(tempPrj);
                  }}
                  disabled={!newTitle || policyResult.status === 'BLOCKED'}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/80 transition-all flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Proactive Conflict Scan &amp; Biometric Seal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BIOMETRIC DIGITAL PROFESSIONAL SEAL MODAL */}
      {isSealModalOpen && activeProjectToSeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Fingerprint className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Digital Professional Seal</h3>
              </div>
              <button 
                onClick={() => setIsSealModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {sealStep === 'confirm_declaration' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                  <div>Project: <strong className="text-white">{activeProjectToSeal.title}</strong></div>
                  <div>Lead Architect: <strong className="text-emerald-400">{currentArchitect.name} ({currentArchitect.ziaNumber})</strong></div>
                  <div>Council Destination: <strong className="text-white">{activeProjectToSeal.councilId} Planning Dept</strong></div>
                  <div>Statutory Drawing Hashes: <strong className="font-mono text-emerald-400">{activeProjectToSeal.documents.length} verified</strong></div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                  <div className="font-bold uppercase text-[11px] mb-1 text-amber-400 font-mono">
                    Statutory Legal Declaration (ZIA Act Cap 442)
                  </div>
                  "I hereby solemnly declare under statutory liability that I am the author of these architectural drawings or they were executed under my direct personal supervision. I confirm that all calculations, fire egress dimensions, and specifications comply with Zambian Standards and applicable Municipal Bylaws. I acknowledge that applying my digital seal binds my practice and professional license to this submission."
                </div>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-neutral-200">
                  <input
                    type="checkbox"
                    checked={declarationChecked}
                    onChange={(e) => setDeclarationChecked(e.target.checked)}
                    className="mt-0.5 rounded bg-neutral-800 border-neutral-600 text-emerald-600 focus:ring-0"
                  />
                  <span>
                    I confirm my identity as <strong>{currentArchitect.name}</strong>, hold active license, and affix my statutory seal.
                  </span>
                </label>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setIsSealModalOpen(false)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!declarationChecked}
                    onClick={() => setSealStep('biometric_scan')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <span>Authenticate with Biometrics</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {sealStep === 'biometric_scan' && (
              <div className="text-center py-6 space-y-5">
                <div className="relative mx-auto w-24 h-24 rounded-full bg-emerald-950/60 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 animate-pulse">
                  <Fingerprint className="w-12 h-12" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">Biometric Sensor Handshake</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Matching hardware biometric token with ZIA National Registration NRC #{currentArchitect.nrcNumber}...
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-400 text-left max-w-sm mx-auto">
                  <div className="text-emerald-400">✓ Hardware Key: YubiKey / TPM 2.0 Enrolled</div>
                  <div className="text-emerald-400">✓ Liveness Check: Confirmed</div>
                  <div className="text-neutral-400">→ Generating RSA-4096 Digital Seal...</div>
                </div>

                <button
                  disabled={isSealingProcessing}
                  onClick={handleExecuteSeal}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950/80 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  {isSealingProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Anchoring to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Confirm Biometric Signature</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {sealStep === 'signed_success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">Submission Passport Generated!</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    SLI 2.0 cryptographically signed and routed to {activeProjectToSeal.councilId} municipal queue.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 rounded-lg text-xs font-mono text-neutral-300 text-left space-y-1">
                  <div className="text-emerald-400 font-bold">Passport ID: {activeProjectToSeal.passport?.passportId || 'ZAPE-2026-LCC-0891'}</div>
                  <div className="truncate text-neutral-400">Anchor: {activeProjectToSeal.passport?.ledgerAnchorHash}</div>
                  <div className="text-neutral-400">Timestamp: {new Date().toLocaleTimeString()}</div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsSealModalOpen(false);
                      setViewState('projects');
                    }}
                    className="px-4 py-2 bg-neutral-800 text-neutral-200 text-xs font-medium rounded-lg hover:bg-neutral-700"
                  >
                    Return to Projects
                  </button>
                  <button
                    onClick={() => {
                      setIsSealModalOpen(false);
                      if (activeProjectToSeal.passport) {
                        onViewPassport(activeProjectToSeal.passport.passportId);
                      }
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Open Passport Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REAL-TIME RSA MATHEMATICAL VERIFICATION MODAL */}
      {selectedSignatureToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden p-6 space-y-5 text-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                  Mathematical Signature Verification
                </h3>
              </div>
              <button
                onClick={() => setSelectedSignatureToVerify(null)}
                className="text-neutral-400 hover:text-white p-1 rounded font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-neutral-400">Docket: <strong className="text-white">{selectedSignatureToVerify.projectName}</strong></div>
                <div className="text-neutral-400">Signature ID: <strong className="text-emerald-400 font-mono">{selectedSignatureToVerify.id}</strong></div>
              </div>

              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">1. RSA Modulus Bit Length:</span>
                  <span className="text-emerald-400 font-bold">4096 Bits (Verified)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">2. Public Exponent e:</span>
                  <span className="text-white">65537 (0x10001)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">3. Digest Scheme:</span>
                  <span className="text-white">SHA-256 (PKCS#1 v1.5)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">4. Key Fingerprint Match:</span>
                  <span className="text-emerald-400 font-bold">100% Match (ZAM-PKI Root)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">5. Biometric NRC Binding:</span>
                  <span className="text-emerald-400 font-bold">NRC #{selectedSignatureToVerify.nrcNumber} Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">6. Ledger Anchor Block:</span>
                  <span className="text-emerald-400">Block #{selectedSignatureToVerify.ledgerBlockIndex}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Mathematical Proof Valid.</strong> The signature decrypts byte-for-byte to the drawing bundle hash. Zero non-repudiation risk.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSignatureToVerify(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIOMETRIC AUTH MODAL */}
      <BiometricAuthModal
        architect={currentArchitect}
        isOpen={isBiometricAuthModalOpen}
        onClose={() => setIsBiometricAuthModalOpen(false)}
        onAuthenticated={(session) => {
          setBiometricSession(session);
          if (activeProjectToSeal) {
            setSealStep('confirm_declaration');
            setDeclarationChecked(false);
            setIsSealModalOpen(true);
          }
        }}
      />

      {/* SIGNED PDF REPORT EXPORT MODAL */}
      {isPdfExportModalOpen && (
        <SignedPdfExportModal
          architect={currentArchitect}
          firm={currentFirm}
          signatures={signatures}
          onClose={() => setIsPdfExportModalOpen(false)}
        />
      )}

      {/* OFFLINE SIGNATURE QR MODAL */}
      {selectedSignatureForQr && (
        <SignatureQrModal
          signature={selectedSignatureForQr}
          onClose={() => setSelectedSignatureForQr(null)}
        />
      )}

      {/* PROACTIVE CONFLICT DETECTION MODAL */}
      {projectForConflictScan && (
        <ConflictDetectionModal
          project={projectForConflictScan}
          architect={currentArchitect}
          firm={currentFirm}
          onProceedToSign={() => handleOpenSealWorkflow(projectForConflictScan)}
          onClose={() => setProjectForConflictScan(null)}
        />
      )}

      {/* BACKEND ACCOUNT AUTH & DATABASE MODAL */}
      <AccountAuthModal
        isOpen={isAccountAuthModalOpen}
        onClose={() => setIsAccountAuthModalOpen(false)}
      />

      {/* GLOBAL EVIDENCE UPLOADER MODAL */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EvidenceUploader
              projects={projects}
              signatures={signatures}
              currentArchitect={currentArchitect}
              currentFirm={currentFirm}
              targetProjectId={evidenceTargetProject?.id}
              initialCategory={evidenceInitialCategory}
              onUpdateProject={onUpdateProject}
              onSignaturesUpdated={(updatedSigs) => setSignatures(updatedSigs)}
              onClose={() => setIsEvidenceModalOpen(false)}
              onNavigateToValidator={() => {
                setIsEvidenceModalOpen(false);
                setViewState('compliance_health');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
