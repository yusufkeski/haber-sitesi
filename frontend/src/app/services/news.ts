import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://localhost:3000/api/news'; // Backend adresi

  constructor(private http: HttpClient) { }

  // Tüm haberleri getirir
  getAllNews(page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`);
  }

  // Tek bir haberin detayını getirir (İleride lazım olacak)
  getNewsBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${slug}`);
  }
}