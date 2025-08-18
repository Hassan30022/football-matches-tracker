import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FootballService, League } from '../services/football.service';

@Component({
  selector: 'app-league-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="selector-container animate-slide-in">
      <label for="league-select" class="selector-label">
        <i class="icon">🏆</i>
        Select League
      </label>
      <div class="custom-select">
        <select 
          id="league-select"
          [(ngModel)]="selectedLeague"
          (change)="onLeagueChange()"
          class="select-input">
          <option value="">Choose a league...</option>
          <option *ngFor="let league of leagues" [value]="league.name">
            {{league.name != '_No League' ? league.name : 'No League' }} {{ league.country ? '(' +league.country +')': ''}}
          </option>
        </select>
        <div class="select-arrow">▼</div>
      </div>
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

    .select-input:focus {
      outline: none;
      border-color: #3b82f6;
      background: rgba(45, 45, 45, 1);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select-input:hover {
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

    .custom-select:hover .select-arrow {
      transform: translateY(-50%) scale(1.1);
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
    }
  `]
})
export class LeagueSelectorComponent implements OnInit {
  @Output() leagueSelected = new EventEmitter<string>();
  
  leagues: League[] = [];
  selectedLeague: string = '';

  constructor(private footballService: FootballService) {}

  ngOnInit() {
    this.loadLeagues();
  }

  loadLeagues() {
    this.footballService.getAllLeagues().subscribe({
      next: (leagues) => {
        this.leagues = [
          ...leagues,
          { name: 'Internationals' }
        ];
      },
      error: (error) => {
        console.error('Error loading leagues:', error);
      }
    });
  }

  onLeagueChange() {
    if (this.selectedLeague) {
      this.leagueSelected.emit(this.selectedLeague);
    }
  }
}