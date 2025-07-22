export interface QuarterPeriod {
  id: string;
  label: string;
  year: number;
  quarter?: number;
  start: string;
  end: string;
  isYear?: boolean;
}

export const generateQuarterPeriods = (games: Array<{ date: string }>): QuarterPeriod[] => {
  if (games.length === 0) return [];

  // Get all unique years from games
  const years = [...new Set(games.map(game => new Date(game.date).getFullYear()))].sort();
  
  const periods: QuarterPeriod[] = [];
  
  years.forEach(year => {
    // Add year total
    periods.push({
      id: `year-${year}`,
      label: `Total ${year}`,
      year,
      start: `${year}-01-01`,
      end: `${year}-12-31`,
      isYear: true
    });

    // Add quarters for this year
    const quarters = [
      { quarter: 1, label: `1º Trimestre ${year}`, start: `${year}-01-01`, end: `${year}-03-31` },
      { quarter: 2, label: `2º Trimestre ${year}`, start: `${year}-04-01`, end: `${year}-06-30` },
      { quarter: 3, label: `3º Trimestre ${year}`, start: `${year}-07-01`, end: `${year}-09-30` },
      { quarter: 4, label: `4º Trimestre ${year}`, start: `${year}-10-01`, end: `${year}-12-31` }
    ];

    // Only add quarters that have games
    quarters.forEach(q => {
      const hasGamesInQuarter = games.some(game => {
        const gameDate = new Date(game.date);
        const quarterStart = new Date(q.start);
        const quarterEnd = new Date(q.end);
        return gameDate >= quarterStart && gameDate <= quarterEnd;
      });

      if (hasGamesInQuarter) {
        periods.push({
          id: `${year}-q${q.quarter}`,
          label: q.label,
          year,
          quarter: q.quarter,
          start: q.start,
          end: q.end
        });
      }
    });
  });

  return periods.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year; // Most recent year first
    if (a.isYear && !b.isYear) return -1; // Year totals before quarters
    if (!a.isYear && b.isYear) return 1;
    if (a.quarter && b.quarter) return b.quarter - a.quarter; // Most recent quarter first
    return 0;
  });
};