import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface CameraCaptureDialogData {
  title?: string;
  subtitle?: string;
}

export interface CameraCaptureResult {
  file?: File;
  action?: 'choose_file';
}

@Component({
  selector: 'app-camera-capture-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 px-6 pt-5">
      <div class="flex items-center gap-3 min-w-0 pr-2">
        <div class="w-9 h-9 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0 border border-blue-100">
          <span class="material-symbols-outlined text-lg">photo_camera</span>
        </div>
        <div class="min-w-0">
          <h2 mat-dialog-title class="!m-0 text-sm font-bold text-slate-900 leading-tight">
            {{ data?.title || 'Take Photo' }}
          </h2>
          <span class="text-[11px] text-slate-500 font-normal">
            {{ data?.subtitle || 'Position subject within frame' }}
          </span>
        </div>
      </div>
      <button
        type="button"
        (click)="close()"
        class="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-1.5 rounded-full hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
        aria-label="Close"
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>

    <!-- Content -->
    <mat-dialog-content class="!p-4 !m-0">
      <!-- Error State -->
      @if (cameraState() === 'error') {
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4 my-2">
          <div class="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-3xl">no_photography</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-slate-900">Camera Unavailable</h3>
            <p class="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {{ errorMessage() }}
            </p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              (click)="chooseFromFile()"
              mat-flat-button
              color="primary"
              class="!text-xs inline-flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-base">photo_library</span>
              <span>Upload from Gallery / Files</span>
            </button>
            <button
              type="button"
              (click)="startCamera()"
              mat-stroked-button
              class="!text-xs"
            >
              Try Again
            </button>
          </div>
        </div>
      }

      <!-- Initializing State -->
      @if (cameraState() === 'initializing') {
        <div class="bg-slate-900 rounded-xl aspect-video flex flex-col items-center justify-center text-white space-y-3 p-6">
          <div class="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p class="text-xs font-medium text-slate-300">Starting camera...</p>
        </div>
      }

      <!-- Streaming State (Live Viewfinder) -->
      <div [class.hidden]="cameraState() !== 'streaming'" class="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
        <video
          #videoPlayer
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover"
        ></video>

        <!-- Viewfinder Overlay Guides -->
        <div class="absolute inset-4 pointer-events-none border border-white/20 rounded-lg">
          <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/80 rounded-tl"></div>
          <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/80 rounded-tr"></div>
          <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/80 rounded-bl"></div>
          <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/80 rounded-br"></div>
        </div>

        <!-- Live Status Pill -->
        <div class="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Camera</span>
        </div>

        <!-- Flip Camera Button (if multiple cameras exist) -->
        @if (hasMultipleCameras()) {
          <button
            type="button"
            (click)="switchCamera()"
            class="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-xs transition-colors flex items-center justify-center"
            title="Switch Camera"
          >
            <span class="material-symbols-outlined text-lg">flip_camera_ios</span>
          </button>
        }
      </div>

      <!-- Captured Preview State -->
      @if (cameraState() === 'captured') {
        <div class="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
          <img
            [src]="capturedImageUrl()"
            alt="Captured photo preview"
            class="w-full h-full object-contain"
          />
          <div class="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">check_circle</span>
            <span>Photo Captured</span>
          </div>
        </div>
      }

      <!-- Hidden Canvas for frame snapshot extraction -->
      <canvas #captureCanvas class="hidden"></canvas>
    </mat-dialog-content>

    <!-- Actions -->
    <mat-dialog-actions align="end" class="border-t border-slate-100 px-6 py-3 gap-2">
      <button
        type="button"
        mat-button
        (click)="close()"
        class="!text-xs text-slate-600"
      >
        Cancel
      </button>

      @if (cameraState() === 'streaming') {
        <button
          type="button"
          mat-flat-button
          color="primary"
          (click)="capturePhoto()"
          class="!text-xs inline-flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-base">photo_camera</span>
          <span>Capture Photo</span>
        </button>
      }

      @if (cameraState() === 'captured') {
        <button
          type="button"
          mat-stroked-button
          (click)="retakePhoto()"
          class="!text-xs inline-flex items-center gap-1 text-slate-700"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Retake</span>
        </button>

        <button
          type="button"
          mat-flat-button
          color="primary"
          (click)="usePhoto()"
          class="!text-xs inline-flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-base">check</span>
          <span>Use Photo</span>
        </button>
      }
    </mat-dialog-actions>
  `
})
export class CameraCaptureDialogComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('captureCanvas') canvasElement?: ElementRef<HTMLCanvasElement>;

  readonly cameraState = signal<'initializing' | 'streaming' | 'captured' | 'error'>('initializing');
  readonly errorMessage = signal<string | null>(null);
  readonly capturedImageUrl = signal<string | null>(null);
  readonly hasMultipleCameras = signal<boolean>(false);
  readonly currentFacingMode = signal<'environment' | 'user'>('environment');

  private mediaStream: MediaStream | null = null;
  private capturedFile: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<CameraCaptureDialogComponent, CameraCaptureResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: CameraCaptureDialogData | null
  ) {}

  ngOnInit(): void {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      this.cameraState.set('error');
      this.errorMessage.set('Camera capture is not supported by your browser or environment. You can select an image from your files instead.');
      return;
    }

    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.revokeCapturedUrl();
  }

  async startCamera(): Promise<void> {
    this.stopCamera();
    this.cameraState.set('initializing');
    this.errorMessage.set(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: this.currentFacingMode() },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Wait a tick for video element to render if needed
      setTimeout(async () => {
        if (this.videoElement?.nativeElement && this.mediaStream) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
          try {
            await this.videoElement.nativeElement.play();
          } catch {
            // Some browsers require explicit user interaction to play
          }
        }
      }, 50);

      this.cameraState.set('streaming');

      // Check available cameras
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        this.hasMultipleCameras.set(videoDevices.length > 1);
      } catch {
        this.hasMultipleCameras.set(false);
      }
    } catch (err: any) {
      this.cameraState.set('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.errorMessage.set('Camera access was denied. Please allow camera permissions in your browser, or select an image from your device instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        this.errorMessage.set('No camera device was detected on your system. Please connect a camera or select an existing image from your device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        this.errorMessage.set('Your camera is currently in use by another application. Please close other camera apps and try again.');
      } else {
        this.errorMessage.set(err.message || 'Unable to access the camera.');
      }
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      this.mediaStream = null;
    }
    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  switchCamera(): void {
    this.currentFacingMode.update(mode => mode === 'environment' ? 'user' : 'environment');
    this.startCamera();
  }

  capturePhoto(): void {
    const video = this.videoElement?.nativeElement;
    const canvas = this.canvasElement?.nativeElement;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const fileName = `camera_photo_${timestamp}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      this.capturedFile = file;
      this.revokeCapturedUrl();
      this.capturedImageUrl.set(URL.createObjectURL(blob));
      this.cameraState.set('captured');

      // Pause the video feed while reviewing photo
      try {
        video.pause();
      } catch {
        // ignore
      }
    }, 'image/jpeg', 0.92);
  }

  retakePhoto(): void {
    this.revokeCapturedUrl();
    this.capturedFile = null;
    this.cameraState.set('streaming');

    const video = this.videoElement?.nativeElement;
    if (video && this.mediaStream) {
      video.play().catch(() => {});
    }
  }

  usePhoto(): void {
    if (this.capturedFile) {
      const fileToReturn = this.capturedFile;
      this.stopCamera();
      this.dialogRef.close({ file: fileToReturn });
    }
  }

  chooseFromFile(): void {
    this.stopCamera();
    this.dialogRef.close({ action: 'choose_file' });
  }

  close(): void {
    this.stopCamera();
    this.dialogRef.close(null);
  }

  private revokeCapturedUrl(): void {
    const url = this.capturedImageUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.capturedImageUrl.set(null);
    }
  }
}
