import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatSortModule, Sort } from "@angular/material/sort";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";

import { VotingService } from "../../services/voting.service";
import { AvailableData } from "../../models/voting.interface";
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
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <mat-icon class="header-icon">ballot</mat-icon>
          Всі голосування
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="isLoading" class="loading-wrapper">
          <app-loading-spinner></app-loading-spinner>
        </div>

        <div *ngIf="error" class="error-wrapper">
          <app-error-message [message]="error"></app-error-message>
        </div>

        <div *ngIf="!isLoading && !error" class="table-container">
          <table mat-table [dataSource]="displayedVotings" matSort (matSortChange)="sortData($event)">
            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                <mat-icon class="header-icon">event</mat-icon>
                Дата
              </th>
              <td mat-cell *matCellDef="let voting">{{ voting.date | date: "dd.MM.yyyy" }}</td>
            </ng-container>

            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                <mat-icon class="header-icon">description</mat-icon>
                Назва
              </th>
              <td mat-cell *matCellDef="let voting">{{ voting.title }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>
                <mat-icon class="header-icon">more_horiz</mat-icon>
                Дії
              </th>
              <td mat-cell *matCellDef="let voting">
                <button 
                  mat-icon-button 
                  color="primary" 
                  [routerLink]="['/voting', voting.id]"
                  [matTooltip]="'Переглянути деталі голосування від ' + (voting.date | date: 'dd.MM.yyyy')"
                  matTooltipPosition="left"
                >
                  <mat-icon>how_to_vote</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="voting-row"></tr>

            <!-- No Data Row -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="3">
                <div class="no-data">
                  <mat-icon>info</mat-icon>
                  Немає доступних голосувань
                </div>
              </td>
            </tr>
          </table>

          <mat-paginator
            [length]="totalVotings"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)"
            aria-label="Виберіть сторінку голосувань"
          >
          </mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .table-container {
      margin-top: 1rem;
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .mat-column-date {
      width: 120px;
    }
    .mat-column-actions {
      width: 80px;
      text-align: center;
    }
    .loading-wrapper,
    .error-wrapper {
      padding: 2rem;
      display: flex;
      justify-content: center;
    }
    td.mat-column-title {
      padding: 1rem;
    }
    .header-icon {
      vertical-align: middle;
      margin-right: 8px;
      color: #1976d2;
      font-size: 1.2rem;
      height: 1.2rem;
      width: 1.2rem;
    }
    mat-card {
      border-radius: 8px;
    }
    mat-card-header {
      padding: 1rem;
    }
    .voting-row {
      transition: background-color 0.2s;
    }
    .voting-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 2rem;
      color: #666;
    }
    .no-data mat-icon {
      color: #1976d2;
    }
    ::ng-deep .mat-sort-header-content {
      display: flex !important;
      align-items: center;
    }
  `]
})
export class VotingListComponent implements OnInit {
  allVotings: AvailableData[] = [];
  displayedVotings: AvailableData[] = [];
  displayedColumns: string[] = ["date", "title", "actions"];
  
  isLoading = false;
  error?: string;
  
  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalVotings = 0;

  constructor(private votingService: VotingService) {}

  ngOnInit(): void {
    this.loadVotings();
  }

  loadVotings(): void {
    this.isLoading = true;
    this.error = undefined;

    this.votingService.getAvailableData().subscribe({
      next: (data) => {
        this.allVotings = data;
        this.totalVotings = data.length;
        this.updateDisplayedVotings();
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading votings:", error);
        this.error = "Помилка завантаження голосувань";
        this.isLoading = false;
      }
    });
  }

  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === "") {
      this.displayedVotings = this.getPageData();
      return;
    }

    this.displayedVotings = this.getPageData().sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "date":
          return this.compare(a.date, b.date, isAsc);
        case "title":
          return this.compare(a.title, b.title, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: string, b: string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updateDisplayedVotings();
  }

  private getPageData(): AvailableData[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.allVotings.slice(startIndex, startIndex + this.pageSize);
  }

  private updateDisplayedVotings(): void {
    this.displayedVotings = this.getPageData();
  }
}
