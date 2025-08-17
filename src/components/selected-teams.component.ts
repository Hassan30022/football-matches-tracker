import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../services/football.service';

@Component({
  selector: 'app-selected-teams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="selected-teams-container" *ngIf="teams.length > 0">
      <h3 class="section-title">
        <i class="icon">📋</i>
        Selected Clubs ({{ teams.length }})
      </h3>
      
      <div class="teams-grid">
        <div 
          *ngFor="let team of teams; trackBy: trackByTeamId"
          class="team-card animate-fade-in hover-lift">
          <div class="team-info-wrapper">
            <img [src]="team.crest" [alt]="team.name" class="team-crest">
            <div class="team-info">
              <span class="team-name">{{ team.name }}</span>
              <span class="team-short">{{ team.shortName }}</span>
            </div>
          </div>
          <button 
            (click)="removeTeam(team)"
            class="remove-button"
            [attr.aria-label]="'Remove ' + team.name">
            ✕
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="teams.length === 0">
      <div class="empty-icon">⚽</div>
      <p class="empty-text">No clubs selected yet</p>
      <p class="empty-subtext">Select a league and add your favorite clubs to track their matches</p>
    </div>
  `,
  styles: [`
    .selected-teams-container {
      margin-bottom: 2rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #f3f4f6;
      margin-bottom: 1rem;
    }

    .icon {
      font-size: 1.3rem;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.75rem;
    }

    .team-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(45, 45, 45, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1rem;
      transition: all 0.3s ease;
    }

    .team-card:hover {
      border-color: #3b82f6;
      background: rgba(45, 45, 45, 1);
    }

    .team-info-wrapper{
      display: flex;
      flex-direction: row;
    }

    .team-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .team-name {
      font-weight: 600;
      color: #f3f4f6;
      font-size: 0.95rem;
    }

    .team-short {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .remove-button {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 2px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .remove-button:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      transform: scale(1.1);
    }

    .empty-state {
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

    .empty-subtext {
      font-size: 0.9rem;
      line-height: 1.5;
      max-width: 300px;
      margin: 0 auto;
    }

    .team-crest{
        width: 40px;
        height: 40px;
        align-self: center;
        margin-right: 10px;
    }

    @media (max-width: 768px) {
      .teams-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .team-card {
        padding: 0.875rem;
      }

      .section-title {
        font-size: 1.1rem;
      }

      .empty-state {
        padding: 2rem 1rem;
      }

      .empty-icon {
        font-size: 2.5rem;
      }
    }
  `]
})
export class SelectedTeamsComponent implements OnInit {
  @Input() teams: Team[] = [];
  @Output() teamRemoved = new EventEmitter<Team>();

  private storageKey = 'selectedTeams';

  ngOnInit() {
    // Load from localStorage if exists
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.teams = JSON.parse(saved);
      } catch {
        console.error('Failed to parse saved teams from localStorage');
      }
    }
  }

  removeTeam(team: Team) {
    this.teams = this.teams.filter(t => t.id !== team.id);
    this.saveTeams();
    this.teamRemoved.emit(team);
  }

  // Whenever teams input changes, store them
  ngOnChanges() {
    this.saveTeams();
  }

  trackByTeamId(index: number, team: Team): number {
    return team.id;
  }

  private saveTeams() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.teams));
  }
}