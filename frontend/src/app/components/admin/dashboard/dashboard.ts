import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import Cropper from 'cropperjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, QuillModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab: string = 'news'; 
  showForm: boolean = false;
  isEditing: boolean = false;
  currentId: number | null = null;
  currentUser: any = null;
  selectedFile: boolean = false;
  
  baseUrl = 'http://localhost:3000'; 
  @ViewChild('imageElement') imageElement!: ElementRef;
  cropper: any; 

  // --- LİSTELER ---
  newsList: any[] = [];
  activeSliderNews: any[] = [];
  activeBreakingNews: any[] = [];
  videoList: any[] = [];
  adList: any[] = [];
  userList: any[] = []; // Personel Listesi
  columnPostList: any[] = []; // Köşe Yazıları Listesi
  candidateNews: any[] = []; 

  // --- FORM DATALARI ---
  newsData = { title: '', category: 'GÜNDEM', content: '', image: null };
  videoData = { title: '', url: '' };
  adData = { title: '', target_url: '', area: 'sidebar', image: null };
  userData = { username: '', password: '', full_name: '', role: 'author', image: null };
  
  // GÜNCELLENDİ: Artık user_id yok, backend token'dan alacak
  postData = { title: '', content: '' }; 

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    document.body.classList.add('admin-body');
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    } else {
      // --- YENİ: GİRİŞ YAPANIN YETKİSİNE GÖRE İLK SEKMEYİ BELİRLE ---
      if (this.checkPermission('news')) {
        this.activeTab = 'news';
        this.getNews();
      } else if (this.checkPermission('columnists')) {
        this.activeTab = 'columnists';
        this.getColumnPosts();
      } else {
         // Hiçbir yetkisi yoksa (Düşük ihtimal ama)
         this.activeTab = '';
      }
    }
  }

  // --- YENİ: YETKİ KONTROL MERKEZİ ---
  checkPermission(section: string): boolean {
    if (!this.currentUser || !this.currentUser.permissions) return false;
    
    const p = this.currentUser.permissions;

    // 1. ADMIN HER YERE GİRER
    if (p.all === true) return true;

    // 2. BÖLÜM BAZLI KONTROLLER
    if (section === 'news' || section === 'slider' || section === 'breaking' || section === 'videos') {
        // Editörler ve Adminler haberleri yönetir
        return p.can_edit_news === true;
    }

    if (section === 'ads') {
        // Reklamları SADECE Admin yönetsin (İstersen editöre de açabilirsin)
        return p.all === true; 
    }

    if (section === 'columnists') {
        // Yazarlar ve Adminler köşe yazısı yazar
        return p.can_post_column === true;
    }

    if (section === 'personnel') return p.all === true; // Sadece Admin

    return false;
  }

  ngOnDestroy() { document.body.classList.remove('admin-body'); }
  onLogout() { this.authService.logout(); this.router.navigate(['/login']); }

  // --- SEKME GEÇİŞLERİ ---
  switchTab(tabName: string) {
    this.activeTab = tabName;
    this.resetForm();
    if (tabName === 'news') this.getNews();
    else if (tabName === 'slider') this.loadSliderEditor();
    else if (tabName === 'breaking') this.loadBreakingEditor();
    else if (tabName === 'videos') this.getVideos();
    else if (tabName === 'ads') this.getAds();
    else if (tabName === 'personnel') this.getUsers();
    else if (tabName === 'columnists') this.getColumnPosts(); // Sadece yazıları çekiyoruz
    else if (tabName === 'personnel') this.getUsers();
  }

  // --- 1. HABER İŞLEMLERİ ---
  getNews() {
    this.http.get<any>(`${this.baseUrl}/api/news`).subscribe(res => {
        this.newsList = res.news || [];
        this.cdr.detectChanges();
    });
  }

  saveNews() {
     if (!this.newsData.title) { alert("Başlık giriniz!"); return; }
     if (!this.isEditing && !this.cropper) { alert("Resim seçiniz!"); return; }

     const formData = new FormData();
     formData.append('title', this.newsData.title);
     formData.append('content', this.newsData.content);
     formData.append('category', this.newsData.category);
     const token = localStorage.getItem('token');
     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

     if (this.cropper) {
        this.cropper.getCroppedCanvas().toBlob((blob: any) => {
            if (blob) {
                formData.append('image', blob, 'news-image.jpg');
                this.sendRequest(formData, headers, 'news');
            }
        }, 'image/jpeg', 0.8);
     } else { this.sendRequest(formData, headers, 'news'); }
  }

  // --- 2. KÖŞE YAZISI İŞLEMLERİ (GÜNCELLENDİ) ---
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

      // Backend'e sadece başlık ve içerik gönderiyoruz.
      // Backend, 'Authorization' başlığındaki token'ı çözüp Yazarın Kim Olduğunu bulacak.
      this.http.post(`${this.baseUrl}/api/column-posts`, this.postData, { headers }).subscribe({
          next: () => {
              alert("Yazınız başarıyla yayınlandı!"); 
              this.getColumnPosts(); 
              this.resetForm();
          },
          error: (err) => {
              console.error(err);
              alert("Hata: " + (err.error?.message || "Yetkiniz olmayabilir."));
          }
      });
  }

  deleteColumnPost(id: number) {
      if(confirm('Bu yazıyı silmek istediğine emin misin?')) {
          const token = localStorage.getItem('token');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          
          this.http.delete(`${this.baseUrl}/api/column-posts/${id}`, { headers }).subscribe({
              next: () => this.getColumnPosts(),
              error: (err) => alert(err.error?.message || "Silinemedi.")
          });
      }
  }

  // --- 3. PERSONEL YÖNETİMİ ---
  getUsers() {
      this.http.get<any>(`${this.baseUrl}/api/users`).subscribe(res => this.userList = res);
  }

  // MEVCUT saveUser YERİNE BUNU YAPIŞTIR:
  saveUser() {
      if(!this.userData.username) return alert("Kullanıcı adı zorunlu!");
      // Şifre kontrolü: Yeni eklerken zorunlu, düzenlerken boş bırakılabilir
      if(!this.isEditing && !this.userData.password) return alert("Şifre zorunlu!");

      const fd = new FormData();
      fd.append('username', this.userData.username);
      fd.append('full_name', this.userData.full_name);
      fd.append('role', this.userData.role);
      
      // Şifre alanı doluysa gönder (Editörken boş bırakırsa değişmez)
      if (this.userData.password) {
          fd.append('password', this.userData.password);
      }

      if(this.cropper) {
          this.cropper.getCroppedCanvas().toBlob((blob: any) => {
              if (blob) fd.append('image', blob, 'avatar.jpg');
              this.sendUserRequest(fd);
          });
      } else {
          this.sendUserRequest(fd);
      }
  }

  sendUserRequest(fd: FormData) {
      if (this.isEditing && this.currentId) {
          // GÜNCELLEME (PUT)
          this.http.put(`${this.baseUrl}/api/users/${this.currentId}`, fd).subscribe({
              next: () => { alert("Personel güncellendi!"); this.getUsers(); this.resetForm(); },
              error: (err) => alert("Hata: " + err.error?.message)
          });
      } else {
          // EKLEME (POST)
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
      // Formu doldur (Şifreyi boş bırakıyoruz, isterse yazar)
      this.userData = { 
          username: user.username, 
          password: '', 
          full_name: user.full_name, 
          role: user.role, 
          image: null 
      };
      
      if (user.image_path) {
          setTimeout(() => { 
              if(this.imageElement) this.imageElement.nativeElement.src = this.baseUrl + user.image_path; 
          }, 100);
      }
  }

  deleteUser(id: number) {
      if(confirm('Personel silinsin mi?')) this.http.delete(`${this.baseUrl}/api/users/${id}`).subscribe(() => this.getUsers());
  }

  // --- ORTAK İSTEK GÖNDERİCİ (Haberler için) ---
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

  // --- DİĞER FONKSİYONLAR ---
  editItem(item: any, type: 'news') {
    this.isEditing = true;
    this.currentId = item.id;
    this.showForm = true;
    this.newsData = { title: item.title, category: item.category_name, content: item.content, image: null };
    
    if (item.image_path) {
        setTimeout(() => { this.imageElement.nativeElement.src = this.baseUrl + item.image_path; }, 100);
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

  resetForm() {
    this.showForm = false; 
    this.isEditing = false; 
    this.selectedFile = false;
    this.newsData = { title: '', category: 'GÜNDEM', content: '', image: null };
    // YENİ: bio yok
    this.userData = { username: '', password: '', full_name: '', role: 'author', image: null };
    this.postData = { title: '', content: '' };
    if(this.cropper) { this.cropper.destroy(); this.cropper = null; }
    if(this.imageElement) this.imageElement.nativeElement.src = '';
  }

  // --- RESİM SEÇME (CROPPER) ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageElement.nativeElement.src = e.target.result;
        if (this.cropper) { this.cropper.destroy(); }
        
        // Personel için kare (1:1), Haber için 16:9
        const ratio = (this.activeTab === 'personnel') ? 1 : (16 / 9);

        this.cropper = new Cropper(this.imageElement.nativeElement, { 
            aspectRatio: ratio, 
            viewMode: 1, 
            autoCropArea: 1 
        } as any);
      };
      reader.readAsDataURL(file);
    }
  }

  // --- DİĞERLERİ (MANŞET, VİDEO, REKLAM) ---
  loadSliderEditor() {
    this.http.get<any>(`${this.baseUrl}/api/news?type=slider`).subscribe(res => { this.activeSliderNews = res.news || []; });
    this.loadCandidates('is_slider');
  }
  loadBreakingEditor() {
    this.http.get<any>(`${this.baseUrl}/api/news?type=breaking`).subscribe(res => { this.activeBreakingNews = res.news || []; });
    this.loadCandidates('is_breaking');
  }
  loadCandidates(excludeType: string) {
    this.http.get<any>(`${this.baseUrl}/api/news?limit=50`).subscribe(res => {
        const all = res.news || [];
        this.candidateNews = all.filter((n: any) => n[excludeType] === 0);
        this.cdr.detectChanges();
    });
  }
  toggleNewsStatus(id: number, type: 'is_slider' | 'is_breaking', status: boolean) {
    const value = status ? 1 : 0;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.patch(`${this.baseUrl}/api/news/${id}/toggle`, { field: type, value }, { headers }).subscribe({
        next: () => {
            if (this.activeTab === 'slider') this.loadSliderEditor();
            else if (this.activeTab === 'breaking') this.loadBreakingEditor();
        }
    });
  }
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
}