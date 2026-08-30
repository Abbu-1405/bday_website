import { CatDefinition, CatProgressionProgress, UserCatMemory } from '../../types/catMeme';
import { CatEventManager } from './CatEventManager';
import { CatMemoryRepository } from './CatMemoryRepository';
import { FAMOUS_CAT_REGISTRY, getCatDefinition } from './catRegistry';
import {
  calculateLevelProgress,
  RELATIONSHIP_POINTS,
  resolveRelationshipAcknowledgement,
} from './CatRelationshipScorer';

/**
 * Singleton service orchestrating cat memory, relationship progression, and interactive actions.
 */
export class CatMemoryService {
  private static repository: CatMemoryRepository = CatMemoryRepository.getInstance();
  private static recordedEncountersInCurrentSpawn: Set<string> = new Set();

  /**
   * Records a visible encounter when a cat appears on screen.
   * Prevents duplicate increments for the same active spawn instance.
   */
  public static recordEncounter(spawnInstanceId: string, catId: string): UserCatMemory {
    if (this.recordedEncountersInCurrentSpawn.has(spawnInstanceId)) {
      return this.repository.getMemory(catId);
    }
    this.recordedEncountersInCurrentSpawn.add(spawnInstanceId);

    // Keep active set compact
    if (this.recordedEncountersInCurrentSpawn.size > 50) {
      const first = Array.from(this.recordedEncountersInCurrentSpawn)[0];
      this.recordedEncountersInCurrentSpawn.delete(first);
    }

    return this.repository.recordEncounter(catId);
  }

  /**
   * Records a meaningful Starlit Letters interaction with a cat.
   */
  public static async recordInteraction(
    catId: string,
    eventType: string,
    impactPoints?: number,
    customSummary?: string
  ): Promise<UserCatMemory> {
    const points = impactPoints !== undefined ? impactPoints : (RELATIONSHIP_POINTS as any)[eventType] || 10;
    const catDef = getCatDefinition(catId);
    const summary = customSummary || `Interacted during ${eventType.toLowerCase().replace(/_/g, ' ')}`;

    return await this.repository.recordInteraction(catId, {
      eventType,
      impactPoints: points,
      significance: points >= 20 ? 'major' : 'meaningful',
      summary,
    });
  }

  /**
   * Records a positive user interaction (Petting the cat).
   * Awards relationship points and triggers a gentle happy reaction.
   */
  public static async recordPet(catId: string): Promise<UserCatMemory> {
    const catDef = getCatDefinition(catId);
    const memory = await this.repository.recordInteraction(catId, {
      eventType: 'INTERACTIVE_PET',
      impactPoints: RELATIONSHIP_POINTS.INTERACTIVE_PET,
      significance: 'meaningful',
      summary: `Petted ${catDef.displayName}`,
    });

    const levelQuote = resolveRelationshipAcknowledgement(catDef, memory.relationshipLevel);
    CatEventManager.emit('REACTION', {
      type: 'excited',
      catId,
      caption: levelQuote || `*Purrs contentedly* 🐾 (+${RELATIONSHIP_POINTS.INTERACTIVE_PET} bond)`,
      duration: 3500,
      overrideActive: true,
    });

    return memory;
  }

  /**
   * Records giving a treat to the cat.
   */
  public static async recordTreat(catId: string): Promise<UserCatMemory> {
    const catDef = getCatDefinition(catId);
    const memory = await this.repository.recordInteraction(catId, {
      eventType: 'INTERACTIVE_TREAT',
      impactPoints: RELATIONSHIP_POINTS.INTERACTIVE_TREAT,
      significance: 'meaningful',
      summary: `Gave a delicious treat to ${catDef.displayName}`,
    });

    CatEventManager.emit('REACTION', {
      type: 'excited',
      catId,
      caption: `*Munch munch munch!* Thank you! 🍪 (+${RELATIONSHIP_POINTS.INTERACTIVE_TREAT} bond)`,
      duration: 4000,
      overrideActive: true,
    });

    return memory;
  }

  /**
   * Records a user dismissal action (shooing the cat away).
   * Decreases relationship points and triggers a displeased or startled reaction.
   */
  public static async recordDismissal(catId: string): Promise<UserCatMemory> {
    const catDef = getCatDefinition(catId);
    const memory = await this.repository.recordInteraction(catId, {
      eventType: 'INTERACTIVE_DISMISS',
      impactPoints: RELATIONSHIP_POINTS.INTERACTIVE_DISMISS,
      significance: 'minor',
      summary: `Politely asked ${catDef.displayName} to leave`,
      isDispleased: true,
    });

    CatEventManager.emit('REACTION', {
      type: 'surprised',
      catId,
      caption: `*Scampers away awkwardly...* (${RELATIONSHIP_POINTS.INTERACTIVE_DISMISS} bond)`,
      duration: 2000,
      overrideActive: true,
    });

    return memory;
  }

  /**
   * Retrieves the current memory document for a cat.
   */
  public static getCatMemory(catId: string): UserCatMemory {
    return this.repository.getMemory(catId);
  }

  /**
   * Retrieves all known cat memories.
   */
  public static getAllMemories(): Record<string, UserCatMemory> {
    return this.repository.getAllMemories();
  }

  /**
   * Calculates progress details for UI presentation.
   */
  public static getProgressionProgress(catId: string): CatProgressionProgress {
    const catDef = getCatDefinition(catId);
    const memory = this.getCatMemory(catId);
    return calculateLevelProgress(catDef, memory.relationshipPoints);
  }

  /**
   * Subscribes to memory updates.
   */
  public static subscribe(listener: (memories: Record<string, UserCatMemory>) => void): () => void {
    return this.repository.subscribe(listener);
  }
}
