import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone, 
  Send,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Architect, ArchitecturalFirm } from '../types';

interface PublicRegistryProps {
  architects: Architect[];
  firms: ArchitecturalFirm[];
}

export const PublicRegistry: React.FC<PublicRegistryProps> = ({
  architects,
  firms
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  // Proposal modal
  const [proposalTarget, setProposalTarget] = useState<Architect | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [proposalSent, setProposalSent] = useState(false);

  const filteredArchitects = architects.filter(arch => {
    const matchesSearch = 
      arch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arch.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arch.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProvince = selectedProvince === 'ALL' || arch.province === selectedProvince;
    const matchesSpecialty = selectedSpecialty === 'ALL' || arch.specializations.some(s => s.includes(selectedSpecialty));

    return matchesSearch && matchesProvince && matchesSpecialty;
  });

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setProposalSent(true);
    setTimeout(() => {
      setProposalSent(false);
      setProposalTarget(null);
      setClientName('');
      setClientEmail('');
      setProjectDescription('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-2xl">
          <span className="text-xs font-mono text-emerald-400 uppercase">MODULE 5 · PUBLIC TRUST REGISTRY</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Verified Architectural Directory of Zambia
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            Protect your investment. Every professional listed here holds verified ZIA accreditation, active tax clearance, and professional indemnity insurance.
          </p>

          {/* Search & Filters */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search architect, firm, specialty..."
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Provinces (Zambia)</option>
                <option value="Lusaka">Lusaka Province</option>
                <option value="Copperbelt">Copperbelt Province</option>
                <option value="Southern">Southern Province</option>
                <option value="North-Western">North-Western Province</option>
              </select>
            </div>

            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Specializations</option>
                <option value="Civic">Civic & Institutional</option>
                <option value="High-Rise">High-Rise Commercial</option>
                <option value="Sustainable">Sustainable & Bioclimatic</option>
                <option value="Heritage">Heritage Conservation</option>
                <option value="Healthcare">Healthcare Facilities</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArchitects.map(arch => {
          const firm = firms.find(f => f.id === arch.firmId);
          const isSuspended = arch.status === 'SUSPENDED';

          return (
            <div 
              key={arch.id}
              className={`p-5 rounded-xl border transition-all ${
                isSuspended 
                  ? 'bg-red-950/20 border-red-900/40 opacity-75' 
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-emerald-600/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-300 shrink-0">
                    {arch.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{arch.name}</h3>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSuspended ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {arch.status}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {arch.title} · <strong className="text-neutral-300">{arch.firmName}</strong>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                  {arch.ziaNumber}
                </span>
              </div>

              {/* Specializations & Badges */}
              <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
                {arch.specializations.map((spec, i) => (
                  <span key={i} className="bg-neutral-950 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                    {spec}
                  </span>
                ))}
              </div>

              {/* Verified Trust Strip */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CPD Compliant
                  </span>
                  {firm?.compliance.piiActive && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      PII Insured (ZMW {(firm.compliance.piiCoverageZMW/1000000).toFixed(0)}M)
                    </span>
                  )}
                </div>

                {!isSuspended ? (
                  <button
                    onClick={() => setProposalTarget(arch)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>Request Proposal</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-red-400 font-mono">
                    Statutory License Suspended
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Proposal Request Modal */}
      {proposalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Building2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Direct Client Proposal Request</h3>
              </div>
              <button onClick={() => setProposalTarget(null)} className="text-neutral-400 hover:text-white text-xs font-mono">
                ✕ Close
              </button>
            </div>

            {proposalSent ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Proposal Request Dispatched!</h4>
                <p className="text-xs text-neutral-400">
                  {proposalTarget.name} ({proposalTarget.firmName}) has received your project brief with a tamper-proof digital timestamp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1">To Verified Architect</label>
                  <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200">
                    <strong>{proposalTarget.name}</strong> ({proposalTarget.ziaNumber}) · {proposalTarget.firmName}
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Your Full Name / Entity</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Kondwani Mwila"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Your Email / Phone</label>
                  <input
                    type="text"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. k.mwila@domain.zm"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Project Scope & Location</label>
                  <textarea
                    required
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Outline your building project, plot location, and preferred timeline..."
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setProposalTarget(null)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Verified RFP</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
