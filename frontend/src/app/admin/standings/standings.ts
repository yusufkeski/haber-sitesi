import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// DİKKAT: Eğer bu satır hala hata veriyorsa, bu satırı silip VS Code'un otomatik bulmasını sağlayacağız.
import { StandingsService } from '../../services/standings'; 

@Component({
  selector: 'app-admin-standings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './standings.html', // (veya standings.component.html)
  styleUrls: ['./standings.css']   // (veya standings.component.css)
})
export class StandingsComponent implements OnInit {
  teams: any[] = [];
  isVisibleOnHome: boolean = true; 

  constructor(
    private standingsService: StandingsService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadStandings();
  }

  loadStandings() {
    this.standingsService.getStandings().subscribe({
      // BURAYA : any EKLENDİ
      next: (data: any) => { 
        this.teams = data.teams;
        this.isVisibleOnHome = data.isVisible;
      },
      // BURAYA : any EKLENDİ
      error: (err: any) => console.error(err) 
    });
  }

  toggleVisibility() {
    this.standingsService.toggleVisibility(this.isVisibleOnHome).subscribe({
      // BURAYA : any EKLENDİ
      next: (res: any) => { 
        if (this.isVisibleOnHome) {
          this.toastr.success('Puan durumu anasayfada GÖSTERİLECEK', 'Ayar Kaydedildi');
        } else {
          this.toastr.warning('Puan durumu anasayfadan GİZLENDİ', 'Ayar Kaydedildi');
        }
      },
      // BURAYA : any EKLENDİ
      error: (err: any) => this.toastr.error('Ayar kaydedilemedi', 'Hata') 
    });
  }

  saveStandings() {
    this.standingsService.updateStandings(this.teams).subscribe({
      // BURAYA : any EKLENDİ
      next: (res: any) => { 
        this.toastr.success(res.message, 'Başarılı');
        this.loadStandings(); 
      },
      // BURAYA : any EKLENDİ
      error: (err: any) => this.toastr.error('Kaydedilirken hata oluştu', 'Hata') 
    });
  }
}