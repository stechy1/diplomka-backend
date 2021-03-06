import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';

import { ExperimentAssets } from '@stechy1/diplomka-share';

import { ObjectDiff } from '@diplomka-backend/stim-lib-common';

/**
 * Rozhraní definující funkce, kterými budou disponovat jednotlivé repozitáře
 *
 * @E Základní implementace experimentu
 * @T Konkrétní implementace experimentu
 */
export interface CustomExperimentRepository<E, T> {
  /**
   * Vrátí jeden konkrétní experiment
   *
   * @param record Základní experiment
   */
  one(record: E): Promise<T | undefined>;

  /**
   * Vloží konkrétní experiment do databáze
   *
   * @param record Konkrétní experiment
   */
  insert(record: T): Promise<InsertResult>;

  /**
   * Aktualizuje konkrétní experiment v databázi
   *
   * @param record Konkrétní experiment
   * @param diff Rozdílné hodnoty v experimentu
   */
  update(record: T, diff: ObjectDiff): Promise<UpdateResult | void>;

  /**
   * Odstraní experiment z databáze
   *
   * @param id ID experimentu, který se má odstranit
   */
  delete(id: number): Promise<DeleteResult>;

  /**
   * Získá informaci o použitých multimediálních výstupech
   *
   * @param record Konkrétní experiment
   */
  outputMultimedia(record: T): ExperimentAssets;
}
