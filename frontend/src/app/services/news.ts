import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- HttpHeaders Eklendi
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getAllNews(page: number = 1) {
    return this.http.get<any>(`http://localhost:3000/api/news?page=${page}`);
  }



  getNewsBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/news/${slug}`);
  }
  
  getNewsByCategory(category: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/news/category/${category}`);
  }

  searchNews(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/news/search?q=${query}`);
  }

  getColumnPosts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/column-posts`);
  }

  getColumnPostById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/column-posts/${id}`);
  }

  getAds(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ads`);
  }

  // --- İŞTE DÜZELTİLMESİ GEREKEN YER BURASI ---
  toggleStatus(id: number, field: string, status: boolean): Observable<any> {
    // 1. Token'ı kutudan çıkar
    const token = localStorage.getItem('token');
    
    // 2. Kafa kağıdını (Header) hazırla
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const payload = { field, status };
    
    // 3. İsteği gönderirken headers'ı da ekle! ({ headers })
    return this.http.put(`${this.baseUrl}/news/${id}/status`, payload, { headers });
  }

  uploadGallery(newsId: number, formData: FormData) {
    return this.http.post(`http://localhost:3000/api/news/${newsId}/media`, formData);
  }

  getSliderNews() {
    return this.http.get<any>('http://localhost:3000/api/news/slider');
  }


}