import { z } from 'zod';

export const DaoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ensName: z.string().optional(),
  createdAt: z.string().datetime()
});

export const MetadataRecordSchema = z.object({
  daoId: z.string().min(1),
  key: z.string().min(1),
  value: z.unknown(),
  updatedAt: z.string().datetime()
});

export const EnsRecordSchema = z.object({
  name: z.string().min(1),
  owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  resolver: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional()
});

export type DaoInput = z.infer<typeof DaoSchema>;
export type MetadataRecordInput = z.infer<typeof MetadataRecordSchema>;
export type EnsRecordInput = z.infer<typeof EnsRecordSchema>;




