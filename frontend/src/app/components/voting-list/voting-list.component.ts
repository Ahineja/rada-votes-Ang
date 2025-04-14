import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { MatRippleModule } from "@angular/material/core";

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
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    MatRippleModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <mat-card class="container-card">
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

        <div *ngIf="!isLoading && !error" class="content-wrapper">
          <div class="votings-grid">
            <mat-card 
              *ngFor="let voting of displayedVotings" 
              class="voting-card" 
              matRipple
              [routerLink]="['/voting', voting.id]"
            >
              <mat-card-content>
                <div class="voting-header">
                  <mat-chip-set>
                    <mat-chip color="primary" highlighted>
                      <mat-icon class="chip-icon">event</mat-icon>
                      {{ voting.date | date: "dd.MM.yyyy" }}
                    </mat-chip>
                  </mat-chip-set>
                  <button 
                    mat-icon-button 
                    color="primary"
                    [matTooltip]="'Переглянути деталі'"
                    matTooltipPosition="above"
                    (click)="$event.stopPropagation()"
                    [routerLink]="['/voting', voting.id]"
                  >
                    <mat-icon>how_to_vote</mat-icon>
                  </button>
                </div>
                <p class="voting-title">{{ voting.title }}</p>
              </mat-card-content>
            </mat-card>

            <!-- No Data Message -->
            <div *ngIf="displayedVotings.length === 0" class="no-data">
              <mat-icon>info</mat-icon>
              <span>Немає доступних голосувань</span>
            </div>
          </div>

          <mat-paginator
            [length]="totalVotings"
            [pageSize]="pageSize"
            [pageSizeOptions]="[6, 12, 24, 48]"
            (page)="onPageChange($event)"
            aria-label="Виберіть сторінку голосувань"
          >
          </mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .container-card {
      border-radius: 8px;
    }

    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .votings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }

    .voting-card {
      height: 100%;
      border-radius: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      border: 1px solid #e0e0e0;
    }

    .voting-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .voting-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .voting-title {
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chip-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-right: 4px;
    }

    .header-icon {
      vertical-align: middle;
      margin-right: 8px;
      color: #1976d2;
    }

    .loading-wrapper,
    .error-wrapper {
      padding: 2rem;
      display: flex;
      justify-content: center;
    }

    .no-data {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 2rem;
      color: #666;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .no-data mat-icon {
      color: #1976d2;
    }

    mat-card-header {
      padding: 1rem;
    }

    ::ng-deep .mat-mdc-card-content {
      padding: 1rem !important;
    }

    ::ng-deep .mdc-evolution-chip {
      height: 24px !important;
    }

    ::ng-deep .mdc-evolution-chip__text-label {
      font-size: 0.8rem !important;
      padding: 0 8px !important;
    }
  `]
})
export class VotingListComponent implements OnInit {
  allVotings: AvailableData[] = [];
  displayedVotings: AvailableData[] = [];
  
  isLoading = false;
  error?: string;
  
  // Pagination
  pageSize = 12;
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

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updateDisplayedVotings();
  }

  private updateDisplayedVotings(): void {
    const startIndex = this.currentPage * this.pageSize;
    this.displayedVotings = this.allVotings.slice(startIndex, startIndex + this.pageSize);
  }
}
