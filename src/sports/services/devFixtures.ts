import { SportsEvent, SportsChannel } from '../models/types';

/**
 * DEVELOPMENT FIXTURES ONLY
 * Clearly labelled test data used exclusively for UI development and preview
 * when live provider upstream feeds are unreachable or unconfigured.
 */
export const DEV_SPORTS_EVENTS_FIXTURES: SportsEvent[] = [
  // --- FANCODE ---
  {
    id: 'dev_fancode_live_1',
    provider: 'FANCODE',
    title: 'Barbados Royals vs Trinbago Knight Riders',
    tournamentName: 'Caribbean Premier League 2025',
    category: 'CRICKET',
    status: 'LIVE',
    startTime: Date.now() - 45 * 60 * 1000, // Started 45m ago
    posterUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'Barbados Royals',
      shortName: 'BR',
      logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=100&q=80',
      score: '162/4 (17.2)'
    },
    awayTeam: {
      name: 'Trinbago Knight Riders',
      shortName: 'TKR',
      logoUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=100&q=80',
      score: '178/6 (20.0)'
    },
    venue: 'Kensington Oval, Bridgetown',
    streamSupportedInApp: true,
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    externalWebUrl: 'https://www.fancode.com',
    externalAppDeepLink: 'fancode://match/dev_live_1',
    lastUpdated: Date.now()
  },
  {
    id: 'dev_fancode_upcoming_1',
    provider: 'FANCODE',
    title: 'Surrey vs Yorkshire',
    tournamentName: 'Vitality Blast T20',
    category: 'CRICKET',
    status: 'UPCOMING',
    startTime: Date.now() + 4 * 3600 * 1000, // In 4 hours
    posterUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'Surrey',
      shortName: 'SUR',
      logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=100&q=80'
    },
    awayTeam: {
      name: 'Yorkshire',
      shortName: 'YOR',
      logoUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=100&q=80'
    },
    venue: 'The Oval, London',
    streamSupportedInApp: false,
    externalWebUrl: 'https://www.fancode.com',
    externalAppDeepLink: 'fancode://match/dev_up_1',
    lastUpdated: Date.now()
  },

  // --- SONYLIV ---
  {
    id: 'dev_sonyliv_live_1',
    provider: 'SONYLIV',
    title: 'Arsenal vs Manchester City',
    tournamentName: 'UEFA Champions League',
    category: 'FOOTBALL',
    status: 'LIVE',
    startTime: Date.now() - 30 * 60 * 1000,
    posterUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'Arsenal FC',
      shortName: 'ARS',
      logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=100&q=80',
      score: '1'
    },
    awayTeam: {
      name: 'Manchester City',
      shortName: 'MCI',
      logoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=100&q=80',
      score: '1'
    },
    venue: 'Emirates Stadium, London',
    streamSupportedInApp: true,
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    externalWebUrl: 'https://www.sonyliv.com/sports',
    externalAppDeepLink: 'sonyliv://sports/dev_live_1',
    lastUpdated: Date.now()
  },
  {
    id: 'dev_sonyliv_upcoming_1',
    provider: 'SONYLIV',
    title: 'Real Madrid vs Bayern Munich',
    tournamentName: 'UEFA Champions League Semi-Final',
    category: 'FOOTBALL',
    status: 'UPCOMING',
    startTime: Date.now() + 24 * 3600 * 1000,
    posterUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'Real Madrid',
      shortName: 'RMA'
    },
    awayTeam: {
      name: 'Bayern Munich',
      shortName: 'BAY'
    },
    venue: 'Santiago Bernabéu, Madrid',
    streamSupportedInApp: false,
    externalWebUrl: 'https://www.sonyliv.com/sports',
    externalAppDeepLink: 'sonyliv://sports/dev_up_1',
    lastUpdated: Date.now()
  },
  {
    id: 'dev_sonyliv_completed_1',
    provider: 'SONYLIV',
    title: 'Novak Djokovic vs Carlos Alcaraz',
    tournamentName: 'Australian Open Final',
    category: 'TENNIS',
    status: 'COMPLETED',
    startTime: Date.now() - 48 * 3600 * 1000,
    posterUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'Novak Djokovic',
      score: '3'
    },
    awayTeam: {
      name: 'Carlos Alcaraz',
      score: '2'
    },
    streamSupportedInApp: false,
    externalWebUrl: 'https://www.sonyliv.com',
    lastUpdated: Date.now()
  },

  // --- TATA PLAY ---
  {
    id: 'dev_tataplay_live_1',
    provider: 'TATAPLAY',
    title: 'Monaco Grand Prix - Main Race',
    tournamentName: 'Formula 1 World Championship 2025',
    category: 'RACING',
    status: 'LIVE',
    startTime: Date.now() - 50 * 60 * 1000,
    posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'Verstappen (Red Bull)',
      score: 'Lap 42/78'
    },
    awayTeam: {
      name: 'Leclerc (Ferrari)',
      score: '+1.824s'
    },
    venue: 'Circuit de Monaco, Monte Carlo',
    streamSupportedInApp: true,
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    externalWebUrl: 'https://www.tataplay.com',
    externalAppDeepLink: 'tataplay://live/dev_f1',
    lastUpdated: Date.now()
  },

  // --- WILLOW ---
  {
    id: 'dev_willow_live_1',
    provider: 'WILLOW',
    title: 'England vs Australia',
    tournamentName: 'The Ashes Test Series',
    category: 'CRICKET',
    status: 'LIVE',
    startTime: Date.now() - 2 * 3600 * 1000,
    posterUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'England',
      shortName: 'ENG',
      score: '284 & 142/3'
    },
    awayTeam: {
      name: 'Australia',
      shortName: 'AUS',
      score: '312'
    },
    venue: 'Lord\'s Cricket Ground, London',
    streamSupportedInApp: true,
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    externalWebUrl: 'https://www.willow.tv',
    externalAppDeepLink: 'willow://live/dev_ashes',
    lastUpdated: Date.now()
  },
  {
    id: 'dev_willow_upcoming_1',
    provider: 'WILLOW',
    title: 'India vs South Africa - 1st ODI',
    tournamentName: 'Bilateral Series 2025',
    category: 'CRICKET',
    status: 'UPCOMING',
    startTime: Date.now() + 12 * 3600 * 1000,
    posterUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    homeTeam: {
      name: 'India',
      shortName: 'IND'
    },
    awayTeam: {
      name: 'South Africa',
      shortName: 'SA'
    },
    venue: 'Eden Gardens, Kolkata',
    streamSupportedInApp: true,
    externalWebUrl: 'https://www.willow.tv',
    externalAppDeepLink: 'willow://live/dev_ind_sa',
    lastUpdated: Date.now()
  }
];

export const DEV_SPORTS_CHANNELS_FIXTURES: SportsChannel[] = [
  {
    id: 'dev_ch_fancode_live',
    provider: 'FANCODE',
    name: 'FanCode Live HD',
    logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
    category: 'CRICKET',
    currentProgram: 'Caribbean Premier League Live',
    streamSupportedInApp: true,
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    externalWebUrl: 'https://www.fancode.com'
  },
  {
    id: 'dev_ch_sony_sports_ten_1',
    provider: 'SONYLIV',
    name: 'Sony Sports Ten 1 HD',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    category: 'FOOTBALL',
    currentProgram: 'UEFA Champions League Live',
    streamSupportedInApp: true,
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    externalWebUrl: 'https://www.sonyliv.com'
  },
  {
    id: 'dev_ch_tata_sports_1',
    provider: 'TATAPLAY',
    name: 'Tata Play Sports HD',
    logoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=120&q=80',
    category: 'RACING',
    currentProgram: 'Formula 1 Live Practice',
    streamSupportedInApp: true,
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    externalWebUrl: 'https://www.tataplay.com'
  },
  {
    id: 'dev_ch_willow_hd',
    provider: 'WILLOW',
    name: 'Willow Cricket HD',
    logoUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=120&q=80',
    category: 'CRICKET',
    currentProgram: 'The Ashes 2025 Live',
    streamSupportedInApp: true,
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    externalWebUrl: 'https://www.willow.tv'
  }
];

