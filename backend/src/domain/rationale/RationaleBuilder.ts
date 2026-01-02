/**
 * Primus OS Business Edition - Rationale Builder
 *
 * Generates structured decision rationale for the Decision Rationale Panel.
 * Template-based, deterministic approach (no LLM required).
 */

import { Relationship, Interaction, ContinuityGrade, Rationale } from '../../types';

export class RationaleBuilder {
  /**
   * Build complete rationale for a relationship
   */
  build(params: {
    relationship: Relationship;
    interactions: Interaction[];
    score: number;
    grade: ContinuityGrade;
  }): Rationale {
    const { relationship, interactions, score, grade } = params;

    return {
      recentActivity: this.buildRecentActivity(relationship, interactions),
      valueDrivers: this.buildValueDrivers(relationship, interactions, grade),
      riskConsiderations: this.buildRiskConsiderations(relationship, grade, interactions),
      recommendedNextStep: this.buildRecommendedNextStep(relationship, grade, interactions),
      governanceNote: this.buildGovernanceNote(relationship, grade),
    };
  }

  /**
   * Recent Activity section
   */
  private buildRecentActivity(relationship: Relationship, interactions: Interaction[]): string {
    if (!relationship.lastInteractionAt || interactions.length === 0) {
      return 'No recent recorded interactions. Relationship may be dormant or activity not yet captured in system.';
    }

    const lastInteraction = interactions
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0];

    const daysAgo = Math.round(
      (Date.now() - lastInteraction.occurredAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const timeDesc = this.formatTimeAgo(daysAgo);
    const context = this.inferInteractionContext(lastInteraction, relationship);

    return `Last contact: ${lastInteraction.type} · ${timeDesc} ago${context ? ` (${context})` : ''}.`;
  }

  /**
   * Value Drivers section
   */
  private buildValueDrivers(
    relationship: Relationship,
    interactions: Interaction[],
    grade: ContinuityGrade
  ): string {
    const parts: string[] = [];

    // Grade-based value assertion
    if (grade === 'AAA' || grade === 'AA') {
      parts.push(
        `${relationship.roleOrSegment} with consistent multi-period engagement and high relationship stability.`
      );
    } else if (grade === 'A') {
      parts.push(
        `${relationship.roleOrSegment} demonstrating stable engagement pattern and regular touchpoints.`
      );
    } else if (grade === 'BBB') {
      parts.push(
        `${relationship.roleOrSegment} with moderate engagement. Opportunity for relationship strengthening.`
      );
    } else {
      parts.push(
        `${relationship.roleOrSegment} with historical value potential. Engagement reactivation may unlock dormant equity.`
      );
    }

    // Interaction density signal
    const last12Mo = interactions.filter((i) => {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      return i.occurredAt >= cutoff;
    });

    if (last12Mo.length >= 6) {
      parts.push('Regular interaction cadence indicates active relationship management.');
    } else if (last12Mo.length >= 3) {
      parts.push('Quarterly engagement pattern established.');
    }

    // Value event signals
    const highValueEvents = interactions.filter((i) => i.valueEventWeight >= 3);
    if (highValueEvents.length > 0) {
      parts.push(
        `${highValueEvents.length} high-value interaction${highValueEvents.length > 1 ? 's' : ''} recorded, indicating strong opportunity signals.`
      );
    }

    return parts.join(' ');
  }

  /**
   * Risk Considerations section
   */
  private buildRiskConsiderations(
    relationship: Relationship,
    grade: ContinuityGrade,
    interactions: Interaction[]
  ): string {
    const parts: string[] = [];

    // Continuity assessment
    if (grade === 'AAA') {
      parts.push('Current continuity is exceptional. Score has maintained AAA-level stability.');
    } else if (grade === 'AA' || grade === 'A') {
      parts.push('Continuity is strong. Monitor for any engagement drift in coming periods.');
    } else if (grade === 'BBB') {
      parts.push(
        'Moderate continuity risk. Contact frequency has decreased. Proactive engagement recommended.'
      );
    } else if (grade === 'BB') {
      parts.push(
        'Relationship has entered low-activity status. Risk of permanent disengagement if not addressed.'
      );
    } else {
      parts.push(
        'Dormant relationship status. Significant risk of relationship equity loss without reactivation.'
      );
    }

    // Recency risk
    if (relationship.lastInteractionAt) {
      const daysAgo = Math.round(
        (Date.now() - relationship.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysAgo > 180) {
        parts.push('No engagement in last 180 days. Immediate outreach recommended to prevent attrition.');
      } else if (daysAgo > 90) {
        parts.push('Engagement gap detected. Consider value-first reactivation sequence.');
      }
    }

    // Interaction trend
    const last6Mo = this.getInteractionsInWindow(interactions, 180);
    const prior6Mo = this.getInteractionsInWindow(interactions, 360, 180);

    if (prior6Mo.length > 0 && last6Mo.length < prior6Mo.length * 0.5) {
      parts.push('Contact frequency declining compared to prior period. Trend monitoring advised.');
    }

    return parts.join(' ');
  }

  /**
   * Recommended Next Step section
   */
  private buildRecommendedNextStep(
    relationship: Relationship,
    grade: ContinuityGrade,
    interactions: Interaction[]
  ): string {
    if (grade === 'AAA' || grade === 'AA') {
      return 'Prepare a continuity confirmation note focused on service consistency and forward planning. Maintain regular touchpoint cadence.';
    }

    if (grade === 'A') {
      return 'Prepare value update focused on market insights or service enhancements relevant to relationship context.';
    }

    if (grade === 'BBB') {
      return 'Prepare reengagement sequence. Focus on delivering value-first content aligned with relationship segment needs.';
    }

    if (grade === 'BB') {
      return 'Prepare reactivation outreach starting with low-commitment value delivery (market insights, industry trends). Avoid transactional messaging.';
    }

    // B grade (dormant)
    return 'Prepare dormant reactivation framework. Consider multi-touch sequence: value content → personalized insight → relationship renewal offer. Route through Governance review before initialization.';
  }

  /**
   * Governance Note section
   */
  private buildGovernanceNote(relationship: Relationship, grade: ContinuityGrade): string {
    const basNote =
      'Adding this relationship to the Approval Batch will route outreach through firm-level messaging standards.';

    if (grade === 'BB' || grade === 'B') {
      return `${basNote} Dormant reactivation requires additional compliance review and senior leadership approval before outreach initialization.`;
    }

    if (grade === 'BBB') {
      return `${basNote} All re-engagement communications must align with firm governance protocols for contact frequency and messaging tone.`;
    }

    return `${basNote} Standard approval workflow applies.`;
  }

  // Helper methods

  private formatTimeAgo(days: number): string {
    if (days === 0) return 'today';
    if (days === 1) return '1 day';
    if (days <= 30) return `${days} days`;
    if (days <= 90) {
      const months = Math.round(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    return `${Math.round(days / 30)}+ months`;
  }

  private inferInteractionContext(interaction: Interaction, relationship: Relationship): string {
    // Simple context inference based on interaction notes or type
    if (interaction.notes) {
      const notes = interaction.notes.toLowerCase();
      if (notes.includes('renewal')) return 'renewal discussion';
      if (notes.includes('pipeline')) return 'pipeline check-in';
      if (notes.includes('referral')) return 'referral conversation';
      if (notes.includes('review')) return 'portfolio review';
    }

    // Default context by type
    if (interaction.type === 'MEETING') return 'scheduled meeting';
    if (interaction.type === 'CALL') return 'phone conversation';
    if (interaction.type === 'EMAIL') return 'email correspondence';

    return '';
  }

  private getInteractionsInWindow(
    interactions: Interaction[],
    windowDays: number,
    offsetDays = 0
  ): Interaction[] {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (windowDays + offsetDays));
    const end = new Date(now);
    end.setDate(end.getDate() - offsetDays);

    return interactions.filter((i) => i.occurredAt >= start && i.occurredAt <= end);
  }
}
