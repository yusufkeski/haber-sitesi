import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Bu satır olmazsa "No suitable injection token" hatası alırsın
})
export class StandingsService {
  private baseUrl = 'http://localhost:3000/api/standings';

  constructor(private http: HttpClient) { }

  getStandings(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  toggleVisibility(isVisible: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/toggle`, { isVisible });
  }

  updateStandings(teamsData: any[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, teamsData);
  }
}