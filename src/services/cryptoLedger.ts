import { AuditBlock } from '../types';

// Fast SHA-256 using standard Web Crypto API
export async function computeSha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate pseudo-deterministic tamper hash for simulation
export function generateMockHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.substring(0, 66);
}

// Simulates the permissioned tamper-evident audit ledger
export class AuditLedgerService {
  private static blocks: AuditBlock[] = [
    {
      index: 10481,
      timestamp: '2026-09-28T09:14:22Z',
      eventType: 'SLI_GENERATED',
      actorId: 'ZIA-1084',
      actorName: 'Arc. Mwansa Phiri',
      actorRole: 'Registered Architect',
      projectId: 'PRJ-LCC-2026-001',
      previousBlockHash: '0x8f4c82b17a3390c5e7b29a1b55928d3ef71109a244195e381023a88c7f99b120',
      blockHash: '0x3a992bc4910cf919e830da03429fa2b2049e712a8848d2c943ff180b0942ac0e',
      dataSummary: 'Submission Passport ZAPE-2026-LCC-0891 anchored with 4 verified drawing hashes.'
    },
    {
      index: 10482,
      timestamp: '2026-09-28T09:16:04Z',
      eventType: 'DIGITAL_SEAL_APPLIED',
      actorId: 'ZIA-1084',
      actorName: 'Arc. Mwansa Phiri',
      actorRole: 'Registered Architect',
      projectId: 'PRJ-LCC-2026-001',
      previousBlockHash: '0x3a992bc4910cf919e830da03429fa2b2049e712a8848d2c943ff180b0942ac0e',
      blockHash: '0x71e998ad5342901198fbbac019488e02947192837bc901a88b19f0923e018a42',
      dataSummary: 'Biometric seal & statutory declaration applied via RSA-4096 signature key.'
    },
    {
      index: 10483,
      timestamp: '2026-09-29T14:40:11Z',
      eventType: 'COUNCIL_APPROVED',
      actorId: 'LCC-OFFICER-042',
      actorName: 'Eng. B. Chanda (Director City Planning)',
      actorRole: 'Council Planning Authority',
      projectId: 'PRJ-LCC-2026-001',
      previousBlockHash: '0x71e998ad5342901198fbbac019488e02947192837bc901a88b19f0923e018a42',
      blockHash: '0xd488c910fa923055819ba8204918e9bc746193740284ab910283e74910aa98ff',
      dataSummary: 'Dual sign-off granted by Lusaka City Council. Building Permit #LCC/BP/2026/0419 issued.'
    }
  ];

  public static getLedger(): AuditBlock[] {
    return [...this.blocks];
  }

  public static async recordEvent(
    eventType: AuditBlock['eventType'],
    actor: { id: string; name: string; role: string },
    projectId: string,
    summary: string
  ): Promise<AuditBlock> {
    const prevBlock = this.blocks[this.blocks.length - 1];
    const prevHash = prevBlock ? prevBlock.blockHash : '0x0000000000000000000000000000000000000000000000000000000000000000';
    const index = prevBlock ? prevBlock.index + 1 : 1;
    const timestamp = new Date().toISOString();
    
    const payload = `${index}|${timestamp}|${eventType}|${actor.id}|${projectId}|${prevHash}|${summary}`;
    const hash = await computeSha256(payload);
    const blockHash = `0x${hash}`;

    const newBlock: AuditBlock = {
      index,
      timestamp,
      eventType,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      projectId,
      previousBlockHash: prevHash,
      blockHash,
      dataSummary: summary
    };

    this.blocks.push(newBlock);
    return newBlock;
  }
}
