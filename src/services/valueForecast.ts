// src/services/valueForecast.ts
// Value forecasting service for PRIMUS OS

import { ValueEvent } from '../data/continuityData';

export interface ForecastBucket {
  horizon: '0-3' | '3-6' | '6-12' | '12+';
  totalValue: number;
  eventDensity: 'Stable' | 'Moderate' | 'High';
}

export const calculateForecast = (events: ValueEvent[]): ForecastBucket[] => {
  const buckets: Record<string, { total: number; count: number }> = {
    '0-3': { total: 0, count: 0 },
    '3-6': { total: 0, count: 0 },
    '6-12': { total: 0, count: 0 },
    '12+': { total: 0, count: 0 },
  };

  events.forEach(event => {
    const weightedValue = event.amount * event.probability;
    buckets[event.horizon].total += weightedValue;
    buckets[event.horizon].count += 1;
  });

  return Object.entries(buckets).map(([horizon, { total, count }]) => {
    let eventDensity: 'Stable' | 'Moderate' | 'High';
    if (count <= 1) eventDensity = 'Stable';
    else if (count <= 3) eventDensity = 'Moderate';
    else eventDensity = 'High';

    return {
      horizon: horizon as '0-3' | '3-6' | '6-12' | '12+',
      totalValue: total,
      eventDensity,
    };
  });
};

export const getTotalProjectedValue = (forecast: ForecastBucket[]): number => {
  return forecast.reduce((sum, bucket) => sum + bucket.totalValue, 0);
};