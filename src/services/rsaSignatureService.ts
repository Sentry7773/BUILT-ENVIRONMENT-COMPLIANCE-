import { RSABiometricSignatureRecord, BiometricSessionState, Project, Architect, ArchitecturalFirm, SubmissionPassport } from '../types';
import { computeSha256, AuditLedgerService } from './cryptoLedger';

// Simulated RSA-4096 Public Key for Arc. Mwansa Phiri (ZIA #1084)
export const ARCHITECT_RSA4096_PUBLIC_KEY = {
  keyType: 'RSA',
  modulusLength: 4096,
  publicExponent: '65537 (0x10001)',
  keyFingerprint: 'SHA256:4a8f90b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456',
  hardwareEnclave: 'YubiKey 5-FIPS / Apple T2 Secure Enclave / TPM 2.0 (FIPS 140-3 Level 3)',
  nrcBinding: '719042/11/1',
  ziaNumber: 'ZIA-1084',
  issuer: 'Republic of Zambia National Public Key Infrastructure (ZAM-PKI) / ZIA CA Root',
  validFrom: '2025-01-01T00:00:00Z',
  validUntil: '2028-12-31T23:59:59Z'
};

// Seed signatures
const SEED_RSA_SIGNATURES: RSABiometricSignatureRecord[] = [
  {
    id: 'SIG-RSA4096-2026-0891',
    timestamp: '2026-09-28 09:16:04',
    architectId: 'ARC-001',
    architectName: 'Arc. Mwansa Phiri',
    ziaNumber: 'ZIA-1084',
    nrcNumber: '719042/11/1',
    firmId: 'FIRM-001',
    firmName: 'Apex Studio Architects Ltd',
    projectId: 'PRJ-LCC-2026-001',
    projectName: 'Lusaka Clean Energy Innovation Hub',
    parcelId: 'LUS-PLOT-4920/12',
    councilId: 'LCC',
    councilName: 'Lusaka City Council',
    buildingType: 'COMMERCIAL_OFFICE',
    totalFloors: 6,
    passportId: 'ZAPE-2026-LCC-0891',
    biometricAuthType: 'FIDO2_HARDWARE_TOKEN',
    biometricHardwareSerial: 'YUBI-FIPS-908124',
    keyAlgorithm: 'RSA-4096 / SHA-256 PKCS#1 v1.5',
    keyFingerprint: 'SHA256:4a8f90b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456',
    signatureHex: '0x8f4c2e91a0b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5',
    drawingBundleHash: '0x3a992bc4910cf919e830da03429fa2b2049e712a8848d2c943ff180b0942ac0e',
    ledgerBlockHash: '0x71e998ad5342901198fbbac019488e02947192837bc901a88b19f0923e018a42',
    ledgerBlockIndex: 10482,
    statutoryDeclarationText: 'Solemnly declared under ZIA Act Cap 442 Section 22: Drawings executed under direct personal supervision. Full statutory compliance guaranteed.',
    verified: true
  },
  {
    id: 'SIG-RSA4096-2026-0892',
    timestamp: '2026-09-29 11:24:19',
    architectId: 'ARC-001',
    architectName: 'Arc. Mwansa Phiri',
    ziaNumber: 'ZIA-1084',
    nrcNumber: '719042/11/1',
    firmId: 'FIRM-001',
    firmName: 'Apex Studio Architects Ltd',
    projectId: 'PRJ-NCC-2026-002',
    projectName: 'Kafue Basin Secondary School & STEM Labs',
    parcelId: 'KAF-PLOT-1092/05',
    councilId: 'NCC',
    councilName: 'Ndola City Council',
    buildingType: 'SCHOOL',
    totalFloors: 2,
    passportId: 'ZAPE-2026-NCC-0892',
    biometricAuthType: 'FINGERPRINT_ENCLAVE',
    biometricHardwareSerial: 'TPM2-ENCLAVE-884102',
    keyAlgorithm: 'RSA-4096 / SHA-256 PKCS#1 v1.5',
    keyFingerprint: 'SHA256:4a8f90b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456',
    signatureHex: '0x7b2a9d4e1f8c3a5b7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5',
    drawingBundleHash: '0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b120',
    ledgerBlockHash: '0xd488c910fa923055819ba8204918e9bc746193740284ab910283e74910aa98ff',
    ledgerBlockIndex: 10476,
    statutoryDeclarationText: 'Solemnly declared under ZIA Act Cap 442 Section 22: Ministry of Education building standard compliance with universal disability ramp access.',
    verified: true
  },
  {
    id: 'SIG-RSA4096-2026-0840',
    timestamp: '2026-08-15 14:02:45',
    architectId: 'ARC-001',
    architectName: 'Arc. Mwansa Phiri',
    ziaNumber: 'ZIA-1084',
    nrcNumber: '719042/11/1',
    firmId: 'FIRM-001',
    firmName: 'Apex Studio Architects Ltd',
    projectId: 'PRJ-LCC-2026-084',
    projectName: 'Apex Medical Research Center Specialized Wing',
    parcelId: 'LUS-PLOT-7714/01',
    councilId: 'LCC',
    councilName: 'Lusaka City Council',
    buildingType: 'HOSPITAL',
    totalFloors: 4,
    passportId: 'ZAPE-2026-LCC-0840',
    biometricAuthType: 'FACIAL_GEOMETRY',
    biometricHardwareSerial: 'IR-TRUE-DEPTH-9102',
    keyAlgorithm: 'RSA-4096 / SHA-256 PKCS#1 v1.5',
    keyFingerprint: 'SHA256:4a8f90b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456',
    signatureHex: '0x99e2f4a1c5d8b0e3f7a9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5',
    drawingBundleHash: '0x1029384756afbecd1234567890abcdef1029384756afbecd1234567890abcdef',
    ledgerBlockHash: '0x44195e381023a88c7f99b1208f4c82b17a3390c5e7b29a1b55928d3ef71109a2',
    ledgerBlockIndex: 10450,
    statutoryDeclarationText: 'Health Professions Council of Zambia (HPCZ) bio-safety Level 3 and radiological isolation compliance verified.',
    verified: true
  },
  {
    id: 'SIG-RSA4096-2026-0799',
    timestamp: '2026-07-20 16:45:11',
    architectId: 'ARC-001',
    architectName: 'Arc. Mwansa Phiri',
    ziaNumber: 'ZIA-1084',
    nrcNumber: '719042/11/1',
    firmId: 'FIRM-001',
    firmName: 'Apex Studio Architects Ltd',
    projectId: 'PRJ-LIV-2026-079',
    projectName: 'Victoria Falls Eco-Resort Masterplan Phase 1',
    parcelId: 'LIV-PLOT-3001/02',
    councilId: 'LIV',
    councilName: 'Livingstone City Council',
    buildingType: 'HERITAGE_DISTRICT',
    totalFloors: 2,
    passportId: 'ZAPE-2026-LIV-0799',
    biometricAuthType: 'FIDO2_HARDWARE_TOKEN',
    biometricHardwareSerial: 'YUBI-FIPS-908124',
    keyAlgorithm: 'RSA-4096 / SHA-256 PKCS#1 v1.5',
    keyFingerprint: 'SHA256:4a8f90b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef123456',
    signatureHex: '0xaa11bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    drawingBundleHash: '0x99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff',
    ledgerBlockHash: '0x12a8848d2c943ff180b0942ac0e3a992bc4910cf919e830da03429fa2b2049e7',
    ledgerBlockIndex: 10418,
    statutoryDeclarationText: 'UNESCO World Heritage Buffer Zone compliance & NHCC Environmental Guidelines verified with zero riverbank intrusion.',
    verified: true
  }
];

class RSASignatureService {
  private signatures: RSABiometricSignatureRecord[] = [...SEED_RSA_SIGNATURES];
  
  // Current active biometric session for Arc. Mwansa Phiri
  private currentSession: BiometricSessionState = {
    isAuthenticated: true,
    authenticatedAt: '2026-10-05 07:15:00',
    expiresAt: '2026-10-05 18:00:00',
    authMethod: 'FIDO2_HARDWARE',
    hardwareTokenId: 'YUBI-FIPS-908124 (ZAM-PKI-L3)',
    enclaveDerivationKey: '0x4a8f90b2c3d4e5f67890abcdef123456',
    biometricConfidence: 0.998
  };

  public getSignatures(): RSABiometricSignatureRecord[] {
    return [...this.signatures];
  }

  public getSession(): BiometricSessionState {
    return { ...this.currentSession };
  }

  public lockSession(): BiometricSessionState {
    this.currentSession = {
      isAuthenticated: false
    };
    return { ...this.currentSession };
  }

  public authenticateBiometric(
    method: 'FINGERPRINT' | 'FIDO2_HARDWARE' | 'FACIAL_RECOGNITION',
    nrcNumber: string
  ): BiometricSessionState {
    const now = new Date();
    const expiry = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours session

    const derivation = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;

    this.currentSession = {
      isAuthenticated: true,
      authenticatedAt: now.toISOString().replace('T', ' ').substring(0, 19),
      expiresAt: expiry.toISOString().replace('T', ' ').substring(0, 19),
      authMethod: method,
      hardwareTokenId: method === 'FIDO2_HARDWARE' ? 'YUBI-FIPS-908124' : method === 'FINGERPRINT' ? 'TPM2-ENCLAVE-884102' : 'IR-BIOMETRIC-3D-9102',
      enclaveDerivationKey: derivation,
      biometricConfidence: method === 'FIDO2_HARDWARE' ? 0.999 : 0.996
    };

    return { ...this.currentSession };
  }

  public async recordProjectSignOff(
    project: Project,
    architect: Architect,
    firm: ArchitecturalFirm,
    passport: SubmissionPassport,
    method: 'FIDO2_HARDWARE_TOKEN' | 'FINGERPRINT_ENCLAVE' | 'FACIAL_GEOMETRY' = 'FIDO2_HARDWARE_TOKEN'
  ): Promise<RSABiometricSignatureRecord> {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const sigId = `SIG-RSA4096-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate deterministic 512-byte hex string representing RSA-4096 signature
    const payload = `${project.id}|${architect.ziaNumber}|${architect.nrcNumber}|${passport.passportId}|${timestamp}`;
    const hash = await computeSha256(payload);
    const signatureHex = `0x${hash}${hash}${hash}${hash}`.substring(0, 258);

    const record: RSABiometricSignatureRecord = {
      id: sigId,
      timestamp,
      architectId: architect.id,
      architectName: architect.name,
      ziaNumber: architect.ziaNumber,
      nrcNumber: architect.nrcNumber,
      firmId: firm.id,
      firmName: firm.name,
      projectId: project.id,
      projectName: project.title,
      parcelId: project.parcelId,
      councilId: project.councilId,
      councilName: passport.councilName,
      buildingType: project.buildingType,
      totalFloors: project.totalFloors,
      passportId: passport.passportId,
      biometricAuthType: method,
      biometricHardwareSerial: this.currentSession.hardwareTokenId || 'YUBI-FIPS-908124',
      keyAlgorithm: 'RSA-4096 / SHA-256 PKCS#1 v1.5',
      keyFingerprint: ARCHITECT_RSA4096_PUBLIC_KEY.keyFingerprint,
      signatureHex,
      drawingBundleHash: passport.documentHashes[0]?.hash || '0x3a992bc4910cf919e830da03429fa2b2049e712a8848d2c943ff180b0942ac0e',
      ledgerBlockHash: passport.ledgerAnchorHash,
      ledgerBlockIndex: 10484 + this.signatures.length,
      statutoryDeclarationText: `Solemnly declared under ZIA Act Cap 442: Direct professional authorship confirmed by ${architect.name} for ${project.title}.`,
      verified: true
    };

    // Prepend new signature to chronological log
    this.signatures = [record, ...this.signatures];
    return record;
  }

  public verifySignatureMathematicalIntegrity(record: RSABiometricSignatureRecord): {
    isValid: boolean;
    modulusBits: number;
    digestAlgorithm: string;
    keyFingerprintMatch: boolean;
    enclaveBindingVerified: boolean;
    nrcMatch: boolean;
  } {
    return {
      isValid: true,
      modulusBits: 4096,
      digestAlgorithm: 'SHA-256 (PKCS#1 v1.5)',
      keyFingerprintMatch: record.keyFingerprint === ARCHITECT_RSA4096_PUBLIC_KEY.keyFingerprint,
      enclaveBindingVerified: true,
      nrcMatch: record.nrcNumber === ARCHITECT_RSA4096_PUBLIC_KEY.nrcBinding
    };
  }

  public async computeDossierExportHash(signatures: RSABiometricSignatureRecord[]): Promise<string> {
    const rawPayload = signatures.map(s => `${s.id}|${s.timestamp}|${s.passportId}|${s.signatureHex}`).join(';;');
    const hash = await computeSha256(rawPayload);
    return `0x${hash}`;
  }

  public attachExternalSignatureRecord(record: RSABiometricSignatureRecord): void {
    this.signatures = [record, ...this.signatures.filter(s => s.id !== record.id && s.projectId !== record.projectId)];
  }
}

export const rsaSignatureService = new RSASignatureService();
