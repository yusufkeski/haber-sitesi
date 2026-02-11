import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NewsService } from '../../services/news';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { PollService } from '../../services/poll.service';
import { VideoService } from '../../services/video.service';
import { StandingsService } from '../../services/standings';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Değişkenler
  standingsData: any = { isVisible: false, teams: [] };
  today: Date = new Date();
  latestNews: any[] = [];
  sliderNews: any[] = [];
  columnPosts: any[] = [];
  breakingNews: string = '';
  baseUrl = 'http://localhost:3000';
  headerAd: any = null;
  sidebarAds: any[] = [];

  currentPage = 1;
  totalNews = 0;
  limit = 10;
  totalPages = 0;

  // Anket Değişkenleri
  polls: any[] = [];
  hasVoted: boolean = false;
  totalVotes: number = 0;

  // Video Değişkenleri
  videos: any[] = [];
  
  // Slider Değişkenleri
  currentSlideIndex: number = 0;
  autoSlideInterval: any;

  weather$!: Observable<{ temp: string, icon: string }>;
  private routerSubscription!: Subscription;

  constructor(
    private standingsService: StandingsService,
    private newsService: NewsService,
    private http: HttpClient,
    private router: Router,
    private pollService: PollService,
    private videoService: VideoService,
    private toastr: ToastrService,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadAllData();
    this.getStandings();
    this.loadNews();
    this.loadSliderNews();

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/' || event.url === '/home') {
           this.loadAllData();
        }
      }
    });

    this.checkLocalVote();
    this.loadPolls();
    this.loadVideos();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.stopAutoSlide(); // Sayfadan çıkınca dönmeyi durdur
  }

  loadAllData() {
    this.today = new Date();
    this.getColumnPosts();
    this.getAds();
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

  // --- ANKET FONKSİYONLARI ---
  checkLocalVote() {
    // Tarayıcı bazlı güvenlik: Daha önce oy kullandıysa formu kapat
    if (localStorage.getItem('hasVoted')) {
      this.hasVoted = true;
    }
  }

  loadPolls() {
    this.pollService.getPolls().subscribe({
      next: (data) => {
        this.polls = data;
        this.calculateTotalVotes();
      },
      error: (err) => console.error('Anketler yüklenemedi', err)
    });
  }

  calculateTotalVotes() {
    this.totalVotes = this.polls.reduce((acc, poll) => acc + poll.vote_count, 0);
  }

  getPercentage(voteCount: number): number {
    if (this.totalVotes === 0) return 0;
    return Math.round((voteCount / this.totalVotes) * 100);
  }

  submitVote(optionId: number) {
    if (this.hasVoted) {
      this.toastr.warning('Zaten oy kullandınız!', 'Uyarı');
      return;
    }

    this.pollService.vote(optionId).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, 'Başarılı');
        localStorage.setItem('hasVoted', 'true');
        this.hasVoted = true;
        this.loadPolls(); // Oranları güncelle
      },
      error: (err) => {
        if (err.status === 403) {
          this.toastr.warning('Bu ağdan daha önce oy kullanılmış.', 'Uyarı');
          localStorage.setItem('hasVoted', 'true'); // Backend yakaladıysa frontend'i de kilitle
          this.hasVoted = true;
        } else {
          this.toastr.error('Bir hata oluştu.', 'Hata');
        }
      }
    });
  }

  // --- VİDEO GALERİ FONKSİYONLARI ---
  loadVideos() {
    this.videoService.getVideos().subscribe({
      next: (data) => {
        // En son eklenen 3 videoyu anasayfada göster
        this.videos = data.slice(0, 3); 
      },
      error: (err) => console.error('Videolar yüklenemedi', err)
    });
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getStandings() {
    this.standingsService.getStandings().subscribe({
      next: (data: any) => {
        this.standingsData = data;
      },
      error: (err: any) => console.error('Puan durumu yüklenemedi', err)
    });
  }

  loadNews(page: number = 1) {
    this.currentPage = page;

    this.newsService.getAllNews(page).subscribe(res => {
      this.latestNews = res.news;
      this.totalNews = res.total;
      this.totalPages = res.totalPages;  // 🔥 Artık backend'den geliyor

      const breaking = this.latestNews.filter((n: any) => n.is_breaking);
      this.breakingNews = breaking.map((n: any) => n.title).join(' • ');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  
  loadSliderNews() {
      this.newsService.getSliderNews().subscribe(data => {
        this.sliderNews = data;
        if (this.sliderNews.length) this.startAutoSlide();
      });
  }

  get visiblePages(): number[] {
  const pages: number[] = [];
  const maxVisible = 5;

  let start = Math.max(this.currentPage - 2, 1);
  let end = Math.min(start + maxVisible - 1, this.totalPages);

  if (end - start < maxVisible - 1) {
    start = Math.max(end - maxVisible + 1, 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
    
  return pages;
  }


}