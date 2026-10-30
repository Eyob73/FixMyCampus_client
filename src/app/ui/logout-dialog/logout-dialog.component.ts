import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-logout-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-title class="!flex !flex-col !items-center !justify-center text-center !m-0 pt-6 pb-2 px-6">
      <div class="w-full flex justify-center items-center mb-3">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs mx-auto">
          <span class="material-symbols-outlined text-2xl flex items-center justify-center leading-none select-none">logout</span>
        </div>
      </div>
      <div class="text-lg font-bold text-slate-900 leading-tight w-full text-center">Sign Out</div>
    </div>

    <mat-dialog-content class="text-center !px-6 !py-2">
      <p class="text-sm text-slate-600 leading-relaxed m-0 max-w-sm mx-auto">
        Are you sure you want to sign out of FixMyCampus? You will need to sign in again to access your account.
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="center" class="border-t border-slate-100 mt-5 pt-3 pb-4 px-6 gap-3 justify-center">
      <button mat-button (click)="cancel()" class="!px-5 text-slate-700 font-medium">
        Cancel
      </button>
      <button mat-flat-button color="warn" (click)="confirm()" class="!bg-red-600 hover:!bg-red-700 !text-white font-medium flex items-center gap-1.5 shadow-xs !px-5">
        <span class="material-symbols-outlined text-[16px]">logout</span>
        <span>Sign Out</span>
      </button>
    </mat-dialog-actions>
  `
})
export class LogoutDialogComponent {
  private dialogRef = inject(MatDialogRef<LogoutDialogComponent>);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
