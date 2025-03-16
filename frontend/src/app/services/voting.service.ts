import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { VotingResult, VotingStatistics, FactionStats, AvailableData } from "../models/voting.interface";

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  private readonly apiUrl = "http://localhost:3000/api/voting";

  constructor(private http: HttpClient) {}

  getAllVotings(): Observable<VotingResult[]> {
    return this.http.get<VotingResult[]>(this.apiUrl);
  }

  getVotingById(id: string): Observable<VotingResult> {
    return this.http.get<VotingResult>(`${this.apiUrl}/${id}`);
  }

  getVotingStatistics(): Observable<VotingStatistics> {
    return this.http.get<VotingStatistics>(`${this.apiUrl}/statistics/summary`);
  }

  getFactionStatistics(factionName: string): Observable<FactionStats> {
    return this.http.get<FactionStats>(`${this.apiUrl}/statistics/faction/${factionName}`);
  }

  updateVotingData(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/update`, {});
  }

  getAvailableData(): Observable<AvailableData[]> {
    return this.http.get<AvailableData[]>(`${this.apiUrl}/available`);
  }
}
