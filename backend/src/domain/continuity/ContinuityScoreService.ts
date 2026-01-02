/**
 * Primus OS Business Edition - Continuity Score Service
 *
 * Calculates relationship continuity scores based on:
 * - Recency of contact (40%)
 * - Frequency of interaction (30%)
 * - Value event signals (20%)
 * - Stability factor (10%)
 */

import { Relationship, Interaction, ContinuityGrade, ScoreResult } from '../../types';

export class ContinuityScoreService {
  /**
   * Calculate continuity score for a relationship
   */
  async calculateForRelationship(
    relationship: Relationship,
    interactions: Interaction[]
  ): Promise<ScoreResult> {
    const now = new Date();

    // Sort interactions by date (most recent first)
    const sortedInteractions = [...interactions].sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
    );

    const lastInteraction = sortedInteractions[0];

    // Calculate component scores
    const recencyScore = this.computeRecencyScore(lastInteraction?.occurredAt, now);
    const frequencyScore = this.computeFrequencyScore(interactions, now);
    const valueScore = this.computeValueScore(interactions);
    const stabilityScore = 5; // TODO: integrate snapshots for volatility analysis

    // Total score (clamped 0-100)
    const total = Math.max(
      0,
      Math.min(100, recencyScore + frequencyScore + valueScore + stabilityScore)
    );

    const grade = this.mapScoreToGrade(total);
    const reasonSummary = this.buildReasonSummary(total, grade, {
      lastInteraction,
      interactionCount: interactions.length,
      valueScore,
      recencyScore,
      frequencyScore,
    });

    return { score: total, grade, reasonSummary };
  }

  /**
   * Recency scoring: 0-40 points based on last interaction age
   */
  private computeRecencyScore(lastInteractionDate?: Date, now = new Date()): number {
    if (!lastInteractionDate) return 5; // Minimal points for no interactions

    const days = (now.getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24);

    if (days <= 30) return 40;
    if (days <= 90) return 30;
    if (days <= 180) return 20;
    if (days <= 365) return 10;
    return 5;
  }

  /**
   * Frequency scoring: 0-30 points based on interaction volume (last 12 months)
   */
  private computeFrequencyScore(interactions: Interaction[], now = new Date()): number {
    const cutoff = new Date(now);
    cutoff.setFullYear(cutoff.getFullYear() - 1);

    const count = interactions.filter((i) => i.occurredAt >= cutoff).length;

    if (count >= 12) return 30; // Monthly+ cadence
    if (count >= 6) return 24;  // Bi-monthly
    if (count >= 3) return 18;  // Quarterly
    if (count >= 1) return 10;  // Annual
    return 0;
  }

  /**
   * Value event scoring: 0-20 points based on weighted interaction quality
   */
  private computeValueScore(interactions: Interaction[]): number {
    const raw = interactions.reduce((sum, i) => sum + (i.valueEventWeight ?? 0), 0);
    // Cap at 20 (max value score)
    return Math.min(raw, 20);
  }

  /**
   * Map numeric score to letter grade
   */
  private mapScoreToGrade(score: number): ContinuityGrade {
    if (score >= 90) return 'AAA';
    if (score >= 80) return 'AA';
    if (score >= 70) return 'A';
    if (score >= 60) return 'BBB';
    if (score >= 45) return 'BB';
    return 'B';
  }

  /**
   * Build human-readable reason summary for audit trail
   */
  private buildReasonSummary(
    score: number,
    grade: ContinuityGrade,
    context: {
      lastInteraction?: Interaction;
      interactionCount: number;
      valueScore: number;
      recencyScore: number;
      frequencyScore: number;
    }
  ): string {
    const parts: string[] = [];

    parts.push(`Score ${score}/100 (${grade}).`);

    if (context.lastInteraction) {
      const recencyDesc = this.describeRecency(context.lastInteraction.occurredAt);
      parts.push(
        `Recent interaction: ${context.lastInteraction.type} ${recencyDesc} ago (${context.recencyScore} pts).`
      );
    } else {
      parts.push('No recorded interactions in the current period.');
    }

    parts.push(
      `Interaction volume (12 months): ${context.interactionCount} (${context.frequencyScore} pts).`
    );
    parts.push(`Value events score: ${context.valueScore}/20 pts.`);

    // Add grade context
    if (grade === 'AAA' || grade === 'AA') {
      parts.push('High stability. Strong relationship continuity.');
    } else if (grade === 'A') {
      parts.push('Stable relationship with regular engagement.');
    } else if (grade === 'BBB') {
      parts.push('Moderate engagement. Monitor for strengthening opportunities.');
    } else if (grade === 'BB') {
      parts.push('Limited recent activity. Consider reactivation strategy.');
    } else {
      parts.push('Dormant relationship. Evaluate continuity value.');
    }

    return parts.join(' ');
  }

  /**
   * Format recency in human-readable form
   */
  private describeRecency(date: Date): string {
    const days = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return '1 day';
    if (days <= 30) return `${days} days`;
    if (days <= 90) {
      const months = Math.round(days / 30);
      return months === 1 ? '1 month' : `${months} months`;
    }
    return `${Math.round(days / 30)}+ months`;
  }

  /**
   * Batch calculate scores for multiple relationships
   */
  async calculateBatch(
    relationships: Relationship[],
    interactionsByRelationship: Map<string, Interaction[]>
  ): Promise<Map<string, ScoreResult>> {
    const results = new Map<string, ScoreResult>();

    for (const rel of relationships) {
      const interactions = interactionsByRelationship.get(rel.id) || [];
      const result = await this.calculateForRelationship(rel, interactions);
      results.set(rel.id, result);
    }

    return results;
  }
}
