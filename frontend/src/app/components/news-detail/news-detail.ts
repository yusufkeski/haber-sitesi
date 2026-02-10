import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser'; // Title eklendi

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
  loading = true;
  currentUrl: string = ''; // Paylaşım için link

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private titleService: Title // SEO Başlığı için servis
  ) {}

  ngOnInit() {
    // Şu anki sayfa linkini al
    this.currentUrl = window.location.href;

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
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
        this.news = data;
        
        // HTML İçeriğini güvenli yap
        if (this.news.content) {
             this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.news.content);
        }

        // Tarayıcı Sekme Başlığını Değiştir (SEO)
        this.titleService.setTitle(`${this.news.title} - NERİK HABER`);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Haber Çekme Hatası:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- YENİ EKLENEN FONKSİYONLAR ---

  // Linki Kopyala
  copyLink() {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      alert('Link kopyalandı! Arkadaşına gönderebilirsin.');
    });
  }

  // WhatsApp Paylaş
  shareWhatsapp() {
    const text = encodeURIComponent(`${this.news.title}\nHaberi oku: ${this.currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
}