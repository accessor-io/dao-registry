export interface Dao {
  id: string;
  name: string;
  ensName?: string;
  createdAt: string; // ISO datetime
}

export interface MetadataRecord {
  daoId: string;
  key: string;
  value: unknown;
  updatedAt: string; // ISO datetime
}

export interface EnsRecord {
  name: string;
  owner: string; // address
  resolver?: string; // address
}

export type UUID = string;




