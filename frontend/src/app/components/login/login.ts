import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if(!this.username || !this.password) {
      this.errorMessage = "Lütfen tüm alanları doldurun!";
      return;
    }

    const loginData = { username: this.username, password: this.password };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        alert("Giriş Başarılı: " + res.user.full_name);
        this.router.navigate(['/admin']); // Giriş yapınca anasayfaya at
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = "Kullanıcı adı veya şifre hatalı!";
      }
    });
  }
}