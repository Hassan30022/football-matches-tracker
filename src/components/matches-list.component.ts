import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FootballService, Match, MatchStatus, Team } from '../services/football.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="matches-container">
      <div class="matches-header">
        <h3 class="section-title">
          <i class="icon">📅</i>
          Matches Schedule
        </h3>
        <div class="timezone-info">
          <i class="timezone-icon">🌍</i>
          <span class="timezone-text">{{ currentTimezone }}</span>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading matches...</p>
      </div>

      <div *ngIf="!loading && matches.length === 0 && selectedTeams.length > 0" class="empty-matches">
        <div class="empty-icon">📅</div>
        <p class="empty-text">No upcoming matches found</p>
        <p class="empty-subtext">Check back later for fixture updates</p>
      </div>

      <div *ngIf="!loading && selectedTeams.length === 0" class="no-teams-state">
        <div class="empty-icon">⚽</div>
        <p class="empty-text">Select clubs to see their matches</p>
        <p class="empty-subtext">Add your favorite clubs above to track their upcoming fixtures</p>
      </div>

      <div class="matches-list" *ngIf="!loading && matches.length > 0">
        <div 
          *ngFor="let match of matches; trackBy: trackByMatchId"
          class="match-card animate-slide-in hover-lift">
          <div class="match-header">
            <span class="competition-name">{{ match.competition.name }}</span>
            <span class="match-date" *ngIf="match.status != matchStatus.FirstHalf && match.status != matchStatus.HalfTime && match.status != matchStatus.SecondHalf">{{ formatDate(match.utcDate) }}</span>
            <span class="match-live" *ngIf="match.status == matchStatus.FirstHalf || match.status == matchStatus.HalfTime || match.status == matchStatus.SecondHalf">🔴Live</span>
          </div>
          
          <div class="match-teams">
            <div class="team home-team">
              <img class="crest" [src]="match.homeTeam.crest" [alt]="match.homeTeam.name">
              <span class="team-name">{{ match.homeTeam.name }}</span>
              <span class="team-short">(Home)</span>
            </div>
            
            <div class="vs-separator">
              <span class="vs-score" *ngIf="match.status != matchStatus.NotStarted">{{match.homeTeam.homeScore??0}} - {{match.awayTeam.awayScore}}</span>
              <span class="vs-text">VS</span>
            </div>
            
            <div class="team away-team">
              <img class="crest-away" [src]="match.awayTeam.crest" [alt]="match.awayTeam.name">
              <span class="team-name">{{ match.awayTeam.name }}</span>
              <span class="team-short">(Away)</span>
            </div>
          </div>
          <div class="live-bar" *ngIf="match.status == matchStatus.FirstHalf || match.status == matchStatus.HalfTime || match.status == matchStatus.SecondHalf"></div>
          <div class="match-time">
            <i class="time-icon" *ngIf="match.status == matchStatus.NotStarted">⏰</i>
            <span>{{ match.status == matchStatus.NotStarted ? formatTime(match.utcDate) : 
                     match.status == matchStatus.FirstHalf ? '1st Half' : 
                     match.status == matchStatus.HalfTime ? 'Half Time' : 
                     match.status == matchStatus.SecondHalf ? '2nd Half' : 'Final' }}</span>
          </div>
          <div class="match-time">
            <i class="time-icon">🏟️</i>
            <span>{{ match.venue }}</span>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`

    .live-bar {
      position: relative;
      width: 80px;      
      height: 4px;
      background: transparent; 
      overflow: hidden;
      border-radius: 2px;
      margin: 0px;
      justify-self: center;
    }

    .live-bar::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 20px;              
      height: 100%;
      background: #2c6def;
      border-radius: 2px;
      animation: slideDash 1.5s ease-in-out infinite alternate;
    }

    @keyframes slideDash {
      from {
        left: 0;
      }
      to {
        left: 60px;  
      }
    }
    .matches-container {
      margin-top: 2rem;
    }

    .matches-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #f3f4f6;
    }

    .icon {
      font-size: 1.3rem;
    }

    .timezone-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(59, 130, 246, 0.1);
      color: #60a5fa;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(59, 130, 246, 0.2);
      font-size: 0.9rem;
    }

    .timezone-icon {
      font-size: 1rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      color: #9ca3af;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(59, 130, 246, 0.1);
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-matches, .no-teams-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #9ca3af;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #d1d5db;
    }

    .crest{
      width: 40px;
      height: 40px;
    }

    .crest-away{
      width: 40px;
      height: 40px;
      align-self: end;
    }

    .empty-subtext {
      font-size: 0.9rem;
      line-height: 1.5;
      max-width: 300px;
      margin: 0 auto;
    }

    .matches-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .match-card {
      background: rgba(45, 45, 45, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .match-card:hover {
      border-color: #3b82f6;
      background: rgba(45, 45, 45, 1);
    }

    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .competition-name {
      font-weight: 600;
      color: #60a5fa;
      font-size: 0.9rem;
    }

    .match-date {
      font-size: 0.9rem;
      color: #9ca3af;
    }

    .match-live {
          color: #c8354b;
    font-weight: 700;
    font-size: 16px;
    font-style: italic;
    }

    .match-teams {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 1rem;
      margin-bottom: 4px;
    }

    .team {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .home-team {
      text-align: left;
    }

    .away-team {
      text-align: right;
    }

    .team-name {
      font-weight: 600;
      color: #f3f4f6;
      font-size: 1rem;
    }

    .team-short {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .vs-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;
    }

    .vs-text {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: bold;
      font-size: 0.8rem;
    }

    .vs-score {
      font-size: 24px;
      font-weight: 600;
    }

    .match-time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #d1d5db;
      font-size: 0.95rem;
      justify-content: center;
    }

    .time-icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .matches-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .section-title {
        font-size: 1.1rem;
      }

      .timezone-info {
        font-size: 0.8rem;
        padding: 0.375rem 0.75rem;
      }

      .match-card {
        padding: 1.25rem;
      }

      .match-teams {
        grid-template-columns: 1fr;
        gap: 1rem;
        text-align: center;
      }

      .home-team, .away-team {
        text-align: center;
      }

      .vs-separator {
        order: 2;
      }

      .away-team {
        order: 3;
      }
    }
  `]
})
export class MatchesListComponent implements OnInit, OnDestroy {
  @Input() selectedTeams: Team[] = [];

  matches: any[] = [];
  loading = false;
  currentTimezone = '';
  private refreshSubscription?: Subscription;
  matchStatus = MatchStatus;

  constructor(private footballService: FootballService) { }

  ngOnInit() {
    this.currentTimezone = this.getCurrentTimezone();
    this.loadMatches();

    // Refresh matches every 5 minutes
    this.refreshSubscription = interval(60000).subscribe(() => {
      this.loadMatches(true);
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  ngOnChanges() {
    this.loadMatches();
  }

  loadMatches(isRefresh: boolean = false) {
    if (this.selectedTeams.length === 0) {
      this.matches = [];
      return;
    }
    if(!isRefresh) {
      this.loading = true;
    }
    const teamIds = this.selectedTeams.map(team => team.id);

    this.footballService.getUpcomingMatches(teamIds).subscribe({
      next: (matches) => {
        // Sort matches by utcDate ascending
        this.matches = matches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading matches:', error);
        this.loading = false;
      }
    });
  }

  private toIsoUtc(dateString: string): string {
    if (!dateString) return dateString;
    // if already has timezone info (Z or +hh:mm / -hh:mm) return as-is
    if (/[zZ]$/.test(dateString) || /[+\-]\d{2}:\d{2}$/.test(dateString)) return dateString;
    return dateString + 'Z';
  }

  formatDate(dateString: string, timeZone = 'Asia/Karachi'): string {
    if (!dateString) return '';
    const iso = this.toIsoUtc(dateString);
    const date = new Date(iso);

    const dayKeyFmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }); // returns YYYY-MM-DD style
    const displayFmt = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', month: 'short', day: 'numeric' });

    const matchDay = dayKeyFmt.format(date);
    const todayTz = dayKeyFmt.format(new Date());
    const tomorrowTz = dayKeyFmt.format(new Date(Date.now() + 24 * 60 * 60 * 1000));

    if (matchDay === todayTz) return 'Today';
    if (matchDay === tomorrowTz) return 'Tomorrow';
    return displayFmt.format(date);
  }

  formatTime(dateString: string, timeZone = 'Asia/Karachi'): string {
    if (!dateString) return '';
    const iso = this.toIsoUtc(dateString);
    const date = new Date(iso);

    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  getCurrentTimezone(): string {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone.replace('_', ' ');
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }
}