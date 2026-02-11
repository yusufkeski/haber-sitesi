    import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private baseUrl = 'http://localhost:3000/api/videos';

  constructor(private http: HttpClient) { }

  getVideos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}