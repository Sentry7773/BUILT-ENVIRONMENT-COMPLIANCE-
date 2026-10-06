import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Upload, 
  Send, 
  Search, 
  Filter, 
  ArrowRight, 
  RefreshCw,
  Building,
  ExternalLink,
  Flame,
  Accessibility,
  Lock,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Project, ProjectDocument, RSABiometricSignatureRecord, Architect, ArchitecturalFirm } from '../types';
import { computeSha256 } from '../services/cryptoLedger';
import { notificationService } from '../services/notificationService';
import { EvidenceUploader, EvidenceCategory } from './EvidenceUploader';

interface ComplianceValidatorProps {
  projects: Project[];
  signatures: RSABiometricSignatureRecord[];
  onUpdateProject: (project: Project) => void;
  onOpenSealWorkflow: (project: Project) => void;
  onSubmitToCouncil: (project: Project) => void;
  onViewPassport: (passportId: string) => void;
  currentArchitect?: Architect;
  currentFirm?: ArchitecturalFirm;
  onSignaturesUpdated?: (signatures: RSABiometricSignatureRecord[]) => void;
  onOpenEvidenceUploader?: (project: Project, category?: EvidenceCategory) => void;
}

interface ValidationReport {
  projectId: string;
  project: Project;
  hasRsaSignature: boolean;
  rsaSignatureRecord?: RSABiometricSignatureRecord;
  hasZemaClearance: boolean;
  zemaDocument?: ProjectDocument;
  hasFireSafety: boolean;
  hasAccessibility: boolean;
  hasLandTitle: boolean;
  hardBlocks: { ruleId: string; title: string; act: string; description: string }[];
  warnings: { ruleId: string; title: string; description: string }[];
  isCouncilEligible: boolean;
  complianceScore: number;
}

export const ComplianceValidator: React.FC<ComplianceValidatorProps> = ({
  projects,
  signatures,
  onUpdateProject,
  onOpenSealWorkflow,
  onSubmitToCouncil,
  onViewPassport,
  currentArchitect,
  currentFirm,
  onSignaturesUpdated,
  onOpenEvidenceUploader
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'BLOCKED_RSA' | 'BLOCKED_ZEMA' | 'ALL_BLOCKED' | 'ELIGIBLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [isAttachingZema, setIsAttachingZema] = useState<string | null>(null);

  // Evidence Uploader Modal State
  const [evidenceModalProject, setEvidenceModalProject] = useState<Project | null>(null);
  const [evidenceModalCategory, setEvidenceModalCategory] = useState<EvidenceCategory>('ENVIRONMENTAL_ZEMA');

  // Evaluate statutory validation rules for each project
  const reports: ValidationReport[] = projects.map(proj => {
    // 1. RSA-4096 Signature Check
    const sig = signatures.find(s => s.projectId === proj.id);
    const hasRsaSignature = Boolean(proj.passport?.digitalSealSignature || sig);

    // 2. ZEMA Environmental Clearance Check
    const zemaDoc = proj.documents.find(
      d => d.category === 'ENVIRONMENTAL_ZEMA' && d.verified
    );
    const hasZemaClearance = Boolean(zemaDoc);

    // 3. Other clearances
    const hasFireSafety = proj.hasFireSafetyPlan || proj.documents.some(d => d.category === 'FIRE_SAFETY' && d.verified);
    const hasAccessibility = proj.hasAccessibilityPlan || proj.documents.some(d => d.category === 'ACCESSIBILITY' && d.verified);
    const hasLandTitle = proj.landTitleVerified || proj.documents.some(d => d.category === 'TITLE_DEED');

    const hardBlocks: ValidationReport['hardBlocks'] = [];
    const warnings: ValidationReport['warnings'] = [];

    // Rule: Mandatory RSA Signature
    if (!hasRsaSignature) {
      hardBlocks.push({
        ruleId: 'STAT_RSA_SEAL_REQUIRED',
        title: 'Mandatory RSA-4096 Biometric Seal Missing',
        act: 'Architects Act Cap 442 Section 18 & ZAPE Digital By-laws 2026',
        description: 'Every technical drawing package submitted to municipal planning must be cryptographically sealed by the registered Lead Architect.'
      });
    }

    // Rule: Mandatory ZEMA Environmental Clearance
    if (!hasZemaClearance) {
      hardBlocks.push({
        ruleId: 'STAT_ZEMA_EPB_REQUIRED',
        title: 'ZEMA Environmental Clearance Certificate Missing',
        act: 'Environmental Management Act No. 12 of 2011 (EMA Regulations)',
        description: `Statutory ZEMA clearance (Environmental Project Brief EPB / EIA Decision Letter) is mandatory for ${proj.buildingType.replace(/_/g, ' ')} development in ${proj.councilId} district before planning consent.`
      });
    }

    // Additional rules
    if (!hasFireSafety && ['COMMERCIAL_OFFICE', 'SHOPPING_MALL', 'HOSPITAL', 'SCHOOL', 'HIGH_RISE', 'INDUSTRIAL'].includes(proj.buildingType)) {
      hardBlocks.push({
        ruleId: 'STAT_FIRE_HYDRANT_REQUIRED',
        title: 'Municipal Fire & Life Safety Plan Missing',
        act: 'Public Health (Fire Regulations) & Council Building By-laws',
        description: 'Multi-occupancy commercial and institutional buildings require an approved municipal fire prevention and hydrant layout.'
      });
    }

    if (!hasAccessibility && ['COMMERCIAL_OFFICE', 'SHOPPING_MALL', 'HOSPITAL', 'SCHOOL'].includes(proj.buildingType)) {
      warnings.push({
        ruleId: 'WARN_DISABILITY_ACCESS',
        title: 'Persons with Disabilities Accessibility Audit Pending',
        description: 'Universal barrier-free ramp, elevator egress and tactile paving layout should be attached to prevent remedial planning queries.'
      });
    }

    if (proj.isFloodZone && !proj.hasFloodMitigation) {
      hardBlocks.push({
        ruleId: 'STAT_FLOOD_HYDROLOGY_REQUIRED',
        title: 'Flood Zone Hydrological Mitigation Report Missing',
        act: 'Urban and Regional Planning Act No. 3 of 2015',
        description: 'Parcel is designated in a designated seasonal flood retention zone. Requires stamped civil storm-drainage certification.'
      });
    }

    const isCouncilEligible = hardBlocks.length === 0;
    const score = Math.max(10, 100 - (hardBlocks.length * 40) - (warnings.length * 10));

    return {
      projectId: proj.id,
      project: proj,
      hasRsaSignature,
      rsaSignatureRecord: sig,
      hasZemaClearance,
      zemaDocument: zemaDoc,
      hasFireSafety,
      hasAccessibility,
      hasLandTitle,
      hardBlocks,
      warnings,
      isCouncilEligible,
      complianceScore: score
    };
  });

  // Filter reports
  const filteredReports = reports.filter(rep => {
    if (filterMode === 'BLOCKED_RSA' && rep.hasRsaSignature) return false;
    if (filterMode === 'BLOCKED_ZEMA' && rep.hasZemaClearance) return false;
    if (filterMode === 'ALL_BLOCKED' && rep.isCouncilEligible) return false;
    if (filterMode === 'ELIGIBLE' && !rep.isCouncilEligible) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rep.project.title.toLowerCase().includes(q) ||
        rep.project.parcelId.toLowerCase().includes(q) ||
        rep.project.clientName.toLowerCase().includes(q) ||
        rep.project.councilId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Aggregate Metrics
  const totalProjects = reports.length;
  const eligibleCount = reports.filter(r => r.isCouncilEligible).length;
  const blockedRsaCount = reports.filter(r => !r.hasRsaSignature).length;
  const blockedZemaCount = reports.filter(r => !r.hasZemaClearance).length;
  const blockedTotalCount = reports.filter(r => !r.isCouncilEligible).length;
  const practiceGateHealth = Math.round((eligibleCount / Math.max(1, totalProjects)) * 100);

  // Quick Action: Attach verified ZEMA document
  const handleAttachZemaClearance = async (project: Project) => {
    setIsAttachingZema(project.id);
    const zemaFileName = `ZEMA-EPB-CLEARANCE-${project.parcelId.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const hash = await computeSha256(zemaFileName + Date.now().toString());

    setTimeout(() => {
      const newDoc: ProjectDocument = {
        id: `DOC-ZEMA-${Date.now()}`,
        name: zemaFileName,
        category: 'ENVIRONMENTAL_ZEMA',
        sha256Hash: `0x${hash}`,
        fileSize: '4.8 MB',
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        verified: true
      };

      const updatedProject: Project = {
        ...project,
        documents: [...project.documents, newDoc]
      };

      onUpdateProject(updatedProject);
      setIsAttachingZema(null);

      notificationService.dispatch({
        eventType: 'PROJECT_STATUS_UPDATED',
        priority: 'MEDIUM',
        targetRole: 'architect',
        title: `ZEMA Environmental Clearance Attached`,
        message: `Statutory Environmental Project Brief certificate verified for ${project.title}.`,
        projectId: project.id,
        projectName: project.title,
        councilId: project.councilId
      });
    }, 800);
  };

  // Quick Action: Attach Fire & Life Safety Plan
  const handleAttachFirePlan = async (project: Project) => {
    const fileName = `FIRE-DEPT-APPROVED-LAYOUT-${Date.now()}.pdf`;
    const hash = await computeSha256(fileName);

    const newDoc: ProjectDocument = {
      id: `DOC-FIRE-${Date.now()}`,
      name: fileName,
      category: 'FIRE_SAFETY',
      sha256Hash: `0x${hash}`,
      fileSize: '6.2 MB',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      verified: true
    };

    const updatedProject: Project = {
      ...project,
      hasFireSafetyPlan: true,
      documents: [...project.documents, newDoc]
    };

    onUpdateProject(updatedProject);

    notificationService.dispatch({
      eventType: 'PROJECT_STATUS_UPDATED',
      priority: 'MEDIUM',
      targetRole: 'architect',
      title: `Fire Safety Clearance Attached`,
      message: `Municipal Fire Prevention Plan registered for ${project.title}.`,
      projectId: project.id,
      projectName: project.title
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Automated Statutory Compliance Validator</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Pre-Council Submission Gatekeeper
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Automated gate audit verifying mandatory RSA-4096 biometric seals and ZEMA environmental clearances before submission to municipal planning authorities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono self-start md:self-auto">
          <button
            onClick={() => {
              const firstBlocked = reports.find(r => !r.isCouncilEligible)?.project || projects[0];
              setEvidenceModalProject(firstBlocked);
              const blockedReport = reports.find(r => r.projectId === firstBlocked?.id);
              setEvidenceModalCategory(
                !blockedReport?.hasZemaClearance ? 'ENVIRONMENTAL_ZEMA' : 'RSA_SIGNATURE'
              );
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-md shadow-emerald-950/80 transition-all cursor-pointer"
            title="Attach missing RSA signature PDFs or environmental clearance certificates"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Attach Missing Evidence</span>
          </button>

          <div className="h-8 w-px bg-neutral-800 hidden sm:block" />

          <div className="text-right">
            <span className="text-neutral-500 block text-[10px]">Gate Health Score</span>
            <span className={`text-xl font-bold ${practiceGateHealth >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {practiceGateHealth}%
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div className="text-right">
            <span className="text-neutral-500 block text-[10px]">Eligible / Total</span>
            <span className="text-xl font-bold text-white">
              {eligibleCount} / {totalProjects}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setFilterMode('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'ALL' 
              ? 'bg-neutral-800/90 border-neutral-600 text-white shadow-md' 
              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Scanned Projects</span>
            <Layers className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-white tabular-nums">
            {totalProjects}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">All practice dossiers</div>
        </div>

        <div 
          onClick={() => setFilterMode('ELIGIBLE')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'ELIGIBLE' 
              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-md' 
              : 'bg-neutral-900/60 border-neutral-800 hover:border-emerald-800/60 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Council Ready</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-emerald-400 tabular-nums">
            {eligibleCount}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">RSA &amp; ZEMA Cleared</div>
        </div>

        <div 
          onClick={() => setFilterMode('BLOCKED_RSA')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'BLOCKED_RSA' 
              ? 'bg-red-950/70 border-red-500 text-red-200 shadow-md' 
              : 'bg-neutral-900/60 border-neutral-800 hover:border-red-800/60 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Blocked: No RSA Seal</span>
            <Key className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-red-400 tabular-nums">
            {blockedRsaCount}
          </div>
          <div className="text-[11px] text-red-400/80 mt-0.5">Unsigned drawings</div>
        </div>

        <div 
          onClick={() => setFilterMode('BLOCKED_ZEMA')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'BLOCKED_ZEMA' 
              ? 'bg-amber-950/70 border-amber-500 text-amber-200 shadow-md' 
              : 'bg-neutral-900/60 border-neutral-800 hover:border-amber-800/60 text-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Blocked: No ZEMA Clear</span>
            <Leaf className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-amber-400 tabular-nums">
            {blockedZemaCount}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">Missing EPB / EIA doc</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-950 p-2 rounded-xl border border-neutral-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project title, parcel, client, council..."
            className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500 placeholder:text-neutral-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'ALL' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({totalProjects})
          </button>
          <button
            onClick={() => setFilterMode('ALL_BLOCKED')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'ALL_BLOCKED' ? 'bg-red-950 text-red-300 font-bold border border-red-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Blocked ({blockedTotalCount})
          </button>
          <button
            onClick={() => setFilterMode('BLOCKED_RSA')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'BLOCKED_RSA' ? 'bg-red-950 text-red-300 font-bold border border-red-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            No RSA ({blockedRsaCount})
          </button>
          <button
            onClick={() => setFilterMode('BLOCKED_ZEMA')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'BLOCKED_ZEMA' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            No ZEMA ({blockedZemaCount})
          </button>
          <button
            onClick={() => setFilterMode('ELIGIBLE')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'ELIGIBLE' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Eligible ({eligibleCount})
          </button>
        </div>
      </div>

      {/* Projects Validation Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 text-neutral-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-60" />
            <p className="text-xs">No projects match the selected compliance filter.</p>
          </div>
        ) : (
          filteredReports.map(report => {
            const isExpanded = expandedProjectId === report.projectId;
            const p = report.project;

            return (
              <div
                key={report.projectId}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  report.isCouncilEligible 
                    ? 'bg-neutral-900/70 border-neutral-800 hover:border-emerald-800/80' 
                    : 'bg-neutral-900/90 border-red-950/80 hover:border-red-800/80 shadow-md'
                }`}
              >
                {/* Project Header Row */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-sm text-white">{p.title}</span>
                      <span className="text-neutral-400 font-mono text-[11px]">{p.parcelId}</span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-emerald-400 text-[11px]">{p.councilId} Planning</span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-400 text-[11px]">{p.buildingType.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400">
                      <span>Client: <strong className="text-neutral-200">{p.clientName}</strong></span>
                      <span>Estimated: <strong className="text-emerald-300">ZMW {(p.estimatedCostZMW / 1000000).toFixed(1)}M</strong></span>
                      <span>Floors: <strong className="text-neutral-200">{p.totalFloors}</strong></span>
                    </div>

                    {/* Pre-submission Gate Status Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {/* RSA Seal Status */}
                      <span className={`flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                        report.hasRsaSignature 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        <Key className="w-3 h-3" />
                        <span>RSA-4096 Seal: {report.hasRsaSignature ? 'Anchored' : 'Missing'}</span>
                      </span>

                      {/* ZEMA Clearance Status */}
                      <span className={`flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                        report.hasZemaClearance 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        <Leaf className="w-3 h-3" />
                        <span>ZEMA Environmental: {report.hasZemaClearance ? 'Verified EPB' : 'Missing'}</span>
                      </span>

                      {/* Overall Council Eligibility Status */}
                      <span className={`flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded font-bold ${
                        report.isCouncilEligible 
                          ? 'bg-emerald-900 text-white' 
                          : 'bg-red-900 text-white'
                      }`}>
                        {report.isCouncilEligible ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>COUNCIL ELIGIBLE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>SUBMISSION BLOCKED ({report.hardBlocks.length})</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
                    <button
                      onClick={() => setExpandedProjectId(isExpanded ? null : report.projectId)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-mono transition-colors"
                    >
                      {isExpanded ? 'Hide Checklist' : 'Inspect Audit Details'}
                    </button>

                    {/* If missing RSA seal, button to launch seal */}
                    {!report.hasRsaSignature && (
                      <button
                        onClick={() => onOpenSealWorkflow(p)}
                        className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        title="Execute RSA-4096 biometric seal"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Apply RSA Seal</span>
                      </button>
                    )}

                    {/* If missing ZEMA, quick attach button */}
                    {!report.hasZemaClearance && (
                      <button
                        onClick={() => handleAttachZemaClearance(p)}
                        disabled={isAttachingZema === p.id}
                        className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                        title="Upload/attach statutory ZEMA clearance certificate"
                      >
                        {isAttachingZema === p.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Leaf className="w-3.5 h-3.5" />
                        )}
                        <span>Attach ZEMA Clearance</span>
                      </button>
                    )}

                    {/* Evidence Uploader Modal Launcher */}
                    {!report.isCouncilEligible && (
                      <button
                        onClick={() => {
                          setEvidenceModalProject(p);
                          setEvidenceModalCategory(
                            !report.hasZemaClearance ? 'ENVIRONMENTAL_ZEMA' : 'RSA_SIGNATURE'
                          );
                        }}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Upload evidence PDFs to resolve missing RSA seals or environmental clearances"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Upload Evidence</span>
                      </button>
                    )}

                    {/* Council Submission Action */}
                    {report.isCouncilEligible ? (
                      <button
                        onClick={() => onSubmitToCouncil(p)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/80 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit to Council</span>
                      </button>
                    ) : (
                      <div 
                        className="px-3 py-1.5 bg-neutral-800/80 text-neutral-500 border border-neutral-700/60 rounded-lg text-xs font-mono cursor-not-allowed flex items-center gap-1.5"
                        title="Resolve all hard statutory blocks before Council gateway will accept this submission."
                      >
                        <Lock className="w-3 h-3 text-neutral-500" />
                        <span>Council Blocked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Detailed Audit Drawer */}
                {isExpanded && (
                  <div className="bg-neutral-950/90 border-t border-neutral-800 p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                        <span>Statutory Submission Gate Checklist</span>
                        <span className="text-[11px] text-neutral-500 font-normal">
                          (Evaluation: {report.complianceScore}/100)
                        </span>
                      </h4>
                    </div>

                    {/* Hard Blocks List */}
                    {report.hardBlocks.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span>Mandatory Statutory Violations (Must be resolved before submission):</span>
                        </span>

                        <div className="space-y-2">
                          {report.hardBlocks.map(block => (
                            <div 
                              key={block.ruleId}
                              className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 space-y-1.5"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="font-bold text-red-300 text-xs">{block.title}</span>
                                <span className="text-[10px] font-mono text-red-400/80">{block.act}</span>
                              </div>
                              <p className="text-[11px] text-neutral-300 leading-relaxed">
                                {block.description}
                              </p>
                              
                              <div className="pt-2 flex flex-wrap items-center gap-2">
                                {block.ruleId === 'STAT_RSA_SEAL_REQUIRED' && (
                                  <>
                                    <button
                                      onClick={() => onOpenSealWorkflow(p)}
                                      className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                                    >
                                      <Key className="w-3 h-3" />
                                      <span>Biometric Sensor Seal</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEvidenceModalProject(p);
                                        setEvidenceModalCategory('RSA_SIGNATURE');
                                      }}
                                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-neutral-700 rounded text-[11px] font-semibold flex items-center gap-1"
                                    >
                                      <Upload className="w-3 h-3 text-emerald-400" />
                                      <span>Upload Signed RSA PDF Evidence</span>
                                    </button>
                                  </>
                                )}

                                {block.ruleId === 'STAT_ZEMA_EPB_REQUIRED' && (
                                  <>
                                    <button
                                      onClick={() => handleAttachZemaClearance(p)}
                                      disabled={isAttachingZema === p.id}
                                      className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                                    >
                                      <Leaf className="w-3 h-3" />
                                      <span>Quick-Attach ZEMA</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEvidenceModalProject(p);
                                        setEvidenceModalCategory('ENVIRONMENTAL_ZEMA');
                                      }}
                                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-neutral-700 rounded text-[11px] font-semibold flex items-center gap-1"
                                    >
                                      <Upload className="w-3 h-3 text-emerald-400" />
                                      <span>Upload ZEMA EPB Certificate PDF</span>
                                    </button>
                                  </>
                                )}

                                {block.ruleId === 'STAT_FIRE_HYDRANT_REQUIRED' && (
                                  <>
                                    <button
                                      onClick={() => handleAttachFirePlan(p)}
                                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                                    >
                                      <Flame className="w-3 h-3 text-red-400" />
                                      <span>Quick-Attach Fire Plan</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEvidenceModalProject(p);
                                        setEvidenceModalCategory('FIRE_SAFETY');
                                      }}
                                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-orange-300 border border-neutral-700 rounded text-[11px] font-semibold flex items-center gap-1"
                                    >
                                      <Upload className="w-3 h-3 text-orange-400" />
                                      <span>Upload Fire Clearance PDF</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings List */}
                    {report.warnings.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Advisory Recommendations:</span>
                        </span>

                        {report.warnings.map(w => (
                          <div 
                            key={w.ruleId}
                            className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200 space-y-1"
                          >
                            <span className="font-bold">{w.title}</span>
                            <p className="text-[11px] text-neutral-300">{w.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Document Breakdown */}
                    <div className="pt-2 border-t border-neutral-800">
                      <span className="text-xs font-mono text-neutral-400 block mb-2">
                        Attached Dossier Documents ({p.documents.length}):
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                        {p.documents.map(doc => (
                          <div key={doc.id} className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="text-white font-medium block truncate text-[11px]">{doc.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">{doc.category}</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                              {doc.verified ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Passport & Legal Proof */}
                    {p.passport && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Cryptographic Passport: <strong className="text-white">{p.passport.passportId}</strong></span>
                        </div>
                        <button
                          onClick={() => onViewPassport(p.passport!.passportId)}
                          className="text-emerald-300 hover:text-white underline text-[11px]"
                        >
                          View Passport
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Real-Time Evidence Uploader Modal */}
      {evidenceModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EvidenceUploader
              projects={projects}
              signatures={signatures}
              currentArchitect={currentArchitect || {
                id: 'ARC-001',
                ziaNumber: 'ZIA-1084',
                nrcNumber: '719042/11/1',
                name: 'Arc. Mwansa Phiri',
                title: 'Principal Lead Architect',
                email: 'm.phiri@apexstudio.co.zm',
                phone: '+260 97 123 4567',
                province: 'LUSAKA',
                city: 'Lusaka',
                status: 'ACTIVE',
                registrationType: 'REGISTERED_ARCHITECT',
                registrationDate: '2016-04-12',
                cpdCredits: 42,
                cpdRequired: 35,
                firmId: 'FIRM-001',
                firmName: 'Apex Studio Architects Ltd',
                specializations: ['Commercial High-Rise', 'Sustainable Timber & Concrete', 'Green Building Design'],
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                biometricEnrolled: true,
                credentials: ['B.Arch (Copperbelt University)', 'M.Arch (UCT)', 'ZIA Corporate Member #1084'],
                disciplinaryHistory: []
              }}
              currentFirm={currentFirm || {
                id: 'FIRM-001',
                name: 'Apex Studio Architects Ltd',
                city: 'Lusaka',
                province: 'LUSAKA',
                address: 'Plot 4920, Great East Road, Arcades Complex, Lusaka',
                contactEmail: 'practice@apexstudio.co.zm',
                contactPhone: '+260 211 290 841',
                compliance: {
                  pacraRegistered: true,
                  pacraNumber: 'PACRA-120220491',
                  zraTaxClear: true,
                  zraTccNumber: 'ZRA-TCC-2026-9021',
                  zraExpiry: '2026-12-31',
                  napsaCompliant: true,
                  napsaNumber: 'NAPSA-C-99120',
                  workersCompCompliant: true,
                  workersCompNumber: 'WC-2026-081',
                  piiActive: true,
                  piiPolicyNumber: 'PII-MADISON-2026-88',
                  piiInsurer: 'Madison General Insurance',
                  piiExpiry: '2026-11-30',
                  piiCoverageZMW: 25000000,
                  ziaFirmLicense: true,
                  healthScore: 98,
                  businessNameConflict: false,
                  verifiedTrademarksCount: 2,
                  patentsAndDesignsCount: 1
                },
                directors: ['Arc. Mwansa Phiri', 'Arc. Chileshe Mulenga'],
                registeredArchitectsCount: 4,
                graduateArchitectsCount: 6,
                activeProjectsCount: 8,
                verificationBadge: 'PLATINUM'
              }}
              onUpdateProject={onUpdateProject}
              onSignaturesUpdated={onSignaturesUpdated}
              targetProjectId={evidenceModalProject.id}
              initialCategory={evidenceModalCategory}
              onClose={() => setEvidenceModalProject(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
