import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FootballService,
  Match,
  MatchStatus,
  Team,
} from "../services/football.service";
import { interval, Subscription } from "rxjs";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ViewKitsModalComponent } from "./view-kits-modal.component";
import { ProgressBarComponent } from "../helper/progress-bar";

@Component({
  selector: "app-matches-list",
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
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

      <div
        *ngIf="!loading && matches.length === 0 && selectedTeams.length > 0"
        class="empty-matches"
      >
        <div class="empty-icon">📅</div>
        <p class="empty-text">No upcoming matches found</p>
        <p class="empty-subtext">Check back later for fixture updates</p>
      </div>

      <div
        *ngIf="!loading && selectedTeams.length === 0"
        class="no-teams-state"
      >
        <div class="empty-icon">⚽</div>
        <p class="empty-text">Select clubs to see their matches</p>
        <p class="empty-subtext">
          Add your favorite clubs above to track their upcoming fixtures
        </p>
      </div>

      <div class="matches-list" *ngIf="!loading && matches.length > 0">
        <div
          *ngFor="let match of matches; trackBy: trackByMatchId"
          class="match-card animate-slide-in hover-lift"
          [ngClass]="{
            focused:
              focusedTeamId === match.homeTeam.id ||
              focusedTeamId === match.awayTeam.id,
          }"
        >
          <div class="match-header">
            <span class="competition-name">{{ match.competition.name }}</span>
            <span
              class="match-date"
              *ngIf="
                match.status != matchStatus.FirstHalf &&
                match.status != matchStatus.HalfTime &&
                match.status != matchStatus.SecondHalf
              "
              >{{ formatDate(match.utcDate) }}</span
            >
            <span
              class="match-live"
              *ngIf="
                match.status == matchStatus.FirstHalf ||
                match.status == matchStatus.HalfTime ||
                match.status == matchStatus.SecondHalf
              "
              >🔴Live</span
            >
          </div>

          <div class="match-teams">
            <div class="team home-team">
              <img
                class="crest"
                [src]="match.homeTeam.crest"
                [alt]="match.homeTeam.name"
              />
              <span class="team-name">{{ match.homeTeam.name }}</span>
              <span class="team-short">(Home)</span>
              <svg
                (click)="viewKits(match.homeTeam)"
                class="w-6 h-6 text-gray-800 dark:text-white home-kit"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.833 5a5 5 0 0 1 3-1h6.334a5 5 0 0 1 3 1L21.1 7.2a1 1 0 0 1 .268 1.296l-2 3.5a1 1 0 0 1-1.382.361l-.986-.59V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-7.234l-.985.591a1 1 0 0 1-1.383-.36l-2-3.5A1 1 0 0 1 2.9 7.2L5.833 5ZM14 5h-4c0 .425.223.933.645 1.355.422.423.93.645 1.355.645.425 0 .933-.222 1.355-.645.423-.422.645-.93.645-1.355Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <div class="vs-separator">
              <span
                class="vs-score"
                *ngIf="
                  match.status != matchStatus.NotStarted &&
                  match.status != matchStatus.TimeNotDefined
                "
                >{{ match.homeTeam.homeScore ?? "" }} -
                {{ match.awayTeam.awayScore ?? "" }}</span
              >
              <img
                class="league-img"
                (click)="
                  openedMatches.has(match.id)
                    ? toggleMatch(match.id)
                    : getLeagueTable(match.idLeague, match.id)
                "
                [ngStyle]="
                  match.status != matchStatus.NotStarted &&
                  match.status != matchStatus.TimeNotDefined &&
                  match.homeTeam.homeScore
                    ? { top: '-60px' }
                    : { top: '-85px' }
                "
                *ngIf="match.leagueBadge"
                [src]="match.leagueBadge"
                alt=""
              />
              <span class="vs-text">VS</span>
            </div>

            <div class="team away-team">
              <img
                class="crest-away"
                [src]="match.awayTeam.crest"
                [alt]="match.awayTeam.name"
              />
              <span class="team-name">{{ match.awayTeam.name }}</span>
              <span class="team-short">(Away)</span>
              <svg
                (click)="viewKits(match.awayTeam)"
                class="w-6 h-6 text-gray-800 dark:text-white away-kit"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.833 5a5 5 0 0 1 3-1h6.334a5 5 0 0 1 3 1L21.1 7.2a1 1 0 0 1 .268 1.296l-2 3.5a1 1 0 0 1-1.382.361l-.986-.59V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-7.234l-.985.591a1 1 0 0 1-1.383-.36l-2-3.5A1 1 0 0 1 2.9 7.2L5.833 5ZM14 5h-4c0 .425.223.933.645 1.355.422.423.93.645 1.355.645.425 0 .933-.222 1.355-.645.423-.422.645-.93.645-1.355Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div
            class="live-bar"
            *ngIf="
              match.status == matchStatus.FirstHalf ||
              match.status == matchStatus.HalfTime ||
              match.status == matchStatus.SecondHalf
            "
          ></div>
          <div class="match-time">
            <i
              class="time-icon"
              *ngIf="
                match.status == matchStatus.NotStarted ||
                match.status == matchStatus.TimeNotDefined
              "
              >⏰</i
            >
            <span>{{
              match.status == matchStatus.NotStarted
                ? formatTime(match.utcDate)
                : match.status == matchStatus.FirstHalf
                  ? "1st Half"
                  : match.status == matchStatus.HalfTime
                    ? "Half Time"
                    : match.status == matchStatus.SecondHalf
                      ? "2nd Half"
                      : match.status == matchStatus.TimeNotDefined
                        ? "Time to be decided!"
                        : "Final"
            }}</span>
          </div>
          <div class="match-time">
            <i class="time-icon" *ngIf="match.venue">🏟️</i>
            <span>{{ match.venue }}</span>
          </div>
          <app-progress-bar *ngIf="loadingStandings[match.id]"></app-progress-bar>
          <div
            class="match-card"
            style="margin-top: 10px;"
            *ngIf="openedMatches.has(match.id)"
          >
            <div class="standings-card">
              <div class="standings-header">
                <h3 class="standings-title">
                  {{ standings[match.idLeague]?.[0]?.strLeague + " Standings" }}
                </h3>
                <span class="standings-updated">
                  Updated:
                  {{
                    standings[match.idLeague]?.[0]?.dateUpdated | date: "medium"
                  }}
                </span>
              </div>

              <div class="standings-table-wrapper">
                <table class="standings-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th class="team-col">Team</th>
                      <th>MP</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GD</th>
                      <th>Pts</th>
                      <th>Streak</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr *ngFor="let team of standings[match.idLeague]">
                      <td>{{ team.intRank }}</td>

                      <td class="team-col team-cell">
                        <img [src]="team.strBadge" class="team-badge" />
                        <span>{{ team.strTeam }}</span>
                      </td>

                      <td>{{ team.intPlayed }}</td>
                      <td>{{ team.intWin }}</td>
                      <td>{{ team.intDraw }}</td>
                      <td>{{ team.intLoss }}</td>
                      <td>{{ team.intGoalDifference }}</td>
                      <td class="points">{{ team.intPoints }}</td>

                      <td class="form">
                        <div
                          *ngFor="let f of reverseForm(team.strForm).split('')"
                          class="form-letter"
                          [ngClass]="{
                            'form-win': f === 'W',
                            'form-draw': f === 'D',
                            'form-loss': f === 'L',
                          }"
                        >
                          {{ f }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .empty-matches,
      .no-teams-state {
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

      .crest {
        width: 40px;
        height: 40px;
      }

      .crest-away {
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

      .focused {
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
        position: relative;
      }

      .home-team {
        text-align: left;
      }

      .away-team {
        text-align: right;
      }

      .home-kit {
        position: absolute;
        bottom: -2px;
        left: 50px;
        cursor: pointer;
      }

      .away-kit {
        position: absolute;
        bottom: -2px;
        right: 50px;
        cursor: pointer;
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
        position: relative;
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

      .league-img {
        height: 50px;
        width: 50px;
        position: absolute;
        top: -85px;
        cursor: pointer;
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

        .home-team,
        .away-team {
          text-align: center;
        }

        .vs-separator {
          order: 2;
        }

        .away-team {
          order: 3;
        }
      }
      .standings-card {
        padding: 16px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .standings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .standings-title {
        font-size: 18px;
        font-weight: 600;
      }

      .standings-updated {
        font-size: 12px;
        color: #ede7e7;
      }

      .standings-table-wrapper {
        overflow-x: auto;
      }

      .standings-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 650px;

        tr {
          border-bottom: 1px solid #eee;
        }
      }

      .standings-table th,
      .standings-table td {
        padding: 10px 8px;
        text-align: center;
        font-size: 14px;
      }

      .standings-table th {
        font-weight: 600;
      }

      .team-col {
        text-align: left;
      }

      .team-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .team-badge {
        width: 20px;
        height: 20px;
      }

      .points {
        font-weight: 600;
      }

      .form {
        font-weight: 500;
        display: flex;
        justify-content: center;
        gap: 4px;
        padding: 6px 8px !important;
      }

      .form-letter {
        width: 20px;
        height: 20px;
        border-radius: 10px;

        &.form-win {
          background-color: #16a34a;
        }
        &.form-draw {
          background-color: #eab308;
        }
        &.form-loss {
          background-color: #dc2626;
        }
      }

      @media (max-width: 768px) {
        .standings-title {
          font-size: 16px;
        }

        .standings-table th,
        .standings-table td {
          padding: 8px 6px;
          font-size: 12px;
        }

        .team-badge {
          width: 18px;
          height: 18px;
        }
      }
    `,
  ],
})
export class MatchesListComponent implements OnInit, OnDestroy {
  @Input() selectedTeams: Team[] = [];
  @Input() focusedTeamId: number | null = null;

  matches: any[] = [];
  loading = false;
  currentTimezone = "";
  private refreshSubscription?: Subscription;
  matchStatus = MatchStatus;
  standings: { [leagueId: number]: any[] } = {};
  loadingStandings: { [eventId: number]: boolean } = {};
  openedMatches = new Set<number>();

  constructor(
    private footballService: FootballService,
    private dialog: MatDialog,
  ) {}

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedTeams"]) {
      this.loadMatches();
    }
  }

  loadMatches(isRefresh: boolean = false) {
    if (this.selectedTeams.length === 0) {
      this.matches = [];
      return;
    }
    if (!isRefresh) {
      this.loading = true;
    }
    const teamIds = this.selectedTeams.map((team) => team.id);

    this.footballService.getUpcomingMatches(teamIds).subscribe({
      next: (matches) => {
        // Sort matches by utcDate ascending
        this.matches = matches.sort(
          (a, b) =>
            new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
        );
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading matches:", error);
        this.loading = false;
      },
    });
  }

  private toIsoUtc(dateString: string): string {
    if (!dateString) return dateString;
    // if already has timezone info (Z or +hh:mm / -hh:mm) return as-is
    if (/[zZ]$/.test(dateString) || /[+\-]\d{2}:\d{2}$/.test(dateString))
      return dateString;
    return dateString + "Z";
  }

  formatDate(dateString: string, timeZone = "Asia/Karachi"): string {
    if (!dateString) return "";
    const iso = this.toIsoUtc(dateString);
    const date = new Date(iso);

    const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }); // returns YYYY-MM-DD style
    const displayFmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const matchDay = dayKeyFmt.format(date);
    const todayTz = dayKeyFmt.format(new Date());
    const tomorrowTz = dayKeyFmt.format(
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    if (matchDay === todayTz) return "Today";
    if (matchDay === tomorrowTz) return "Tomorrow";
    return displayFmt.format(date);
  }

  formatTime(dateString: string, timeZone = "Asia/Karachi"): string {
    if (!dateString) return "";
    const iso = this.toIsoUtc(dateString);
    const date = new Date(iso);

    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  getCurrentTimezone(): string {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone.replace("_", " ");
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }

  viewKits(teamDetails: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = "90vw";
    dialogConfig.width = "90vw";
    dialogConfig.minHeight = "90vh";
    dialogConfig.height = "90vh";
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      teamDetails: teamDetails,
    };
    const dialogRef = this.dialog.open(ViewKitsModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((data) => {
      if (data?.updated) {
      }
    });
  }

  getLeagueTable(leagueId: number, eventId?: number) {
    this.loadingStandings[eventId!] = true;
    this.footballService.getLeagueTable(leagueId).subscribe({
      next: (table) => {
        this.loadingStandings[eventId!] = false;
        console.log("League Table:", table);
        this.standings[leagueId] = table;
        if (table.length > 0 && eventId) {
          this.toggleMatch(eventId!);
        }
      },
      error: (error) => {
        console.error("Error loading league table:", error);
        this.loadingStandings[eventId!] = false;
      },
    });
  }

  reverseForm(form: string) {
    if (!form) return "";
    return form.split("").reverse().join("");
  }

  toggleMatch(matchId: number) {
    if (this.openedMatches.has(matchId)) {
      this.openedMatches.delete(matchId);
    } else {
      this.openedMatches.add(matchId);
    }
  }
}
