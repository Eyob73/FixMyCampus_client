import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ImageLightboxData {
  url: string;
  fileName?: string;
  fileSize?: string;
  category?: string;
}

@Component({
  selector: 'app-image-lightbox-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="flex items-center justify-between pb-2 border-b border-slate-100 px-6 pt-5">
      <div class="flex items-center gap-2.5 min-w-0 pr-2">
        <div class="w-9 h-9 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0 border border-blue-100">
          <span class="material-symbols-outlined text-lg">image</span>
        </div>
        <div class="min-w-0">
          <h2 mat-dialog-title class="!m-0 text-sm font-bold text-slate-900 leading-tight truncate" [title]="data.fileName">
            {{ data.fileName || 'Image Preview' }}
          </h2>
          <span class="text-[11px] text-slate-500 font-normal">Ticket Attachment</span>
        </div>
      </div>
      <button
        type="button"
        mat-dialog-close
        class="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
        aria-label="Close"
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>

    <mat-dialog-content class="!p-4 !m-0">
      <div class="bg-slate-50 rounded-xl p-2 border border-slate-200/80 flex items-center justify-center overflow-auto max-h-[70vh]">
        <img
          [src]="data.url"
          [alt]="data.fileName || 'Image preview'"
          class="max-w-full max-h-[66vh] object-contain rounded-lg shadow-2xs"
        />
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="border-t border-slate-100 px-6 py-3 gap-2">
      @if (data.url) {
        <a
          [href]="data.url"
          target="_blank"
          mat-button
          class="text-slate-700 font-medium !text-xs inline-flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-base">open_in_new</span>
          <span>Open Full Size</span>
        </a>
      }
      <button
        type="button"
        mat-flat-button
        color="primary"
        mat-dialog-close
        class="!text-xs"
      >
        Close
      </button>
    </mat-dialog-actions>
  `
})
export class ImageLightboxDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageLightboxDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageLightboxData
  ) {}
}
