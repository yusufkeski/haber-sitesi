import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef Eklendi
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-column-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './column-post-detail.html',
  styleUrls: ['./column-post-detail.css']
})
export class ColumnPostDetailComponent implements OnInit {
  post: any = null;
  safeContent: SafeHtml = '';
  baseUrl = 'http://localhost:3000';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef // Dedektifi çağırdık
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log("🔗 İstenen Yazı ID:", id); // Konsola bas

      if (id) {
        this.loadPost(Number(id));
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPost(id: number) {
    this.loading = true;
    this.newsService.getColumnPostById(id).subscribe({
      next: (data) => {
        console.log("✅ Yazı Verisi Geldi:", data); // Veri geldi mi?
        this.post = data;
        
        if (this.post && this.post.content) {
             this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.post.content);
        }

        this.loading = false;
        this.cdr.detectChanges(); // ⚡ EKRANI ZORLA GÜNCELLE
      },
      error: (err) => {
        console.error("❌ Yazı Çekme Hatası:", err); // Hata varsa göster
        this.loading = false;
        this.cdr.detectChanges(); // ⚡ EKRANI ZORLA GÜNCELLE
      }
    });
  }
}