
import { Injectable, signal, inject } from '@angular/core';
import { PersistenceService } from './persistence.service';

export interface DriveFile {
  id: string;
  name: string;
  type: string;
  sizeStr: string;
  createdAt: string;
  dataUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriveService {
  private persistence = inject(PersistenceService);
  private filesState = signal<DriveFile[]>([]);
  readonly files = this.filesState.asReadonly();

  constructor() {
      this.loadFiles();
  }

  private async loadFiles() {
      try {
          // Try loading from IndexedDB first
          const dbFiles = await this.persistence.getAllFiles();
          if (dbFiles && dbFiles.length > 0) {
              this.filesState.set(dbFiles);
          } else {
              // Fallback for demo legacy data
              const stored = localStorage.getItem('artifact_files');
              if (stored) {
                  const localFiles = JSON.parse(stored);
                  this.filesState.set(localFiles);
                  // Migrate to DB
                  localFiles.forEach((f: any) => this.persistence.saveFile(f));
                  localStorage.removeItem('artifact_files');
              }
          }
      } catch(e) { console.error('Error loading files', e); }
  }

  async addFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const newFile: DriveFile = {
            id: crypto.randomUUID(),
            name: file.name,
            type: this.getType(file.type),
            sizeStr: this.formatSize(file.size),
            createdAt: new Date().toISOString(),
            dataUrl: e.target?.result as string
        };
        
        // Optimistic UI update
        this.filesState.update(prev => [newFile, ...prev]);
        
        // Async save to DB (Non-blocking)
        try {
            await this.persistence.saveFile(newFile);
        } catch (err) {
            console.error('Failed to save file to DB', err);
        }
    };
    reader.readAsDataURL(file);
  }
  
  async createDummyFile() {
      const newFile: DriveFile = {
          id: crypto.randomUUID(),
          name: `Odus_${Math.floor(Math.random()*1000)}.dat`,
          type: 'DATA',
          sizeStr: '12 KB',
          createdAt: new Date().toISOString()
      };
      
      this.filesState.update(prev => [newFile, ...prev]);
      await this.persistence.saveFile(newFile);
      return newFile;
  }

  downloadFile(fileId: string) {
      const file = this.filesState().find(f => f.id === fileId);
      if (file && file.dataUrl) {
          const a = document.createElement('a');
          a.href = file.dataUrl;
          a.download = file.name;
          a.click();
      } else {
          alert('File data unavailable (Simulated).');
      }
  }

  private getType(mime: string): string {
      if (mime.includes('image')) return 'IMG';
      if (mime.includes('pdf')) return 'PDF';
      if (mime.includes('text')) return 'TXT';
      return 'FILE';
  }

  private formatSize(bytes: number) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
