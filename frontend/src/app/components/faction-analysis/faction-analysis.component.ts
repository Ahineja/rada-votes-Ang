import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { CommonModule } from "@angular/common";
import { ViewChild } from "@angular/core";

import { VotingService } from "../../services/voting.service";
import { FactionStats } from "../../models/voting.interface";
import { LoadingSpinnerComponent } from "../shared/loading-spinner/loading-spinner.component";
import { ErrorMessageComponent } from "../shared/error-message/error-message.component";

@Component({
  selector: "app-faction-analysis",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="faction-analysis-container">
      <div *ngIf="isLoading" class="loading-wrapper">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <div *ngIf="error" class="error-wrapper">
        <app-error-message [message]="error"></app-error-message>
      </div>

      <div *ngIf="!isLoading && !error && factionStats" class="content-wrapper">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Статистика фракції</mat-card-title>
            <mat-card-subtitle>{{ factionName }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Всього депутатів:</span>
                <span class="stat-value">{{ factionStats.totalMembers }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Середня явка:</span>
                <span class="stat-value">{{ factionStats.averageParticipation | number: "1.1-1" }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">За:</span>
                <span class="stat-value for">{{ factionStats.votingPattern.for }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Проти:</span>
                <span class="stat-value against">{{ factionStats.votingPattern.against }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Утримались:</span>
                <span class="stat-value abstained">{{ factionStats.votingPattern.abstained }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Не голосували:</span>
                <span class="stat-value not-voted">{{ factionStats.votingPattern.notVoted }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="voting-pattern-card">
          <mat-card-header>
            <mat-card-title>Паттерни голосування</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div class="pattern-grid">
              <div class="pattern-item">
                <div class="pattern-label">За</div>
                <div class="pattern-bar">
                  <div
                    class="pattern-fill for"
                    [style.width.%]="(factionStats.votingPattern.for / factionStats.totalMembers) * 100"
                  ></div>
                </div>
                <div class="pattern-value">{{ factionStats.votingPattern.for }}</div>
              </div>

              <div class="pattern-item">
                <div class="pattern-label">Проти</div>
                <div class="pattern-bar">
                  <div
                    class="pattern-fill against"
                    [style.width.%]="(factionStats.votingPattern.against / factionStats.totalMembers) * 100"
                  ></div>
                </div>
                <div class="pattern-value">{{ factionStats.votingPattern.against }}</div>
              </div>

              <div class="pattern-item">
                <div class="pattern-label">Утримались</div>
                <div class="pattern-bar">
                  <div
                    class="pattern-fill abstained"
                    [style.width.%]="(factionStats.votingPattern.abstained / factionStats.totalMembers) * 100"
                  ></div>
                </div>
                <div class="pattern-value">{{ factionStats.votingPattern.abstained }}</div>
              </div>

              <div class="pattern-item">
                <div class="pattern-label">Не голосували</div>
                <div class="pattern-bar">
                  <div
                    class="pattern-fill not-voted"
                    [style.width.%]="(factionStats.votingPattern.notVoted / factionStats.totalMembers) * 100"
                  ></div>
                </div>
                <div class="pattern-value">{{ factionStats.votingPattern.notVoted }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .faction-analysis-container {
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
    .summary-card {
      margin-bottom: 1rem;
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
    .stat-value.for { color: #4caf50; }
    .stat-value.against { color: #f44336; }
    .stat-value.abstained { color: #ff9800; }
    .stat-value.not-voted { color: #9e9e9e; }
    .voting-pattern-card {
      margin-top: 1rem;
    }
    .pattern-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
    }
    .pattern-item {
      display: grid;
      grid-template-columns: 100px 1fr 80px;
      align-items: center;
      gap: 1rem;
    }
    .pattern-label {
      font-weight: 500;
    }
    .pattern-bar {
      height: 24px;
      background-color: #f5f5f5;
      border-radius: 12px;
      overflow: hidden;
    }
    .pattern-fill {
      height: 100%;
      transition: width 0.3s ease;
    }
    .pattern-fill.for { background-color: #4caf50; }
    .pattern-fill.against { background-color: #f44336; }
    .pattern-fill.abstained { background-color: #ff9800; }
    .pattern-fill.not-voted { background-color: #9e9e9e; }
    .pattern-value {
      text-align: right;
      font-weight: 500;
    }
  `]
})
export class FactionAnalysisComponent implements OnInit {
  factionName?: string;
  factionStats?: FactionStats;
  isLoading = false;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private votingService: VotingService
  ) {}

  ngOnInit(): void {
    this.factionName = this.route.snapshot.paramMap.get("name") || undefined;
    if (this.factionName) {
      this.loadFactionStats(this.factionName);
    }
  }

  loadFactionStats(factionName: string): void {
    this.isLoading = true;
    this.error = undefined;

    this.votingService.getFactionStatistics(factionName).subscribe({
      next: (data) => {
        this.factionStats = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Помилка завантаження даних";
        this.isLoading = false;
      }
    });
  }
}
