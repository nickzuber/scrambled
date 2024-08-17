import { useEffect } from "react";
import { PersistedStorage } from "../constants/state";
import { seed as todaySeed } from "../utils/words-helper";

function getKeys() {
  return Object.keys(localStorage);
}

function deleteKey(key: string) {
  return localStorage.removeItem(key);
}

/**
 * Deletes all temporary keys in an idempotent manner; only deleting keys that
 * are not for the current day.
 */
export function clean() {
  const oldSeededKeys = getKeys()
    .filter(
      (key) =>
        // Note that we will purge any data that has our unique stamp (is data
        // associated with this game) AND has a seed divider.
        //
        // This does not mean all data in general is wiped, just ones that have
        // both of these markings.
        key.indexOf(PersistedStorage.Stamp) > -1 &&
        key.indexOf(PersistedStorage.SeedDivider) > -1,
    )
    .filter((key) => {
      const [seed] = key.split(PersistedStorage.SeedDivider);
      return seed !== todaySeed;
    });

  for (const oldKey of oldSeededKeys) {
    deleteKey(oldKey);
  }
}

/**
 * Deletes all temporary keys, regardless of what day it is.
 */
export function deleteEphemeralData() {
  const oldSeededKeys = getKeys().filter(
    (key) =>
      // Note that we will purge any data that has our unique stamp (is data
      // associated with this game) AND has a seed divider.
      //
      // This does not mean all data in general is wiped, just ones that have
      // both of these markings.
      key.indexOf(PersistedStorage.Stamp) > -1 &&
      key.indexOf(PersistedStorage.SeedDivider) > -1,
  );

  for (const oldKey of oldSeededKeys) {
    deleteKey(oldKey);
  }
}

export const useLocalStorageGC = () => {
  useEffect(() => clean(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};
