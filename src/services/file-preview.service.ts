
import { Injectable, signal } from '@angular/core';

export interface FilePreview {
  id: string;
  filename: string;
  mimeType: string;
  content: string;
  size: number;
  previewUrl?: string;
  isPreviewable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FilePreviewService {
  
  private previewState = signal<FilePreview | null>(null);
  readonly currentPreview = this.previewState.asReadonly();

  canPreview(mimeType: string): boolean {
    const previewableTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'text/plain',
      'text/markdown',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'application/xml'
    ];

    return previewableTypes.some(type => mimeType.includes(type));
  }

  async generatePreview(file: File): Promise<FilePreview> {
    const preview: FilePreview = {
      id: crypto.randomUUID(),
      filename: file.name,
      mimeType: file.type,
      content: '',
      size: file.size,
      isPreviewable: this.canPreview(file.type)
    };

    if (!preview.isPreviewable) {
      return preview;
    }

    if (file.type.startsWith('image/')) {
      preview.previewUrl = await this.createImagePreview(file);
    } else if (file.type === 'application/pdf') {
      preview.previewUrl = URL.createObjectURL(file);
    } else if (file.type.startsWith('text/')) {
      preview.content = await this.readTextFile(file);
    }

    return preview;
  }

  private createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  setPreview(preview: FilePreview | null) {
    this.previewState.set(preview);
  }

  closePreview() {
    const current = this.previewState();
    if (current?.previewUrl) {
      URL.revokeObjectURL(current.previewUrl);
    }
    this.previewState.set(null);
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return 'spreadsheet';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
    return 'file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
