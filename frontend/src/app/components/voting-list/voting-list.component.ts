import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatSortModule, MatSort } from "@angular/material/sort";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

import { VotingService } from "../../services/voting.service";
import { VotingResult } from "../../models/voting.interface";
import { LoadingSpinnerComponent } from "../shared/loading-spinner/loading-spinner.component";
import { ErrorMessageComponent } from "../shared/error-message/error-message.component";

@Component({
  selector: "app-voting-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="voting-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Список голосувань</mat-card-title>
          <button mat-raised-button color="primary" (click)="refreshData()">
            Оновити дані
          </button>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="isLoading" class="loading-wrapper">
            <app-loading-spinner></app-loading-spinner>
          </div>

          <div *ngIf="error" class="error-wrapper">
            <app-error-message
              [message]="error"
              [showRetry]="true"
              [onRetry]="refreshData"
            ></app-error-message>
          </div>

          <div *ngIf="!isLoading && !error" class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Дата</th>
                <td mat-cell *matCellDef="let voting">
                  {{ voting.date | date: "dd.MM.yyyy" }}
                </td>
              </ng-container>

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Назва</th>
                <td mat-cell *matCellDef="let voting">{{ voting.title }}</td>
              </ng-container>

              <ng-container matColumnDef="totalVotes">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Всього</th>
                <td mat-cell *matCellDef="let voting">{{ voting.totalVotes }}</td>
              </ng-container>

              <ng-container matColumnDef="votesFor">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>За</th>
                <td mat-cell *matCellDef="let voting">{{ voting.votesFor }}</td>
              </ng-container>

              <ng-container matColumnDef="votesAgainst">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Проти</th>
                <td mat-cell *matCellDef="let voting">{{ voting.votesAgainst }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Дії</th>
                <td mat-cell *matCellDef="let voting">
                  <button mat-button color="primary" [routerLink]="['/voting', voting.id]">
                    Деталі
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <mat-paginator
              [pageSizeOptions]="[5, 10, 25, 100]"
              aria-label="Виберіть сторінку голосувань"
            ></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .voting-list-container {
      padding: 1rem;
    }
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }
    .loading-wrapper,
    .error-wrapper {
      padding: 2rem;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
  `]
})
export class VotingListComponent implements OnInit {
  displayedColumns: string[] = ["date", "title", "totalVotes", "votesFor", "votesAgainst", "actions"];
  dataSource!: MatTableDataSource<VotingResult>;
  isLoading = false;
  error?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private votingService: VotingService) {}

  ngOnInit(): void {
    this.loadVotingData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadVotingData(): void {
    this.isLoading = true;
    this.error = undefined;

    this.votingService.getAllVotings().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Помилка завантаження даних";
        this.isLoading = false;
      }
    });
  }

  refreshData(): void {
    this.votingService.updateVotingData().subscribe({
      next: () => {
        this.loadVotingData();
      },
      error: (error) => {
        this.error = "Помилка оновлення даних";
      }
    });
  }
}
