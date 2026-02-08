import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl = 'http://localhost:3000/api'; // Ana API kökü (Değiştirdik)

  constructor(private http: HttpClient) { }

  // 1. Haberleri Getir (api/news)
  getAllNews(page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/news?page=${page}`);
  }

  // 2. Tek Haber Getir (api/news/slug)
  getNewsBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/news/${slug}`);
  }

  // 3. Köşe Yazılarını Getir (api/column-posts)
  getColumnPosts(): Observable<any> {
    // BURASI DÜZELDİ: Artık /news altına değil, direkt /api altına gidiyor
    return this.http.get<any>(`${this.baseUrl}/column-posts`);
  }

  getColumnPostById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/column-posts/${id}`);
  }

  getAds(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ads`);
  }
}