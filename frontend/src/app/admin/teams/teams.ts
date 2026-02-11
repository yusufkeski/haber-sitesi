import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 

// 1. DEĞİŞİKLİK: ImageCropperModule yerine ImageCropperComponent yazıyoruz
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper'; 

import { TeamService } from '../../services/team.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-teams',
  standalone: true, 
  // 2. DEĞİŞİKLİK: imports dizisine de ImageCropperComponent yazıyoruz
  imports: [CommonModule, FormsModule, ImageCropperComponent], 
  templateUrl: './teams.html',
  styleUrls: ['./teams.css']
})
export class TeamsComponent implements OnInit {
  teams: any[] = [];
  teamName: string = '';

  // Kırpma (Cropper) Değişkenleri
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedFile: File | null = null;

  constructor(
    private teamService: TeamService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (data) => this.teams = data,
      error: (err) => console.error(err)
    });
  }

  // Bilgisayardan dosya seçildiğinde tetiklenir
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  // Resim kırpıldığında tetiklenir
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 || event.objectUrl; // Ekranda önizleme için
    
    // İşin sırrı burası: Kırpılan Base64 resmi, Backend'in (multer) anlayacağı File objesine çeviriyoruz
    if (event.base64) {
      this.croppedFile = this.base64ToFile(event.base64, 'logo.png');
    } else if (event.blob) {
      this.croppedFile = new File([event.blob], 'logo.png', { type: 'image/png' });
    }
  }

  // Base64 to File dönüştürücü fonksiyon
  base64ToFile(data: string, filename: string): File {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Takımı Kaydet
  saveTeam() {
    if (!this.teamName) {
      this.toastr.warning('Lütfen takım adını girin.', 'Uyarı');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.teamName);
    
    if (this.croppedFile) {
      formData.append('logo', this.croppedFile); // Kırpılmış logoyu form datasına ekle
    }

    this.teamService.addTeam(formData).subscribe({
      next: (res) => {
        this.toastr.success(res.message, 'Başarılı');
        this.loadTeams(); // Tabloyu güncelle
        // Formu temizle
        this.teamName = '';
        this.imageChangedEvent = '';
        this.croppedImage = '';
        this.croppedFile = null;
      },
      error: (err) => this.toastr.error('Takım eklenemedi.', 'Hata')
    });
  }

  deleteTeam(id: number) {
    if (confirm('Bu takımı silmek istediğinize emin misiniz?')) {
      this.teamService.deleteTeam(id).subscribe({
        next: (res) => {
          this.toastr.success(res.message, 'Silindi');
          this.loadTeams();
        },
        error: (err) => this.toastr.error('Silme işlemi başarısız.', 'Hata')
      });
    }
  }
}