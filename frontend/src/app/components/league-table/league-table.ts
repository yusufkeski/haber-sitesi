import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandingsService } from '../../services/standings'; // Servis yolunu kontrol et

@Component({
  selector: 'app-league-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './league-table.html',
  styleUrls: ['./league-table.css']
})
export class LeagueTableComponent implements OnInit {
  standings: any[] = [];
  seasonName: string = '2025-2026 Sezonu'; // Bunu API'den de çekebiliriz

  constructor(private standingsService: StandingsService) { }

  ngOnInit(): void {
    this.standingsService.getStandings().subscribe({
      next: (data: any) => this.standings = data.teams,
      error: (err: any) => console.error('Veri çekilemedi', err)
    });
  }
}