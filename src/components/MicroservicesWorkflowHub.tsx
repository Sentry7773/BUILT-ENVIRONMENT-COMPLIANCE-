import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Server,
  Database,
  Layers,
  Cpu,
  FileText,
  Activity,
  Terminal,
  RefreshCw,
  QrCode,
  DollarSign,
  Building,
  UserCheck,
  Award,
  Zap,
  Globe,
  HardHat,
  Eye,
  Send,
  Code2,
  Sparkles,
  Key
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface WorkflowStep {
  stepNumber: number;
  id: string;
  title: string;
  service: string;
  endpoint: string;
  method: 'POST' | 'GET';
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result?: any;
}

const INITIAL_STEPS: WorkflowStep[] = [
  { stepNumber: 1, id: 'project_init', title: 'Project & Submission Initiation', service: 'Project Service (:4001)', endpoint: '/api/projects', method: 'POST', description: 'Creates project record & initial submission in DRAFT state.', status: 'PENDING' },
  { stepNumber: 2, id: 'verify_identity', title: 'National Identity & Consent Check', service: 'Verification Service (:4002)', endpoint: '/api/verifications/identity', method: 'POST', description: 'Simulated INRIS/NRC biometric consent match for client.', status: 'PENDING' },
  { stepNumber: 3, id: 'verify_entity', title: 'PACRA Corporate Entity Status', service: 'Verification Service (:4002)', endpoint: '/api/verifications/entity', method: 'POST', description: 'Verifies firm registration & absence of business name conflicts.', status: 'PENDING' },
  { stepNumber: 4, id: 'verify_architect', title: 'ZIA Architect Registration & CPD', service: 'Verification Service (:4002)', endpoint: '/api/verifications/professional', method: 'POST', description: 'Checks unencumbered ZIA license, CPD credits & disciplinary record.', status: 'PENDING' },
  { stepNumber: 5, id: 'verify_engineer', title: 'EIZ Engineering Practising Certificate', service: 'Verification Service (:4002)', endpoint: '/api/verifications/engineer', method: 'POST', description: 'Verifies structural/civil engineer registration & discipline check.', status: 'PENDING' },
  { stepNumber: 6, id: 'verify_tax', title: 'ZRA Tax Clearance (TPIN)', service: 'Verification Service (:4002)', endpoint: '/api/verifications/tax', method: 'POST', description: 'Verifies valid Tax Clearance Certificate with ZRA customs.', status: 'PENDING' },
  { stepNumber: 7, id: 'verify_social', title: 'NAPSA & Workers Compensation', service: 'Verification Service (:4002)', endpoint: '/api/verifications/social', method: 'POST', description: 'Validates social security and occupational injury compliance.', status: 'PENDING' },
  { stepNumber: 8, id: 'verify_insurance', title: 'Professional Indemnity Insurance (PII)', service: 'Verification Service (:4002)', endpoint: '/api/verifications/insurance', method: 'POST', description: 'Validates minimum ZMW 5,000,000 active PII coverage.', status: 'PENDING' },
  { stepNumber: 9, id: 'compliance_engine', title: 'Statutory Compliance Evaluation', service: 'Compliance Engine (:4003)', endpoint: '/api/compliance/evaluate/:id', method: 'POST', description: 'Evaluates hard blocks, warnings, and computes 100-point score.', status: 'PENDING' },
  { stepNumber: 10, id: 'passport_issue', title: 'Issue Cryptographic Submission Passport', service: 'Passport Service (:4004)', endpoint: '/api/passports/issue/:id', method: 'POST', description: 'Hashes documents, signs HMAC payload, anchors to SHA-256 ledger.', status: 'PENDING' },
  { stepNumber: 11, id: 'council_submit', title: 'Council Planning Gateway Ingestion', service: 'Council Service (:4005)', endpoint: '/api/council/submit/:id', method: 'POST', description: 'Pushes verified dossier to Council Planning Authority docket.', status: 'PENDING' },
  { stepNumber: 12, id: 'invoice_generate', title: 'Statutory Planning Fee Invoice', service: 'Payment Service (:4006)', endpoint: '/api/payments/invoice/:id', method: 'POST', description: 'Computes Council Permit, NCC levy, ZIA & EIZ statutory splits.', status: 'PENDING' },
  { stepNumber: 13, id: 'payment_settle', title: 'Multi-Channel Fee Settlement', service: 'Payment Service (:4006)', endpoint: '/api/payments/simulate', method: 'POST', description: 'Simulates Mobile Money / Bank payment and triggers instant event.', status: 'PENDING' },
  { stepNumber: 14, id: 'council_decision', title: 'Council Statutory Decision & Conditions', service: 'Council Service (:4005)', endpoint: '/api/council/decision', method: 'POST', description: 'Planning officer approves submission with statutory conditions.', status: 'PENDING' },
  { stepNumber: 15, id: 'contractor_bind', title: 'NCC Contractor Binding & NTP', service: 'Contractor Service (:4007)', endpoint: '/api/contractors/bind/:id', method: 'POST', description: 'Verifies NCC Grade C1 contractor and issues Notice to Proceed.', status: 'PENDING' },
  { stepNumber: 16, id: 'inspection_record', title: 'Geotagged Site Inspection Log', service: 'Inspection Service (:4008)', endpoint: '/api/inspections/:id', method: 'POST', description: 'Records foundation inspection with GPS coordinates & photo hashes.', status: 'PENDING' },
  { stepNumber: 17, id: 'occupancy_issue', title: 'Occupancy Certificate Issuance', service: 'Inspection Service (:4008)', endpoint: '/api/occupancy/:id', method: 'POST', description: 'Issues Certificate of Occupancy (OC-xxxx) and seals into ledger.', status: 'PENDING' },
  { stepNumber: 18, id: 'public_verify', title: 'Public QR Verification & Audit', service: 'Gateway & Verifier (:4000)', endpoint: '/api/public/passports/:id', method: 'GET', description: 'Validates immutable QR authenticity and current statutory state.', status: 'PENDING' }
];

export const MicroservicesWorkflowHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'kafka_events' | 'graphql' | 'ai_plan_review' | 'auth_service' | 'fiware_cdc' | 'ledger'>('pipeline');
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentWorkflowStatus, setCurrentWorkflowStatus] = useState<string>('DRAFT');
  
  // Real-time data
  const [kafkaEvents, setKafkaEvents] = useState<any[]>([]);
  const [ledgerBlocks, setLedgerBlocks] = useState<any[]>([]);
  const [fiwareEntities, setFiwareEntities] = useState<any[]>([]);
  const [debeziumStatus, setDebeziumStatus] = useState<any[]>([]);

  // Auth Service :4009 real data & testing state
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [recentOtps, setRecentOtps] = useState<any[]>([]);
  const [authTestOutput, setAuthTestOutput] = useState<string>('// Select a test action below to execute live against :4009 Auth Service');
  const [testAccessToken, setTestAccessToken] = useState<string | null>(null);
  const [testOtpCode, setTestOtpCode] = useState<string | null>(null);
  const [isAuthTesting, setIsAuthTesting] = useState(false);

  // GraphQL interactive playground state
  const [graphqlQuery, setGraphqlQuery] = useState(`query GetSubmissionState {
  submissionState(submissionId: "${activeSubmissionId || 'SUB-SAMPLE'}") {
    status
    context
    updated_at
  }
}`);
  const [graphqlResult, setGraphqlResult] = useState<string>('// Run a query to inspect GraphQL Gateway response');
  const [isQueryingGql, setIsQueryingGql] = useState(false);

  // AI Plan Review simulator state
  const [aiReviewResult, setAiReviewResult] = useState<any | null>(null);
  const [isAiReviewing, setIsAiReviewing] = useState(false);

  // Load telemetry periodically
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchTelemetry = async () => {
    try {
      const [eventsRes, ledgerRes, fiwareRes, cdcRes, usersRes, otpsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/ledger'),
        fetch('/api/fiware/entities'),
        fetch('/api/debezium/status'),
        fetch('/api/auth/users'),
        fetch('/api/auth/otps')
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setKafkaEvents(data.events || []);
      }
      if (ledgerRes.ok) {
        const data = await ledgerRes.json();
        setLedgerBlocks(data.ledger || []);
      }
      if (fiwareRes.ok) {
        const data = await fiwareRes.json();
        setFiwareEntities(data.entities || []);
      }
      if (cdcRes.ok) {
        const data = await cdcRes.json();
        setDebeziumStatus(data.connectors || []);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setRegisteredUsers(uData.users || []);
      }
      if (otpsRes.ok) {
        const oData = await otpsRes.json();
        setRecentOtps(oData.otps || []);
      }
    } catch (e) {
      // offline or startup
    }
  };

  // Run full 18-step pipeline in one go
  const handleRunFullPipeline = async () => {
    setIsAutoRunning(true);
    try {
      // Mark steps as running sequentially in UI
      const updatedSteps = [...steps];
      for (let i = 0; i < updatedSteps.length; i++) {
        updatedSteps[i].status = 'RUNNING';
        setSteps([...updatedSteps]);
        await new Promise(r => setTimeout(r, 120));
      }

      // Execute backend E2E Orchestrator
      const res = await fetch('/api/workflow/run-e2e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: `Lusaka Eco Tower Phase ${Math.floor(Math.random() * 800 + 100)}`,
          parcelId: `LUSAKA/${Math.floor(Math.random() * 500 + 100)}/26`
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActiveSubmissionId(data.submission.id);
        setActiveProjectId(data.project.id);
        setCurrentWorkflowStatus(data.finalState.status);

        // Mark all completed with response payload
        for (let i = 0; i < updatedSteps.length; i++) {
          updatedSteps[i].status = 'COMPLETED';
        }
        setSteps([...updatedSteps]);

        // Update GraphQL query placeholder with live submission ID
        setGraphqlQuery(`query GetSubmissionState {
  submissionState(submissionId: "${data.submission.id}") {
    status
    context
    updated_at
  }
}`);

        notificationService.dispatch({
          eventType: 'COUNCIL_PERMIT_GRANTED',
          priority: 'HIGH',
          targetRole: 'all',
          title: 'ZAPE 3.0 End-to-End Workflow Completed',
          message: `Submission ${data.submission.id} completed all 18 microservice steps and received Occupancy Certificate ${data.occupancy.certificate_number}.`,
          actionTab: 'platform_hub',
          actionLabel: 'Inspect Pipeline'
        });

        await fetchTelemetry();
      } else {
        throw new Error(data.error || 'Pipeline execution failed');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error running pipeline: ' + err.message);
    } finally {
      setIsAutoRunning(false);
    }
  };

  // Run AI Plan Review
  const handleRunAiPlanReview = async () => {
    setIsAiReviewing(true);
    try {
      const res = await fetch('/api/plan-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: activeSubmissionId || 'SUB-SAMPLE',
          project_type: 'HOSPITAL',
          risk_level: 'CRITICAL',
          documents: [
            { document_type: 'ARCHITECTURAL_DRAWINGS', name: 'Plans.pdf' },
            { document_type: 'STRUCTURAL_DRAWINGS', name: 'Calcs.pdf' }
            // Omitting SITE_PLAN to test detection
          ]
        })
      });
      const data = await res.json();
      setAiReviewResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiReviewing(false);
    }
  };

  // Execute GraphQL Query
  const handleExecuteGraphql = async () => {
    setIsQueryingGql(true);
    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: graphqlQuery })
      });
      const data = await res.json();
      setGraphqlResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setGraphqlResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsQueryingGql(false);
    }
  };

  // Auth Service :4009 Live Test Actions
  const handleTestAuthRegister = async () => {
    setIsAuthTesting(true);
    try {
      const payload = {
        full_name: 'MARY BANDA',
        phone: '0977123456',
        password: 'Zambia@2026',
        role: 'ARCHITECT',
        zia_membership: 'ZIA-ARCH-00991'
      };
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTestOtpCode(data.dev_otp_code || null);
      setAuthTestOutput(`// POST /api/auth/register (Status ${res.status})\n` + JSON.stringify(data, null, 2));
      fetchTelemetry();
    } catch (err: any) {
      setAuthTestOutput('Error: ' + err.message);
    } finally {
      setIsAuthTesting(false);
    }
  };

  const handleTestAuthVerifyOtp = async () => {
    setIsAuthTesting(true);
    try {
      const codeToUse = testOtpCode || recentOtps[0]?.code_plain || '123456';
      const payload = { identifier: '0977123456', code: codeToUse };
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.accessToken) setTestAccessToken(data.accessToken);
      setAuthTestOutput(`// POST /api/auth/verify-otp (Status ${res.status})\n` + JSON.stringify(data, null, 2));
      fetchTelemetry();
    } catch (err: any) {
      setAuthTestOutput('Error: ' + err.message);
    } finally {
      setIsAuthTesting(false);
    }
  };

  const handleTestAuthLogin = async () => {
    setIsAuthTesting(true);
    try {
      const payload = { identifier: '0977123456', password: 'Zambia@2026' };
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.accessToken) setTestAccessToken(data.accessToken);
      setAuthTestOutput(`// POST /api/auth/login (Status ${res.status})\n` + JSON.stringify(data, null, 2));
      fetchTelemetry();
    } catch (err: any) {
      setAuthTestOutput('Error: ' + err.message);
    } finally {
      setIsAuthTesting(false);
    }
  };

  const handleTestAuthMe = async () => {
    setIsAuthTesting(true);
    try {
      const token = testAccessToken || sessionStorage.getItem('zape_access_token');
      if (!token) {
        setAuthTestOutput('// Error: No access token available. Run Login or Verify OTP first.');
        return;
      }
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAuthTestOutput(`// GET /api/auth/me (Protected with requireAuth) (Status ${res.status})\n` + JSON.stringify(data, null, 2));
    } catch (err: any) {
      setAuthTestOutput('Error: ' + err.message);
    } finally {
      setIsAuthTesting(false);
    }
  };

  const handleTestAuthLockout = async () => {
    setIsAuthTesting(true);
    try {
      let lastData = null;
      for (let i = 1; i <= 5; i++) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: '0977123456', password: 'WrongPassword' + i })
        });
        lastData = await res.json();
      }
      setAuthTestOutput(`// Brute Force Lockout Simulation (5 bad passwords sent):\n` + JSON.stringify(lastData, null, 2));
      fetchTelemetry();
    } catch (err: any) {
      setAuthTestOutput('Error: ' + err.message);
    } finally {
      setIsAuthTesting(false);
    }
  };

  const handleTestAuthRefresh = async () => {
    setIsAuthTesting(true);
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.accessToken) setTestAccessToken(data.accessToken);
      setAuthTestOutput(`// POST /api/auth/refresh (Cookie rotation) (Status ${res.status})\n` + JSON.stringify(data, null, 2));
    } catch (err: any) {
      setAuthTestOutput('Error: ' + err.message);
    } finally {
      setIsAuthTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Architecture & Orchestrator */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-600/80 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span>ZAPE 3.0 Platform Engine &amp; Microservices Hub</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Kafka · FIWARE · GraphQL · SHA-256 Ledger
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Event-driven backbone with 18-step statutory pipeline, Debezium CDC connectors &amp; AI plan review.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-300 pt-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Kafka CloudEvents Bus: Online ({kafkaEvents.length} events)
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-300">
              SHA-256 Ledger: <strong className="text-white">{ledgerBlocks.length} Blocks</strong>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-300">
              FIWARE Orion Entities: <strong className="text-white">{fiwareEntities.length} Registered</strong>
            </span>
          </div>
        </div>

        {/* Master Action Trigger */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleRunFullPipeline}
            disabled={isAutoRunning}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/80 transition-all flex items-center gap-2 font-mono"
          >
            {isAutoRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running 18-Step Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Full 18-Step Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>18-Step Workflow Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('kafka_events')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'kafka_events'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Kafka CloudEvents ({kafkaEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graphql')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'graphql'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-pink-400" />
          <span>GraphQL Gateway (/graphql)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_plan_review')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ai_plan_review'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Plan Review Service</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('auth_service');
            fetchTelemetry();
          }}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'auth_service'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Auth &amp; User Service (:4009)</span>
        </button>

        <button
          onClick={() => setActiveTab('fiware_cdc')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'fiware_cdc'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>FIWARE Orion &amp; Debezium CDC</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SHA-256 Ledger ({ledgerBlocks.length})</span>
        </button>
      </div>

      {/* TAB 1: 18-STEP WORKFLOW PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Active Workflow Status Strip */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-neutral-400">Current Submission:</span>
              <span className="text-white font-bold">{activeSubmissionId || 'No active submission (Click "Run Pipeline")'}</span>
              {activeProjectId && <span className="text-neutral-500 font-mono">({activeProjectId})</span>}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Workflow State Machine:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-bold">
                {currentWorkflowStatus}
              </span>
            </div>
          </div>

          {/* Grid of 18 Pipeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {steps.map(step => (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all space-y-2 flex flex-col justify-between ${
                  step.status === 'COMPLETED'
                    ? 'bg-neutral-900/90 border-emerald-800/80'
                    : step.status === 'RUNNING'
                    ? 'bg-emerald-950/40 border-emerald-500 animate-pulse'
                    : 'bg-neutral-900/50 border-neutral-800 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                      Step {step.stepNumber}
                    </span>
                    <span className="text-[10px] text-emerald-400 truncate max-w-[150px]">
                      {step.service}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {step.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : step.status === 'RUNNING' ? (
                      <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                    )}
                    <span>{step.title}</span>
                  </h3>

                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-neutral-500">{step.method} {step.endpoint}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    step.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' :
                    step.status === 'RUNNING' ? 'bg-amber-950 text-amber-300' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: KAFKA CLOUDEVENTS BUS */}
      {activeTab === 'kafka_events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Kafka Event Backbone Stream</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800">
                  CloudEvents 1.0 Compliant
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Decoupled event-driven choreography. All microservices communicate via published topics.
              </p>
            </div>

            <button
              onClick={fetchTelemetry}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Events</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {kafkaEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs font-mono">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                      {evt.type}
                    </span>
                    <span className="text-neutral-400 text-[11px]">source: {evt.source}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {evt.time?.replace('T', ' ').substring(0, 19)} · ID: {evt.id?.substring(0, 8)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                  <span className="text-neutral-500">Partition Key:</span>
                  <span className="text-emerald-400 font-bold">{evt.key}</span>
                </div>

                <pre className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-emerald-300 overflow-x-auto max-h-32">
                  <code>{JSON.stringify(evt.data, null, 2)}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GRAPHQL GATEWAY EXPLORER */}
      {activeTab === 'graphql' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-pink-400" />
              <span>ZAPE GraphQL Gateway Explorer (/api/graphql)</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Federated single-endpoint GraphQL gateway aggregating project, submission states, public passports &amp; ledger events.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Query Editor */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-300 font-bold">GraphQL Query / Mutation</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setGraphqlQuery(`query GetSubmissionState {
  submissionState(submissionId: "${activeSubmissionId || 'SUB-SAMPLE'}") {
    status
    context
    updated_at
  }
}`)}
                    className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono"
                  >
                    State Query
                  </button>
                  <button
                    onClick={() => setGraphqlQuery(`query GetPublicPassport {
  publicPassport(submissionId: "${activeSubmissionId || 'SUB-SAMPLE'}") {
    sha256_hash
    qr_url
    issued_at
  }
}`)}
                    className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono"
                  >
                    Passport Query
                  </button>
                  <button
                    onClick={() => setGraphqlQuery(`query GetLedgerChain {
  ledger {
    seq
    event_type
    hash
    previous_hash
  }
}`)}
                    className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono"
                  >
                    Ledger Query
                  </button>
                </div>
              </div>

              <textarea
                value={graphqlQuery}
                onChange={(e) => setGraphqlQuery(e.target.value)}
                rows={10}
                className="w-full bg-neutral-900 border border-neutral-700 text-xs font-mono text-pink-300 p-3 rounded-lg focus:outline-none focus:border-pink-500"
              />

              <button
                onClick={handleExecuteGraphql}
                disabled={isQueryingGql}
                className="w-full py-2.5 bg-pink-700 hover:bg-pink-600 disabled:opacity-50 text-white text-xs font-bold font-mono rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isQueryingGql ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>Execute GraphQL Query</span>
              </button>
            </div>

            {/* Query Response */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <span className="text-xs font-mono text-neutral-300 font-bold block">Response (JSON)</span>
              <pre className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto min-h-[260px] max-h-[350px]">
                <code>{graphqlResult}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI PLAN REVIEW SERVICE */}
      {activeTab === 'ai_plan_review' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>AI Plan Review Engine (Python FastAPI / Gemini Service)</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Automated statutory compliance scanning: verifies mandatory drawing bundles, fire egress corridors, and institutional health clearances.
                </p>
              </div>

              <button
                onClick={handleRunAiPlanReview}
                disabled={isAiReviewing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                {isAiReviewing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Run AI Review Simulation</span>
              </button>
            </div>

            {aiReviewResult && (
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-neutral-400">AI Engine Status:</span>
                  <span className="text-emerald-400 font-bold">{aiReviewResult.ai_status}</span>
                </div>

                <div className="flex items-center justify-between font-mono">
                  <span className="text-neutral-400">Human Peer Review Flag:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${aiReviewResult.human_review_required ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300'}`}>
                    {aiReviewResult.human_review_required ? 'ACTION REQUIRED' : 'PASSED'}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <span className="text-neutral-400 font-semibold block">Flagged Regulatory Items:</span>
                  {aiReviewResult.flags?.map((flag: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-200 space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <strong className="text-red-300">{flag.type}</strong>
                        <span className="px-1.5 py-0.5 rounded bg-red-900 text-[10px]">{flag.severity}</span>
                      </div>
                      <p className="text-[11px] text-neutral-300">{JSON.stringify(flag.details)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: AUTH SERVICE (:4009) */}
      {activeTab === 'auth_service' && (
        <div className="space-y-6">
          {/* Header & Quick Action Tester */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>ZAPE Auth Backend Service (:4009 /api/auth)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    PostgreSQL Migration 002
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real accounts in `users`, rotating sessions in `refresh_tokens`, 6-digit SMS/email OTPs in `otp_codes`, and RBAC middleware.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Bcrypt / PBKDF2 Cost 12</span>
                </span>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div>
              <span className="text-xs font-mono font-bold text-neutral-300 block mb-2">
                Interactive API Test Flow (Matches cURL Test Specification):
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  onClick={handleTestAuthRegister}
                  disabled={isAuthTesting}
                  className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 transition-colors flex items-center gap-1.5"
                >
                  <span>1. Register Mary Banda (Architect)</span>
                </button>

                <button
                  onClick={handleTestAuthVerifyOtp}
                  disabled={isAuthTesting}
                  className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 transition-colors flex items-center gap-1.5"
                >
                  <span>2. Verify OTP &amp; Activate</span>
                </button>

                <button
                  onClick={handleTestAuthLogin}
                  disabled={isAuthTesting}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors flex items-center gap-1.5"
                >
                  <span>3. Login (Zambia@2026)</span>
                </button>

                <button
                  onClick={handleTestAuthMe}
                  disabled={isAuthTesting}
                  className="px-3 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-200 transition-colors flex items-center gap-1.5"
                >
                  <span>4. Call /api/auth/me (Bearer Token)</span>
                </button>

                <button
                  onClick={handleTestAuthLockout}
                  disabled={isAuthTesting}
                  className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 transition-colors flex items-center gap-1.5"
                >
                  <span>5. Test 5-Failure Lockout (15m Lock)</span>
                </button>

                <button
                  onClick={handleTestAuthRefresh}
                  disabled={isAuthTesting}
                  className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 transition-colors flex items-center gap-1.5"
                >
                  <span>6. Rotate Refresh Token</span>
                </button>
              </div>
            </div>

            {/* Live API Console Output */}
            <div>
              <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-neutral-400">
                <span>Auth Service Response Terminal:</span>
                {isAuthTesting && <span className="text-purple-400 animate-pulse">Executing request...</span>}
              </div>
              <pre className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-purple-300 overflow-x-auto max-h-56">
                <code>{authTestOutput}</code>
              </pre>
            </div>
          </div>

          {/* Database Tables & Active Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registered Users */}
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Table: users ({registeredUsers.length} Rows in PostgreSQL)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">CITEXT unique index on email &amp; phone.</p>
                </div>
                <button
                  onClick={fetchTelemetry}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-neutral-300"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {registeredUsers.map((u, idx) => (
                  <div key={u.id || idx} className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{u.full_name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${u.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                        {u.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span>{u.phone || u.email}</span>
                      <span className="text-purple-400 font-bold">{u.role}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      ID: {u.id} · Verified: {u.email_verified_at || u.phone_verified_at || 'Pending OTP'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OTP Codes Queue */}
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Table: otp_codes ({recentOtps.length} Sent OTPs)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">10-minute expiry, max 5 attempts per code.</p>
                </div>
                <button
                  onClick={fetchTelemetry}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-neutral-300"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {recentOtps.map((otp, idx) => (
                  <div key={otp.id || idx} className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{otp.identifier}</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300">{otp.purpose}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        {otp.created_at?.replace('T', ' ').substring(0, 19)} · ID: {otp.id}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-amber-400 font-bold tracking-widest text-sm">{otp.code_plain || '******'}</div>
                      <span className={`text-[10px] font-mono ${otp.consumed_at ? 'text-emerald-400' : 'text-neutral-400'}`}>
                        {otp.consumed_at ? 'Consumed' : 'Valid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FIWARE ORION & DEBEZIUM CDC */}
      {activeTab === 'fiware_cdc' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FIWARE Orion Broker Entities */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>FIWARE Orion Context Broker (NGSI-v2)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Semantic smart-city data entities representing cadastral parcels and statutory zoning boundaries.
              </p>
            </div>

            <div className="space-y-3">
              {fiwareEntities.map((ent, idx) => (
                <div key={ent.id || idx} className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                    <span className="text-white font-bold">{ent.id}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                      type: {ent.type}
                    </span>
                  </div>
                  <pre className="text-[11px] text-neutral-300 overflow-x-auto">
                    <code>{JSON.stringify(ent, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Debezium CDC Replication Connectors */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Debezium Change Data Capture (CDC)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Log-based streaming connectors syncing legacy PACRA companies and ZRA Tax databases into Kafka without invasive API rework.
              </p>
            </div>

            <div className="space-y-3">
              {debeziumStatus.map((cdc, idx) => (
                <div key={cdc.name || idx} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-white font-bold">{cdc.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                      {cdc.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 space-y-1">
                    <div>Source Server: <span className="text-neutral-200">{cdc.server}</span></div>
                    <div>Kafka Topic Prefix: <span className="text-amber-400">{cdc.topicPrefix}</span></div>
                    <div>Captured Tables: <span className="text-neutral-200">{cdc.tables?.join(', ')}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CRYPTOGRAPHIC SHA-256 LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Immutable SHA-256 Hash Chain Ledger</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {ledgerBlocks.length} Blocks Chained
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Consecutive cryptographically anchored blocks: current hash = sha256(previous_hash + payload + event_type).
              </p>
            </div>

            <button
              onClick={fetchTelemetry}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {ledgerBlocks.map((block) => (
              <div key={block.seq} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Block #{block.seq}
                    </span>
                    <span className="text-white font-semibold">{block.event_type}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">{block.created_at?.replace('T', ' ').substring(0, 19)}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-500 block">Previous Block Hash:</span>
                    <span className="text-neutral-400 truncate block">{block.previous_hash}</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-emerald-500 block">Block SHA-256 Hash:</span>
                    <span className="text-emerald-300 truncate block font-bold">{block.hash}</span>
                  </div>
                </div>

                <pre className="p-2 rounded bg-neutral-900 text-[11px] text-neutral-300 overflow-x-auto max-h-24">
                  <code>{JSON.stringify(block.payload, null, 2)}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
