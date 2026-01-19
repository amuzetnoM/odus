
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private dbName = 'ArtifactDB';
  private dbVersion = 3; // Incremented for new store
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = (event) => console.error('DB Error', event);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      // Store raw GitHub data
      if (!db.objectStoreNames.contains('repos')) {
        db.createObjectStore('repos', { keyPath: 'id' });
      }

      // Store AI Reasoning/Memory logs
      if (!db.objectStoreNames.contains('ai_memory')) {
        const store = db.createObjectStore('ai_memory', { keyPath: 'id', autoIncrement: true });
        store.createIndex('context', 'context', { unique: false });
      }

      // Store Drive Files
      if (!db.objectStoreNames.contains('drive_files')) {
        db.createObjectStore('drive_files', { keyPath: 'id' });
      }

      // Store Repo Dependency Indices (Background Index)
      if (!db.objectStoreNames.contains('repo_dependency_index')) {
        db.createObjectStore('repo_dependency_index', { keyPath: 'projectId' });
      }
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
    };
  }

  async saveRepoData(repoId: number, data: any) {
    return this.performTransaction('repos', 'readwrite', (store) => {
      return store.put({ id: repoId, ...data, lastUpdated: new Date() });
    });
  }

  async getRepoData(repoId: number): Promise<any> {
    return this.performTransaction('repos', 'readonly', (store) => {
      return store.get(repoId);
    });
  }

  async logAiReasoning(context: string, reasoning: string, outcome: string) {
    return this.performTransaction('ai_memory', 'readwrite', (store) => {
      return store.add({
        context,
        reasoning,
        outcome,
        timestamp: new Date()
      });
    });
  }

  async getAiMemory(): Promise<any[]> {
    return this.performTransaction('ai_memory', 'readonly', (store) => {
      return store.getAll();
    });
  }

  // --- Drive File Persistence ---

  async saveFile(file: any) {
    return this.performTransaction('drive_files', 'readwrite', (store) => {
      return store.put(file);
    });
  }

  async getAllFiles(): Promise<any[]> {
    return this.performTransaction('drive_files', 'readonly', (store) => {
      return store.getAll();
    });
  }

  // --- Repo Dependency Index (Background) ---

  async saveRepoIndex(projectId: string, dependencyGraph: any) {
     return this.performTransaction('repo_dependency_index', 'readwrite', (store) => {
         return store.put({ projectId, graph: dependencyGraph, lastIndexed: new Date() });
     });
  }

  async deleteRepoIndex(projectId: string) {
      return this.performTransaction('repo_dependency_index', 'readwrite', (store) => {
          return store.delete(projectId);
      });
  }

  // --- System Reset ---
  async resetDatabase(): Promise<void> {
      if (this.db) {
          this.db.close();
      }
      return new Promise((resolve, reject) => {
          const req = indexedDB.deleteDatabase(this.dbName);
          req.onsuccess = () => resolve();
          req.onerror = () => reject();
          req.onblocked = () => console.warn('Database delete blocked. Close other tabs.');
      });
  }

  private performTransaction(storeName: string, mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        // Retry logic if DB isn't ready
        let retries = 0;
        const checkDb = setInterval(() => {
           retries++;
           if (this.db) {
               clearInterval(checkDb);
               this.performTransaction(storeName, mode, op).then(resolve).catch(reject);
           } else if (retries > 10) {
               clearInterval(checkDb);
               reject('DB not initialized');
           }
        }, 200);
        return;
      }
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = op(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
