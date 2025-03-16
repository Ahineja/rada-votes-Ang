import { Component, Input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-error-message",
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="error-card">
      <mat-card-content>
        <div class="error-container">
          <p class="error-icon">⚠️</p>
          <p class="error-text">{{ message || "Сталася помилка" }}</p>
          <button mat-raised-button color="primary" (click)="onRetry()" *ngIf="showRetry">
            Спробувати ще раз
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .error-card {
      margin: 1rem;
      background-color: #fff3f3;
    }
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
    }
    .error-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .error-text {
      color: #d32f2f;
      text-align: center;
      margin-bottom: 1rem;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message?: string;
  @Input() showRetry = false;
  @Input() onRetry = () => {};
}
