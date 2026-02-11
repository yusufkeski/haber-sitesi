import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private baseUrl = 'http://localhost:3000/api/poll';

  constructor(private http: HttpClient) { }

  getPolls(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  vote(optionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/vote`, { optionId });
  }
}