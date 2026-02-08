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
  activeTab: string = 'news'; // Varsayılan sekme
  showNewsForm: boolean = false;
  isEditing: boolean = false;
  currentNewsId: number | null = null;
  
  currentUser: any = null;
  selectedFile: boolean = false;
  
  // Listeler
  newsList: any[] = [];
  activeSliderNews: any[] = [];
  candidateNews: any[] = [];
  
  baseUrl = 'http://localhost:3000'; 

  @ViewChild('imageElement') imageElement!: ElementRef;
  cropper: any; 

  newsData = {
    title: '',
    category: 'GÜNDEM',
    content: '',
    image: null
  };

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
      this.getNews();
    }
  }

  ngOnDestroy() {
    document.body.classList.remove('admin-body');
  }

  // --- SEKME YÖNETİMİ ---
  switchTab(tabName: string) {
    this.activeTab = tabName;
    if (tabName === 'news') {
        this.getNews(); 
    } else if (tabName === 'slider') {
        this.loadSliderEditor();
    }
  }

  // --- HABERLERİ ÇEK ---
  getNews() {
    this.http.get<any>('http://localhost:3000/api/news').subscribe({
        next: (response) => {
            this.newsList = response.news || (Array.isArray(response) ? response : []);
            this.cdr.detectChanges();
        }
    });
  }

  // --- MANŞET EDİTÖRÜNÜ YÜKLE ---
  loadSliderEditor() {
    // 1. Yayındaki Manşetleri Çek
    this.http.get<any>('http://localhost:3000/api/news?type=slider').subscribe(res => {
        this.activeSliderNews = res.news || [];
        this.cdr.detectChanges();
    });

    // 2. Aday Haberleri Çek (Son 50 haber arasından manşet olmayanlar)
    this.http.get<any>('http://localhost:3000/api/news?limit=50').subscribe(res => {
        const all = res.news || [];
        // Zaten manşet olanları listeden çıkar
        this.candidateNews = all.filter((n: any) => n.is_slider === 0);
        this.cdr.detectChanges();
    });
  }

  // --- MANŞET DURUMUNU DEĞİŞTİR ---
  toggleNewsStatus(id: number, type: 'is_slider' | 'is_breaking', status: boolean) {
    const value = status ? 1 : 0;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.patch(`http://localhost:3000/api/news/${id}/toggle`, { field: type, value: value }, { headers }).subscribe({
        next: () => {
            if (this.activeTab === 'slider') this.loadSliderEditor();
            else this.getNews();
        },
        error: (err) => alert("İşlem başarısız.")
    });
  }

  // --- HABER EKLEME / GÜNCELLEME İŞLEMLERİ ---
  editNews(news: any) {
    this.isEditing = true;
    this.currentNewsId = news.id;
    this.showNewsForm = true;
    this.newsData = {
      title: news.title,
      category: news.category_name || 'GÜNDEM',
      content: news.content,
      image: null
    };
    if (news.image_path) {
        setTimeout(() => {
            this.imageElement.nativeElement.src = this.baseUrl + news.image_path;
        }, 100);
    }
  }

  resetForm() {
    this.showNewsForm = false;
    this.isEditing = false;
    this.currentNewsId = null;
    this.newsData = { title: '', category: 'GÜNDEM', content: '', image: null };
    this.selectedFile = false;
    if (this.cropper) { this.cropper.destroy(); this.cropper = null; }
    this.imageElement.nativeElement.src = '';
  }

  saveNews() {
     if (!this.newsData.title) { alert("Başlık giriniz!"); return; }
     if (!this.isEditing && !this.cropper) { alert("Resim seçiniz!"); return; }

     const formData = new FormData();
     formData.append('title', this.newsData.title);
     formData.append('content', this.newsData.content);
     formData.append('category', this.newsData.category);
     formData.append('is_breaking', '0');
     formData.append('is_slider', '1');

     const token = localStorage.getItem('token');
     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

     if (this.cropper) {
        this.cropper.getCroppedCanvas().toBlob((blob: any) => {
            if (blob) {
                formData.append('image', blob, 'news-image.jpg');
                this.sendRequest(formData, headers);
            }
        }, 'image/jpeg', 0.8);
     } else {
        this.sendRequest(formData, headers);
     }
  }

  sendRequest(formData: FormData, headers: HttpHeaders) {
    if (this.isEditing && this.currentNewsId) {
        this.http.put(`http://localhost:3000/api/news/${this.currentNewsId}`, formData, { headers }).subscribe({
            next: () => { alert('Haber güncellendi!'); this.resetForm(); this.getNews(); },
            error: (err) => alert("Hata: " + err.message)
        });
    } else {
        this.http.post('http://localhost:3000/api/news', formData, { headers }).subscribe({
            next: () => { alert('Haber eklendi!'); this.resetForm(); this.getNews(); },
            error: (err) => alert("Hata: " + err.message)
        });
    }
  }

  deleteNews(id: number) {
      if(confirm('Silmek istediğine emin misin?')) {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.delete(`http://localhost:3000/api/news/${id}`, { headers }).subscribe({
            next: () => { alert("Silindi."); this.getNews(); },
            error: (err) => alert("Hata.")
        });
      }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageElement.nativeElement.src = e.target.result;
        if (this.cropper) { this.cropper.destroy(); }
        this.cropper = new Cropper(this.imageElement.nativeElement, { aspectRatio: 16/9, viewMode: 1, autoCropArea: 1 } as any);
      };
      reader.readAsDataURL(file);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}