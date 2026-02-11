import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser'; // <-- Meta EKLENDİ

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
  currentUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private meta: Meta // <-- Servis EKLENDİ
  ) {}

  ngOnInit() {
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
        
        if (this.news.content) {
             this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.news.content);
        }

        // 1. Tarayıcı Başlığını Değiştir
        this.titleService.setTitle(`${this.news.title} - NERİK HABER`);

        // 2. META ETİKETLERİNİ GÜNCELLE (WhatsApp, Google, Twitter için)
        this.updateMetaTags();

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

  // --- YENİ META FONKSİYONU ---
  updateMetaTags() {
    // Haber Özeti (Yoksa içeriğin ilk 150 karakteri)
    const description = this.news.summary || this.news.title;
    // Haber Resmi (Yoksa varsayılan site logosu)
    const image = this.news.image_path ? this.baseUrl + this.news.image_path : 'assets/logo.png';

    // Standart Meta Etiketleri
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'author', content: this.news.author_name || 'Nerik Haber' });

    // Open Graph (WhatsApp, Facebook, LinkedIn)
    this.meta.updateTag({ property: 'og:title', content: this.news.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: this.currentUrl });
    this.meta.updateTag({ property: 'og:type', content: 'article' });

    // Twitter Kartları
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: this.news.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  copyLink() {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      alert('Link kopyalandı! Arkadaşına gönderebilirsin.');
    });
  }

  shareWhatsapp() {
    const text = encodeURIComponent(`${this.news.title}\nHaberi oku: ${this.currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
}