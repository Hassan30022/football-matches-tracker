import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { FootballService, League } from "../services/football.service";

@Component({
  selector: "app-league-selector",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="selector-container animate-slide-in">
      <label for="league-select" class="selector-label">
        <i class="icon">🏆</i>
        Select League
      </label>
      <div class="custom-select">
        <div class="select-input" (click)="dropdownOpen = !dropdownOpen">
          {{ selectedLeague || "Choose a league..." }}
          <div class="select-arrow">▼</div>
        </div>

        <ul *ngIf="dropdownOpen" class="custom-options">
          <li *ngFor="let league of leagues" (click)="selectLeague(league)">
            {{ league.name != "_No League" ? league.name : "No League" }}
            {{ league.country ? "(" + league.country + ")" : "" }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
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
        border-color: 2px solid #3b82f6;
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

      .custom-options {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0; 
        background: #2d2d2d;
        border-radius: 12px;
        margin-top: 4px;
        list-style: none;
        padding: 0;
        z-index: 1000;
        max-height: 250px; 
        overflow-y: auto;
      }

      .custom-options li {
        padding: 0.75rem 1rem;
        color: #e5e5e5;
        cursor: pointer;
        transition: background 0.2s;
      }

      .custom-options li:hover {
        background: #3b3b3b;
      }

      @media (max-width: 768px) {
        .select-input {
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
        }
      }
    `,
  ],
})
export class LeagueSelectorComponent implements OnInit {
  @Output() leagueSelected = new EventEmitter<string>();

  leagues: League[] = [];
  selectedLeague: string = "";
  dropdownOpen = false;

  constructor(private footballService: FootballService) {}

  ngOnInit() {
    this.loadLeagues();
  }

  loadLeagues() {
    this.footballService.getAllLeagues().subscribe({
      next: (leagues) => {
        this.leagues = [{ name: "Internationals"}, {name: "Others"}, ...leagues];
      },
      error: (error) => {
        console.error("Error loading leagues:", error);
      },
    });
  }

  selectLeague(league: any) {
    this.selectedLeague = league.name;
    this.dropdownOpen = false;
    this.onLeagueChange();
  }

  onLeagueChange() {
    if (this.selectedLeague) {
      this.leagueSelected.emit(this.selectedLeague);
    }
  }
}