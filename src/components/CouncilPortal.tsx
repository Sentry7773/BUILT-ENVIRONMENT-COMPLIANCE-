import React, { useState } from 'react';
import { 
  FileCheck, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  QrCode, 
  MessageSquare, 
  FileText,
  Building,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Project, CouncilReviewComment, SubmissionPassport } from '../types';
import { MOCK_COUNCILS } from '../data/mockDatabase';
import { AuditLedgerService } from '../services/cryptoLedger';
import { notificationService } from '../services/notificationService';

interface CouncilPortalProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onViewPassport: (passportId: string) => void;
  onViewSitePlaque?: (passport: SubmissionPassport) => void;
}

export const CouncilPortal: React.FC<CouncilPortalProps> = ({
  projects,
  onUpdateProject,
  onViewPassport,
  onViewSitePlaque
}) => {
  const [selectedCouncil, setSelectedCouncil] = useState<string>('LCC');
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);

  // Review actions
  const [officerName, setOfficerName] = useState<string>('Eng. B. Chanda (Director City Planning)');
  const [secondaryOfficerName, setSecondaryOfficerName] = useState<string>('Arch. L. Mwale (Chief Building Surveyor)');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [approvalConditions, setApprovalConditions] = useState<string>('Mandatory foundation inspection before concrete pour. Solar PV commissioning certificate required prior to occupancy.');

  const councilInfo = MOCK_COUNCILS.find(c => c.id === selectedCouncil) || MOCK_COUNCILS[0];
  const councilProjects = projects.filter(p => p.councilId === selectedCouncil);

  // Handle Council Dual Approval
  const handleApproveProject = async () => {
    if (!selectedProject) return;

    const permitNumber = `${selectedCouncil}/BP/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const approvalData = {
      approvedAt: now.replace('T', ' ').substring(0, 16),
      permitNumber,
      primaryOfficer: officerName,
      secondaryOfficer: secondaryOfficerName,
      expiryDate: '2028-10-05',
      conditions: approvalConditions.split('.').filter(c => c.trim().length > 0)
    };

    const updatedPassport = selectedProject.passport ? {
      ...selectedProject.passport,
      councilApproval: approvalData
    } : undefined;

    // Anchor to immutable audit ledger
    await AuditLedgerService.recordEvent(
      'COUNCIL_APPROVED',
      { id: selectedCouncil + '-OFFICER', name: officerName, role: 'Council Planning Authority' },
      selectedProject.id,
      `Dual sign-off granted by ${councilInfo.name}. Building Permit #${permitNumber} issued. Site QR plaque generated.`
    );

    const updatedProject: Project = {
      ...selectedProject,
      status: 'APPROVED',
      passport: updatedPassport
    };

    // Dispatch high-priority event-driven notification alerting architect
    notificationService.dispatch({
      eventType: 'COUNCIL_PERMIT_GRANTED',
      priority: 'HIGH',
      targetRole: 'architect',
      title: `Building Permit Issued (#${permitNumber})`,
      message: `${councilInfo.name} has granted statutory dual sign-off for "${selectedProject.title}". Site QR Plaque generated for construction hoard.`,
      projectId: selectedProject.id,
      projectName: selectedProject.title,
      permitNumber,
      councilId: selectedCouncil,
      actionTab: 'site_plaque',
      actionLabel: 'View Site Plaque'
    });

    onUpdateProject(updatedProject);
    setSelectedProject(updatedProject);
  };

  // Handle Statutory IP Hold
  const handlePlaceIpHold = async () => {
    if (!selectedProject) return;

    await AuditLedgerService.recordEvent(
      'DISCIPLINARY_ACTION',
      { id: selectedCouncil + '-TRIBUNAL', name: officerName, role: 'Council Planning Legal Officer' },
      selectedProject.id,
      `Project placed on statutory IP_HOLD by ${councilInfo.name} pending copyright ownership investigation.`
    );

    const updatedProject: Project = {
      ...selectedProject,
      status: 'IP_HOLD'
    };

    notificationService.dispatch({
      eventType: 'IP_HOLD_FREEZE',
      priority: 'HIGH',
      targetRole: 'all',
      title: `Statutory IP_HOLD Placed on ${selectedProject.title}`,
      message: `${officerName} (${councilInfo.name}) placed project on statutory IP_HOLD pending copyright dispute adjudication.`,
      projectId: selectedProject.id,
      projectName: selectedProject.title,
      councilId: selectedCouncil,
      actionTab: 'ip_bridge',
      actionLabel: 'Inspect IP Docket'
    });

    onUpdateProject(updatedProject);
    setSelectedProject(updatedProject);
  };

  // Handle Planning Rejection
  const handleRejectProject = async () => {
    if (!selectedProject) return;

    await AuditLedgerService.recordEvent(
      'DOCUMENT_HASH_VERIFIED',
      { id: selectedCouncil + '-PLANNING', name: officerName, role: 'Council Planning Authority' },
      selectedProject.id,
      `Planning submission rejected by ${councilInfo.name} due to unresolvable statutory non-compliance.`
    );

    const updatedProject: Project = {
      ...selectedProject,
      status: 'REJECTED'
    };

    notificationService.dispatch({
      eventType: 'REMEDIATION_REQUESTED',
      priority: 'HIGH',
      targetRole: 'architect',
      title: `Statutory Planning Rejection: ${selectedProject.title}`,
      message: `${councilInfo.name} has formally rejected submission ${selectedProject.id}. View council review docket for statutory grounds.`,
      projectId: selectedProject.id,
      projectName: selectedProject.title,
      councilId: selectedCouncil,
      actionTab: 'architect',
      actionLabel: 'Review Rejection Findings'
    });

    onUpdateProject(updatedProject);
    setSelectedProject(updatedProject);
  };

  // Add Comment
  const handleAddComment = () => {
    if (!selectedProject || !newCommentText.trim()) return;

    const newComment: CouncilReviewComment = {
      id: `C-${Date.now()}`,
      author: officerName,
      role: 'Council Review Officer',
      department: `${councilInfo.name} Planning & Development Directorate`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      text: newCommentText.trim(),
      status: 'PENDING'
    };

    const updatedProject: Project = {
      ...selectedProject,
      status: 'ADDITIONAL_INFO_REQUESTED',
      comments: [newComment, ...selectedProject.comments]
    };

    // Dispatch high-priority event-driven notification alerting architect
    notificationService.dispatch({
      eventType: 'REMEDIATION_REQUESTED',
      priority: 'HIGH',
      targetRole: 'architect',
      title: 'Council Planning Remediation Requested',
      message: `${officerName} (${councilInfo.name}) posted statutory modification notes on "${selectedProject.title}": "${newCommentText.trim()}"`,
      projectId: selectedProject.id,
      projectName: selectedProject.title,
      councilId: selectedCouncil,
      actionTab: 'architect',
      actionLabel: 'Open Project Studio'
    });

    onUpdateProject(updatedProject);
    setSelectedProject(updatedProject);
    setNewCommentText('');
  };

  return (
    <div className="space-y-6">
      {/* Council Selector & Anti-Corruption Audit Strip */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">{councilInfo.name}</h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              {councilInfo.jurisdictionCode}
            </span>
          </div>
          <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
            <span>Province: <strong className="text-neutral-300">{councilInfo.province}</strong></span>
            <span className="text-neutral-600">·</span>
            <span>Active Reviewers: <strong className="text-neutral-300 font-mono">{councilInfo.activeReviewers}</strong></span>
            <span className="text-neutral-600">·</span>
            <span>Avg Review Turnaround: <strong className="text-emerald-400 font-mono">{councilInfo.avgReviewDays} days</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400">Jurisdiction:</label>
          <select
            value={selectedCouncil}
            onChange={(e) => {
              setSelectedCouncil(e.target.value);
              const firstInCouncil = projects.find(p => p.councilId === e.target.value);
              setSelectedProject(firstInCouncil || null);
            }}
            className="bg-neutral-800 border border-neutral-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {MOCK_COUNCILS.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono text-neutral-400 uppercase">
              Submissions Queue ({councilProjects.length})
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              Randomized Review Allocation
            </span>
          </div>

          <div className="space-y-2">
            {councilProjects.length === 0 ? (
              <div className="p-8 text-center bg-neutral-900/40 rounded-xl border border-neutral-800 text-xs text-neutral-500">
                No active submissions for this council jurisdiction.
              </div>
            ) : (
              councilProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedProject?.id === proj.id
                      ? 'bg-neutral-800/90 border-emerald-500 shadow-md'
                      : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-neutral-400">{proj.id}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      proj.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                      proj.status === 'COUNCIL_IN_REVIEW' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                      'bg-orange-950 text-orange-300 border border-orange-800/60'
                    }`}>
                      {proj.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white truncate">{proj.title}</div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
                    <span>{proj.buildingType}</span>
                    <span className="font-mono text-emerald-400">{proj.totalFloors} Flrs · ZMW {(proj.estimatedCostZMW/1000000).toFixed(0)}M</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Detailed Planning & Statutory Review Workspace (8 cols) */}
        <div className="lg:col-span-8">
          {selectedProject ? (
            <div className="space-y-5">
              {/* Project Header Banner */}
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 uppercase">
                      Statutory Review Docket: {selectedProject.id}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{selectedProject.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedProject.passport && (
                      <button
                        onClick={() => onViewPassport(selectedProject.passport!.passportId)}
                        className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-900 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Passport</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-neutral-800">
                  <div>
                    <span className="text-neutral-500 block">Lead Architect</span>
                    <span className="text-neutral-200 font-medium">Arc. Mwansa Phiri</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Cadastral Parcel</span>
                    <span className="text-neutral-200 font-mono font-medium">{selectedProject.parcelId}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Site Footprint</span>
                    <span className="text-neutral-200 font-mono">{selectedProject.buildingFootprintSqM} m²</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Risk Category</span>
                    <span className="text-amber-400 font-mono font-bold">{selectedProject.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* GIS & Automated Rule Check Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cadastral & Zoning Panel */}
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono uppercase flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      GIS Cadastral Verification
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">ZONING: C-2 COMMERCIAL</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-300">Front Road Reserve Setback (9.0m min):</span>
                      <span className="font-mono text-emerald-400 font-semibold">10.2m (Compliant)</span>
                    </div>
                    <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-300">Maximum Plot Coverage (60% limit):</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {Math.round((selectedProject.buildingFootprintSqM / selectedProject.plotAreaSqM) * 100)}% (Compliant)
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-300">Flood Catchment Overlay:</span>
                      <span className={`font-mono font-semibold ${selectedProject.isFloodZone ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {selectedProject.isFloodZone ? 'Seasonal Flood Zone (Mitigated)' : 'Dry Plateau Zone'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Drawing Integrity Panel */}
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Tamper-Evident Drawing Hashes
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      {selectedProject.documents.length} Validated
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {selectedProject.documents.map((doc, idx) => (
                      <div key={idx} className="p-2 rounded bg-neutral-950/80 border border-neutral-800">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-200 font-medium truncate">{doc.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">MATCH</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">
                          {doc.sha256Hash}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Council Officer Dual Sign-off Section */}
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono uppercase">
                      Statutory Dual Sign-Off Decision
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Mandatory anti-corruption protocol requires primary planning and secondary building surveyor signatures.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                    Dual Key Verification
                  </span>
                </div>

                {selectedProject.status === 'APPROVED' && selectedProject.passport?.councilApproval ? (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        BUILDING PERMIT GRANTED
                      </span>
                      <span className="font-mono text-white font-bold">
                        Permit #{selectedProject.passport.councilApproval.permitNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300 pt-2 border-t border-emerald-900/60">
                      <div>
                        <span className="text-neutral-500 block">Primary Approval Officer:</span>
                        <strong className="text-white">{selectedProject.passport.councilApproval.primaryOfficer}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Secondary Surveyor Officer:</span>
                        <strong className="text-white">{selectedProject.passport.councilApproval.secondaryOfficer}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Approval Timestamp:</span>
                        <span className="font-mono">{selectedProject.passport.councilApproval.approvedAt}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Statutory Validity Expiry:</span>
                        <span className="font-mono text-amber-300">{selectedProject.passport.councilApproval.expiryDate} (2 Years)</span>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-neutral-300">
                      <span className="text-neutral-500 block mb-1">Approved Building Conditions:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-300">
                        {selectedProject.passport.councilApproval.conditions.map((cond, i) => (
                          <li key={i}>{cond}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={() => onViewPassport(selectedProject.passport!.passportId)}
                        className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Passport ({selectedProject.passport.passportId})</span>
                      </button>

                      {onViewSitePlaque && (
                        <button
                          onClick={() => onViewSitePlaque(selectedProject.passport!)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Generate &amp; Print Official Site Plaque</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Primary Reviewing Officer</label>
                        <input
                          type="text"
                          value={officerName}
                          onChange={(e) => setOfficerName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Secondary Signatory (Building Surveyor)</label>
                        <input
                          type="text"
                          value={secondaryOfficerName}
                          onChange={(e) => setSecondaryOfficerName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Mandatory Approval Conditions</label>
                      <textarea
                        value={approvalConditions}
                        onChange={(e) => setApprovalConditions(e.target.value)}
                        rows={2}
                        className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleAddComment}
                          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors"
                        >
                          Request Remediation
                        </button>

                        <button
                          onClick={handlePlaceIpHold}
                          className="px-3 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-800/80 text-purple-200 text-xs font-medium rounded-lg transition-colors"
                          title="Place on statutory IP_HOLD pending copyright dispute"
                        >
                          Statutory IP_HOLD
                        </button>

                        <button
                          onClick={handleRejectProject}
                          className="px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-medium rounded-lg transition-colors"
                        >
                          Reject Submission
                        </button>
                      </div>

                      <button
                        onClick={handleApproveProject}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950/80 flex items-center gap-2 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Dual Sign-Off &amp; Issue Site Plaque</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Council & Architect Communication Thread */}
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                    Review Notes & Audit Dialogue ({selectedProject.comments.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {selectedProject.comments.map(c => (
                    <div key={c.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                        <span className="font-semibold text-emerald-400">{c.author} ({c.role})</span>
                        <span className="font-mono">{c.timestamp}</span>
                      </div>
                      <p className="text-neutral-200 leading-relaxed">{c.text}</p>
                    </div>
                  ))}

                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Add official comment, setback request or condition note..."
                      className="flex-1 bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg"
                    >
                      Post Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-neutral-900/40 rounded-xl border border-neutral-800 text-xs text-neutral-500">
              Select a project from the left queue to begin statutory inspection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
