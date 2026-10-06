import React, { useState } from 'react';
import { 
  Leaf, 
  Sun, 
  Droplets, 
  Wind, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

export const GreenBuildingEngine: React.FC = () => {
  const [projectValueZMW, setProjectValueZMW] = useState<number>(45000000);
  const [councilBaseFeeZMW, setCouncilBaseFeeZMW] = useState<number>(180000);

  // Green Feature Checklist
  const [features, setFeatures] = useState<{ id: string; label: string; category: string; points: number; active: boolean }[]>([
    { id: 'solar_pv', label: 'Rooftop Solar PV (>= 30% building load coverage with battery backup)', category: 'ENERGY', points: 25, active: true },
    { id: 'rainwater', label: 'Rainwater Harvesting & Filtration Cistern (>= 50,000L capacity)', category: 'WATER', points: 20, active: true },
    { id: 'passive_cool', label: 'Passive Solar Shading & Natural Cross-Ventilation Chimney Stacks', category: 'PASSIVE', points: 15, active: true },
    { id: 'local_materials', label: 'Locally Sourced Low-Carbon Earth Masonry & Copperbelt Clay Bricks', category: 'MATERIALS', points: 20, active: true },
    { id: 'greywater', label: 'Greywater Recycling for Landscape Irrigation & Flush Supply', category: 'WATER', points: 10, active: false },
    { id: 'ev_ready', label: 'Electric Vehicle (EV) Charging Bays & Solar Carport Canopy', category: 'ENERGY', points: 10, active: false },
    { id: 'native_flora', label: 'Indigenous Drought-Tolerant Landscaping (>= 80% Zambian species)', category: 'ECOLOGY', points: 10, active: true }
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const currentScore = Math.min(100, features.filter(f => f.active).reduce((sum, f) => sum + f.points, 0));

  let tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'STANDARD' = 'STANDARD';
  let discountPercent = 0;

  if (currentScore >= 80) {
    tier = 'PLATINUM';
    discountPercent = 25;
  } else if (currentScore >= 65) {
    tier = 'GOLD';
    discountPercent = 15;
  } else if (currentScore >= 50) {
    tier = 'SILVER';
    discountPercent = 10;
  } else if (currentScore >= 35) {
    tier = 'BRONZE';
    discountPercent = 5;
  }

  const discountSavingsZMW = (councilBaseFeeZMW * discountPercent) / 100;
  const netCouncilFeeZMW = councilBaseFeeZMW - discountSavingsZMW;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Leaf className="w-4 h-4" />
            <span>MODULE 9 · GREEN BUILDING &amp; CLIMATE RESILIENCE ENGINE</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sustainability Scoring &amp; Municipal Fee Incentive Calculator
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            In alignment with Zambia's Green Economy agenda, statutory municipal councils grant direct plan approval fee rebates (up to 25%) and fast-track review lanes for sustainable, bioclimatic designs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feature Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Climate &amp; Environmental Specifications
            </h3>

            <div className="space-y-2">
              {features.map((feat) => (
                <div
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    feat.active
                      ? 'bg-emerald-950/30 border-emerald-700/60 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      feat.active ? 'bg-emerald-500 border-emerald-400 text-neutral-950 font-bold' : 'border-neutral-700'
                    }`}>
                      {feat.active && '✓'}
                    </span>
                    <span className="text-xs font-medium">{feat.label}</span>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 font-bold shrink-0 ml-2">
                    +{feat.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Scorecard & Economic Incentive (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase">Sustainability Rating</span>
                <h3 className="text-xl font-bold text-white font-mono">{tier} TIER</h3>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-400">Green Score</div>
                <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                  {currentScore}/100
                </div>
              </div>
            </div>

            {/* Economic Council Discount Calculator */}
            <div className="space-y-3 text-xs">
              <span className="text-neutral-400 font-mono uppercase block text-[11px]">
                Municipal Council Submission Fee Rebate
              </span>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Standard Council Base Fee:</span>
                  <span className="font-mono text-white">ZMW {councilBaseFeeZMW.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Green Incentive Discount ({discountPercent}%):
                  </span>
                  <span className="font-mono">- ZMW {discountSavingsZMW.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between font-bold text-white">
                  <span>Net Payable to Municipal Council:</span>
                  <span className="font-mono text-emerald-300 text-sm">ZMW {netCouncilFeeZMW.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Fast-Track Review Privilege */}
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-xs text-neutral-300 space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Statutory Fast-Track Review Lane:</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Eligible for priority review turnaround within <strong>3 business days</strong> (vs. standard 14 days) at Lusaka City Council and Ndola City Council.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
