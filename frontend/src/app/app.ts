import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './app.html', // <-- DİKKAT: 'app.component.html' DEĞİL
  styleUrls: ['./app.css']   // <-- DİKKAT: 'app.component.css' DEĞİL
})
export class AppComponent implements OnInit {
  today: Date = new Date();
  weather$!: Observable<{ temp: string, icon: string }>;
  isAdminPage: boolean = false;
  isLoginPage: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.isAdminPage = url.includes('/admin');
        this.isLoginPage = url.includes('/login');
        window.scrollTo(0, 0);
      }
    });

    this.today = new Date();
    // Hava durumu API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=41.1436&longitude=35.4552&current_weather=true&t=${Date.now()}`;
    
    this.weather$ = this.http.get(weatherUrl).pipe(
      map((res: any) => {
        if (res && res.current_weather) {
          return {
            temp: Math.round(res.current_weather.temperature).toString(),
            icon: this.getWeatherIconClass(res.current_weather.weathercode)
          };
        }
        return { temp: '--', icon: 'fa-sun' };
      }),
      catchError((err) => {
        console.error('Hava durumu hatası:', err);
        return of({ temp: '!!', icon: 'fa-exclamation-triangle' });
      })
    );
  }

  getWeatherIconClass(code: number): string {
    if (code === 0) return 'fa-sun';
    if (code >= 1 && code <= 3) return 'fa-cloud-sun';
    if (code >= 45 && code <= 48) return 'fa-smog';
    if (code >= 51 && code <= 67) return 'fa-cloud-rain';
    if (code >= 71 && code <= 86) return 'fa-snowflake';
    if (code >= 95) return 'fa-bolt';
    return 'fa-cloud';
  }

  onSearch(query: string) {
    if (query && query.trim().length > 0) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }
}