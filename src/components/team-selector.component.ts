import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FootballService, Team } from '../services/football.service';

@Component({
  selector: 'app-team-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="selector-container" [class.animate-slide-in]="teams.length > 0">
      <label for="team-select" class="selector-label">
        <i class="icon">⚽</i>
        Select Club
      </label>
      <div class="custom-select">
        <select 
          id="team-select"
          [(ngModel)]="selectedTeamId"
          (change)="onTeamChange()"
          class="select-input"
          [disabled]="!league || teams.length === 0">
          <option value="">
            {{ league ? 'Choose a club...' : 'Select a league first' }}
          </option>
          <option *ngFor="let team of teams" [value]="team.id">
            {{ team.name }}
          </option>
        </select>
        <div class="select-arrow">▼</div>
      </div>
      
      <button 
        *ngIf="selectedTeamId && !isTeamAlreadySelected()"
        (click)="addTeam()"
        class="add-button hover-lift">
        <i class="plus-icon">+</i>
        Add Club
      </button>
    </div>
  `,
  styles: [`
    .selector-container {
      margin-bottom: 1.5rem;
    }

    .selector-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #f3f4f6;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .icon {
      font-size: 1.2rem;
    }

    .custom-select {
      position: relative;
      margin-bottom: 1rem;
    }

    .select-input {
      width: 100%;
      padding: 1rem 1.25rem;
      background: rgba(45, 45, 45, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #e5e5e5;
      font-size: 1rem;
      appearance: none;
      cursor: pointer;
      transition: all 0.3s ease;
      padding-right: 3rem;
    }

    .select-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .select-input:focus:not(:disabled) {
      outline: none;
      border-color: #3b82f6;
      background: rgba(45, 45, 45, 1);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select-input:hover:not(:disabled) {
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(45, 45, 45, 1);
    }

    .select-arrow {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
      transition: transform 0.2s ease;
    }

    .add-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }

    .add-button:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    }

    .plus-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }

    option {
      background: #2d2d2d;
      color: #e5e5e5;
      padding: 0.5rem;
    }

    @media (max-width: 768px) {
      .select-input {
        padding: 0.875rem 1rem;
        font-size: 0.95rem;
      }

      .add-button {
        padding: 0.625rem 1.25rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class TeamSelectorComponent implements OnChanges {
  @Input() league!: string;
  @Input() selectedTeams: Team[] = [];
  @Output() teamAdded = new EventEmitter<Team>();

  teams: Team[] = [];
  selectedTeamId: string = '';

  constructor(private footballService: FootballService) {}

  ngOnChanges() {
    if (this.league) {
      console.log('League ID changed:', this.league);
      this.loadTeams();
    } else {
      this.teams = [];
      this.selectedTeamId = '';
    }
  }

  loadTeams() {
    this.footballService.getTeamsByLeague(this.league).subscribe({
      next: (teams) => {
        this.teams = teams;
        console.log('Teams loaded:', this.teams);
        this.selectedTeamId = '';
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  onTeamChange() {
    // Method for handling selection change if needed
  }

  addTeam() {
    if (this.selectedTeamId) {
      const team = this.teams.find(t => t.id === parseInt(this.selectedTeamId));
      if (team) {
        this.teamAdded.emit(team);
        this.selectedTeamId = '';
      }
    }
  }

  isTeamAlreadySelected(): boolean {
    return this.selectedTeams.some(team => 
      team.id === parseInt(this.selectedTeamId)
    );
  }
}