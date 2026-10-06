import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Award, 
  Building, 
  UserCheck,
  FileCheck
} from 'lucide-react';
import { StudentLogbookEntry } from '../types';
import { MOCK_STUDENT_LOGS } from '../data/mockDatabase';

export const StudentLogbook: React.FC = () => {
  const [logs, setLogs] = useState<StudentLogbookEntry[]>(MOCK_STUDENT_LOGS);
  const [isAdding, setIsAdding] = useState(false);

  // New Log Entry state
  const [projectName, setProjectName] = useState('Lusaka Clean Energy Innovation Hub');
  const [designStage, setDesignStage] = useState<StudentLogbookEntry['designStage']>('STATUTORY_DRAWINGS');
  const [hours, setHours] = useState<number>(20);
  const [tasks, setTasks] = useState('');

  const handleVerify = (id: string) => {
    setLogs(logs.map(l => l.id === id ? { ...l, verifiedByMentor: true } : l));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tasks.trim()) return;

    const newEntry: StudentLogbookEntry = {
      id: `LOG-${Date.now()}`,
      studentId: 'STU-UNZA-2022-491',
      studentName: 'Chikondi Phiri',
      university: 'University of Zambia (UNZA)',
      yearOfStudy: 4,
      projectName,
      firmName: 'Apex Studio Architects Ltd',
      mentorName: 'Arc. Mwansa Phiri',
      mentorZiaNumber: 'ZIA-1084',
      designStage,
      hoursLogged: hours,
      tasksCompleted: tasks.trim(),
      verifiedByMentor: false,
      dateLogged: new Date().toISOString().substring(0, 10)
    };

    setLogs([newEntry, ...logs]);
    setIsAdding(false);
    setTasks('');
  };

  const totalVerifiedHours = logs.filter(l => l.verifiedByMentor).reduce((sum, l) => sum + l.hoursLogged, 0);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>MODULE 12 · STUDENT &amp; GRADUATE ARCHITECTURE PIPELINE</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Verified Architectural Experience Transcript
          </h2>
          <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
            Eliminating forged internship claims. Students from UNZA and CBU log project contributions directly into a cryptographically signed transcript signed off by ZIA-registered principals.
          </p>
        </div>
      </div>

      {/* Student Profile & Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400">Emerging Practitioner</span>
          <h3 className="text-base font-bold text-white mt-1">Chikondi Phiri</h3>
          <span className="text-[11px] text-cyan-400 font-mono">UNZA 4th Year Architecture</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400">Supervising Mentor</span>
          <h3 className="text-base font-bold text-white mt-1">Arc. Mwansa Phiri</h3>
          <span className="text-[11px] text-emerald-400 font-mono">ZIA-1084 · Apex Studio</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400">Verified Experience Hours</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5 tabular-nums">
            {totalVerifiedHours} / 500 hrs
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Prerequisite for Professional Exam</span>
        </div>
      </div>

      {/* Logbook Header & Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white font-mono uppercase">
          Project Logbook Entries ({logs.length})
        </h3>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Project Hours</span>
        </button>
      </div>

      {/* Add Log Form */}
      {isAdding && (
        <form onSubmit={handleAddLog} className="p-5 rounded-xl bg-neutral-900 border border-neutral-700 space-y-4 text-xs">
          <h4 className="font-bold text-white font-mono uppercase">Record Practical Experience Entry</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1">Project</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Design Stage</label>
              <select
                value={designStage}
                onChange={(e) => setDesignStage(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg"
              >
                <option value="CONCEPT">Concept Design &amp; Site Analysis</option>
                <option value="SCHEMATIC">Schematic Spatial Layout</option>
                <option value="STATUTORY_DRAWINGS">Statutory Working Drawings</option>
                <option value="BIM_MODELING">BIM 3D Model &amp; Coordination</option>
                <option value="SITE_SUPERVISION">Construction Site Supervision</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Hours Logged</label>
              <input
                type="number"
                min={1}
                max={80}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 text-white p-2 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Detailed Technical Tasks Executed</label>
            <textarea
              required
              rows={2}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder="e.g. Modeled stairwell section details to ZABS compliance; assisted mentor with council site inspection..."
              className="w-full bg-neutral-950 border border-neutral-700 text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
            >
              Submit for Mentor Sign-Off
            </button>
          </div>
        </form>
      )}

      {/* Logs Table */}
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{log.projectName}</span>
                <span className="text-[10px] font-mono bg-neutral-950 text-cyan-300 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                  {log.designStage.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">{log.dateLogged}</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed max-w-2xl">
                {log.tasksCompleted}
              </p>
              <div className="text-[10px] text-neutral-400">
                Mentor: <strong className="text-neutral-200">{log.mentorName} ({log.mentorZiaNumber})</strong> · {log.firmName}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-base font-bold font-mono text-cyan-400 tabular-nums">
                  {log.hoursLogged} hrs
                </div>
                <span className={`text-[10px] font-mono ${
                  log.verifiedByMentor ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {log.verifiedByMentor ? 'VERIFIED' : 'PENDING MENTOR'}
                </span>
              </div>

              {!log.verifiedByMentor && (
                <button
                  onClick={() => handleVerify(log.id)}
                  className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded text-xs hover:bg-emerald-900 transition-colors"
                >
                  Sign Off as Mentor
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
