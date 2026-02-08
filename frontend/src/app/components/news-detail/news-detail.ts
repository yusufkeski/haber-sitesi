import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef eklendi
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-detail.html',
  styleUrls: ['./news-detail.css']
})
export class NewsDetailComponent implements OnInit {
  news: any = null;
  safeContent: SafeHtml = ''; 
  baseUrl = 'http://localhost:3000';
  loading = true; // Başlangıçta yükleniyor

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef // Dedektif iş başında
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      console.log("🔗 URL'den gelen slug:", slug); // Konsolda bunu gör
      
      if (slug) {
        this.loadNews(slug);
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadNews(slug: string) {
    this.loading = true;
    
    this.newsService.getNewsBySlug(slug).subscribe({
      next: (data) => {
        console.log("✅ Haber Sunucudan Geldi:", data);
        this.news = data;
        
        // HTML İçeriğini temizle/güvenli yap
        if (this.news.content) {
             this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.news.content);
        }

        this.loading = false; // Yükleme bitti
        this.cdr.detectChanges(); // ⚡ EKRANI ZORLA YENİLE
      },
      error: (err) => {
        console.error('❌ Haber Çekme Hatası:', err);
        this.loading = false; // Hata olsa bile yüklemeyi bitir
        this.cdr.detectChanges(); // ⚡ EKRANI ZORLA YENİLE
      }
    });
  }
}