import { Architect, ArchitecturalFirm, Project, SubmissionPassport } from '../types';
import { computeSha256 } from './cryptoLedger';

export interface PolicyEvaluationResult {
  status: 'APPROVED_FOR_SUBMISSION' | 'REMEDIATE' | 'BLOCKED' | 'IP_HOLD' | 'FOREIGN_LOCALIZATION_REQUIRED' | 'CORPORATE_PRACTICE_VIOLATION';
  complianceScore: number;
  hardBlocks: string[];
  warnings: string[];
  conditionalTasks: string[];
  greenScore: number;
  greenTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'NONE';
  councilFeeDiscountPercent: number;
  statutoryChecklist: {
    ruleId: string;
    description: string;
    passed: boolean;
    severity: 'hard_block' | 'remediate' | 'warning' | 'incentive';
    category: 'PROFESSIONAL' | 'FIRM' | 'PACRA_IP' | 'TEMPLATE_LICENSING' | 'FOREIGN_GATEWAY' | 'DEVELOPER_CONTROL' | 'RISK_SAFETY' | 'SITE_ZONING' | 'CLIMATE';
  }[];
}

export function evaluateSubmissionEligibility(
  firm: ArchitecturalFirm,
  architect: Architect,
  project: Project
): PolicyEvaluationResult {
  const hardBlocks: string[] = [];
  const warnings: string[] = [];
  const conditionalTasks: string[] = [];
  const checklist: PolicyEvaluationResult['statutoryChecklist'] = [];

  let specificStatusOverride: PolicyEvaluationResult['status'] | null = null;

  // 1. Individual Professional Checks
  const isArchActive = architect.status === 'ACTIVE';
  checklist.push({
    ruleId: 'architect_registration_active',
    description: 'Lead Architect holds active, unencumbered ZIA registration.',
    passed: isArchActive,
    severity: 'hard_block',
    category: 'PROFESSIONAL'
  });
  if (!isArchActive) {
    hardBlocks.push(`Lead Architect (${architect.name}, ${architect.ziaNumber}) registration status is ${architect.status}. Architectural submissions are legally prohibited.`);
  }

  const hasCpd = architect.cpdCredits >= architect.cpdRequired;
  checklist.push({
    ruleId: 'cpd_minimum_accrual',
    description: `Architect has accrued mandatory annual CPD credits (${architect.cpdCredits}/${architect.cpdRequired} credits).`,
    passed: hasCpd,
    severity: 'remediate',
    category: 'PROFESSIONAL'
  });
  if (!hasCpd) {
    conditionalTasks.push(`CPD Deficit: Architect has logged ${architect.cpdCredits} credits out of ${architect.cpdRequired} required. Complete outstanding accredited modules.`);
  }

  if (architect.registrationType === 'GRADUATE') {
    const hasCoSigner = architect.firmId === firm.id;
    checklist.push({
      ruleId: 'graduate_co_signature',
      description: 'Graduate Architect submission co-signed by Registered Principal.',
      passed: hasCoSigner,
      severity: 'hard_block',
      category: 'PROFESSIONAL'
    });
    if (!hasCoSigner) {
      hardBlocks.push('Graduate architect may only submit under direct supervision of a Registered Architect.');
    }
  }

  // 2. PACRA & Corporate Integrity Checks (ZAPE 3.0)
  const isPacraValid = firm.compliance.pacraRegistered;
  checklist.push({
    ruleId: 'pacra_active_status',
    description: `Firm PACRA Company Registration active (${firm.compliance.pacraNumber}).`,
    passed: isPacraValid,
    severity: 'hard_block',
    category: 'PACRA_IP'
  });
  if (!isPacraValid) {
    hardBlocks.push('Firm is not in good legal standing with PACRA company registry.');
  }

  const hasNameConflict = firm.compliance.businessNameConflict;
  checklist.push({
    ruleId: 'pacra_business_name_check',
    description: 'Firm business name verified without trademark or corporate name conflict.',
    passed: !hasNameConflict,
    severity: 'hard_block',
    category: 'PACRA_IP'
  });
  if (hasNameConflict) {
    hardBlocks.push('PACRA registry conflict: Firm name or trading identity is subject to an active naming dispute.');
  }

  if (project.claimsTrademark) {
    const tmValid = firm.compliance.verifiedTrademarksCount > 0;
    checklist.push({
      ruleId: 'trademark_verification',
      description: `Project trademark claim verified via PACRA Intellectual Property Office (${project.trademarkId || 'TM-REG'}).`,
      passed: tmValid,
      severity: 'hard_block',
      category: 'PACRA_IP'
    });
    if (!tmValid) {
      hardBlocks.push('Claimed trademark or proprietary brand is not registered in PACRA IP database.');
    }
  }

  // 3. Government Compliance Checks (ZRA, NAPSA, Workers Comp, PII)
  const isZraClear = firm.compliance.zraTaxClear;
  checklist.push({
    ruleId: 'tax_clearance_zra',
    description: `ZRA Tax Clearance Certificate valid (${firm.compliance.zraTccNumber} - Exp: ${firm.compliance.zraExpiry}).`,
    passed: isZraClear,
    severity: 'hard_block',
    category: 'FIRM'
  });
  if (!isZraClear) {
    hardBlocks.push('Firm does not hold a valid Zambia Revenue Authority (ZRA) Tax Clearance Certificate.');
  }

  const isNapsaCompliant = firm.compliance.napsaCompliant;
  checklist.push({
    ruleId: 'napsa_compliance',
    description: `NAPSA Statutory Employer Contributions verified (${firm.compliance.napsaNumber}).`,
    passed: isNapsaCompliant,
    severity: 'hard_block',
    category: 'FIRM'
  });
  if (!isNapsaCompliant) {
    hardBlocks.push('Firm is non-compliant with NAPSA employer pension remittance regulations.');
  }

  const isWorkersCompValid = firm.compliance.workersCompCompliant;
  checklist.push({
    ruleId: 'workers_compensation_wcfcb',
    description: `Workers Compensation Fund Control Board (WCFCB) compliance current (${firm.compliance.workersCompNumber}).`,
    passed: isWorkersCompValid,
    severity: 'hard_block',
    category: 'FIRM'
  });
  if (!isWorkersCompValid) {
    hardBlocks.push('Workers Compensation Fund Control Board (WCFCB) certificate missing or expired.');
  }

  const isPiiActive = firm.compliance.piiActive;
  checklist.push({
    ruleId: 'professional_indemnity_pii',
    description: `Professional Indemnity Insurance active (${firm.compliance.piiPolicyNumber} - ZMW ${(firm.compliance.piiCoverageZMW / 1000000).toFixed(1)}M cover).`,
    passed: isPiiActive,
    severity: 'hard_block',
    category: 'FIRM'
  });
  if (!isPiiActive) {
    hardBlocks.push('Firm Professional Indemnity Insurance (PII) has lapsed or is inactive. Statutory risk protection is mandatory.');
  } else {
    const expiry = new Date(firm.compliance.piiExpiry).getTime();
    const now = new Date('2026-10-05').getTime();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      warnings.push(`Professional Indemnity Insurance will expire in ${daysUntilExpiry} days (${firm.compliance.piiExpiry}). Prepare renewal.`);
    }
  }

  // 4. Intellectual Property & Plagiarism Checks (ZAPE 3.0)
  if (project.hasActiveIpDispute) {
    checklist.push({
      ruleId: 'ip_dispute_clearance',
      description: 'Project drawing files free from active intellectual property or plagiarism disputes.',
      passed: false,
      severity: 'hard_block',
      category: 'PACRA_IP'
    });
    hardBlocks.push('CRITICAL IP ALERT: Project is frozen under formal IP Dispute proceedings (IP_HOLD). Unlawful reuse claim filed.');
    specificStatusOverride = 'IP_HOLD';
  }

  // 5. Standardized Template & Regulated Marketplace Checks (ZAPE 3.0 Module 17)
  if (project.usesStandardizedTemplate) {
    const hasLicense = !!project.templateLicenseId;
    checklist.push({
      ruleId: 'template_license_valid',
      description: `Type-Approved Standardized Template License verified (${project.templateLicenseId || 'Missing'}).`,
      passed: hasLicense,
      severity: 'hard_block',
      category: 'TEMPLATE_LICENSING'
    });
    if (!hasLicense) {
      hardBlocks.push('Standardized template usage requires an active, purchased single-use or developer license.');
    }

    const hasSiteAdaptation = !!project.siteAdaptationCertificate;
    checklist.push({
      ruleId: 'template_site_adaptation',
      description: 'Mandatory Site Adaptation Certificate filed by Registered Local Architect.',
      passed: hasSiteAdaptation,
      severity: 'hard_block',
      category: 'TEMPLATE_LICENSING'
    });
    if (!hasSiteAdaptation) {
      hardBlocks.push('Standardized templates cannot be directly constructed without site-specific adaptation (soil, orientation, bylaws) by a registered architect.');
    }
  }

  // 6. Foreign-Based Design Localization Gateway (ZAPE 3.0 Module 18)
  if (project.originCountry && project.originCountry !== 'ZAMBIA') {
    const hasLocalAdopter = !!project.localAdoptingArchitectId;
    checklist.push({
      ruleId: 'foreign_local_adopting_architect',
      description: `Foreign design (${project.originCountry}) adopted by Registered Zambian Lead Architect.`,
      passed: hasLocalAdopter,
      severity: 'hard_block',
      category: 'FOREIGN_GATEWAY'
    });
    if (!hasLocalAdopter) {
      hardBlocks.push(`SOVEREIGNTY GATE: Architectural design originating from ${project.originCountry} cannot receive council review without an adopting Zambian registered architect assuming legal liability.`);
      specificStatusOverride = 'FOREIGN_LOCALIZATION_REQUIRED';
    }

    const hasLocalizationReport = !!project.localizationReportApproved;
    checklist.push({
      ruleId: 'foreign_localization_report',
      description: 'Zambian Building Regulations & Climate Localization Engineering Report verified.',
      passed: hasLocalizationReport,
      severity: 'hard_block',
      category: 'FOREIGN_GATEWAY'
    });
    if (!hasLocalizationReport) {
      hardBlocks.push('Foreign design localization report (converting foreign codes, wind loads, and thermal envelopes to Zambian standards) is required.');
    }

    const hasPermit = !!project.foreignConsultantPermitNumber;
    checklist.push({
      ruleId: 'foreign_consultant_permit',
      description: `Temporary Foreign Consultant Practice Permit active (${project.foreignConsultantPermitNumber || 'Missing'}).`,
      passed: hasPermit,
      severity: 'hard_block',
      category: 'FOREIGN_GATEWAY'
    });
    if (!hasPermit) {
      conditionalTasks.push('Foreign collaborating architectural firm must register a Temporary Foreign Consultant Permit with ZIA.');
    }

    const hasMaterialEquivalency = !!project.materialEquivalencyApproved;
    checklist.push({
      ruleId: 'material_equivalency_matrix',
      description: 'ZABS Material Equivalency Matrix filed for substituted local construction products.',
      passed: hasMaterialEquivalency,
      severity: 'remediate',
      category: 'FOREIGN_GATEWAY'
    });
    if (!hasMaterialEquivalency) {
      conditionalTasks.push('Submit ZABS Material Equivalency Report demonstrating local Zambian material performance substitution.');
    }
  }

  // 7. Non-Architect Firm & Real Estate Developer Controls (ZAPE 3.0 Module 19)
  if (project.submittedByDeveloper) {
    const hasFirmLink = !!project.hasRegisteredArchitecturalFirmLink;
    checklist.push({
      ruleId: 'developer_corporate_practice_firewall',
      description: 'Corporate Practice Firewall: Developer linked to an independent registered architectural firm.',
      passed: hasFirmLink,
      severity: 'hard_block',
      category: 'DEVELOPER_CONTROL'
    });
    if (!hasFirmLink) {
      hardBlocks.push('CORPORATE PRACTICE VIOLATION: Non-architect developer cannot perform or directly seal architectural submissions. Mandatory linkage to a registered architectural practice required.');
      specificStatusOverride = 'CORPORATE_PRACTICE_VIOLATION';
    }

    const hasIndependenceDeclaration = !!project.hasProfessionalIndependenceDeclaration;
    checklist.push({
      ruleId: 'professional_independence_declaration',
      description: 'Architect Professional Independence Declaration signed (free from commercial developer coercion).',
      passed: hasIndependenceDeclaration,
      severity: 'hard_block',
      category: 'DEVELOPER_CONTROL'
    });
    if (!hasIndependenceDeclaration) {
      hardBlocks.push('Architect must sign statutory declaration confirming design decisions were free from commercial pressure or safety compromises.');
    }

    const conflictScore = project.conflictOfInterestScore || 0;
    const isConflictAcceptable = conflictScore <= 0.7;
    checklist.push({
      ruleId: 'developer_conflict_of_interest_radar',
      description: `Conflict-of-Interest Radar: Risk index ${(conflictScore * 100).toFixed(0)}% (threshold <= 70%).`,
      passed: isConflictAcceptable,
      severity: 'remediate',
      category: 'DEVELOPER_CONTROL'
    });
    if (!isConflictAcceptable) {
      conditionalTasks.push(`High Conflict of Interest Risk (${(conflictScore * 100).toFixed(0)}%): Common ownership or directorship between developer and architect requires independent ZIA peer review.`);
    }
  }

  // 8. Project Typology & Safety Risk Checks
  if (project.buildingType === 'SCHOOL') {
    const hasFire = project.hasFireSafetyPlan;
    checklist.push({
      ruleId: 'school_fire_safety_plan',
      description: 'Educational facility fire escape egress route and assembly plan verified.',
      passed: hasFire,
      severity: 'remediate',
      category: 'RISK_SAFETY'
    });
    if (!hasFire) {
      conditionalTasks.push('Statutory Mandate: High-occupancy school requires certified Fire Safety & Egress Strategy drawing.');
    }

    const hasAccess = project.hasAccessibilityPlan;
    checklist.push({
      ruleId: 'school_accessibility_plan',
      description: 'Universal accessibility (ZABS BS8300 ramps, tactile signage, ADA toilets) certified.',
      passed: hasAccess,
      severity: 'remediate',
      category: 'RISK_SAFETY'
    });
    if (!hasAccess) {
      conditionalTasks.push('Universal Inclusion Mandate: Upload certified disability accessibility compliance plan.');
    }
  }

  if (project.buildingType === 'HOSPITAL') {
    const hasHealth = project.hasHealthClearance;
    checklist.push({
      ruleId: 'hospital_health_board_clearance',
      description: 'Health Professions Council of Zambia (HPCZ) and Public Health Directorate clearance.',
      passed: hasHealth,
      severity: 'remediate',
      category: 'RISK_SAFETY'
    });
    if (!hasHealth) {
      conditionalTasks.push('Health Facility Protocol: Health Professions Council of Zambia (HPCZ) layout clearance missing.');
    }
  }

  if (project.buildingType === 'HIGH_RISE' || project.totalFloors >= 5) {
    const hasStrucDocs = project.documents.some(d => d.category === 'STRUCTURAL_CALCS');
    checklist.push({
      ruleId: 'high_rise_peer_review',
      description: 'Independent Structural Engineering Peer Review and wind/seismic analysis filed.',
      passed: hasStrucDocs,
      severity: 'remediate',
      category: 'RISK_SAFETY'
    });
    if (!hasStrucDocs) {
      conditionalTasks.push('High-rise buildings (>4 storeys) require an independent Structural Peer Review endorsement.');
    }
  }

  // 9. Site & Land Checks
  const isTitleOk = project.landTitleVerified;
  checklist.push({
    ruleId: 'land_title_verification',
    description: `Cadastral Parcel (${project.parcelId}) Certificate of Title or Council Ground Rent receipt verified.`,
    passed: isTitleOk,
    severity: 'hard_block',
    category: 'SITE_ZONING'
  });
  if (!isTitleOk) {
    hardBlocks.push(`Land tenure for parcel ${project.parcelId} is unverified. Valid Certificate of Title or Council Lease required.`);
  }

  if (project.isFloodZone) {
    const hasFloodRep = project.hasFloodMitigation;
    checklist.push({
      ruleId: 'flood_risk_mitigation',
      description: 'Site is located in seasonal flood catchment. Hydrological runoff & slab elevation report required.',
      passed: hasFloodRep,
      severity: 'remediate',
      category: 'SITE_ZONING'
    });
    if (!hasFloodRep) {
      conditionalTasks.push('Site Hydrology: Parcel is in designated flood catchment zone. Submit Water Resources Authority runoff mitigation report.');
    }
  }

  // 10. Green Building & Sustainability Score
  let greenPoints = 0;
  if (project.greenFeatures.some(f => f.toLowerCase().includes('solar'))) greenPoints += 25;
  if (project.greenFeatures.some(f => f.toLowerCase().includes('rainwater') || f.toLowerCase().includes('greywater'))) greenPoints += 20;
  if (project.greenFeatures.some(f => f.toLowerCase().includes('ventilation') || f.toLowerCase().includes('shading'))) greenPoints += 15;
  if (project.greenFeatures.some(f => f.toLowerCase().includes('local') || f.toLowerCase().includes('brick') || f.toLowerCase().includes('masonry'))) greenPoints += 20;
  if (project.greenFeatures.some(f => f.toLowerCase().includes('accessibility') || f.toLowerCase().includes('ramp'))) greenPoints += 10;
  if (project.greenFeatures.some(f => f.toLowerCase().includes('bio-digester') || f.toLowerCase().includes('waste'))) greenPoints += 10;

  const greenScore = Math.min(100, greenPoints);
  let greenTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'NONE' = 'NONE';
  let councilFeeDiscountPercent = 0;

  if (greenScore >= 80) {
    greenTier = 'PLATINUM';
    councilFeeDiscountPercent = 25;
  } else if (greenScore >= 65) {
    greenTier = 'GOLD';
    councilFeeDiscountPercent = 15;
  } else if (greenScore >= 50) {
    greenTier = 'SILVER';
    councilFeeDiscountPercent = 10;
  } else if (greenScore >= 35) {
    greenTier = 'BRONZE';
    councilFeeDiscountPercent = 5;
  }

  checklist.push({
    ruleId: 'green_building_incentive',
    description: `Green Building Performance: ${greenTier} Tier (${greenScore}/100 pts) qualifies for ${councilFeeDiscountPercent}% municipal fee discount.`,
    passed: greenScore >= 35,
    severity: 'incentive',
    category: 'CLIMATE'
  });

  // Calculate overall compliance score (0 - 100)
  const totalWeight = checklist.filter(c => c.severity !== 'incentive').length;
  const passedWeight = checklist.filter(c => c.severity !== 'incentive' && c.passed).length;
  let complianceScore = Math.round((passedWeight / (totalWeight || 1)) * 100);

  if (hardBlocks.length > 0) {
    complianceScore = Math.min(complianceScore, 40);
  }

  let finalStatus: PolicyEvaluationResult['status'] = 'APPROVED_FOR_SUBMISSION';
  if (specificStatusOverride) {
    finalStatus = specificStatusOverride;
  } else if (hardBlocks.length > 0) {
    finalStatus = 'BLOCKED';
  } else if (conditionalTasks.length > 0) {
    finalStatus = 'REMEDIATE';
  }

  return {
    status: finalStatus,
    complianceScore,
    hardBlocks,
    warnings,
    conditionalTasks,
    greenScore,
    greenTier,
    councilFeeDiscountPercent,
    statutoryChecklist: checklist
  };
}

export async function generateSubmissionPassport(
  project: Project,
  architect: Architect,
  firm: ArchitecturalFirm,
  greenScore: number,
  greenTier: SubmissionPassport['greenTier']
): Promise<SubmissionPassport> {
  const now = new Date().toISOString();
  const sliUuid = `SLI-${Math.floor(100000 + Math.random() * 900000)}-2026-ZM`;
  const passportId = `ZAPE-2026-${project.councilId}-${Math.floor(1000 + Math.random() * 9000)}`;

  const docHashes = project.documents.map(d => ({
    name: d.name,
    hash: d.sha256Hash
  }));

  const passportPayload = `${passportId}|${sliUuid}|${project.id}|${architect.id}|${firm.id}|${firm.compliance.pacraNumber}|${now}|${JSON.stringify(docHashes)}`;
  const anchorHash = `0x${await computeSha256(passportPayload)}`;
  const signature = `RSA4096-ZIA-SIG-${anchorHash.substring(2, 14)}...${anchorHash.substring(58, 66)}`;

  return {
    passportId,
    sliUuid,
    projectId: project.id,
    projectName: project.title,
    leadArchitectId: architect.id,
    leadArchitectName: `${architect.name} (${architect.ziaNumber})`,
    firmId: firm.id,
    firmName: firm.name,
    councilId: project.councilId,
    councilName: project.councilId === 'LCC' ? 'Lusaka City Council' : project.councilId === 'NCC' ? 'Ndola City Council' : 'Kitwe City Council',
    parcelId: project.parcelId,
    gpsCoordinates: { lat: -15.4167, lng: 28.2833 },
    buildingType: project.buildingType,
    riskLevel: project.riskLevel,
    totalFloors: project.totalFloors,
    estimatedCostZMW: project.estimatedCostZMW,
    complianceScore: 98,
    policyVersion: 'ZAPE-STATUTORY-POL-2026.3',
    greenScore,
    greenTier,
    digitalSealTimestamp: now,
    digitalSealSignature: signature,
    ledgerAnchorHash: anchorHash,
    pacraRegNumber: firm.compliance.pacraNumber,
    ipChainId: `IP-CHAIN-${passportId}`,
    templateLicenseId: project.templateLicenseId,
    foreignAdoptionCertificateId: project.localAdoptingArchitectId ? `FAC-ZIA-${project.id}` : undefined,
    developerAuthorizationId: project.submittedByDeveloper ? `DAC-${project.developerPacraId}` : undefined,
    siteAdaptationCertificateId: project.usesStandardizedTemplate ? `SAC-${project.id}` : undefined,
    documentHashes: docHashes,
    sitePlaqueQrUrl: `https://zape.gov.zm/verify/plaque/${passportId}`
  };
}
