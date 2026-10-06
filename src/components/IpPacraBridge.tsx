import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Award, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Search, 
  Plus, 
  ExternalLink,
  Layers,
  Sparkles,
  Gavel,
  FileCode,
  Fingerprint
} from 'lucide-react';
import { IPAsset, IPDisputeCase, ArchitecturalFirm } from '../types';
import { MOCK_IP_ASSETS, MOCK_IP_DISPUTES } from '../data/mockDatabase';
import { computeSha256, AuditLedgerService } from '../services/cryptoLedger';

interface IpPacraBridgeProps {
  firms: ArchitecturalFirm[];
}

export const IpPacraBridge: React.FC<IpPacraBridgeProps> = ({ firms }) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'disputes' | 'verify_timestamp'>('assets');
  const [ipAssets, setIpAssets] = useState<IPAsset[]>(MOCK_IP_ASSETS);
  const [disputes, setDisputes] = useState<IPDisputeCase[]>(MOCK_IP_DISPUTES);

  // New IP Asset filing state
  const [isFilingNew, setIsFilingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<IPAsset['assetType']>('PATENT');
  const [newFirmId, setNewFirmId] = useState('FIRM-001');
  const [newDescription, setNewDescription] = useState('');
  const [newAuthor, setNewAuthor] = useState('Arc. Mwansa Phiri (ZIA 1084)');

  // Forensic Timestamp Verification Tool state
  const [testHash, setTestHash] = useState('0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b120');
  const [verifiedAsset, setVerifiedAsset] = useState<IPAsset | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // File Dispute State
  const [isFilingDispute, setIsFilingDispute] = useState(false);
  const [disputeAssetId, setDisputeAssetId] = useState('IP-AST-003');
  const [respondentName, setRespondentName] = useState('');
  const [disputeSummary, setDisputeSummary] = useState('');

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const firm = firms.find(f => f.id === newFirmId) || firms[0];
    const generatedHash = `0x${await computeSha256(newTitle + Date.now().toString())}`;
    const pacraNo = `PACRA-${newType.substring(0, 3)}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAsset: IPAsset = {
      id: `IP-AST-00${ipAssets.length + 1}`,
      title: newTitle.trim(),
      assetType: newType,
      ownerFirmId: firm.id,
      ownerFirmName: firm.name,
      leadAuthor: newAuthor,
      pacraRegistrationNo: pacraNo,
      sha256Hash: generatedHash,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z',
      status: 'REGISTERED',
      description: newDescription.trim(),
      activeLicensesCount: 0,
      royaltiesEarnedZMW: 0
    };

    await AuditLedgerService.recordEvent(
      'IP_ASSET_REGISTERED',
      { id: firm.compliance.pacraNumber, name: firm.name, role: 'PACRA Verified Entity' },
      newAsset.id,
      `PACRA IP Asset registered: ${newAsset.title} (${newAsset.pacraRegistrationNo}). SHA-256 anchored.`
    );

    setIpAssets([newAsset, ...ipAssets]);
    setIsFilingNew(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleVerifyHash = () => {
    const found = ipAssets.find(a => a.sha256Hash.toLowerCase() === testHash.trim().toLowerCase());
    setVerifiedAsset(found || null);
    setIsVerified(true);
  };

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondentName.trim() || !disputeSummary.trim()) return;

    const targetAsset = ipAssets.find(a => a.id === disputeAssetId) || ipAssets[0];

    const newCase: IPDisputeCase = {
      id: `DISP-2026-${Math.floor(10 + Math.random() * 90)}`,
      assetId: targetAsset.id,
      complainantName: targetAsset.leadAuthor,
      complainantFirm: targetAsset.ownerFirmName,
      respondentName: respondentName.trim(),
      respondentFirm: 'Respondent Commercial Entity',
      claimType: 'UNLICENSED_REUSE',
      originalHash: targetAsset.sha256Hash,
      disputedHash: `0x${await computeSha256(respondentName + targetAsset.title)}`,
      similarityScore: 96.8,
      status: 'ACTIVE_FREEZE',
      dateFiled: new Date().toISOString().substring(0, 10),
      summary: disputeSummary.trim(),
      remedyActionTaken: 'Submission frozen under IP_HOLD. Notice served to council and respondent.'
    };

    await AuditLedgerService.recordEvent(
      'IP_DISPUTE_ENACTED',
      { id: 'ZIA-IP-TRIBUNAL', name: 'ZIA / PACRA Joint IP Board', role: 'Arbitration Authority' },
      newCase.id,
      `Formal IP dispute lodged for asset ${targetAsset.title}. Target submission frozen on IP_HOLD.`
    );

    setDisputes([newCase, ...disputes]);
    setIsFilingDispute(false);
    setRespondentName('');
    setDisputeSummary('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>MODULE 16 &amp; 20 · PACRA &amp; INTELLECTUAL PROPERTY GOVERNANCE BRIDGE</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            National Architectural IP &amp; PACRA Registry Bridge
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            Eliminating architectural design theft, unauthorized drawing reuse, and fake practice identities. Links architectural assets to PACRA Companies Registry, Patents, Trademarks, and timestamped copyright proof.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'assets' ? 'bg-purple-900/60 text-purple-200 border border-purple-700/60' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Protected IP Assets ({ipAssets.length})
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'disputes' ? 'bg-red-950/80 text-red-200 border border-red-800/60' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              IP Disputes &amp; Takedown Docket ({disputes.length})
            </button>
            <button
              onClick={() => setActiveTab('verify_timestamp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'verify_timestamp' ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Forensic Hash Verifier
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: REGISTERED IP ASSETS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400 uppercase">
              PACRA Verified Intellectual Property Portfolio
            </span>
            <button
              onClick={() => setIsFilingNew(!isFilingNew)}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Architectural IP Asset</span>
            </button>
          </div>

          {/* Filing Form */}
          {isFilingNew && (
            <form onSubmit={handleCreateAsset} className="p-5 rounded-xl bg-neutral-900 border border-purple-800/60 space-y-4 text-xs">
              <h4 className="font-bold text-white font-mono uppercase">New Architectural IP Registration</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-neutral-400 block mb-1">Asset Title / Invention Name</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Modular Earth-Masonry Passive Cooling Connector"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">IP Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                  >
                    <option value="PATENT">Patent (Structural/Thermal Invention)</option>
                    <option value="INDUSTRIAL_DESIGN">Industrial Design (Facade/Detail)</option>
                    <option value="TRADEMARK">Trademark (Firm Brand / Typology)</option>
                    <option value="STANDARDIZED_TEMPLATE">Standardized Reusable Template</option>
                    <option value="COPYRIGHT_DRAWING">Statutory Drawing Copyright</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Technical Specification Summary</label>
                <textarea
                  required
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline protectable novelty, claims, and building code performance..."
                  className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilingNew(false)}
                  className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
                >
                  Anchor Proof to PACRA Ledger
                </button>
              </div>
            </form>
          )}

          {/* Asset Cards */}
          <div className="grid grid-cols-1 gap-4">
            {ipAssets.map(asset => (
              <div key={asset.id} className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{asset.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                        {asset.assetType}
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        {asset.pacraRegistrationNo}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Owner: <strong className="text-neutral-200">{asset.ownerFirmName}</strong> · Authorship: <strong className="text-neutral-300">{asset.leadAuthor}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block">Licensing Revenue</span>
                    <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                      ZMW {asset.royaltiesEarnedZMW.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-500 block font-mono">
                      {asset.activeLicensesCount} Active Licenses
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {asset.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
                  <div className="truncate max-w-lg">
                    <span className="text-neutral-500">SHA-256 Proof:</span>{' '}
                    <span className="text-neutral-300">{asset.sha256Hash}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PACRA Certified · Anchored {asset.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: IP DISPUTES & TAKEDOWN DOCKET */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Active Intellectual Property Enforcement &amp; Takedown Queue
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                When a design infringement is flagged, the disputed project is placed on <strong>IP_HOLD</strong>, blocking council approval until determined.
              </p>
            </div>

            <button
              onClick={() => setIsFilingDispute(!isFilingDispute)}
              className="px-3 py-1.5 bg-red-950 text-red-200 hover:bg-red-900 border border-red-800/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Lodge IP Theft Complaint</span>
            </button>
          </div>

          {/* File Dispute Form */}
          {isFilingDispute && (
            <form onSubmit={handleFileDispute} className="p-5 rounded-xl bg-neutral-900 border border-red-800/80 space-y-4 text-xs">
              <h4 className="font-bold text-white font-mono uppercase text-red-300">
                Statutory Intellectual Property Complaint Filing
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Select Your Protected Asset</label>
                  <select
                    value={disputeAssetId}
                    onChange={(e) => setDisputeAssetId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                  >
                    {ipAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.title} ({a.pacraRegistrationNo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Alleged Infringing Entity / Practice</label>
                  <input
                    type="text"
                    required
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="e.g. Unregistered drafting firm or developer"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Evidence of Plagiarism / Unlawful Reproduction</label>
                <textarea
                  required
                  rows={3}
                  value={disputeSummary}
                  onChange={(e) => setDisputeSummary(e.target.value)}
                  placeholder="Describe observed unauthorized reuse, altered title blocks, or duplicate layout..."
                  className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilingDispute(false)}
                  className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Enact Statutory IP_HOLD Freeze</span>
                </button>
              </div>
            </form>
          )}

          {/* Dispute Cards */}
          <div className="space-y-3">
            {disputes.map(disp => (
              <div key={disp.id} className="p-5 rounded-xl bg-neutral-900 border border-red-900/60 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-red-400 font-bold">{disp.id}</span>
                    <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded font-mono text-[10px] border border-red-800">
                      {disp.status}
                    </span>
                    <span className="text-neutral-300">
                      <strong>{disp.complainantFirm}</strong> vs. <strong className="text-red-300">{disp.respondentName}</strong>
                    </span>
                  </div>

                  <span className="text-amber-400 font-mono text-[11px] font-bold">
                    AI CAD Similarity: {disp.similarityScore}% Match
                  </span>
                </div>

                <p className="text-neutral-300 leading-relaxed">{disp.summary}</p>

                {disp.remedyActionTaken && (
                  <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-red-200">
                    <strong>Statutory Action:</strong> {disp.remedyActionTaken}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FORENSIC TIMESTAMP VERIFIER */}
      {activeTab === 'verify_timestamp' && (
        <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Forensic SHA-256 Authorship &amp; Timestamp Verifier
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Paste any drawing file hash or patent payload to confirm mathematical proof-of-authorship before Zambian courts or ZIA tribunals.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={testHash}
              onChange={(e) => setTestHash(e.target.value)}
              placeholder="Paste 64-character SHA-256 drawing hash..."
              className="flex-1 bg-neutral-950 border border-neutral-700 text-xs font-mono text-white px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleVerifyHash}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Verify Authorship
            </button>
          </div>

          {isVerified && (
            <div className="pt-2">
              {verifiedAsset ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    AUTHORS &amp; PACRA OWNERSHIP 100% CONFIRMED
                  </div>
                  <div className="text-neutral-200">
                    Asset: <strong>{verifiedAsset.title}</strong> ({verifiedAsset.pacraRegistrationNo})
                  </div>
                  <div className="text-neutral-300">
                    Lead Author: <strong className="text-white">{verifiedAsset.leadAuthor}</strong> · Practice: <strong className="text-white">{verifiedAsset.ownerFirmName}</strong>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">
                    Anchored Timestamp: {verifiedAsset.timestamp}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Hash not found in PACRA/ZIA registered copyright vault. Drawing may be unregistered, tampered, or fabricated.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
