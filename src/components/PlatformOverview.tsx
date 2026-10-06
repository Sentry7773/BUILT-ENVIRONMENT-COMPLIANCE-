import React from 'react';
import { 
  ShieldCheck, 
  Building, 
  FileCheck, 
  Scale, 
  Leaf, 
  QrCode, 
  GraduationCap, 
  Database, 
  Calculator, 
  Search,
  ExternalLink,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Globe,
  Award,
  Building2,
  Lock,
  Gavel
} from 'lucide-react';
import { Project, ArchitecturalFirm, Architect } from '../types';

interface PlatformOverviewProps {
  onNavigate: (tab: string) => void;
  projects: Project[];
  firms: ArchitecturalFirm[];
  architects: Architect[];
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  onNavigate,
  projects,
  firms,
  architects
}) => {
  const approvedCount = projects.filter(p => p.status === 'APPROVED').length;
  const inReviewCount = projects.filter(p => p.status === 'COUNCIL_IN_REVIEW' || p.status === 'SEALED_AND_SUBMITTED').length;

  return (
    <div className="space-y-10">
      {/* Hero Visual Section */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
          <img 
            src="/src/assets/images/zape_civic_architecture_1791209740935.jpg" 
            alt="Civic Architecture in Zambia" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 mb-4 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ZAPE 3.0 SOVEREIGN GOVERNANCE &amp; IP TRUST LAYER</span>
            <span className="text-neutral-500">·</span>
            <span>NATIONAL DEPLOYMENT BASELINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            National Built-Environment <br />
            <span className="text-emerald-400">Governance &amp; IP Protection</span> Platform
          </h1>

          <p className="mt-4 text-base sm:text-lg text-neutral-300 leading-relaxed font-light">
            Connecting registered architects, firms, clients, developers, foreign consultants, municipal councils, and PACRA into an integrated, tamper-evident regulatory and intellectual property trust layer for the Republic of Zambia.
          </p>

          {/* Expanded Doctrine Invariants */}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-300 font-mono">
            <span className="flex items-center gap-1 text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5" /> No Stolen IP
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5" /> No Unlawful Developer Practice
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5" /> No Unlocalized Foreign Drawings
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5" /> Zero Prohibited Advertising
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('architect')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2"
            >
              <span>Submit &amp; Seal Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('ip_bridge')}
              className="px-5 py-2.5 bg-purple-950/80 hover:bg-purple-900 text-purple-200 text-sm font-medium rounded-lg border border-purple-800/80 transition-colors flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>PACRA &amp; IP Bridge</span>
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg border border-neutral-700 transition-colors flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Standardized Templates</span>
            </button>
            <button
              onClick={() => onNavigate('foreign_gateway')}
              className="px-5 py-2.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg border border-neutral-700 transition-colors flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Foreign Gateway</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Operational Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400">Registered Professionals</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{architects.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">ZIA Registered Active</div>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400">PACRA Accredited Practices</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{firms.length}</div>
          <div className="text-[11px] text-purple-400 mt-1">100% PACRA Companies Verified</div>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400">Protected IP Assets</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">3 Registrations</div>
          <div className="text-[11px] text-emerald-400 mt-1">Patents, TMs, Copyright Vault</div>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="text-xs text-neutral-400">Municipal Jurisdictions</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">5 Councils</div>
          <div className="text-[11px] text-neutral-400 mt-1">LCC · NCC · KCC · LIV · SOL</div>
        </div>
      </div>

      {/* Upgraded Ecosystem Modules Bento Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Expanded ZAPE 3.0 Governance Modules</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Explore the full national architecture, IP, corporate practice, and regulatory stack.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: PACRA & IP Bridge */}
          <div 
            onClick={() => onNavigate('ip_bridge')}
            className="group p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-600/60 cursor-pointer transition-all hover:bg-neutral-850"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-purple-400">MODULE 16 &amp; 20</span>
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
              PACRA Bridge &amp; IP Protection
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Links firms to PACRA corporate records, protects practice trademarks, timestamps copyright proof, and enforces takedown freezes on IP_HOLD.
            </p>
            <div className="mt-4 flex items-center text-xs text-purple-400 font-medium gap-1">
              <span>Open IP Vault &amp; Disputes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Regulated Design Marketplace */}
          <div 
            onClick={() => onNavigate('marketplace')}
            className="group p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-600/60 cursor-pointer transition-all hover:bg-neutral-850"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400">MODULE 17</span>
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
              Standardized Design Repository
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Statutory type-approved housing and clinic typologies with single-household/developer licensing and mandatory registered architect site adaptation.
            </p>
            <div className="mt-4 flex items-center text-xs text-emerald-400 font-medium gap-1">
              <span>Browse Type-Approved Templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Foreign Design Gateway */}
          <div 
            onClick={() => onNavigate('foreign_gateway')}
            className="group p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-blue-600/60 cursor-pointer transition-all hover:bg-neutral-850"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-blue-400">MODULE 18</span>
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
              Foreign Design Localization Gateway
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Enforces Zambian sovereignty. Imported designs must be adopted by a local ZIA architect, localized to Zambian codes, and backed by a ZABS Material Equivalency Matrix.
            </p>
            <div className="mt-4 flex items-center text-xs text-blue-400 font-medium gap-1">
              <span>Inspect Foreign Docket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Developer Governance & Corporate Practice Control */}
          <div 
            onClick={() => onNavigate('developer_control')}
            className="group p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-orange-600/60 cursor-pointer transition-all hover:bg-neutral-850"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-950/60 border border-orange-800/40 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-orange-400">MODULE 19</span>
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-orange-300 transition-colors">
              Corporate Practice Control &amp; Firewall
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Bars developers from unlawfully providing architectural services. Enforces Conflict-of-Interest Radar and issues Developer Authorization Certificates (DAC).
            </p>
            <div className="mt-4 flex items-center text-xs text-orange-400 font-medium gap-1">
              <span>View Developer Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Council Submissions & Dual Signoff */}
          <div 
            onClick={() => onNavigate('council')}
            className="group p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-600/60 cursor-pointer transition-all hover:bg-neutral-850"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-amber-400">MODULE 7</span>
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
              Council Approval Workflow
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Municipal planning queue with GIS parcel overlays, anti-corruption audit trails, mandatory dual sign-off, and permit generation.
            </p>
            <div className="mt-4 flex items-center text-xs text-amber-400 font-medium gap-1">
              <span>Enter Council Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Citizen Trust & Site QR Plaque */}
          <div 
            onClick={() => onNavigate('site_plaque')}
            className="group p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-600/60 cursor-pointer transition-all hover:bg-neutral-850"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400">MODULE 13</span>
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
              Citizen Trust &amp; Site QR Plaque
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Public site hoard QR plaques allow any citizen to verify approved storeys, building use, and instantly report unauthorized violations.
            </p>
            <div className="mt-4 flex items-center text-xs text-emerald-400 font-medium gap-1">
              <span>Scan Site Plaque</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
