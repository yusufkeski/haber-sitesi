import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5 fade-in">
      <div class="row justify-content-center">
        <div class="col-lg-10 bg-white p-5 rounded-4 shadow-sm border border-light-subtle">
          <h1 class="fw-bold text-dark mb-4 border-bottom pb-3">Gizlilik Politikası</h1>
          <div class="fs-6 text-secondary lh-lg">
            <p><strong>Son Güncelleme:</strong> {{ today | date:'dd.MM.yyyy' }}</p>
            <p>Nerik Dijital Medya ("Nerik Haber") olarak, ziyaretçilerimizin gizliliğine ve kişisel verilerinin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, sitemizi (nerik.com) ziyaret ettiğinizde topladığımız bilgileri ve bu bilgileri nasıl kullandığımızı açıklar.</p>
            
            <h4 class="fw-bold text-dark mt-4">1. Toplanan Bilgiler</h4>
            <p>Sitemizi ziyaret ettiğinizde, deneyiminizi iyileştirmek amacıyla tarayıcı türünüz, IP adresiniz, ziyaret ettiğiniz sayfalar ve sitede geçirdiğiniz süre gibi anonim istatistiksel veriler toplanabilir. Bu veriler sizi kişisel olarak tanımlamaz.</p>

            <h4 class="fw-bold text-dark mt-4">2. Çerezler (Cookies)</h4>
            <p>Sitemiz, kullanıcı tercihlerini hatırlamak ve site trafiğini analiz etmek için çerezler kullanmaktadır. Çerezler hakkında daha detaylı bilgi için <a href="/cerez-politikasi" class="text-primary fw-bold text-decoration-none">Çerez Politikamızı</a> inceleyebilirsiniz.</p>

            <h4 class="fw-bold text-dark mt-4">3. Üçüncü Taraf Bağlantıları</h4>
            <p>Sitemizde farklı web sitelerine bağlantılar bulunabilir. Nerik Haber, bu dış sitelerin gizlilik uygulamalarından sorumlu değildir. Başka bir siteye yönlendirildiğinizde, o sitenin gizlilik politikasını okumanızı tavsiye ederiz.</p>

            <h4 class="fw-bold text-dark mt-4">4. Bilgilerin Paylaşımı</h4>
            <p>Ziyaretçi verileri, yasal zorunluluklar (mahkeme kararları vb.) haricinde hiçbir şekilde üçüncü şahıs veya kurumlarla paylaşılmaz, satılmaz veya kiralanamaz.</p>

            <h4 class="fw-bold text-dark mt-4">5. İletişim</h4>
            <p>Gizlilik politikamız ile ilgili soru, şikayet ve görüşleriniz için sitemizde yer alan resmi sosyal medya hesaplarımız veya ihbar hattımız üzerinden bizimle iletişime geçebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent implements OnInit {
  today = new Date();
  
  ngOnInit() {
    // Sayfa açıldığında en tepeye kaydır
    window.scrollTo(0, 0);
  }
}