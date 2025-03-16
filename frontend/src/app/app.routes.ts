import { Routes } from '@angular/router';
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { VotingListComponent } from "./components/voting-list/voting-list.component";
import { VotingDetailComponent } from "./components/voting-detail/voting-detail.component";
import { FactionAnalysisComponent } from "./components/faction-analysis/faction-analysis.component";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "votings", component: VotingListComponent },
  { path: "voting/:id", component: VotingDetailComponent },
  { path: "faction/:name", component: FactionAnalysisComponent },
  { path: "**", redirectTo: "/dashboard" }
];
