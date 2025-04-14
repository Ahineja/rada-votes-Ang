import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="loading-container">
      <div class="spinner-wrapper">
        <mat-progress-spinner
          mode="indeterminate"
          diameter="48"
          strokeWidth="4"
          color="primary"
        ></mat-progress-spinner>
        <mat-icon class="loading-icon">how_to_vote</mat-icon>
      </div>
      <span class="loading-text">Завантаження...</span>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
    }

    .spinner-wrapper {
      position: relative;
      width: 48px;
      height: 48px;
    }

    .loading-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #1976d2;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .loading-text {
      color: #666;
      font-size: 1rem;
      animation: fadeInOut 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.5;
      }
      50% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.5;
      }
    }

    @keyframes fadeInOut {
      0% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.5;
      }
    }

    ::ng-deep .mat-progress-spinner circle {
      stroke: #1976d2;
      transition: stroke-dashoffset 0.3s ease;
    }
  `]
})
export class LoadingSpinnerComponent {}
