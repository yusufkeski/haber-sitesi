import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. ChangeDetectorRef Eklendi
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NewsService } from '../../services/news';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-list.html'
})
export class NewsListComponent implements OnInit {
  newsList: any[] = [];
  title: string = '';
  loading = true;
  baseUrl = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef // 2. Dedektifi içeri aldık
  ) {}

  ngOnInit() {
    // URL veya Parametre değişirse algıla
    this.route.url.subscribe(() => {
      this.resetAndLoad();
    });
    
    this.route.queryParams.subscribe(params => {
       if(params['q']) this.resetAndLoad();
    });
  }

  resetAndLoad() {
    this.loading = true;
    this.newsList = [];
    this.cdr.detectChanges(); // Yükleniyor ekranını hemen göster
    
    const urlSegments = this.route.snapshot.url;
    const path = urlSegments[0]?.path;

    if (path === 'category') {
        const cat = this.route.snapshot.paramMap.get('name'); // 'name' parametresini al
        if (cat) {
            this.title = `${cat} HABERLERİ`;
            this.loadCategory(cat);
        }
    } else if (path === 'search') {
        const query = this.route.snapshot.queryParamMap.get('q');
        if (query) {
            this.title = `"${query}" SONUÇLARI`;
            this.loadSearch(query);
        }
    } else {
        this.loading = false;
        this.cdr.detectChanges();
    }
  }

  loadCategory(category: string) {
    this.newsService.getNewsByCategory(category)
      .pipe(finalize(() => {
          this.loading = false; 
          this.cdr.detectChanges(); // 3. İŞLEM BİTİNCE EKRANI ZORLA GÜNCELLE
      }))
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.newsList = data.map((item: any) => ({
                ...item,
                category: item.category_name || item.category
            }));
          }
        },
        error: (err) => console.error("Kategori Hatası:", err)
      });
  }

  loadSearch(query: string) {
    this.newsService.searchNews(query)
      .pipe(finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // 4. İŞLEM BİTİNCE EKRANI ZORLA GÜNCELLE
      }))
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.newsList = data.map((item: any) => ({
                ...item,
                category: item.category_name || item.category
            }));
          }
        },
        error: (err) => console.error("Arama Hatası:", err)
      });
  }
}