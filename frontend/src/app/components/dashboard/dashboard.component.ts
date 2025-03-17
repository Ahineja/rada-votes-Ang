import { Component, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

import { VotingService } from "../../services/voting.service";
import { VotingStatistics, AvailableData } from "../../models/voting.interface";
import { LoadingSpinnerComponent } from "../shared/loading-spinner/loading-spinner.component";
import { ErrorMessageComponent } from "../shared/error-message/error-message.component";
import { VotingListComponent } from "../voting-list/voting-list.component";

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
    MatTooltipModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    VotingListComponent
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
        <div class="left-column">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="header-icon">analytics</mat-icon>
                Загальна статистика
              </mat-card-title>
              <button mat-raised-button color="primary" (click)="refreshData()" class="refresh-button">
                <mat-icon>sync</mat-icon>
                Оновити дані
              </button>
            </mat-card-header>

            <mat-card-content>
              <div class="stats-grid">
                <div class="stat-item">
                  <mat-icon class="stat-icon">how_to_vote</mat-icon>
                  <span class="stat-label">Всього голосувань:</span>
                  <span class="stat-value">{{ statistics?.totalSessions || 0 }}</span>
                </div>
                <div class="stat-item">
                  <mat-icon class="stat-icon">groups</mat-icon>
                  <span class="stat-label">Середня явка:</span>
                  <span class="stat-value">{{ (statistics?.averageParticipation || 0) | number: "1.1-1" }}%</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="factions-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="header-icon">account_balance</mat-icon>
                Статистика за фракціями
              </mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <mat-list>
                <mat-list-item *ngFor="let faction of getFactionList()">
                  <div class="faction-item">
                    <div class="faction-info">
                      <span class="faction-name">
                        <mat-icon class="faction-icon">group</mat-icon>
                        {{ faction.name }}
                      </span>
                      <span class="faction-stats">
                        <mat-icon class="stats-icon" [matTooltip]="'Кількість депутатів'">person</mat-icon>
                        {{ faction.stats.totalMembers }}
                        <mat-icon class="stats-icon" [matTooltip]="'Середня явка'">how_to_reg</mat-icon>
                        {{ faction.stats.averageParticipation | number: "1.1-1" }}%
                      </span>
                    </div>
                    <button mat-button color="primary" [routerLink]="['/faction', faction.name]">
                      <mat-icon>trending_up</mat-icon>
                      Аналіз
                    </button>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <mat-card class="help-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon class="header-icon">help_outline</mat-icon>
                Як користуватись системою
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                <mat-list-item>
                  <mat-icon matListItemIcon class="help-icon">sync</mat-icon>
                  <div matListItemTitle>Оновлення даних</div>
                  <div matListItemLine>Натисніть "Оновити дані" для завантаження нових голосувань</div>
                </mat-list-item>
                <mat-list-item>
                  <mat-icon matListItemIcon class="help-icon">ballot</mat-icon>
                  <div matListItemTitle>Деталі голосування</div>
                  <div matListItemLine>Натисніть на кнопку "Деталі" біля голосування для перегляду результатів</div>
                </mat-list-item>
                <mat-list-item>
                  <mat-icon matListItemIcon class="help-icon">insights</mat-icon>
                  <div matListItemTitle>Аналіз фракцій</div>
                  <div matListItemLine>Виберіть фракцію для детального аналізу голосувань</div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="right-column">
          <app-voting-list></app-voting-list>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .loading-wrapper,
    .error-wrapper {
      padding: 2rem;
      display: flex;
      justify-content: center;
    }
    .content-wrapper {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 1rem;
    }
    @media (max-width: 1200px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }
    }
    .left-column {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .right-column {
      min-width: 0;
    }
    .summary-card,
    .factions-card,
    .help-card {
      height: fit-content;
      border-radius: 8px;
    }
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }
    .header-icon {
      vertical-align: middle;
      margin-right: 8px;
      color: #1976d2;
    }
    .refresh-button {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background-color: #f5f5f5;
      border-radius: 8px;
      transition: transform 0.2s;
    }
    .stat-item:hover {
      transform: translateY(-2px);
    }
    .stat-icon {
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
      color: #1976d2;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
      text-align: center;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1976d2;
    }
    .faction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0.5rem 0;
    }
    .faction-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .faction-name {
      font-weight: 500;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .faction-icon {
      color: #1976d2;
      font-size: 1.2rem;
      height: 1.2rem;
      width: 1.2rem;
    }
    .faction-stats {
      font-size: 0.9rem;
      color: #666;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .stats-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
      color: #666;
    }
    .help-card {
      background-color: #e3f2fd;
    }
    .help-card mat-list-item {
      height: auto;
      margin-bottom: 1rem;
    }
    .help-icon {
      color: #1976d2;
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }
    [matListItemTitle] {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    [matListItemLine] {
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

    // First update the data
    this.votingService.updateVotingData().subscribe({
      next: () => {
        // After successful update, load the statistics
        this.votingService.getVotingStatistics().subscribe({
          next: (data) => {
            this.statistics = data;
            this.isLoading = false;
          },
          error: (error) => {
            this.error = "Помилка завантаження статистики";
            this.isLoading = false;
            console.error("Statistics error:", error);
          }
        });

        // Load recent votings
        this.votingService.getAvailableData().subscribe({
          next: (data) => {
            // Filter out votings without IDs and take the first 5
            this.recentVotings = data
              .filter(voting => voting && voting.id)
              .slice(0, 5);
          },
          error: (error) => {
            console.error("Recent votings error:", error);
            this.recentVotings = [];
          }
        });
      },
      error: (error) => {
        this.error = "Помилка оновлення даних";
        this.isLoading = false;
        console.error("Update error:", error);
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData(); // Now we can just call loadDashboardData since it includes the update
  }

  getFactionList(): Array<{ name: string; stats: any }> {
    if (!this.statistics?.factionStatistics) return [];
    return Object.entries(this.statistics.factionStatistics).map(([name, stats]) => ({
      name,
      stats
    }));
  }
}
