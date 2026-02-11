import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import Cropper from 'cropperjs';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

// Servisler
import { AuthService } from '../../../services/auth';
import { NewsService } from '../../../services/news'; 
import { DashboardService } from '../../../services/dashboard';
import { TeamService } from '../../../services/team.service';
import { StandingsService } from '../../../services/standings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, QuillModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab: string = 'overview'; 
  showForm: boolean = false;
  isEditing: boolean = false;
  currentId: number | null = null;
  currentUser: any = null;
  selectedFile: File | null = null;
  stats: any = null;
  
  baseUrl = 'http://localhost:3000'; 
  @ViewChild('imageElement') imageElement!: ElementRef;
  cropper: any; 

  galleryFiles: File[] = [];
  galleryPreview: string[] = [];

  // --- LİSTELER ---
  newsList: any[] = [];
  activeSliderNews: any[] = [];
  activeBreakingNews: any[] = [];
  candidateNews: any[] = [];
  videoList: any[] = [];
  adList: any[] = [];
  userList: any[] = [];
  columnPostList: any[] = [];
  
  // SPOR LİSTELERİ
  teamList: any[] = [];
  standingsList: any[] = [];
  standingsVisible: boolean = true;

  // --- FORM DATALARI ---
  newsData: any = {
  title: '',
  category_id: 1,
  content: '',
  image: null,
  is_slider: false,
  is_breaking: false
  };

  videoData = { title: '', url: '' };
  adData = { title: '', target_url: '', area: 'sidebar', image: null };
  userData = { username: '', password: '', full_name: '', role: 'author', image: null };
  postData = { title: '', content: '' }; 
  teamData = { name: '' }; // Yeni Takım Formu


  // 1. PASTA GRAFİK (Editör Performansı)
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };
  pieChartOptions: ChartOptions<'pie'> = { responsive: true };

  // 2. BAR GRAFİK (En Çok Okunanlar)
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Okunma Sayısı', backgroundColor: '#0d6efd' }]
  };
  barChartOptions: ChartOptions<'bar'> = { responsive: true };

  // 3. GENİŞ BAR GRAFİK (Son 7 Günde Eklenen Haberler)
  recentNewsData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ 
        data: [], 
        label: 'Okunma Sayısı', 
        backgroundColor: '#6610f2', // Mor renk olsun, diğerinden ayrılsın
        barPercentage: 0.5 // Çubuklar çok kalın olmasın
    }]
  };
  recentNewsOptions: ChartOptions<'bar'> = { 
      responsive: true,
      maintainAspectRatio: false, // Boyutlandırmayı biz kontrol edelim
      scales: {
          y: { beginAtZero: true }
      }
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    private newsService: NewsService, 
    private dashboardService: DashboardService,
    private teamService: TeamService, // Enjekte edildi
    private standingsService: StandingsService // Enjekte edildi
  ) {}

  ngOnInit() {
    document.body.classList.add('admin-body');
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    } else {
      if (this.checkPermission('news')) {
        this.activeTab = 'news';
        this.getNews();
      } else {
         this.activeTab = '';
      }
    }
  }

  // --- İSTATİSTİKLERİ ÇEK VE GRAFİĞE DÖK ---
  loadStats() {
      this.dashboardService.getStats().subscribe(res => {
          this.stats = res;

          // Pasta Grafik Verisi (Editörler)
          if(res.authorStats) {
              this.pieChartData = {
                  labels: res.authorStats.map((a: any) => a.full_name),
                  datasets: [{ data: res.authorStats.map((a: any) => a.news_count) }]
              };
          }

          // Bar Grafik Verisi (En Çok Okunanlar)
          if(res.topNews) {
              this.barChartData = {
                  labels: res.topNews.map((n: any) => n.title.substring(0, 15) + '...'), // Başlık çok uzunsa kısalt
                  datasets: [{ data: res.topNews.map((n: any) => n.view_count), label: 'Okunma', backgroundColor: '#0d6efd' }]
              };
          }

          // 3. YENİ GENİŞ BAR GRAFİK (Son 7 Gün Haberleri)
          if(res.last7Days) {
              this.recentNewsData = {
                  // Etiket olarak: "Haber Başlığı (Tarih)"
                  labels: res.last7Days.map((n: any) => `${n.title.substring(0, 20)}.. (${n.short_date})`),
                  datasets: [{
                      data: res.last7Days.map((n: any) => n.view_count),
                      label: 'Bu Haberin Okunma Sayısı',
                      backgroundColor: '#6610f2', // Mor
                      hoverBackgroundColor: '#520dc2'
                  }]
              };
          }

          
          this.cdr.detectChanges();
      });
  }

  // --- YETKİ KONTROLÜ ---
  checkPermission(section: string): boolean {
    if (!this.currentUser || !this.currentUser.permissions) return false;
    const p = this.currentUser.permissions;
    if (p.all === true) return true;
    if (['news', 'slider', 'breaking', 'videos', 'teams', 'standings'].includes(section)) return p.can_edit_news === true;
    if (section === 'ads') return p.all === true; 
    if (section === 'columnists') return p.can_post_column === true;
    if (section === 'personnel') return p.all === true;
    return false;
  }

  ngOnDestroy() { document.body.classList.remove('admin-body'); }
  onLogout() { this.authService.logout(); this.router.navigate(['/login']); }

  // --- SEKME GEÇİŞLERİ ---
  switchTab(tabName: string) {
    this.activeTab = tabName;
    this.resetForm();
    if (tabName === 'overview') this.loadStats();
    else if (tabName === 'news') this.getNews();
    else if (tabName === 'slider') this.loadSliderEditor();
    else if (tabName === 'breaking') this.loadBreakingEditor();
    else if (tabName === 'videos') this.getVideos();
    else if (tabName === 'ads') this.getAds();
    else if (tabName === 'personnel') this.getUsers();
    else if (tabName === 'columnists') this.getColumnPosts();
    else if (tabName === 'teams') this.getTeams(); // Takımlar
    else if (tabName === 'standings') this.getStandings(); // Puan Durumu
  }

  // ==========================================
  // 1. MANŞET VE SON DAKİKA YÖNETİMİ (ÖZEL)
  // ==========================================

  // Manşetleri Yükle (Sola ve Sağa Ayır)
  loadSliderEditor() {
    this.newsService.getAllNews().subscribe(res => {
        const allNews = res.news ? res.news : res;
        if(Array.isArray(allNews)) {
            // SOL TARAFA: Manşet Olanlar
            this.activeSliderNews = allNews.filter((n: any) => n.is_slider === 1 || n.is_slider === true);
            // SAĞ TARAFA: Manşet Olmayanlar
            this.candidateNews = allNews.filter((n: any) => n.is_slider === 0 || n.is_slider === false);
            this.cdr.detectChanges();
        }
    });
  }

  // Son Dakikaları Yükle (Sola ve Sağa Ayır)
  loadBreakingEditor() {
    this.newsService.getAllNews().subscribe(res => {
        const allNews = res.news ? res.news : res;
        if(Array.isArray(allNews)) {
            // SOL TARAFA: Son Dakika Olanlar
            this.activeBreakingNews = allNews.filter((n: any) => n.is_breaking === 1 || n.is_breaking === true);
            // SAĞ TARAFA: Son Dakika Olmayanlar
            this.candidateNews = allNews.filter((n: any) => n.is_breaking === 0 || n.is_breaking === false);
            this.cdr.detectChanges();
        }
    });
  }

  // Durum Değiştir (Sağa/Sola At)
  toggleStatus(news: any, field: string) {
    const newStatus = !news[field]; // Tersi yap (Varsa çıkar, yoksa ekle)

    this.newsService.toggleStatus(news.id, field, newStatus).subscribe({
      next: (res) => {
        // İşlem başarılı, listeleri yenile
        if(field === 'is_slider') this.loadSliderEditor();
        if(field === 'is_breaking') this.loadBreakingEditor();
      },
      error: (err) => {
        console.error('Hata:', err);
        alert('İşlem yapılamadı! Yetki hatası olabilir.');
      }
    });
  }

  // ==========================================
  // 2. HABER İŞLEMLERİ (GENEL)
  // ==========================================
  getNews() {
    this.http.get<any>(`${this.baseUrl}/api/news`).subscribe(res => {
        this.newsList = res.news ? res.news : res;
        this.cdr.detectChanges();
    });
  }

saveNews() {
  const formData = new FormData();

  formData.append('title', this.newsData.title);
  formData.append('content', this.newsData.content);
  formData.append('category_id', String(this.newsData.category_id));
  formData.append('is_slider', this.newsData.is_slider ? '1' : '0');
  formData.append('is_breaking', this.newsData.is_breaking ? '1' : '0');

  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  if (this.cropper) {
    this.cropper.getCroppedCanvas().toBlob((blob: any) => {
      if (blob) formData.append('image', blob, 'news.jpg');

      this.http.post<any>('http://localhost:3000/api/news', formData, { headers })
        .subscribe(res => {
          const newsId = res.insertId; // 🔥 önemli

          // GALERİ VARSA 2. İSTEĞİ AT
          if (this.galleryFiles.length > 0) {
            const galleryData = new FormData();
            this.galleryFiles.forEach(f => galleryData.append('media', f));

            this.http.post(`http://localhost:3000/api/news/${newsId}/media`, galleryData, { headers })
              .subscribe(() => {
                alert("Haber ve galeri eklendi");
                this.resetForm();
                this.getNews();
              });
          } else {
            alert("Haber eklendi");
            this.resetForm();
            this.getNews();
          }
        });
    });
  }
}

appendGalleryAndSend(formData: FormData) {
  this.galleryFiles.forEach(file => {
    formData.append('media', file);
  });

  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.http.post('http://localhost:3000/api/news', formData, { headers })
    .subscribe({
      next: (res) => {
        console.log("Haber eklendi", res);
        this.resetForm();
        this.getNews();
      },
      error: (err) => {
        console.error("HABER EKLEME HATASI", err);
        alert("Yetki hatası veya sunucu hatası var.");
      }
    });
}







  // Ortak İstek Gönderici (Haberler için)
  sendRequest(formData: FormData, headers: HttpHeaders, type: 'news') {
    if (this.isEditing && this.currentId) {
        this.http.put(`${this.baseUrl}/api/news/${this.currentId}`, formData, { headers }).subscribe({
            next: () => { alert('Güncellendi!'); this.resetForm(); this.getNews(); },
            error: () => alert("Hata oluştu")
        });
    } else {
        this.http.post(`${this.baseUrl}/api/news`, formData, { headers }).subscribe({
            next: () => { alert('Eklendi!'); this.resetForm(); this.getNews(); },
            error: () => alert("Hata oluştu")
        });
    }
  }

  editItem(item: any, type: 'news') {
    this.isEditing = true;
    this.currentId = item.id;
    this.showForm = true;
    this.newsData = { 
      title: item.title, 
      category_id: item.category_id, 
      content: item.content, 
      image: null 
    };
    if (item.image_path) {
        setTimeout(() => { if(this.imageElement) this.imageElement.nativeElement.src = this.baseUrl + item.image_path; }, 100);
    }
  }

  deleteItem(id: number, type: string) {
      if(confirm('Silinsin mi?')) {
          const token = localStorage.getItem('token');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          this.http.delete(`${this.baseUrl}/api/${type}/${id}`, { headers }).subscribe(() => {
            if(type === 'news') this.getNews();
            if(type === 'videos') this.getVideos();
            if(type === 'ads') this.getAds();
          });
      }
  }

  // ==========================================
  // 3. KÖŞE YAZISI İŞLEMLERİ
  // ==========================================
  getColumnPosts() {
      this.http.get<any>(`${this.baseUrl}/api/column-posts`).subscribe(res => {
          this.columnPostList = res;
          this.cdr.detectChanges();
      });
  }

  saveColumnPost() {
      if(!this.postData.title) return alert("Yazı başlığı girmelisiniz!");
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${this.baseUrl}/api/column-posts`, this.postData, { headers }).subscribe({
          next: () => { alert("Yazınız yayınlandı!"); this.getColumnPosts(); this.resetForm(); },
          error: (err) => alert("Hata: " + (err.error?.message || "Yetkiniz yok."))
      });
  }

  deleteColumnPost(id: number) {
      if(confirm('Silmek istiyor musunuz?')) {
          const token = localStorage.getItem('token');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          this.http.delete(`${this.baseUrl}/api/column-posts/${id}`, { headers }).subscribe({
              next: () => this.getColumnPosts(),
              error: (err) => alert(err.error?.message || "Silinemedi.")
          });
      }
  }

  // ==========================================
  // 4. PERSONEL, VİDEO, REKLAM, DİĞERLERİ
  // ==========================================
  getUsers() { this.http.get<any>(`${this.baseUrl}/api/users`).subscribe(res => this.userList = res); }
  
  saveUser() {
      if(!this.userData.username) return alert("Kullanıcı adı zorunlu!");
      if(!this.isEditing && !this.userData.password) return alert("Şifre zorunlu!");
      const fd = new FormData();
      fd.append('username', this.userData.username);
      fd.append('full_name', this.userData.full_name);
      fd.append('role', this.userData.role);
      if (this.userData.password) fd.append('password', this.userData.password);

      if(this.cropper) {
          this.cropper.getCroppedCanvas().toBlob((blob: any) => {
              if (blob) fd.append('image', blob, 'avatar.jpg');
              this.sendUserRequest(fd);
          });
      } else { this.sendUserRequest(fd); }
  }

  sendUserRequest(fd: FormData) {
      if (this.isEditing && this.currentId) {
          this.http.put(`${this.baseUrl}/api/users/${this.currentId}`, fd).subscribe({
              next: () => { alert("Personel güncellendi!"); this.getUsers(); this.resetForm(); },
              error: (err) => alert("Hata: " + err.error?.message)
          });
      } else {
          this.http.post(`${this.baseUrl}/api/users`, fd).subscribe({
              next: () => { alert("Personel eklendi!"); this.getUsers(); this.resetForm(); },
              error: (err) => alert("Hata: " + err.error?.message)
          });
      }
  }

  editUser(user: any) {
      this.isEditing = true;
      this.showForm = true;
      this.currentId = user.id;
      this.userData = { username: user.username, password: '', full_name: user.full_name, role: user.role, image: null };
      if (user.image_path) {
          setTimeout(() => { if(this.imageElement) this.imageElement.nativeElement.src = this.baseUrl + user.image_path; }, 100);
      }
  }
  deleteUser(id: number) { if(confirm('Personel silinsin mi?')) this.http.delete(`${this.baseUrl}/api/users/${id}`).subscribe(() => this.getUsers()); }

  getVideos() { this.http.get<any>(`${this.baseUrl}/api/videos`).subscribe(res => { this.videoList = res; }); }
  saveVideo() { 
      if(!this.videoData.title || !this.videoData.url) return alert("Eksik");
      this.http.post(`${this.baseUrl}/api/videos`, this.videoData).subscribe(() => { alert("Eklendi"); this.getVideos(); });
  }
  deleteVideo(id: number) { this.http.delete(`${this.baseUrl}/api/videos/${id}`).subscribe(() => this.getVideos()); }

  getAds() { this.http.get<any>(`${this.baseUrl}/api/ads`).subscribe(res => { this.adList = res; }); }
  saveAd() { 
      const input = document.getElementById('adFile') as HTMLInputElement;
      if(input.files && input.files[0]) {
          const fd = new FormData();
          fd.append('image', input.files[0]);
          fd.append('title', this.adData.title);
          fd.append('target_url', this.adData.target_url);
          fd.append('area', this.adData.area);
          this.http.post(`${this.baseUrl}/api/ads`, fd).subscribe(() => { alert("Eklendi"); this.getAds(); });
      }
  }
  deleteAd(id: number) { this.http.delete(`${this.baseUrl}/api/ads/${id}`).subscribe(() => this.getAds()); }

 // ==========================================
  // YARDIMCILAR & DİĞERLERİ (Mevcutlara Eklemeler)
  // ==========================================

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; 
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageElement.nativeElement.src = e.target.result;
        if (this.cropper) { this.cropper.destroy(); }
        // Takımlar ve Personel için 1:1, Haberler için 16:9 oran
        const ratio = (this.activeTab === 'personnel' || this.activeTab === 'teams') ? 1 : (16 / 9);
        this.cropper = new Cropper(this.imageElement.nativeElement, { aspectRatio: ratio, viewMode: 1, autoCropArea: 1 } as any);
      };
      reader.readAsDataURL(file);
    }
  }

  resetForm() {
    this.galleryFiles = [];
    this.showForm = false; 
    this.isEditing = false; 
    this.selectedFile = null;
    this.newsData = { title: '', category_id: 1, content: '', image: null };
    this.userData = { username: '', password: '', full_name: '', role: 'author', image: null };
    this.teamData = { name: '' }; // Takım formunu sıfırla
    this.postData = { title: '', content: '' };
    if(this.cropper) { this.cropper.destroy(); this.cropper = null; }
    if(this.imageElement && this.imageElement.nativeElement) this.imageElement.nativeElement.src = '';
  }

  getLast7DaysLabels(): string[] {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      dates.push(`${day}.${month}`);
    }
    return dates;
  }

  // ==========================================
  // SPOR (TAKIM VE PUAN DURUMU) İŞLEMLERİ
  // ==========================================

  getTeams() {
    this.teamService.getTeams().subscribe(res => { this.teamList = res; this.cdr.detectChanges(); });
  }

  saveTeam() {
    if (!this.teamData.name) return alert("Takım adı giriniz!");
    const formData = new FormData();
    formData.append('name', this.teamData.name);
    
    if (this.cropper) {
      this.cropper.getCroppedCanvas().toBlob((blob: any) => {
        formData.append('logo', blob, 'logo.png');
        this.teamService.addTeam(formData).subscribe(() => { alert("Takım eklendi!"); this.resetForm(); this.getTeams(); });
      });
    } else {
      this.teamService.addTeam(formData).subscribe(() => { alert("Takım eklendi!"); this.resetForm(); this.getTeams(); });
    }
  }

  deleteTeam(id: number) {
    if(confirm('Takımı silerseniz puan durumu verileri de silinir. Emin misiniz?')) {
      this.teamService.deleteTeam(id).subscribe(() => this.getTeams());
    }
  }

  getStandings() {
    this.standingsService.getStandings().subscribe((res: any) => {
      this.standingsList = res.teams;
      this.standingsVisible = res.isVisible;
      this.cdr.detectChanges();
    });
  }

  saveStandings() {
    this.standingsService.updateStandings(this.standingsList).subscribe(() => {
      alert("Puan durumu güncellendi!");
      this.getStandings();
    });
  }

  toggleStandings() {
    this.standingsService.toggleVisibility(this.standingsVisible).subscribe();
  }

  onGallerySelect(event: any) {
  this.galleryFiles = Array.from(event.target.files);
  this.galleryPreview = [];

  this.galleryFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => this.galleryPreview.push(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

  
}