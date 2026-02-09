import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NewsService } from '../../services/news';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Değişkenler
  today: Date = new Date();
  latestNews: any[] = [];
  sliderNews: any[] = [];
  columnPosts: any[] = [];
  breakingNews: string = '';
  baseUrl = 'http://localhost:3000';
  headerAd: any = null;
  sidebarAds: any[] = [];
  
  // SLIDER İÇİN YENİ DEĞİŞKENLER
  currentSlideIndex: number = 0;
  autoSlideInterval: any;

  weather$!: Observable<{ temp: string, icon: string }>;
  private routerSubscription!: Subscription;

  constructor(
    private newsService: NewsService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllData();

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/' || event.url === '/home') {
           this.loadAllData();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.stopAutoSlide(); // Sayfadan çıkınca dönmeyi durdur
  }

  loadAllData() {
    this.today = new Date();
    this.getNews();
    this.getColumnPosts();
    this.getAds();
  }

  getNews() {
    this.newsService.getAllNews().subscribe({
      next: (data: any) => {
        const newsArray = data.news ? data.news : data;
        
        if (Array.isArray(newsArray)) {
          this.latestNews = newsArray;
          
          // Slider Haberleri
          this.sliderNews = newsArray.filter((n: any) => n.is_slider);
          
          // Slider geldiyse otomatik döndürmeyi başlat
          if (this.sliderNews.length > 0) {
            this.startAutoSlide();
          }

          // Son Dakika
          const breaking = newsArray.filter((n: any) => n.is_breaking);
          this.breakingNews = breaking.map((n: any) => n.title).join(' • ');
        }
      },
      error: (err) => console.error("Haber çekme hatası:", err)
    });
  }

  getColumnPosts() {
    this.newsService.getColumnPosts().subscribe(data => {
      this.columnPosts = data;
    });
  }

  getAds() {
    this.newsService.getAds().subscribe((ads: any[]) => {
      this.headerAd = ads.find(a => a.area === 'header');
      this.sidebarAds = ads.filter(a => a.area === 'sidebar');
    });
  }

  // --- SLIDER FONKSİYONLARI ---

  // Sonraki Slayt
  nextSlide() {
    if (this.sliderNews.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.sliderNews.length;
    }
  }

  // Önceki Slayt
  prevSlide() {
    if (this.sliderNews.length > 0) {
      this.currentSlideIndex = (this.currentSlideIndex - 1 + this.sliderNews.length) % this.sliderNews.length;
    }
  }

  // Belirli Slayta Git (Noktalara basınca)
  goToSlide(index: number) {
    this.currentSlideIndex = index;
    this.stopAutoSlide(); // Kullanıcı müdahale ettiyse durdur
    this.startAutoSlide(); // Sonra tekrar başlat
  }

  // Otomatik Dönmeyi Başlat
  startAutoSlide() {
    this.stopAutoSlide(); // Çakışma olmasın diye önce temizle
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5 Saniyede bir döner
  }

  // Otomatik Dönmeyi Durdur (Mouse üzerine gelince vb.)
  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
}