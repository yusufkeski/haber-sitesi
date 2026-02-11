import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';
import { DashboardComponent } from './components/admin/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { NewsDetailComponent } from './components/news-detail/news-detail';
import { NewsListComponent } from './components/news-list/news-list';
import { PrivacyComponent } from './components/privacy/privacy';
import { CookiesComponent } from './components/cookies/cookies';
import { TeamsComponent } from './admin/teams/teams';
import { StandingsComponent } from './admin/standings/standings';
import { LeagueTableComponent } from './components/league-table/league-table';

export const routes: Routes = [

    { path: 'puan-durumu', component: LeagueTableComponent },
    // 1. Site açılınca direkt Anasayfaya git
    { path: '', component: HomeComponent },
    
    // 2. Sadece /login yazanlar giriş ekranına gitsin
    { path: 'login', component: LoginComponent },

    { path: 'haber/:slug', component: NewsDetailComponent },


    // 3. Dashboard sayfası için route 
    { path: 'admin', component: DashboardComponent },
    { path: 'admin/teams', component: TeamsComponent },
    { path: 'admin/standings', component: StandingsComponent },

    { path: 'admin', component: DashboardComponent, canActivate: [authGuard] },

    { path: 'category/:name', component: NewsListComponent },
    { path: 'search', component: NewsListComponent },
    { path: 'gizlilik-politikasi', component: PrivacyComponent },
    { path: 'cerez-politikasi', component: CookiesComponent },

    { path: 'yazi/:id', loadComponent: () => import('./components/column-post-detail/column-post-detail').then(m => m.ColumnPostDetailComponent) },
];