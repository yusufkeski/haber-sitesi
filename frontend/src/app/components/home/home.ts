import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NewsService } from '../../services/news';
import { Observable, map, catchError, of } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  today: Date = new Date();// [cite: 432] Şimdiki zamanı yakala
// ... diğer değişkenler (latestNews, weather$ vb.) aynı kalsın [cite: 432, 434]
  latestNews: any[] = [];
  sliderNews: any[] = [];
  columnPosts: any[] = []; // YENİ: Köşe yazıları listesi
  breakingNews: string = '';
  baseUrl = 'http://localhost:3000';
  headerAd: any = null;
  sidebarAds: any[] = [];
  
  weather$!: Observable<{ temp: string, icon: string }>;

  constructor(
    private newsService: NewsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.today = new Date(); // [cite: 434] Sayfa her yüklendiğinde tarihi tazele
    this.getNews();// [cite: 434]
    this.getNews();
    this.getColumnPosts(); // YENİ: Yazıları çağır
    this.getNews();
    this.getColumnPosts();
    this.getAds();
    
    // Hava Durumu (Aynı kalıyor)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=41.1436&longitude=35.4552&current_weather=true&t=${Date.now()}`;
    this.weather$ = this.http.get(url).pipe(
      map((res: any) => {
        if (res && res.current_weather) {
          return {
            temp: Math.round(res.current_weather.temperature).toString(),
            icon: this.getWeatherIconClass(res.current_weather.weathercode)
          };
        }
        return { temp: '--', icon: 'fa-sun' };
      }),
      catchError(err => of({ temp: '!!', icon: 'fa-exclamation-triangle' }))
    );
  }

  getNews() {
    this.newsService.getAllNews().subscribe({
      next: (response) => {
        const news = response.news || [];
        this.sliderNews = news.filter((n: any) => n.is_slider);
        const breaking = news.find((n: any) => n.is_breaking);
        this.breakingNews = breaking ? breaking.title : 'Vezirköprü\'den en güncel haberler...';
        this.latestNews = news; 
      }
    });
  }

  // YENİ: Köşe Yazılarını Çeken Fonksiyon
  getColumnPosts() {
    this.newsService.getColumnPosts().subscribe({
      next: (data) => {
        this.columnPosts = data || [];
      },
      error: (err) => console.error("Köşe yazıları alınamadı:", err)
    });
  }

  getWeatherIconClass(code: number): string {
    // ... (Eski kodlar aynı)
    if (code === 0) return 'fa-sun';
    if (code >= 1 && code <= 3) return 'fa-cloud-sun';
    return 'fa-cloud';
  }

  getAds() {
    this.newsService.getAds().subscribe({
        next: (ads: any[]) => {
            // Backend'den gelen reklamları 'area'sına göre ayır
            this.headerAd = ads.find(a => a.area === 'header');
            this.sidebarAds = ads.filter(a => a.area === 'sidebar');
        }
    });
  }
}