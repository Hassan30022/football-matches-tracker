import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Team } from './services/football.service';
import { LeagueSelectorComponent } from './components/league-selector.component';
import { TeamSelectorComponent } from './components/team-selector.component';
import { SelectedTeamsComponent } from './components/selected-teams.component';
import { MatchesListComponent } from './components/matches-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LeagueSelectorComponent,
    TeamSelectorComponent,
    SelectedTeamsComponent,
    MatchesListComponent
  ],
  template: `
    <div class="app-container">
      <div> 
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title animate-fade-in">
            <i class="title-icon">⚽</i>
            Football Matches Tracker
          </h1>
          <p class="app-subtitle animate-fade-in">
            Never miss a match of your favorite football clubs!
          </p>
        </div>
      </header>

      <main class="main-content">
        <div class="content-wrapper">
          <!-- Selectors Section -->
          <section class="selectors-section glass-effect">
            <app-league-selector 
              (leagueSelected)="onLeagueSelected($event)">
            </app-league-selector>
            
            <app-team-selector 
              [league]="selectedLeague"
              [selectedTeams]="selectedTeams"
              (teamAdded)="onTeamAdded($event)">
            </app-team-selector>
          </section>

          <!-- Selected Teams Section -->
          <section class="teams-section">
            <app-selected-teams
              [teams]="selectedTeams"
              (teamRemoved)="onTeamRemoved($event)"
              (focusChanged)="focusedTeamId = $event">
            </app-selected-teams>
          </section>

          <!-- Matches Section -->
          <section class="matches-section">
            <app-matches-list
              [selectedTeams]="selectedTeams" [focusedTeamId]="focusedTeamId "
              >
            </app-matches-list>
          </section>
        </div>
      </main>
     </div>
      <footer class="app-footer">
        <div class="footer-content">
          <p class="footer-text">
            Built with ❤️ by M. Hassan Asghar
          </p>
          <p class="version-text">
            version: 20.8.0.03 | 2025
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      color: #e5e5e5;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .app-header {
      background: rgba(45, 45, 45, 0.6);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      text-align: center;
    }

    .app-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

    }

    .title-icon {
      font-size: 1.2em;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }

    .app-subtitle {
      font-size: 1.1rem;
      color: #9ca3af;
      font-weight: 400;
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .selectors-section {
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .teams-section,
    .matches-section {
      padding: 0;
    }

    .app-footer {
      background: rgba(26, 26, 26, 0.9);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.5rem 0;
      margin-top: 3rem;
      position: relative;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      text-align: center;
    }

    .footer-text {
      color: #6b7280;
      font-size: 0.9rem;
    }

    .version-text {
      color: #6b7280;
      font-size: 0.9rem;
      position: absolute;
      right: 12px;
      bottom: 24px;
    }

    @media (max-width: 768px) {
      .app-header {
        padding: 1.5rem 0;
      }

      .header-content {
        padding: 0 1rem;
      }

      .app-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .app-subtitle {
        font-size: 1rem;
      }

      .main-content {
        padding: 1.5rem 0;
      }

      .content-wrapper {
        padding: 0 1rem;
        gap: 1.5rem;
      }

      .selectors-section {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .content-wrapper {
        padding: 0 0.75rem;
      }

      .selectors-section {
        padding: 1rem;
      }
    }
  `]
})
export class App implements OnInit {
  selectedLeague = '';
  selectedTeams: Team[] = [];
  focusedTeamId: number | null = null;

  ngOnInit() {
    this.loadSavedTeams();
  }

  onLeagueSelected(leagueName: string) {
    this.selectedLeague = leagueName;
  }

  onTeamAdded(team: Team) {
    if (!this.selectedTeams.find(t => t.id === team.id)) {
      this.selectedTeams = [...this.selectedTeams, team];
      this.saveTeams();
    }
  }

  onTeamRemoved(team: Team) {
    this.selectedTeams = this.selectedTeams.filter(t => t.id !== team.id);
    this.saveTeams();
  }

  private loadSavedTeams() {
    try {
      const saved = localStorage.getItem('footballTrackerTeams');
      if (saved) {
        this.selectedTeams = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading saved teams:', error);
    }
  }

  private saveTeams() {
    try {
      localStorage.setItem('footballTrackerTeams', JSON.stringify(this.selectedTeams));
    } catch (error) {
      console.error('Error saving teams:', error);
    }
  }
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});