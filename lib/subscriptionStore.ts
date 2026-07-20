import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PlanId } from './types';

/**
 * Subscription / entitlement layer, wired to RevenueCat.
 *
 * Setup before publishing:
 *   1. Add your RevenueCat public SDK keys as env vars (see below).
 *   2. In the RevenueCat dashboard create an entitlement `pro`, an offering
 *      `default`, and two packages: monthly ($rc_monthly) and annual
 *      ($rc_annual). Attach your App Store / Play Store products to them.
 *   3. Products/prices are pulled live from the offering, so the paywall always
 *      shows real localized pricing.
 *
 * The rest of the app only reads `isPro`, so no UI changes are needed when the
 * real store is connected.
 */

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

const ENTITLEMENT_ID = 'pro';

/** Map a RevenueCat package to our internal PlanId. */
function planIdForPackage(pkg: PurchasesPackage): PlanId | null {
  const id = pkg.identifier.toLowerCase();
  const type = pkg.packageType;
  if (type === 'ANNUAL' || id.includes('annual') || id.includes('year')) return 'yearly';
  if (type === 'MONTHLY' || id.includes('month')) return 'monthly';
  return null;
}

function isProFromInfo(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

function activePlanFromInfo(info: CustomerInfo): PlanId | null {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  if (!entitlement) return null;
  return entitlement.productIdentifier.toLowerCase().includes('year') ? 'yearly' : 'monthly';
}

interface SubscriptionState {
  isPro: boolean;
  activePlan: PlanId | null;
  purchasedAt: number | null;
  isProcessing: boolean;
  hydrated: boolean;
  configured: boolean;
  offering: PurchasesOffering | null;
  packages: PurchasesPackage[];
  configure: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (planId: PlanId) => Promise<boolean>;
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
      configured: false,
      offering: null,
      packages: [],

      configure: async () => {
        if (get().configured) return;
        const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
        if (!apiKey) {
          // Keys not set yet. Leave the store in a safe, non-crashing state so
          // the app still runs in preview / before publishing.
          set({ configured: false });
          return;
        }
        try {
          Purchases.configure({ apiKey });
          set({ configured: true });

          // Reflect current entitlement immediately, then keep in sync.
          const info = await Purchases.getCustomerInfo();
          set({ isPro: isProFromInfo(info), activePlan: activePlanFromInfo(info) });

          Purchases.addCustomerInfoUpdateListener((updated) => {
            set({ isPro: isProFromInfo(updated), activePlan: activePlanFromInfo(updated) });
          });

          await get().loadOfferings();
        } catch {
          set({ configured: false });
        }
      },

      loadOfferings: async () => {
        if (!get().configured) return;
        try {
          const offerings = await Purchases.getOfferings();
          const current = offerings.current;
          if (current) {
            set({ offering: current, packages: current.availablePackages });
          }
        } catch {
          // Keep any previously loaded offering; paywall falls back to catalog.
        }
      },

      purchase: async (planId) => {
        if (!get().configured) {
          throw new Error('Purchases are not available yet. Please try again later.');
        }
        const pkg = get().packages.find((p) => planIdForPackage(p) === planId);
        if (!pkg) {
          throw new Error('That plan is not available right now.');
        }
        set({ isProcessing: true });
        try {
          const { customerInfo } = await Purchases.purchasePackage(pkg);
          const pro = isProFromInfo(customerInfo);
          set({
            isPro: pro,
            activePlan: pro ? planId : get().activePlan,
            purchasedAt: pro ? Date.now() : get().purchasedAt,
          });
          return pro;
        } finally {
          set({ isProcessing: false });
        }
      },

      restore: async () => {
        if (!get().configured) return get().isPro;
        set({ isProcessing: true });
        try {
          const info = await Purchases.restorePurchases();
          const pro = isProFromInfo(info);
          set({ isPro: pro, activePlan: activePlanFromInfo(info) });
          return pro;
        } catch {
          return get().isPro;
        } finally {
          set({ isProcessing: false });
        }
      },

      // Store subscriptions are cancelled through the App Store / Play Store, not
      // in-app. This only clears local demo state; real entitlement always comes
      // from RevenueCat on next launch.
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

/** Live localized price string for a plan, or null if offerings aren't loaded. */
export function priceForPlan(packages: PurchasesPackage[], planId: PlanId): string | null {
  const pkg = packages.find((p) => planIdForPackage(p) === planId);
  return pkg?.product.priceString ?? null;
}
