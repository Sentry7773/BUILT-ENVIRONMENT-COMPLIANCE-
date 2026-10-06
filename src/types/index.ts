export type ActorRole = 
  | 'architect' 
  | 'council' 
  | 'zia_admin' 
  | 'public_citizen' 
  | 'student' 
  | 'developer' 
  | 'foreign_consultant' 
  | 'ip_officer';

export type ArchitectStatus = 'ACTIVE' | 'CPD_PENDING' | 'UNDER_INVESTIGATION' | 'SUSPENDED' | 'PROVISIONAL';
export type RegistrationType = 'REGISTERED_ARCHITECT' | 'FELLOW' | 'GRADUATE' | 'TECHNICIAN' | 'FOREIGN_TEMPORARY';

export interface Architect {
  id: string;
  ziaNumber: string;
  nrcNumber: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  status: ArchitectStatus;
  registrationType: RegistrationType;
  registrationDate: string;
  cpdCredits: number;
  cpdRequired: number;
  firmId: string;
  firmName: string;
  specializations: string[];
  avatarUrl: string;
  biometricEnrolled: boolean;
  credentials: string[];
  disciplinaryHistory: {
    date: string;
    description: string;
    sanction?: string;
  }[];
}

export interface FirmCompliance {
  pacraRegistered: boolean;
  pacraNumber: string;
  zraTaxClear: boolean;
  zraTccNumber: string;
  zraExpiry: string;
  napsaCompliant: boolean;
  napsaNumber: string;
  workersCompCompliant: boolean;
  workersCompNumber: string;
  piiActive: boolean;
  piiPolicyNumber: string;
  piiInsurer: string;
  piiExpiry: string;
  piiCoverageZMW: number;
  ziaFirmLicense: boolean;
  healthScore: number; // 0 - 100
  // ZAPE 3.0 IP & PACRA Fields
  businessNameConflict: boolean;
  verifiedTrademarksCount: number;
  patentsAndDesignsCount: number;
}

export interface ArchitecturalFirm {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  compliance: FirmCompliance;
  directors: string[];
  registeredArchitectsCount: number;
  graduateArchitectsCount: number;
  activeProjectsCount: number;
  verificationBadge: 'PLATINUM' | 'GOLD' | 'STANDARD' | 'RESTRICTED';
}

export type BuildingType = 
  | 'SINGLE_RESIDENTIAL' 
  | 'MULTI_RESIDENTIAL' 
  | 'COMMERCIAL_OFFICE' 
  | 'SHOPPING_MALL' 
  | 'SCHOOL' 
  | 'HOSPITAL' 
  | 'HIGH_RISE' 
  | 'INDUSTRIAL' 
  | 'HERITAGE_DISTRICT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';

export type SubmissionStatus = 
  | 'DRAFT' 
  | 'PRE_CHECK_BLOCKED' 
  | 'REMEDIATION_REQUIRED' 
  | 'SEALED_AND_SUBMITTED' 
  | 'COUNCIL_IN_REVIEW' 
  | 'ADDITIONAL_INFO_REQUESTED' 
  | 'APPROVED' 
  | 'REJECTED'
  | 'IP_HOLD'
  | 'FOREIGN_LOCALIZATION_REQUIRED'
  | 'CORPORATE_PRACTICE_VIOLATION'
  | 'ADVERTISING_VIOLATION';

export interface ProjectDocument {
  id: string;
  name: string;
  category: 'ARCHITECTURAL_PLANS' | 'STRUCTURAL_CALCS' | 'FIRE_SAFETY' | 'ACCESSIBILITY' | 'ENVIRONMENTAL_ZEMA' | 'HERITAGE' | 'TITLE_DEED' | 'FOREIGN_LOCALIZATION' | 'MATERIAL_EQUIVALENCY' | 'TEMPLATE_ADAPTATION';
  sha256Hash: string;
  fileSize: string;
  uploadedAt: string;
  verified: boolean;
  ipWatermarkId?: string;
}

export interface SubmissionPassport {
  passportId: string; // e.g. ZAPE-2026-LCC-0891
  sliUuid: string;
  projectId: string;
  projectName: string;
  leadArchitectId: string;
  leadArchitectName: string;
  firmId: string;
  firmName: string;
  councilId: string;
  councilName: string;
  parcelId: string;
  gpsCoordinates: { lat: number; lng: number };
  buildingType: BuildingType;
  riskLevel: RiskLevel;
  totalFloors: number;
  estimatedCostZMW: number;
  documentHashes: { name: string; hash: string }[];
  complianceScore: number;
  policyVersion: string;
  greenScore: number;
  greenTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'NONE';
  digitalSealTimestamp: string;
  digitalSealSignature: string;
  ledgerAnchorHash: string;
  // ZAPE 3.0 IP & Governance Additions
  pacraRegNumber: string;
  ipChainId?: string;
  templateLicenseId?: string;
  foreignAdoptionCertificateId?: string;
  developerAuthorizationId?: string;
  siteAdaptationCertificateId?: string;
  councilApproval?: {
    approvedAt: string;
    permitNumber: string;
    primaryOfficer: string;
    secondaryOfficer: string;
    expiryDate: string;
    conditions: string[];
  };
  sitePlaqueQrUrl: string;
}

export interface CouncilReviewComment {
  id: string;
  author: string;
  role: string;
  department: string;
  timestamp: string;
  text: string;
  status: 'PENDING' | 'RESOLVED';
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientContact: string;
  leadArchitectId: string;
  firmId: string;
  councilId: string;
  parcelId: string;
  siteAddress: string;
  province: string;
  buildingType: BuildingType;
  riskLevel: RiskLevel;
  totalFloors: number;
  plotAreaSqM: number;
  buildingFootprintSqM: number;
  estimatedCostZMW: number;
  status: SubmissionStatus;
  documents: ProjectDocument[];
  hasFireSafetyPlan: boolean;
  hasAccessibilityPlan: boolean;
  hasHealthClearance: boolean;
  hasFloodMitigation: boolean;
  hasHeritageClearance: boolean;
  isFloodZone: boolean;
  isHeritageZone: boolean;
  landTitleVerified: boolean;
  greenFeatures: string[];
  passport?: SubmissionPassport;
  comments: CouncilReviewComment[];
  createdAt: string;
  // ZAPE 3.0 New Governance Fields
  claimsTrademark?: boolean;
  trademarkId?: string;
  usesStandardizedTemplate?: boolean;
  templateId?: string;
  templateLicenseId?: string;
  siteAdaptationCertificate?: boolean;
  originCountry: string; // 'ZAMBIA' or foreign e.g. 'UAE', 'UK', 'CHINA', 'SOUTH_AFRICA'
  foreignFirmName?: string;
  foreignConsultantPermitNumber?: string;
  localAdoptingArchitectId?: string;
  localAdoptingArchitectName?: string;
  localizationReportApproved?: boolean;
  materialEquivalencyApproved?: boolean;
  submittedByDeveloper?: boolean;
  developerPacraId?: string;
  developerName?: string;
  hasRegisteredArchitecturalFirmLink?: boolean;
  hasProfessionalIndependenceDeclaration?: boolean;
  conflictOfInterestScore?: number; // 0.0 - 1.0
  hasActiveIpDispute?: boolean;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  eventType: 
    | 'SLI_GENERATED' 
    | 'DIGITAL_SEAL_APPLIED' 
    | 'COUNCIL_SUBMITTED' 
    | 'COUNCIL_APPROVED' 
    | 'DISCIPLINARY_ACTION' 
    | 'DOCUMENT_HASH_VERIFIED'
    | 'IP_ASSET_REGISTERED'
    | 'TEMPLATE_TYPE_APPROVED'
    | 'FOREIGN_DESIGN_LOCALIZED'
    | 'DEVELOPER_AUTHORIZED'
    | 'IP_DISPUTE_ENACTED';
  actorId: string;
  actorName: string;
  actorRole: string;
  projectId: string;
  previousBlockHash: string;
  blockHash: string;
  dataSummary: string;
}

export interface CitizenReport {
  id: string;
  sitePlaqueId: string;
  projectName: string;
  siteAddress: string;
  reportedAt: string;
  reporterContact: string;
  violationType: 'UNAUTHORIZED_HEIGHT' | 'CHANGED_USE' | 'UNSAFE_SCAFFOLDING' | 'NO_APPROVED_PERMIT' | 'ENVIRONMENTAL_HAZARD' | 'ENCROACHMENT' | 'UNLICENSED_TEMPLATE' | 'DEVELOPER_UNLAWFUL_PRACTICE';
  description: string;
  status: 'INVESTIGATING' | 'INSPECTION_SCHEDULED' | 'RESOLVED' | 'FALSE_REPORT';
  assignedInspector?: string;
  councilActionTaken?: string;
}

export interface StudentLogbookEntry {
  id: string;
  studentId: string;
  studentName: string;
  university: string;
  yearOfStudy: number;
  projectName: string;
  firmName: string;
  mentorName: string;
  mentorZiaNumber: string;
  designStage: 'CONCEPT' | 'SCHEMATIC' | 'STATUTORY_DRAWINGS' | 'SITE_SUPERVISION' | 'BIM_MODELING';
  hoursLogged: number;
  tasksCompleted: string;
  verifiedByMentor: boolean;
  dateLogged: string;
}

// -------------------------------------------------------------
// ZAPE 3.0 NEW MODULE ENTITIES
// -------------------------------------------------------------

export type IPAssetType = 
  | 'COPYRIGHT_DRAWING' 
  | 'TRADEMARK' 
  | 'PATENT' 
  | 'INDUSTRIAL_DESIGN' 
  | 'STANDARDIZED_TEMPLATE';

export interface IPAsset {
  id: string;
  title: string;
  assetType: IPAssetType;
  ownerFirmId: string;
  ownerFirmName: string;
  leadAuthor: string;
  pacraRegistrationNo: string;
  sha256Hash: string;
  timestamp: string;
  status: 'REGISTERED' | 'PENDING_PACRA' | 'DISPUTED' | 'LICENSED';
  description: string;
  activeLicensesCount: number;
  royaltiesEarnedZMW: number;
}

export interface IPDisputeCase {
  id: string;
  assetId: string;
  complainantName: string;
  complainantFirm: string;
  respondentName: string;
  respondentFirm: string;
  claimType: 'PLAGIARISM' | 'UNLICENSED_REUSE' | 'TRADEMARK_INFRINGEMENT' | 'FOREIGN_UNAUTHORIZED_USE';
  originalHash: string;
  disputedHash: string;
  similarityScore: number; // e.g. 94%
  status: 'ACTIVE_FREEZE' | 'MEDIATION' | 'ZIA_ETHICS_PANEL' | 'RESOLVED_TAKEDOWN' | 'DISMISSED';
  dateFiled: string;
  summary: string;
  remedyActionTaken?: string;
}

export interface StandardizedTemplate {
  id: string;
  name: string;
  version: string;
  category: 'AFFORDABLE_HOUSING' | 'RURAL_SCHOOL' | 'COMMUNITY_CLINIC' | 'MODULAR_SYSTEM' | 'HERITAGE_INFILL';
  authorArchitect: string;
  authorZiaNumber: string;
  firmName: string;
  pacraFirmId: string;
  typeApprovalStatus: 'TYPE_APPROVED' | 'IN_COMMITTEE_REVIEW' | 'REVOKED';
  suitableClimateZones: string[];
  maxFloors: number;
  minPlotSizeSqM: number;
  estimatedBuildCostZMW: number;
  singleUseLicenseFeeZMW: number;
  multiUnitDeveloperLicenseFeeZMW: number;
  requiresSiteAdaptation: boolean;
  totalLicensesIssued: number;
  description: string;
  imageUrl?: string;
}

export interface ForeignDesignPackage {
  id: string;
  projectName: string;
  originCountry: string;
  foreignFirmName: string;
  foreignConsultantPermitNo: string;
  localAdoptingArchitectId: string;
  localAdoptingArchitectName: string;
  localAdoptingArchitectZia: string;
  localizationReportApproved: boolean;
  materialEquivalencyMatrix: {
    originalSpec: string;
    zambianSubstitute: string;
    fireRating: string;
    certifiedByZABS: boolean;
  }[];
  liabilityDeclarationSigned: boolean;
  status: 'LOCALIZED_APPROVED' | 'PENDING_LOCAL_ADOPTION' | 'EQUIVALENCY_DEFICIT';
  dateImported: string;
}

export interface DeveloperEntity {
  id: string;
  companyName: string;
  pacraNumber: string;
  directors: string[];
  zraTaxClear: boolean;
  authorizedPathway: 'INDEPENDENT_CONTRACT' | 'ARCHITECTURAL_SUBSIDIARY' | 'JOINT_VENTURE' | 'TEMPLATE_LICENSING';
  registeredArchitecturalFirmLink: string;
  professionalIndependenceDeclaration: boolean;
  conflictOfInterestScore: number; // 0.0 - 1.0 (Alert if > 0.7)
  authorizationCertificateId: string;
  activeProjectsCount: number;
  advertisingComplianceStatus: 'COMPLIANT' | 'FLAGGED_UNLAWFUL_CLAIM';
}

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'INFO';

export type NotificationEventType = 
  | 'PROJECT_STATUS_UPDATED'
  | 'BIOMETRIC_SEAL_APPLIED'
  | 'COUNCIL_SUBMITTED'
  | 'COUNCIL_PERMIT_GRANTED'
  | 'REMEDIATION_REQUESTED'
  | 'IP_HOLD_FREEZE'
  | 'CITIZEN_REPORT_ALERT';

export interface AppNotification {
  id: string;
  timestamp: string;
  eventType: NotificationEventType;
  priority: NotificationPriority;
  targetRole: 'architect' | 'council' | 'all' | 'public_citizen';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  councilId?: string;
  permitNumber?: string;
  read: boolean;
  actionTab?: string;
  actionLabel?: string;
}

export interface RSABiometricSignatureRecord {
  id: string; // e.g. SIG-RSA4096-2026-0891
  timestamp: string;
  architectId: string;
  architectName: string;
  ziaNumber: string;
  nrcNumber: string;
  firmId: string;
  firmName: string;
  projectId: string;
  projectName: string;
  parcelId: string;
  councilId: string;
  councilName: string;
  buildingType: BuildingType;
  totalFloors: number;
  passportId: string;
  biometricAuthType: 'FIDO2_HARDWARE_TOKEN' | 'FINGERPRINT_ENCLAVE' | 'FACIAL_GEOMETRY';
  biometricHardwareSerial: string;
  keyAlgorithm: 'RSA-4096 / SHA-256 PKCS#1 v1.5';
  keyFingerprint: string;
  signatureHex: string;
  drawingBundleHash: string;
  ledgerBlockHash: string;
  ledgerBlockIndex: number;
  statutoryDeclarationText: string;
  verified: boolean;
}

export interface BiometricSessionState {
  isAuthenticated: boolean;
  authenticatedAt?: string;
  expiresAt?: string;
  authMethod?: 'FINGERPRINT' | 'FIDO2_HARDWARE' | 'FACIAL_RECOGNITION';
  hardwareTokenId?: string;
  enclaveDerivationKey?: string;
  biometricConfidence?: number;
}

