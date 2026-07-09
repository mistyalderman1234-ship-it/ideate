import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PlanId } from './types';

/**
 * Subscription / entitlement layer.
 *
 * This is a mock of a RevenueCat integration so the paywall and Pro gating are
 * fully testable now. To wire real RevenueCat later:
 *   1. Install react-native-purchases and add your public SDK key as a secret.
 *   2. In configure(), call Purchases.configure({ apiKey }).
 *   3. In purchase(), call Purchases.purchasePackage(pkg) and read
 *      customerInfo.entitlements.active['pro'] to set `isPro`.
 *   4. In restore(), call Purchases.restorePurchases().
 * The rest of the app only reads `isPro`, so no UI changes are needed.
 */

interface SubscriptionState {
  isPro: boolean;
  activePlan: PlanId | null;
  purchasedAt: number | null;
  isProcessing: boolean;
  hydrated: boolean;
  purchase: (planId: PlanId) => Promise<void>;
  restore: () => Promise<boolean>;
  cancel: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      activePlan: null,
      purchasedAt: null,
      isProcessing: false,
      hydrated: false,
      purchase: async (planId) => {
        set({ isProcessing: true });
        // Mock purchase flow. Replace with Purchases.purchasePackage(...) later.
        await new Promise((resolve) => setTimeout(resolve, 1200));
        set({
          isPro: true,
          activePlan: planId,
          purchasedAt: Date.now(),
          isProcessing: false,
        });
      },
      restore: async () => {
        set({ isProcessing: true });
        await new Promise((resolve) => setTimeout(resolve, 900));
        set({ isProcessing: false });
        return get().isPro;
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
      }),
      onRehydrateStorage: () => () => {
        useSubscriptionStore.setState({ hydrated: true });
      },
    },
  ),
);
