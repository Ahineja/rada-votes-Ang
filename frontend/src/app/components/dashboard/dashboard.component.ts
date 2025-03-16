import { Component, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

import { VotingService } from "../../services/voting.service";
import { VotingStatistics, AvailableData } from "../../models/voting.interface";
import { LoadingSpinnerComponent } from "../shared/loading-spinner/loading-spinner.component";
import { ErrorMessageComponent } from "../shared/error-message/error-message.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="dashboard-container">
      <div *ngIf="isLoading" class="loading-wrapper">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <div *ngIf="error" class="error-wrapper">
        <app-error-message [message]="error"></app-error-message>
      </div>

      <div *ngIf="!isLoading && !error" class="content-wrapper">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Загальна статистика</mat-card-title>
            <button mat-raised-button color="primary" (click)="refreshData()">
              Оновити дані
            </button>
          </mat-card-header>

          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Всього голосувань:</span>
                <span class="stat-value">{{ statistics?.totalSessions }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Середня явка:</span>
                <span class="stat-value">{{ statistics?.averageParticipation | number: "1.1-1" }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="factions-card">
          <mat-card-header>
            <mat-card-title>Статистика за фракціями</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let faction of getFactionList()">
                <div class="faction-item">
                  <div class="faction-info">
                    <span class="faction-name">{{ faction.name }}</span>
                    <span class="faction-stats">
                      {{ faction.stats.totalMembers }} депутатів,
                      {{ faction.stats.averageParticipation | number: "1.1-1" }}% явка
                    </span>
                  </div>
                  <button mat-button color="primary" [routerLink]="['/faction', faction.name]">
                    Деталі
                  </button>
                </div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card class="recent-card">
          <mat-card-header>
            <mat-card-title>Останні голосування</mat-card-title>
            <button mat-button color="primary" routerLink="/votings">
              Всі голосування
            </button>
          </mat-card-header>

          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let voting of recentVotings">
                <div class="voting-item">
                  <div class="voting-info">
                    <span class="voting-title">{{ voting.title }}</span>
                    <span class="voting-date">{{ voting.date | date: "dd.MM.yyyy" }}</span>
                  </div>
                  <button mat-button color="primary" [routerLink]="['/voting', voting.id]">
                    Деталі
                  </button>
                </div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1rem;
    }
    .loading-wrapper,
    .error-wrapper {
      padding: 2rem;
    }
    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .summary-card,
    .factions-card,
    .recent-card {
      margin-bottom: 1rem;
    }
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .faction-item,
    .voting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .faction-info,
    .voting-info {
      display: flex;
      flex-direction: column;
    }
    .faction-name,
    .voting-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    .faction-stats,
    .voting-date {
      font-size: 0.9rem;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  statistics?: VotingStatistics;
  recentVotings: AvailableData[] = [];
  isLoading = false;
  error?: string;

  constructor(private votingService: VotingService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = undefined;

    this.votingService.getVotingStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Помилка завантаження даних";
        this.isLoading = false;
      }
    });

    this.votingService.getAvailableData().subscribe({
      next: (data) => {
        this.recentVotings = data.slice(0, 5);
      }
    });
  }

  refreshData(): void {
    this.votingService.updateVotingData().subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (error) => {
        this.error = "Помилка оновлення даних";
      }
    });
  }

  getFactionList(): Array<{ name: string; stats: any }> {
    if (!this.statistics?.factionStatistics) return [];
    return Object.entries(this.statistics.factionStatistics).map(([name, stats]) => ({
      name,
      stats
    }));
  }
}
