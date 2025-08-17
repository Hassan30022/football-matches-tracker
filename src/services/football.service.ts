import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';

export interface League {
  id: number;
  name: string;
  country: string;
  emblem?: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  crest?: string;
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  utcDate: string;
  status: string;
  competition: {
    name: string;
    emblem?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FootballService {
  private apiUrl = 'https://api.football-data.org/v4';
  private apiKey = '4321b750b59c4fe7aa8724a5dc5472bf';

  private baseUrl = 'https://www.thesportsdb.com/api/v1/json/3';
  private baseUrl2 = 'https://www.thesportsdb.com/api/v1/json/123';

  constructor(private http: HttpClient) { }

  getAllLeagues(): Observable<League[]> {
    return this.http.get<{ leagues: any[] }>(`${this.baseUrl}/all_leagues.php`).pipe(
      map(response =>
        response.leagues
          .filter(l => l.strSport === 'Soccer')
          .map(l => ({
            id: Number(l.idLeague),
            name: l.strLeague,
            country: l.strLeagueAlternate,
            emblem: ''
          }))
      )
    );
  }

  getTeamsByLeague(leagueName: string): Observable<Team[]> {
    return this.http
      .get<any>(`${this.baseUrl}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`)
      .pipe(
        map(response => {
          if (!response?.teams) return [];
          return response.teams.map((team: any) => ({
            id: parseInt(team.idTeam, 10),
            name: team.strTeam,
            shortName: team.strTeamShort || team.strTeam,
            crest: team.strBadge
          }));
        })
      );
  }

  getUpcomingMatches(teamIds: number[]): Observable<Match[]> {
    const requests = teamIds.map(id =>
      this.http.get<any>(`${this.baseUrl2}/eventsnext.php?id=${id}`).pipe(
        map(res => (res.events || []).map((e: any) => ({
          id: parseInt(e.idEvent, 10),
          utcDate: e.dateEvent + 'T' + e.strTime,
          status: e.strStatus || 'Scheduled',
          venue: e.strVenue,
          postponed: e.strPostponed != 'no',
          season: e.strSeason,
          homeTeam: {
            id: parseInt(e.idHomeTeam, 10),
            name: e.strHomeTeam,
            shortName: e.strHomeTeamShort || e.strHomeTeam,
            crest: e.strHomeTeamBadge,
            homeScore: e.intHomeScore,
          },
          awayTeam: {
            id: parseInt(e.idAwayTeam, 10),
            name: e.strAwayTeam,
            shortName: e.strAwayTeamShort || e.strAwayTeam,
            crest: e.strAwayTeamBadge,
            awayScore: e.intAwayScore
          },
          competition: {
            name: e.strLeague,
            emblem: e.strLeagueBadge
          }
        })))
      )
    );

    return forkJoin(requests).pipe(
      map(results => results.flat())
    );
  }
}