import { type Href, router } from 'expo-router';

/**
 * Go back when there is history, otherwise replace with a known route.
 *
 * Screens that can be opened directly (deep link, shared URL, refreshed web
 * tab) have no history to pop, so a plain router.back() leaves the user stuck.
 */
export function goBackOrReplace(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
