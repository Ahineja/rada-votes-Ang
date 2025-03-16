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
import { VotingResult, Deputy } from "../../models/voting.interface";
import { LoadingSpinnerComponent } from "../shared/loading-spinner/loading-spinner.component";
import { ErrorMessageComponent } from "../shared/error-message/error-message.component";

@Component({
  selector: "app-voting-detail",
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
    <div class="voting-detail-container">
      <div *ngIf="isLoading" class="loading-wrapper">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <div *ngIf="error" class="error-wrapper">
        <app-error-message [message]="error"></app-error-message>
      </div>

      <div *ngIf="!isLoading && !error && voting" class="content-wrapper">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>{{ voting.title }}</mat-card-title>
            <mat-card-subtitle>{{ voting.date | date: "dd.MM.yyyy" }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Всього голосів:</span>
                <span class="stat-value">{{ voting.totalVotes }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">За:</span>
                <span class="stat-value for">{{ voting.votesFor }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Проти:</span>
                <span class="stat-value against">{{ voting.votesAgainst }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Утримались:</span>
                <span class="stat-value abstained">{{ voting.abstained }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Не голосували:</span>
                <span class="stat-value not-voted">{{ voting.didNotVote }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="deputies-card">
          <mat-card-header>
            <mat-card-title>Список депутатів</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Ім'я</th>
                <td mat-cell *matCellDef="let deputy">{{ deputy.name }}</td>
              </ng-container>

              <ng-container matColumnDef="faction">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Фракція</th>
                <td mat-cell *matCellDef="let deputy">{{ deputy.faction || "Не вказано" }}</td>
              </ng-container>

              <ng-container matColumnDef="vote">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Голос</th>
                <td mat-cell *matCellDef="let deputy">
                  <mat-chip-set>
                    <mat-chip
                      [color]="getVoteColor(deputy.vote)"
                      [highlighted]="true"
                    >
                      {{ getVoteText(deputy.vote) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>
            </table>

            <mat-paginator
              [pageSizeOptions]="[5, 10, 25, 100]"
              aria-label="Виберіть сторінку депутатів"
            ></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .voting-detail-container {
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
    .deputies-card {
      margin-top: 1rem;
    }
    table {
      width: 100%;
    }
    .mat-column-vote {
      width: 150px;
    }
  `]
})
export class VotingDetailComponent implements OnInit {
  voting?: VotingResult;
  dataSource!: MatTableDataSource<Deputy>;
  isLoading = false;
  error?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private votingService: VotingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadVotingData(id);
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadVotingData(id: string): void {
    this.isLoading = true;
    this.error = undefined;

    this.votingService.getVotingById(id).subscribe({
      next: (data) => {
        this.voting = data;
        this.dataSource = new MatTableDataSource(data.deputies || []);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Помилка завантаження даних";
        this.isLoading = false;
      }
    });
  }

  getVoteColor(vote?: string): string {
    switch (vote) {
      case "for": return "primary";
      case "against": return "warn";
      case "abstained": return "accent";
      default: return "";
    }
  }

  getVoteText(vote?: string): string {
    switch (vote) {
      case "for": return "За";
      case "against": return "Проти";
      case "abstained": return "Утримався";
      case "not_voted": return "Не голосував";
      default: return "Не вказано";
    }
  }
}
