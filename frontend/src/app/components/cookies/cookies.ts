import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5 fade-in">
      <div class="row justify-content-center">
        <div class="col-lg-10 bg-white p-5 rounded-4 shadow-sm border border-light-subtle">
          <h1 class="fw-bold text-dark mb-4 border-bottom pb-3">Çerez (Cookie) Politikası</h1>
          <div class="fs-6 text-secondary lh-lg">
            <p><strong>Son Güncelleme:</strong> {{ today | date:'dd.MM.yyyy' }}</p>
            <p>Nerik Dijital Medya ("Nerik Haber") olarak, ziyaretçilerimize daha iyi bir hizmet sunabilmek, sitemizi güvenli tutmak ve site kullanımını analiz etmek amacıyla çerezler (cookies) kullanmaktayız.</p>
            
            <h4 class="fw-bold text-dark mt-4">1. Çerez Nedir?</h4>
            <p>Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla bilgisayarınıza veya mobil cihazınıza kaydedilen küçük boyutlu metin dosyalarıdır. Sitemizin cihazınızı tanımasını ve tercihlerinizi hatırlamasını sağlar.</p>

            <h4 class="fw-bold text-dark mt-4">2. Hangi Çerezleri Kullanıyoruz?</h4>
            <ul class="lh-lg">
              <li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevlerini (güvenlik, sayfa yükleme vb.) yerine getirmesi için kesinlikle gereklidir.</li>
              <li><strong>Analitik Çerezler:</strong> Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Hangi haberlerin daha çok okunduğunu analiz etmek için kullanılır. Bu veriler tamamen anonimdir.</li>
              <li><strong>Reklam Çerezleri:</strong> Size ilgi alanlarınıza uygun reklamlar (varsa) göstermek amacıyla iş ortaklarımız tarafından kullanılabilir.</li>
            </ul>

            <h4 class="fw-bold text-dark mt-4">3. Çerezleri Nasıl Yönetebilirsiniz?</h4>
            <p>Çoğu web tarayıcısı, çerezleri otomatik olarak kabul edecek şekilde ayarlanmıştır. Tarayıcı ayarlarınızı değiştirerek çerezleri dilediğiniz zaman reddedebilir veya cihazınızdan silebilirsiniz. Ancak çerezleri devre dışı bırakmanız durumunda sitemizin bazı özellikleri düzgün çalışmayabilir.</p>

            <h4 class="fw-bold text-dark mt-4">4. Değişiklikler</h4>
            <p>Bu Çerez Politikası, yasal veya operasyonel nedenlerle tarafımızca zaman zaman güncellenebilir. Politika metnindeki değişiklikleri takip etmek ziyaretçinin sorumluluğundadır.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CookiesComponent implements OnInit {
  today = new Date();
  
  ngOnInit() {
    window.scrollTo(0, 0);
  }
}