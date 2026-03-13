import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VoiceDB extends DBSchema {
  generations: {
    key: string;
    value: {
      id: string;
      userId: string;
      text: string;
      voiceId: string;
      audioUrl: string;
      createdAt: string;
      duration?: string;
    };
    indexes: { 'by-user': string };
  };
  voices: {
    key: string;
    value: {
      id: string;
      userId: string;
      name: string;
      type: string;
      gender: string;
      baseVoice: string;
      createdAt: string;
    };
    indexes: { 'by-user': string };
  };
}

let dbPromise: Promise<IDBPDatabase<VoiceDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<VoiceDB>('voice-forge-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('generations')) {
        const genStore = db.createObjectStore('generations', { keyPath: 'id' });
        genStore.createIndex('by-user', 'userId');
      }
      if (!db.objectStoreNames.contains('voices')) {
        const voiceStore = db.createObjectStore('voices', { keyPath: 'id' });
        voiceStore.createIndex('by-user', 'userId');
      }
    },
  });
}

export const db = {
  async addGeneration(gen: any) {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('generations', gen);
  },
  async getGenerations(userId: string) {
    if (!dbPromise) return [];
    const db = await dbPromise;
    const all = await db.getAllFromIndex('generations', 'by-user', userId);
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async deleteGeneration(id: string) {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.delete('generations', id);
  },
  async addVoice(voice: any) {
    if (!dbPromise) return;
    const db = await dbPromise;
    await db.put('voices', voice);
  },
  async getVoices(userId: string) {
    if (!dbPromise) return [];
    const db = await dbPromise;
    return await db.getAllFromIndex('voices', 'by-user', userId);
  }
};
