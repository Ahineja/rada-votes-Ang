import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <span>Голосування ВРУ</span>
      <span class="toolbar-spacer"></span>
      <button mat-button routerLink="/dashboard">
        <mat-icon>dashboard</mat-icon>
        Головна
      </button>
      <button mat-button routerLink="/votings">
        <mat-icon>list</mat-icon>
        Голосування
      </button>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    .content {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    button {
      margin-left: 0.5rem;
    }
    mat-icon {
      margin-right: 0.25rem;
    }
  `]
})
export class AppComponent {
  title = 'Голосування ВРУ';
}
