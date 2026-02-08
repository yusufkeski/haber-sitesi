import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // AsyncPipe bunun içinde
import { HttpClient } from '@angular/common/http';
import { NewsService } from '../../services/news';
import { Observable, map, catchError, of } from 'rxjs'; // Gerekli kütüphaneler
import { RouterModule } from '@angular/router'; // RouterLink için

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  latestNews: any[] = [];
  sliderNews: any[] = [];
  breakingNews: string = '';
  baseUrl = 'http://localhost:3000';
  
  // HTML'in beklediği "weather$" yayını burada tanımlıyoruz!
  weather$!: Observable<{ temp: string, icon: string }>;

  constructor(
    private newsService: NewsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getNews();
    
    // URL (Cache sorunu olmasın diye sonuna zaman ekliyoruz)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=41.1436&longitude=35.4552&current_weather=true&t=${Date.now()}`;

    // Yayını başlatıyoruz
    this.weather$ = this.http.get(url).pipe(
      map((res: any) => {
        // Veri geldiğinde işle
        if (res && res.current_weather) {
          return {
            temp: Math.round(res.current_weather.temperature).toString(),
            icon: this.getWeatherIconClass(res.current_weather.weathercode)
          };
        }
        return { temp: '--', icon: 'fa-sun' }; // Boş gelirse
      }),
      catchError(err => {
        console.error('Hava durumu hatası:', err);
        return of({ temp: '!!', icon: 'fa-exclamation-triangle' }); // Hata olursa
      })
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
      },
      error: (err) => console.error(err)
    });
  }

  getWeatherIconClass(code: number): string {
    if (code === 0) return 'fa-sun';
    if (code >= 1 && code <= 3) return 'fa-cloud-sun';
    if (code >= 45 && code <= 48) return 'fa-smog';
    if (code >= 51 && code <= 67) return 'fa-cloud-rain';
    if (code >= 71 && code <= 77) return 'fa-snowflake';
    if (code >= 80 && code <= 82) return 'fa-cloud-showers-heavy';
    if (code >= 95) return 'fa-bolt';
    return 'fa-cloud';
  }
}