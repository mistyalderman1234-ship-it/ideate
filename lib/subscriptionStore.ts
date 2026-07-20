import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PlanId } from './types';

/**
 * Subscription / entitlement layer for the WEB app, wired to Stripe Checkout.
 *
 * Flow (email-only, no accounts):
 *   1. User enters their email on the paywall and picks a plan.
 *   2. startCheckout() asks the `stripe-checkout` edge function for a Checkout
 *      Session URL and redirects the browser to Stripe.
 *   3. On return (?status=success) the paywall calls refreshStatus(), which
 *      queries Stripe (via the function) for an active subscription on that
 *      email and flips `isPro`.
 *   4. "Restore" is the same refreshStatus() by email — works on any device.
 *
 * The rest of the app only reads `isPro`, so no other UI depends on Stripe.
 * Prices are inline in the edge function (matches lib/catalog.ts).
 */

const BILT_URL = process.env.EXPO_PUBLIC_BILT_URL;
const BILT_ANON_KEY = process.env.EXPO_PUBLIC_BILT_ANON_KEY;

interface StatusResponse {
  active: boolean;
  plan: PlanId | null;
  since: number | null;
}

async function callFunction(body: Record<string, unknown>): Promise<unknown> {
  if (!BILT_URL || !BILT_ANON_KEY) {
    throw new Error('Payments are not available right now.');
  }
  const res = await fetch(`${BILT_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: BILT_ANON_KEY,
      Authorization: `Bearer ${BILT_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    const message =
      data !== null && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Something went wrong.';
    throw new Error(message);
  }
  return data;
}

function isCheckoutSessionResponse(value: unknown): value is { url: string } {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { url?: unknown }).url === 'string'
  );
}

export type KeyMode = 'live' | 'test' | 'unknown';

function isKeyModeResponse(value: unknown): value is { mode: KeyMode } {
  if (value === null || typeof value !== 'object') return false;
  const mode = (value as { mode?: unknown }).mode;
  return mode === 'live' || mode === 'test' || mode === 'unknown';
}

function isVerifyResponse(value: unknown): value is { verified: boolean } {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { verified?: unknown }).verified === 'boolean'
  );
}

function isStatusResponse(value: unknown): value is StatusResponse {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as { active?: unknown; plan?: unknown; since?: unknown };
  return (
    typeof candidate.active === 'boolean' &&
    (candidate.plan === null || typeof candidate.plan === 'string') &&
    (candidate.since === null || typeof candidate.since === 'number')
  );
}

function currentOrigin(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

interface SubscriptionState {
  isPro: boolean;
  activePlan: PlanId | null;
  purchasedAt: number | null;
  email: string | null;
  isProcessing: boolean;
  hydrated: boolean;
  setEmail: (email: string) => void;
  /** Report whether the server's Stripe key is live, test, or missing. */
  getKeyMode: () => Promise<KeyMode>;
  /** Email a 6-digit verification code to the given address. */
  sendCode: (email: string) => Promise<void>;
  /** Confirm the code. Resolves true when the email is verified. */
  verifyCode: (email: string, code: string) => Promise<boolean>;
  /** Create a Stripe Checkout session and redirect the browser to it. */
  startCheckout: (planId: PlanId, email: string) => Promise<void>;
  /** Re-check Stripe for an active subscription on the saved email. */
  refreshStatus: (emailOverride?: string) => Promise<boolean>;
  /** Clear local Pro state. Real cancellation happens in Stripe's portal. */
  cancel: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      activePlan: null,
      purchasedAt: null,
      email: null,
      isProcessing: false,
      hydrated: false,

      setEmail: (email) => set({ email: email.trim().toLowerCase() }),

      getKeyMode: async () => {
        try {
          const response = await callFunction({ action: 'key-mode' });
          return isKeyModeResponse(response) ? response.mode : 'unknown';
        } catch {
          return 'unknown';
        }
      },

      sendCode: async (email) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        await callFunction({ action: 'send-code', email: cleanEmail });
        set({ email: cleanEmail });
      },

      verifyCode: async (email, code) => {
        const cleanEmail = email.trim().toLowerCase();
        const response = await callFunction({
          action: 'verify-code',
          email: cleanEmail,
          code: code.trim(),
        });
        return isVerifyResponse(response) ? response.verified : false;
      },

      startCheckout: async (planId, email) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        set({ isProcessing: true, email: cleanEmail });
        try {
          const response = await callFunction({
            action: 'create-session',
            email: cleanEmail,
            plan: planId,
            origin: currentOrigin(),
          });
          if (!isCheckoutSessionResponse(response)) {
            throw new Error('Something went wrong.');
          }
          const { url } = response;
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.location.assign(url);
            // Navigation unloads the page; keep processing until then.
            return;
          }
          throw new Error('Subscriptions are available on the web app.');
        } finally {
          // If we didn't redirect (error/native), clear the spinner.
          set({ isProcessing: false });
        }
      },

      refreshStatus: async (emailOverride) => {
        const email = (emailOverride ?? get().email ?? '').trim().toLowerCase();
        if (!email.includes('@')) return get().isPro;
        set({ isProcessing: true });
        try {
          const response = await callFunction({
            action: 'check-status',
            email,
          });
          if (!isStatusResponse(response)) {
            return get().isPro;
          }
          set({
            isPro: response.active,
            activePlan: response.plan,
            purchasedAt: response.since,
            email,
          });
          return response.active;
        } catch {
          return get().isPro;
        } finally {
          set({ isProcessing: false });
        }
      },

      cancel: () => set({ isPro: false, activePlan: null, purchasedAt: null }),
    }),
    {
      name: 'ai-business-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPro: state.isPro,
        activePlan: state.activePlan,
        purchasedAt: state.purchasedAt,
        email: state.email,
      }),
      onRehydrateStorage: () => () => {
        useSubscriptionStore.setState({ hydrated: true });
      },
    },
  ),
);
