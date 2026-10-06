import { 
  Architect, 
  ArchitecturalFirm, 
  Project, 
  CitizenReport, 
  StudentLogbookEntry,
  IPAsset,
  IPDisputeCase,
  StandardizedTemplate,
  ForeignDesignPackage,
  DeveloperEntity
} from '../types';

export const MOCK_COUNCILS = [
  { id: 'LCC', name: 'Lusaka City Council', province: 'Lusaka', jurisdictionCode: 'ZM-09-LCC', activeReviewers: 14, avgReviewDays: 4.2 },
  { id: 'NCC', name: 'Ndola City Council', province: 'Copperbelt', jurisdictionCode: 'ZM-08-NCC', activeReviewers: 8, avgReviewDays: 5.1 },
  { id: 'KCC', name: 'Kitwe City Council', province: 'Copperbelt', jurisdictionCode: 'ZM-08-KCC', activeReviewers: 9, avgReviewDays: 4.8 },
  { id: 'LIV', name: 'Livingstone City Council', province: 'Southern', jurisdictionCode: 'ZM-07-LIV', activeReviewers: 6, avgReviewDays: 6.0 },
  { id: 'SOL', name: 'Solwezi Municipal Council', province: 'North-Western', jurisdictionCode: 'ZM-06-SOL', activeReviewers: 5, avgReviewDays: 7.2 }
];

export const MOCK_FIRMS: ArchitecturalFirm[] = [
  {
    id: 'FIRM-001',
    name: 'Apex Studio Architects Ltd',
    city: 'Lusaka',
    province: 'Lusaka',
    address: 'Plot 4812, Addis Ababa Drive, Rhodes Park, Lusaka',
    contactEmail: 'practice@apexstudio.co.zm',
    contactPhone: '+260 211 254 990',
    directors: ['Arc. Mwansa Phiri (ZIA 1084)', 'Arc. Beatrice Tembo (ZIA 0954)'],
    registeredArchitectsCount: 6,
    graduateArchitectsCount: 4,
    activeProjectsCount: 14,
    verificationBadge: 'PLATINUM',
    compliance: {
      pacraRegistered: true,
      pacraNumber: 'PACRA-12020004918',
      zraTaxClear: true,
      zraTccNumber: 'ZRA-TCC-2026-90412',
      zraExpiry: '2026-12-31',
      napsaCompliant: true,
      napsaNumber: 'NAPSA-EMP-401928',
      workersCompCompliant: true,
      workersCompNumber: 'WCFCB-883190',
      piiActive: true,
      piiPolicyNumber: 'PII-MADISON-2026-081',
      piiInsurer: 'Madison General Insurance Zambia',
      piiExpiry: '2027-04-30',
      piiCoverageZMW: 15000000,
      ziaFirmLicense: true,
      healthScore: 98,
      businessNameConflict: false,
      verifiedTrademarksCount: 2,
      patentsAndDesignsCount: 1
    }
  },
  {
    id: 'FIRM-002',
    name: 'Copperbelt Urban Dynamics Ltd',
    city: 'Kitwe',
    province: 'Copperbelt',
    address: 'Suite 4, Parklands Business Park, Kitwe',
    contactEmail: 'info@copperbelturban.zm',
    contactPhone: '+260 212 228 114',
    directors: ['Arc. Chileshe Mulenga (ZIA 0872)'],
    registeredArchitectsCount: 4,
    graduateArchitectsCount: 3,
    activeProjectsCount: 9,
    verificationBadge: 'GOLD',
    compliance: {
      pacraRegistered: true,
      pacraNumber: 'PACRA-12019003812',
      zraTaxClear: true,
      zraTccNumber: 'ZRA-TCC-2026-44129',
      zraExpiry: '2026-11-30',
      napsaCompliant: true,
      napsaNumber: 'NAPSA-EMP-391820',
      workersCompCompliant: true,
      workersCompNumber: 'WCFCB-772184',
      piiActive: true,
      piiPolicyNumber: 'PII-NIKO-2026-193',
      piiInsurer: 'NICO Insurance Zambia',
      piiExpiry: '2026-12-15',
      piiCoverageZMW: 8000000,
      ziaFirmLicense: true,
      healthScore: 91,
      businessNameConflict: false,
      verifiedTrademarksCount: 1,
      patentsAndDesignsCount: 2
    }
  },
  {
    id: 'FIRM-003',
    name: 'Horizon Built Environment Partners',
    city: 'Ndola',
    province: 'Copperbelt',
    address: 'Broadway Way, Commercial Quarter, Ndola',
    contactEmail: 'admin@horizonzm.com',
    contactPhone: '+260 212 612 045',
    directors: ['Arc. Derrick Mwape (ZIA 0619 - SUSPENDED)'],
    registeredArchitectsCount: 2,
    graduateArchitectsCount: 2,
    activeProjectsCount: 5,
    verificationBadge: 'RESTRICTED',
    compliance: {
      pacraRegistered: true,
      pacraNumber: 'PACRA-12022009110',
      zraTaxClear: true,
      zraTccNumber: 'ZRA-TCC-2026-11029',
      zraExpiry: '2026-10-31',
      napsaCompliant: false,
      napsaNumber: 'NAPSA-EMP-102948',
      workersCompCompliant: true,
      workersCompNumber: 'WCFCB-552910',
      piiActive: false,
      piiPolicyNumber: 'PII-PRUDENTIAL-2025-09',
      piiInsurer: 'Prudential Zambia',
      piiExpiry: '2026-09-01',
      piiCoverageZMW: 2000000,
      ziaFirmLicense: false,
      healthScore: 48,
      businessNameConflict: true, // PACRA name dispute
      verifiedTrademarksCount: 0,
      patentsAndDesignsCount: 0
    }
  }
];

export const MOCK_ARCHITECTS: Architect[] = [
  {
    id: 'ARC-001',
    ziaNumber: 'ZIA-1084',
    nrcNumber: '294810/11/1',
    name: 'Arc. Mwansa Phiri',
    title: 'Principal Lead Architect & Urbanist',
    email: 'm.phiri@apexstudio.co.zm',
    phone: '+260 977 401 229',
    province: 'Lusaka',
    city: 'Lusaka',
    status: 'ACTIVE',
    registrationType: 'REGISTERED_ARCHITECT',
    registrationDate: '2016-04-12',
    cpdCredits: 38,
    cpdRequired: 30,
    firmId: 'FIRM-001',
    firmName: 'Apex Studio Architects Ltd',
    specializations: ['Civic & Institutional', 'High-Rise Commercial', 'Sustainable Urban Design'],
    avatarUrl: '/src/assets/images/architect_portrait_zia_1791209775003.jpg',
    biometricEnrolled: true,
    credentials: [
      'ZIA Registered Architect',
      'CPD Compliant 2026',
      'Green Building Council Certified',
      'Lead Consultant Eligible',
      'PACRA IP Agent Accredited',
      'Foreign Design Local Adopter'
    ],
    disciplinaryHistory: []
  },
  {
    id: 'ARC-002',
    ziaNumber: 'ZIA-0872',
    nrcNumber: '119284/61/1',
    name: 'Arc. Chileshe Mulenga',
    title: 'Fellow Architect, Urban Regeneration',
    email: 'c.mulenga@copperbelturban.zm',
    phone: '+260 966 812 040',
    province: 'Copperbelt',
    city: 'Kitwe',
    status: 'ACTIVE',
    registrationType: 'FELLOW',
    registrationDate: '2008-11-20',
    cpdCredits: 45,
    cpdRequired: 30,
    firmId: 'FIRM-002',
    firmName: 'Copperbelt Urban Dynamics Ltd',
    specializations: ['Industrial & Mining Architecture', 'Public Healthcare Facilities', 'Heritage Conservation'],
    avatarUrl: '',
    biometricEnrolled: true,
    credentials: [
      'ZIA Fellow Architect',
      'CPD Compliant 2026',
      'Heritage Conservation Accredited (NHCC)',
      'Lead Arbitrator Panel ZIA',
      'Foreign Design Adopting Architect'
    ],
    disciplinaryHistory: []
  },
  {
    id: 'ARC-003',
    ziaNumber: 'ZIA-1240',
    nrcNumber: '381920/10/1',
    name: 'Arc. Thandiwe Zulu',
    title: 'Senior Architect, Climate & Biomimetic Design',
    email: 't.zulu@greenspace.zm',
    phone: '+260 978 519 220',
    province: 'Lusaka',
    city: 'Lusaka',
    status: 'ACTIVE',
    registrationType: 'REGISTERED_ARCHITECT',
    registrationDate: '2020-03-15',
    cpdCredits: 34,
    cpdRequired: 30,
    firmId: 'FIRM-001',
    firmName: 'Apex Studio Architects Ltd',
    specializations: ['Bioclimatic Design', 'Educational Facilities', 'Low-Carbon Masonry'],
    avatarUrl: '',
    biometricEnrolled: true,
    credentials: [
      'ZIA Registered Architect',
      'CPD Compliant 2026',
      'Passive Solar Certification (SADC)',
      'Accessibility Audit Specialist',
      'Standardized Template Reviewer'
    ],
    disciplinaryHistory: []
  },
  {
    id: 'ARC-004',
    ziaNumber: 'ZIA-0619',
    nrcNumber: '184910/68/1',
    name: 'Arc. Derrick Mwape',
    title: 'Architect (License Suspended)',
    email: 'd.mwape@horizonzm.com',
    phone: '+260 955 319 802',
    province: 'Copperbelt',
    city: 'Ndola',
    status: 'SUSPENDED',
    registrationType: 'REGISTERED_ARCHITECT',
    registrationDate: '2004-06-18',
    cpdCredits: 12,
    cpdRequired: 30,
    firmId: 'FIRM-003',
    firmName: 'Horizon Built Environment Partners',
    specializations: ['Commercial Retail'],
    avatarUrl: '',
    biometricEnrolled: false,
    credentials: ['Past Registration (2004-2025)'],
    disciplinaryHistory: [
      {
        date: '2025-11-14',
        description: 'Unauthorized rubber-stamping of non-compliant structural modifications in Ndola CBD without peer review.',
        sanction: '12-Month License Suspension & Statutory Fine ZMW 75,000'
      }
    ]
  },
  {
    id: 'ARC-005',
    ziaNumber: 'GRAD-ZIA-449',
    nrcNumber: '401928/11/1',
    name: 'Graduate Arc. Kasonde Banda',
    title: 'Graduate Architect & Computational Designer',
    email: 'k.banda@apexstudio.co.zm',
    phone: '+260 971 228 901',
    province: 'Lusaka',
    city: 'Lusaka',
    status: 'ACTIVE',
    registrationType: 'GRADUATE',
    registrationDate: '2024-01-10',
    cpdCredits: 22,
    cpdRequired: 20,
    firmId: 'FIRM-001',
    firmName: 'Apex Studio Architects Ltd',
    specializations: ['Computational BIM', 'Parametric Facades'],
    avatarUrl: '',
    biometricEnrolled: true,
    credentials: ['Graduate Member ZIA', 'Candidate for Full Professional Exam 2027'],
    disciplinaryHistory: []
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'PRJ-LCC-2026-001',
    title: 'Lusaka Clean Energy Innovation Hub',
    clientName: 'Ministry of Technology & Science / ZICTA',
    clientContact: 'director.procurement@mots.gov.zm',
    leadArchitectId: 'ARC-001',
    firmId: 'FIRM-001',
    councilId: 'LCC',
    parcelId: 'LUS-RHOD-4819/B',
    siteAddress: 'Corner of Great East Road & Church Road, Lusaka',
    province: 'Lusaka',
    buildingType: 'COMMERCIAL_OFFICE',
    riskLevel: 'HIGH',
    totalFloors: 6,
    plotAreaSqM: 4200,
    buildingFootprintSqM: 1850,
    estimatedCostZMW: 64000000,
    status: 'APPROVED',
    hasFireSafetyPlan: true,
    hasAccessibilityPlan: true,
    hasHealthClearance: false,
    hasFloodMitigation: false,
    hasHeritageClearance: false,
    isFloodZone: false,
    isHeritageZone: false,
    landTitleVerified: true,
    originCountry: 'ZAMBIA',
    claimsTrademark: true,
    trademarkId: 'TM-PACRA-2026-091',
    greenFeatures: [
      'Solar Rooftop PV 180kWp with Battery Storage',
      'Rainwater Harvesting Cistern (90,000L)',
      'Solar Shading Terracotta Brise-soleil',
      'Locally Manufactured Copperbelt Earth Bricks',
      'Greywater Recycling for Landscape Irrigation'
    ],
    createdAt: '2026-09-12',
    documents: [
      {
        id: 'DOC-01',
        name: 'ARCH-A101-MasterPlan_FloorPlans.pdf',
        category: 'ARCHITECTURAL_PLANS',
        sha256Hash: '0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b120',
        fileSize: '14.8 MB',
        uploadedAt: '2026-09-28 08:30',
        verified: true,
        ipWatermarkId: 'WM-ZAPE-PACRA-0891'
      },
      {
        id: 'DOC-02',
        name: 'STRUC-S201-ReinforcedFrameCalcs.pdf',
        category: 'STRUCTURAL_CALCS',
        sha256Hash: '0x9924ba01e4210dfa481239bc711209348129038472910ab38120491823098124',
        fileSize: '8.4 MB',
        uploadedAt: '2026-09-28 08:34',
        verified: true
      },
      {
        id: 'DOC-03',
        name: 'FIRE-F301-Egress_HydrantPlan.pdf',
        category: 'FIRE_SAFETY',
        sha256Hash: '0x3219084719283746192837461928374619283746192837461928374619283746',
        fileSize: '4.2 MB',
        uploadedAt: '2026-09-28 08:39',
        verified: true
      },
      {
        id: 'DOC-04',
        name: 'TITLE-DEED-CertificateOfTitle_Verified.pdf',
        category: 'TITLE_DEED',
        sha256Hash: '0xfa89124019283741928374192837419283741928374192837419283741928374',
        fileSize: '2.1 MB',
        uploadedAt: '2026-09-28 08:40',
        verified: true
      }
    ],
    comments: [
      {
        id: 'C-01',
        author: 'Eng. B. Chanda',
        role: 'Director of City Planning',
        department: 'Lusaka City Council Planning & Development',
        timestamp: '2026-09-29 11:20',
        text: 'Automated policy check passed. Front setback conforms to 9.0m road widening buffer. Dual sign-off completed.',
        status: 'RESOLVED'
      }
    ],
    passport: {
      passportId: 'ZAPE-2026-LCC-0891',
      sliUuid: 'SLI-98412-2026-ZM-09',
      projectId: 'PRJ-LCC-2026-001',
      projectName: 'Lusaka Clean Energy Innovation Hub',
      leadArchitectId: 'ARC-001',
      leadArchitectName: 'Arc. Mwansa Phiri (ZIA 1084)',
      firmId: 'FIRM-001',
      firmName: 'Apex Studio Architects Ltd',
      councilId: 'LCC',
      councilName: 'Lusaka City Council',
      parcelId: 'LUS-RHOD-4819/B',
      gpsCoordinates: { lat: -15.4167, lng: 28.2833 },
      buildingType: 'COMMERCIAL_OFFICE',
      riskLevel: 'HIGH',
      totalFloors: 6,
      estimatedCostZMW: 64000000,
      complianceScore: 98,
      policyVersion: 'ZAPE-STATUTORY-POL-2026.3',
      greenScore: 84,
      greenTier: 'GOLD',
      digitalSealTimestamp: '2026-09-28T09:16:04Z',
      digitalSealSignature: 'RSA4096-SIG-9f4a19b023...c84192b',
      ledgerAnchorHash: '0x3a992bc4910cf919e830da03429fa2b2049e712a8848d2c943ff180b0942ac0e',
      pacraRegNumber: 'PACRA-12020004918',
      ipChainId: 'IP-CHAIN-2026-001',
      documentHashes: [
        { name: 'ARCH-A101-MasterPlan_FloorPlans.pdf', hash: '0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b120' },
        { name: 'STRUC-S201-ReinforcedFrameCalcs.pdf', hash: '0x9924ba01e4210dfa481239bc711209348129038472910ab38120491823098124' },
        { name: 'FIRE-F301-Egress_HydrantPlan.pdf', hash: '0x3219084719283746192837461928374619283746192837461928374619283746' },
        { name: 'TITLE-DEED-CertificateOfTitle_Verified.pdf', hash: '0xfa89124019283741928374192837419283741928374192837419283741928374' }
      ],
      councilApproval: {
        approvedAt: '2026-09-29 14:40',
        permitNumber: 'LCC/BP/2026/0419',
        primaryOfficer: 'Eng. B. Chanda (Director City Planning)',
        secondaryOfficer: 'Arch. L. Mwale (Chief Building Surveyor)',
        expiryDate: '2028-09-29',
        conditions: [
          'Mandatory foundation inspection before concrete pour.',
          'Solar PV commissioning certificate required prior to occupancy.',
          'Stormwater discharge connection to Church Road municipal collector only.'
        ]
      },
      sitePlaqueQrUrl: 'https://zape.gov.zm/verify/plaque/ZAPE-2026-LCC-0891'
    }
  },
  {
    id: 'PRJ-NCC-2026-002',
    title: 'Kafue Basin Secondary School & STEM Labs',
    clientName: 'Kafue Education Trust / Ministry of Education',
    clientContact: 'projects@kafuetrust.org.zm',
    leadArchitectId: 'ARC-003',
    firmId: 'FIRM-001',
    councilId: 'LCC',
    parcelId: 'KAF-PLOT-9102/E',
    siteAddress: 'Plot 9102, Off Kafue Road, Lusaka South',
    province: 'Lusaka',
    buildingType: 'SCHOOL',
    riskLevel: 'HIGH',
    totalFloors: 2,
    plotAreaSqM: 12500,
    buildingFootprintSqM: 3200,
    estimatedCostZMW: 24500000,
    status: 'COUNCIL_IN_REVIEW',
    hasFireSafetyPlan: true,
    hasAccessibilityPlan: true,
    hasHealthClearance: false,
    hasFloodMitigation: true,
    hasHeritageClearance: false,
    isFloodZone: true,
    isHeritageZone: false,
    landTitleVerified: true,
    originCountry: 'ZAMBIA',
    greenFeatures: [
      'Passive Cross Ventilation with Chimney Stacks',
      'Universal Access Wheelchair Ramps 1:12 slope throughout',
      'Indigenous Acacia Shade Canopy Integration',
      'Borehole & Bio-Digester Wastewater Sanitation'
    ],
    createdAt: '2026-09-20',
    documents: [
      {
        id: 'DOC-11',
        name: 'KAFUE_SCHOOL_ARCH_PLANS.pdf',
        category: 'ARCHITECTURAL_PLANS',
        sha256Hash: '0x114488bb99220033445566778899aabbccddeeff0011223344556677889900aa',
        fileSize: '19.2 MB',
        uploadedAt: '2026-09-24 10:15',
        verified: true
      }
    ],
    comments: []
  },
  {
    id: 'PRJ-FOR-2026-004',
    title: 'Copperbelt High-Density Commercial Tower',
    clientName: 'Gulf Horizons Investment Group (Dubai)',
    clientContact: 'projects@gulfhorizons.ae',
    leadArchitectId: 'ARC-002',
    firmId: 'FIRM-002',
    councilId: 'KCC',
    parcelId: 'KIT-CBD-209/A',
    siteAddress: 'Independence Avenue, Kitwe Central',
    province: 'Copperbelt',
    buildingType: 'HIGH_RISE',
    riskLevel: 'CRITICAL',
    totalFloors: 14,
    plotAreaSqM: 6000,
    buildingFootprintSqM: 2400,
    estimatedCostZMW: 120000000,
    status: 'COUNCIL_IN_REVIEW',
    hasFireSafetyPlan: true,
    hasAccessibilityPlan: true,
    hasHealthClearance: false,
    hasFloodMitigation: false,
    hasHeritageClearance: false,
    isFloodZone: false,
    isHeritageZone: false,
    landTitleVerified: true,
    originCountry: 'UAE',
    foreignFirmName: 'Al-Mansoor Architecture & Towers LLC (Dubai)',
    foreignConsultantPermitNumber: 'FCP-ZIA-2026-018',
    localAdoptingArchitectId: 'ARC-002',
    localAdoptingArchitectName: 'Arc. Chileshe Mulenga (Fellow ZIA 0872)',
    localizationReportApproved: true,
    materialEquivalencyApproved: true,
    greenFeatures: ['High-Performance Double Glazed Shading Facade', 'Chilled Water District Cooling Adapter'],
    createdAt: '2026-09-15',
    documents: [
      {
        id: 'DOC-41',
        name: 'DUBAI_TOWER_LOCALIZED_ZAMBIA_SET.pdf',
        category: 'FOREIGN_LOCALIZATION',
        sha256Hash: '0x44556677889900112233445566778899aabbccddeeff00112233445566778899',
        fileSize: '28.4 MB',
        uploadedAt: '2026-09-22 14:00',
        verified: true
      },
      {
        id: 'DOC-42',
        name: 'ZABS_MATERIAL_EQUIVALENCY_REPORT.pdf',
        category: 'MATERIAL_EQUIVALENCY',
        sha256Hash: '0x77889900aabbccddeeff00112233445566778899aabbccddeeff001122334455',
        fileSize: '6.2 MB',
        uploadedAt: '2026-09-22 14:10',
        verified: true
      }
    ],
    comments: [
      {
        id: 'C-04',
        author: 'Arc. K. Mwansa',
        role: 'Chief Architect',
        department: 'Kitwe City Council Planning Directorate',
        timestamp: '2026-09-26 10:15',
        text: 'Foreign localization report verified. Wind load structural calcs converted to Zambian ZS SANS 10160 codes. Local adopting architect assumes full statutory liability.',
        status: 'RESOLVED'
      }
    ]
  },
  {
    id: 'PRJ-DEV-2026-005',
    title: 'Silverest Eco-Estate Gated Community (50 Units)',
    clientName: 'Zambezi Sun Urban Developers Ltd',
    clientContact: 'developments@zambezisun.zm',
    leadArchitectId: 'ARC-001',
    firmId: 'FIRM-001',
    councilId: 'LCC',
    parcelId: 'CHONG-PLOT-8812/M',
    siteAddress: 'Silverest Extension, Great East Road, Lusaka East',
    province: 'Lusaka',
    buildingType: 'MULTI_RESIDENTIAL',
    riskLevel: 'MEDIUM',
    totalFloors: 2,
    plotAreaSqM: 35000,
    buildingFootprintSqM: 8500,
    estimatedCostZMW: 48000000,
    status: 'SEALED_AND_SUBMITTED',
    hasFireSafetyPlan: true,
    hasAccessibilityPlan: true,
    hasHealthClearance: false,
    hasFloodMitigation: false,
    hasHeritageClearance: false,
    isFloodZone: false,
    isHeritageZone: false,
    landTitleVerified: true,
    originCountry: 'ZAMBIA',
    usesStandardizedTemplate: true,
    templateId: 'ZM-TMPL-01',
    templateLicenseId: 'LIC-DEV-2026-50U',
    siteAdaptationCertificate: true,
    submittedByDeveloper: true,
    developerPacraId: 'PACRA-DEV-12018002910',
    developerName: 'Zambezi Sun Urban Developers Ltd',
    hasRegisteredArchitecturalFirmLink: true,
    hasProfessionalIndependenceDeclaration: true,
    conflictOfInterestScore: 0.32, // Low risk (< 0.7)
    greenFeatures: ['Standardized Solar Rooftop Layout', 'Subdivision Rainwater Infiltration Basins'],
    createdAt: '2026-09-28',
    documents: [
      {
        id: 'DOC-51',
        name: 'SILVEREST_SITE_ADAPTATION_MASTER.pdf',
        category: 'TEMPLATE_ADAPTATION',
        sha256Hash: '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
        fileSize: '11.8 MB',
        uploadedAt: '2026-09-29 11:30',
        verified: true
      }
    ],
    comments: []
  }
];

export const MOCK_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'REP-2026-041',
    sitePlaqueId: 'ZAPE-2026-LCC-0891',
    projectName: 'Lusaka Clean Energy Innovation Hub',
    siteAddress: 'Corner of Great East Road & Church Road, Lusaka',
    reportedAt: '2026-10-01 16:30',
    reporterContact: '+260 97* *** 812 (Anonymous Whistleblower)',
    violationType: 'UNSAFE_SCAFFOLDING',
    description: 'Pedestrian walkway protection barrier along Church Road has collapsed due to wind, exposing passing citizens to falling debris.',
    status: 'INSPECTION_SCHEDULED',
    assignedInspector: 'Insp. Clement Tembo (LCC Safety Unit)',
    councilActionTaken: 'Stop-order issued to contractor until protective gantry is reconstructed to ZABS standard.'
  },
  {
    id: 'REP-2026-039',
    sitePlaqueId: 'UNKNOWN-SITE-RHODES',
    projectName: 'Unregistered Construction opposite Manda Hill',
    siteAddress: 'Plot 104, Great East Road, Lusaka',
    reportedAt: '2026-09-22 11:15',
    reporterContact: '+260 96* *** 404',
    violationType: 'NO_APPROVED_PERMIT',
    description: 'No ZAPE Site QR Plaque displayed on perimeter hoard. Four storey excavation happening without verified architect signage.',
    status: 'INVESTIGATING',
    assignedInspector: 'Insp. R. Banda',
    councilActionTaken: 'Site enforcement team dispatched. Illegal development notice served.'
  },
  {
    id: 'REP-2026-042',
    sitePlaqueId: 'UNLICENSED-TMPL-KABWATA',
    projectName: 'Kabwata Commercial Strips',
    siteAddress: 'Burma Road, Kabwata',
    reportedAt: '2026-10-03 14:20',
    reporterContact: '+260 95* *** 119',
    violationType: 'DEVELOPER_UNLAWFUL_PRACTICE',
    description: 'Developer billboard advertising "Free Architectural Design with Plot Purchase" - direct violation of ZIA Reserved Services Act.',
    status: 'INVESTIGATING',
    assignedInspector: 'ZIA Legal Officer J. Mwape',
    councilActionTaken: 'Cease & Desist served on developer marketing unit.'
  }
];

export const MOCK_STUDENT_LOGS: StudentLogbookEntry[] = [
  {
    id: 'LOG-001',
    studentId: 'STU-UNZA-2022-491',
    studentName: 'Chikondi Phiri',
    university: 'University of Zambia (UNZA) - School of Engineering / Architecture',
    yearOfStudy: 4,
    projectName: 'Lusaka Clean Energy Innovation Hub',
    firmName: 'Apex Studio Architects Ltd',
    mentorName: 'Arc. Mwansa Phiri',
    mentorZiaNumber: 'ZIA-1084',
    designStage: 'STATUTORY_DRAWINGS',
    hoursLogged: 42,
    tasksCompleted: 'Drafted Section B-B, developed universal accessibility ramp detailing according to ZABS BS8300, checked door clear openings.',
    verifiedByMentor: true,
    dateLogged: '2026-09-24'
  },
  {
    id: 'LOG-002',
    studentId: 'STU-CBU-2023-118',
    studentName: 'Bwalya Musonda',
    university: 'Copperbelt University (CBU) - School of the Built Environment',
    yearOfStudy: 3,
    projectName: 'Kafue Basin Secondary School & STEM Labs',
    firmName: 'Apex Studio Architects Ltd',
    mentorName: 'Arc. Thandiwe Zulu',
    mentorZiaNumber: 'ZIA-1240',
    designStage: 'BIM_MODELING',
    hoursLogged: 36,
    tasksCompleted: 'Parametric sun-path solar study on class facade louvers; modeled rainwater gutter layout and storage tank gravity feed.',
    verifiedByMentor: true,
    dateLogged: '2026-09-26'
  }
];

// -------------------------------------------------------------
// ZAPE 3.0 NEW MOCK DATA: IP, TEMPLATES, FOREIGN, DEVELOPERS
// -------------------------------------------------------------

export const MOCK_IP_ASSETS: IPAsset[] = [
  {
    id: 'IP-AST-001',
    title: 'Zambian Bioclimatic Earth-Brick Shading Louver System',
    assetType: 'PATENT',
    ownerFirmId: 'FIRM-001',
    ownerFirmName: 'Apex Studio Architects Ltd',
    leadAuthor: 'Arc. Mwansa Phiri & Arc. Thandiwe Zulu',
    pacraRegistrationNo: 'PACRA-PAT-2025-0419',
    sha256Hash: '0x9924ba01e4210dfa481239bc711209348129038472910ab38120491823098124',
    timestamp: '2025-08-14 11:20:00Z',
    status: 'REGISTERED',
    description: 'Interlocking compressed earth brick louver configuration achieving 45% solar radiation reduction without mechanical cooling.',
    activeLicensesCount: 4,
    royaltiesEarnedZMW: 140000
  },
  {
    id: 'IP-AST-002',
    title: 'Apex Studio Logo & Typology Mark',
    assetType: 'TRADEMARK',
    ownerFirmId: 'FIRM-001',
    ownerFirmName: 'Apex Studio Architects Ltd',
    leadAuthor: 'Apex Studio Directors',
    pacraRegistrationNo: 'PACRA-TM-CLASS-42-8812',
    sha256Hash: '0x3a992bc4910cf919e830da03429fa2b2049e712a8848d2c943ff180b0942ac0e',
    timestamp: '2024-03-10 09:00:00Z',
    status: 'REGISTERED',
    description: 'Protected architectural practice trademark under PACRA Class 42 (Architectural & Engineering Design Services).',
    activeLicensesCount: 0,
    royaltiesEarnedZMW: 0
  },
  {
    id: 'IP-AST-003',
    title: 'Standardized 3-Bedroom Affordable Eco-Housing Typology',
    assetType: 'STANDARDIZED_TEMPLATE',
    ownerFirmId: 'FIRM-001',
    ownerFirmName: 'Apex Studio Architects Ltd',
    leadAuthor: 'Arc. Mwansa Phiri (ZIA 1084)',
    pacraRegistrationNo: 'PACRA-CR-2026-0041',
    sha256Hash: '0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b120',
    timestamp: '2026-01-15 14:30:00Z',
    status: 'LICENSED',
    description: 'Type-approved, climate-responsive 3-bedroom expandable rural/peri-urban residential design for Zambian soil catchments.',
    activeLicensesCount: 18,
    royaltiesEarnedZMW: 216000
  }
];

export const MOCK_IP_DISPUTES: IPDisputeCase[] = [
  {
    id: 'DISP-2026-08',
    assetId: 'IP-AST-003',
    complainantName: 'Arc. Mwansa Phiri',
    complainantFirm: 'Apex Studio Architects Ltd',
    respondentName: 'Impala Drafting & Property Ltd',
    respondentFirm: 'Impala Drafting (Unregistered Entity)',
    claimType: 'UNLICENSED_REUSE',
    originalHash: '0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b120',
    disputedHash: '0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b199',
    similarityScore: 97.4,
    status: 'ACTIVE_FREEZE',
    dateFiled: '2026-09-30',
    summary: 'Respondent duplicated Type-Approved Eco-Bungalow drawings without purchasing license; submitted to Chongwe Council under forged title block.',
    remedyActionTaken: 'Submission frozen under IP_HOLD. Disciplinary summons issued.'
  }
];

export const MOCK_STANDARDIZED_TEMPLATES: StandardizedTemplate[] = [
  {
    id: 'ZM-TMPL-01',
    name: 'Lusaka Eco-Bungalow (3-Bed Expandable)',
    version: 'v2.4',
    category: 'AFFORDABLE_HOUSING',
    authorArchitect: 'Arc. Mwansa Phiri',
    authorZiaNumber: 'ZIA-1084',
    firmName: 'Apex Studio Architects Ltd',
    pacraFirmId: 'PACRA-12020004918',
    typeApprovalStatus: 'TYPE_APPROVED',
    suitableClimateZones: ['Savannah Plateau', 'Lusaka Basin', 'Southern Valley'],
    maxFloors: 1,
    minPlotSizeSqM: 300,
    estimatedBuildCostZMW: 320000,
    singleUseLicenseFeeZMW: 4500,
    multiUnitDeveloperLicenseFeeZMW: 45000,
    requiresSiteAdaptation: true,
    totalLicensesIssued: 48,
    description: 'Statutory type-approved affordable housing design. Optimized for passive cross-ventilation, rainwater harvesting cistern, and solar PV roof orientation.',
    imageUrl: '/src/assets/images/blueprint_drawing_sheet_1791209752432.jpg'
  },
  {
    id: 'ZM-TMPL-02',
    name: 'Copperbelt Community Health Outpost',
    version: 'v1.8',
    category: 'COMMUNITY_CLINIC',
    authorArchitect: 'Arc. Chileshe Mulenga',
    authorZiaNumber: 'ZIA-0872',
    firmName: 'Copperbelt Urban Dynamics Ltd',
    pacraFirmId: 'PACRA-12019003812',
    typeApprovalStatus: 'TYPE_APPROVED',
    suitableClimateZones: ['Copperbelt Humid Subtropical', 'North-Western'],
    maxFloors: 1,
    minPlotSizeSqM: 1200,
    estimatedBuildCostZMW: 1450000,
    singleUseLicenseFeeZMW: 12000,
    multiUnitDeveloperLicenseFeeZMW: 90000,
    requiresSiteAdaptation: true,
    totalLicensesIssued: 14,
    description: 'Turnkey rural outpatient clinic with medical-grade ventilation, solar vaccine cold-chain facility, and universal wheelchair access.'
  },
  {
    id: 'ZM-TMPL-03',
    name: 'SADC Standard 4-Classroom Block & STEM Lab',
    version: 'v3.0',
    category: 'RURAL_SCHOOL',
    authorArchitect: 'Arc. Thandiwe Zulu',
    authorZiaNumber: 'ZIA-1240',
    firmName: 'Apex Studio Architects Ltd',
    pacraFirmId: 'PACRA-12020004918',
    typeApprovalStatus: 'TYPE_APPROVED',
    suitableClimateZones: ['All Zambian Agro-Ecological Zones'],
    maxFloors: 1,
    minPlotSizeSqM: 2500,
    estimatedBuildCostZMW: 850000,
    singleUseLicenseFeeZMW: 8000,
    multiUnitDeveloperLicenseFeeZMW: 60000,
    requiresSiteAdaptation: true,
    totalLicensesIssued: 29,
    description: 'Ministry of Education compliant school block. Acoustic-isolated classrooms with 1.2m clear fire escape doors and natural daylighting.'
  }
];

export const MOCK_FOREIGN_PACKAGES: ForeignDesignPackage[] = [
  {
    id: 'FOR-PKG-01',
    projectName: 'Copperbelt High-Density Commercial Tower',
    originCountry: 'United Arab Emirates (Dubai)',
    foreignFirmName: 'Al-Mansoor Architecture & Towers LLC',
    foreignConsultantPermitNo: 'FCP-ZIA-2026-018',
    localAdoptingArchitectId: 'ARC-002',
    localAdoptingArchitectName: 'Arc. Chileshe Mulenga (Fellow ZIA 0872)',
    localAdoptingArchitectZia: 'ZIA-0872',
    localizationReportApproved: true,
    liabilityDeclarationSigned: true,
    status: 'LOCALIZED_APPROVED',
    dateImported: '2026-09-15',
    materialEquivalencyMatrix: [
      {
        originalSpec: 'ASTM A992 Grade 50 Structural Steel (Import)',
        zambianSubstitute: 'SABS 1431 Grade 350WA Steel (Certified Local Stockist)',
        fireRating: '2-Hour Intumescent Coating System',
        certifiedByZABS: true
      },
      {
        originalSpec: 'Curtain Wall Glazing SHGC 0.22 (UAE Standard)',
        zambianSubstitute: 'Double Low-E Argon Filled Unit (ZS SANS 204 compliant)',
        fireRating: 'Class 1 Surface Spread',
        certifiedByZABS: true
      }
    ]
  },
  {
    id: 'FOR-PKG-02',
    projectName: 'Lusaka Tech Campus Incubator',
    originCountry: 'United Kingdom (London)',
    foreignFirmName: 'Foster & Partners Associate Studio UK',
    foreignConsultantPermitNo: 'PENDING_REGISTRATION',
    localAdoptingArchitectId: '',
    localAdoptingArchitectName: 'Unassigned (Action Required)',
    localAdoptingArchitectZia: '',
    localizationReportApproved: false,
    liabilityDeclarationSigned: false,
    status: 'PENDING_LOCAL_ADOPTION',
    dateImported: '2026-10-02',
    materialEquivalencyMatrix: []
  }
];

export const MOCK_DEVELOPERS: DeveloperEntity[] = [
  {
    id: 'DEV-001',
    companyName: 'Zambezi Sun Urban Developers Ltd',
    pacraNumber: 'PACRA-DEV-12018002910',
    directors: ['Charles Lubasi (MD)', 'Miriam Mwansa (CFO)'],
    zraTaxClear: true,
    authorizedPathway: 'JOINT_VENTURE',
    registeredArchitecturalFirmLink: 'Apex Studio Architects Ltd (FIRM-001)',
    professionalIndependenceDeclaration: true,
    conflictOfInterestScore: 0.32, // Low Risk
    authorizationCertificateId: 'DAC-ZIA-2026-044',
    activeProjectsCount: 3,
    advertisingComplianceStatus: 'COMPLIANT'
  },
  {
    id: 'DEV-002',
    companyName: 'Copperbelt Crest Properties PLC',
    pacraNumber: 'PACRA-DEV-12022004819',
    directors: ['Jameson Phiri (CEO)'],
    zraTaxClear: true,
    authorizedPathway: 'INDEPENDENT_CONTRACT',
    registeredArchitecturalFirmLink: 'None (Attempting Direct SLI Submission)',
    professionalIndependenceDeclaration: false,
    conflictOfInterestScore: 0.88, // CRITICAL CONFLICT OF INTEREST
    authorizationCertificateId: 'REVOKED_UNLAWFUL_PRACTICE',
    activeProjectsCount: 1,
    advertisingComplianceStatus: 'FLAGGED_UNLAWFUL_CLAIM' // e.g. Free architectural designs advertised
  }
];
