import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  ShieldCheck, 
  FileCode,
  Sparkles,
  Info
} from 'lucide-react';

export const BimRuleChecker: React.FC = () => {
  // Configurable parameters to test automated compliance
  const [frontSetback, setFrontSetback] = useState<number>(9.5); // min 9.0m
  const [sideSetback, setSideSetback] = useState<number>(3.2); // min 3.0m
  const [plotCoverage, setPlotCoverage] = useState<number>(54); // max 60%
  const [ceilingHeight, setCeilingHeight] = useState<number>(2.85); // min 2.6m
  const [fireEgressDistance, setFireEgressDistance] = useState<number>(24); // max 30m
  const [rampSlope, setRampSlope] = useState<number>(12); // 1:12 (max 12, higher number means gentler slope, e.g. 1:12 is compliant, 1:8 is illegal)
  const [windowGlazingPercent, setWindowGlazingPercent] = useState<number>(14); // min 10%

  const rules = [
    {
      id: 'rule_front_setback',
      title: 'Front Road Reserve Setback (Zambian Roads Act)',
      measured: `${frontSetback} m`,
      statutory: '>= 9.0 m',
      passed: frontSetback >= 9.0,
      note: frontSetback < 9.0 ? 'Violation: Building encroaches on 9m statutory road widening reserve.' : 'Compliant buffer maintained.'
    },
    {
      id: 'rule_side_setback',
      title: 'Side Boundary Clearance (Fire & Maintenance)',
      measured: `${sideSetback} m`,
      statutory: '>= 3.0 m',
      passed: sideSetback >= 3.0,
      note: sideSetback < 3.0 ? 'Violation: Fire access gap insufficient along boundary wall.' : 'Adequate fire vehicle clearance.'
    },
    {
      id: 'rule_plot_coverage',
      title: 'Maximum Plot Coverage Ratio',
      measured: `${plotCoverage}%`,
      statutory: '<= 60%',
      passed: plotCoverage <= 60,
      note: plotCoverage > 60 ? 'Violation: Overdevelopment. Impervious footprint exceeds 60% limit.' : 'Permeable open space preserved.'
    },
    {
      id: 'rule_ceiling_height',
      title: 'Habitable Room Clear Ceiling Height',
      measured: `${ceilingHeight} m`,
      statutory: '>= 2.6 m',
      passed: ceilingHeight >= 2.6,
      note: ceilingHeight < 2.6 ? 'Violation: Sub-standard headroom for thermal ventilation.' : 'Comfortable natural ventilation volume.'
    },
    {
      id: 'rule_fire_egress',
      title: 'Maximum Fire Exit Travel Distance',
      measured: `${fireEgressDistance} m`,
      statutory: '<= 30.0 m',
      passed: fireEgressDistance <= 30,
      note: fireEgressDistance > 30 ? 'CRITICAL VIOLATION: Evacuation path exceeds life-safety distance.' : 'Rapid egress verified.'
    },
    {
      id: 'rule_ramp_slope',
      title: 'Universal Access Wheelchair Ramp (ZABS BS8300)',
      measured: `1:${rampSlope}`,
      statutory: '<= 1:12 slope',
      passed: rampSlope >= 12,
      note: rampSlope < 12 ? 'Violation: Ramp gradient too steep for unassisted wheelchair access.' : 'Compliant universal gradient.'
    },
    {
      id: 'rule_natural_light',
      title: 'Habitable Natural Glazing Aperture',
      measured: `${windowGlazingPercent}%`,
      statutory: '>= 10% floor area',
      passed: windowGlazingPercent >= 10,
      note: windowGlazingPercent < 10 ? 'Violation: Inadequate natural daylighting.' : 'Natural light and ventilation verified.'
    }
  ];

  const totalPassed = rules.filter(r => r.passed).length;
  const overallCompliant = totalPassed === rules.length;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>MODULE 8 · AUTOMATED BIM &amp; PLAN CODE CHECKER</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Machine-Readable Zambian Building Regulations
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            Parses Industry Foundation Classes (IFC) and CAD drawing parameters against statutory building regulations, slashing council plan review turnaround from 90 days to under 10 minutes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Parameter Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Model Spatial Parameters
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span>Front Road Setback:</span>
                  <span className="font-mono text-emerald-400 font-bold">{frontSetback} m</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="0.5"
                  value={frontSetback}
                  onChange={(e) => setFrontSetback(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span>Side Boundary Setback:</span>
                  <span className="font-mono text-emerald-400 font-bold">{sideSetback} m</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="6"
                  step="0.1"
                  value={sideSetback}
                  onChange={(e) => setSideSetback(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span>Plot Coverage:</span>
                  <span className="font-mono text-emerald-400 font-bold">{plotCoverage}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="85"
                  step="1"
                  value={plotCoverage}
                  onChange={(e) => setPlotCoverage(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span>Fire Egress Path Distance:</span>
                  <span className="font-mono text-emerald-400 font-bold">{fireEgressDistance} m</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="1"
                  value={fireEgressDistance}
                  onChange={(e) => setFireEgressDistance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-neutral-300 mb-1">
                  <span>Ramp Gradient (1 : X):</span>
                  <span className="font-mono text-emerald-400 font-bold">1:{rampSlope}</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="16"
                  step="1"
                  value={rampSlope}
                  onChange={(e) => setRampSlope(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rule Results Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Automated Code Validation Results
                </h3>
                <span className="text-xs text-neutral-400">
                  {totalPassed} of {rules.length} Statutory Checks Satisfied
                </span>
              </div>

              <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                overallCompliant 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}>
                {overallCompliant ? 'MODEL PASSED' : 'VIOLATIONS DETECTED'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {rules.map((r) => (
                <div key={r.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        r.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {r.passed ? '✓' : '✕'}
                      </span>
                      <strong className="text-white">{r.title}</strong>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 pl-6">
                      {r.note}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono font-bold block ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.measured}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Req: {r.statutory}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
