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

  constructor(private http: HttpClient) {}

getAllLeagues(): Observable<League[]> {
  return this.http.get<{ leagues: any[] }>(`${this.baseUrl}/all_leagues.php`).pipe(
    map(response =>
      response.leagues
        .filter(l => l.strSport === 'Soccer') 
        .map(l => ({
          id: Number(l.idLeague),
          name: l.strLeague,
          country: l.strLeagueAlternate, 
          emblem: ''   // You can fill later if you fetch emblems
        }))
    )
  );
}
  private headers = new HttpHeaders({
    'X-Auth-Token': this.apiKey
  });

  // Demo data for offline/fallback mode
  private demoLeagues: League[] = [
    { id: 2021, name: 'Premier League', country: 'England' },
    { id: 2014, name: 'Primera División', country: 'Spain' },
    { id: 2019, name: 'Serie A', country: 'Italy' },
    { id: 2002, name: 'Bundesliga', country: 'Germany' },
    { id: 2015, name: 'Ligue 1', country: 'France' }
  ];

  private demoTeams: { [key: number]: Team[] } = {
    2021: [
      { id: 57, name: 'Arsenal FC', shortName: 'Arsenal' },
      { id: 61, name: 'Chelsea FC', shortName: 'Chelsea' },
      { id: 65, name: 'Manchester City FC', shortName: 'Man City' },
      { id: 66, name: 'Manchester United FC', shortName: 'Man United' },
      { id: 64, name: 'Liverpool FC', shortName: 'Liverpool' },
      { id: 73, name: 'Tottenham Hotspur FC', shortName: 'Tottenham' }
    ],
    2014: [
      { id: 81, name: 'FC Barcelona', shortName: 'Barcelona' },
      { id: 86, name: 'Real Madrid CF', shortName: 'Real Madrid' },
      { id: 78, name: 'Atlético de Madrid', shortName: 'Atlético' },
      { id: 90, name: 'Real Betis Balompié', shortName: 'Betis' }
    ]
  };

getTeamsByLeague(leagueName: string): Observable<Team[]> {
  return this.http
    .get<any>(`${this.baseUrl}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`)
    .pipe(
      map(response => {
        if (!response?.teams) return [];
        return response.teams.map((team: any) => ({
          id: parseInt(team.idTeam, 10),
          name: team.strTeam,
          shortName: team.strTeamShort || team.strTeam, // fallback if short name missing
          crest: team.strTeamBadge
        }));
      })
    );
}

getUpcomingMatches(teamIds: number[]): Observable<Match[]> {
  const requests = teamIds.map(id =>
    this.http.get<any>(`${this.baseUrl2}/eventsnext.php?id=${id}`).pipe(
      map(res => (res.events || []).map((e: any) => ({
        id: parseInt(e.idEvent, 10),
        homeTeam: {
          id: parseInt(e.idHomeTeam, 10),
          name: e.strHomeTeam,
          shortName: e.strHomeTeamShort || e.strHomeTeam,
          crest: e.strHomeTeamBadge
        },
        awayTeam: {
          id: parseInt(e.idAwayTeam, 10),
          name: e.strAwayTeam,
          shortName: e.strAwayTeamShort || e.strAwayTeam,
          crest: e.strAwayTeamBadge
        },
        utcDate: e.dateEvent + 'T' + e.strTime, // combine date/time
        status: e.strStatus || 'Scheduled',
        competition: {
          name: e.strLeague,
          emblem: e.strLeagueBadge
        }
      })))
    )
  );

  return forkJoin(requests).pipe(
    map(results => results.flat()) // merge all matches from different teams
  );
}

  private findTeamById(teamId: number): Team | null {
    for (const leagueTeams of Object.values(this.demoTeams)) {
      const team = leagueTeams.find(t => t.id === teamId);
      if (team) return team;
    }
    return null;
  }

  private getRandomOpponent(excludeTeamId: number): Team | null {
    const allTeams = Object.values(this.demoTeams).flat();
    const opponents = allTeams.filter(t => t.id !== excludeTeamId);
    return opponents[Math.floor(Math.random() * opponents.length)] || null;
  }

  private getLeagueNameByTeamId(teamId: number): string {
    for (const [leagueId, teams] of Object.entries(this.demoTeams)) {
      if (teams.find(t => t.id === teamId)) {
        const league = this.demoLeagues.find(l => l.id === parseInt(leagueId));
        return league?.name || 'Unknown League';
      }
    }
    return 'Unknown League';
  }
}