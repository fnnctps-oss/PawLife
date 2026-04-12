import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

const REVENUECAT_API_KEY_IOS = 'appl_YOUR_KEY_HERE';
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_KEY_HERE';

/**
 * Initialize RevenueCat -- call once at app startup.
 * Optionally pass a userId to link purchases with Firebase auth.
 */
export async function initRevenueCat(userId?: string): Promise<void> {
  try {
    const apiKey =
      Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    Purchases.configure({ apiKey, appUserID: userId ?? null });
  } catch (error) {
    console.error('[subscriptions] Failed to initialize RevenueCat:', error);
  }
}

/**
 * Fetch the current offerings and return the available packages.
 * Returns an empty array if no offerings are found.
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    console.error('[subscriptions] Failed to get offerings:', error);
    return [];
  }
}

/**
 * Purchase a specific package and return the updated CustomerInfo.
 * Throws on failure so callers can handle UI feedback.
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      // User cancelled -- not a real error, rethrow silently
      throw error;
    }
    console.error('[subscriptions] Purchase failed:', error);
    throw error;
  }
}

/**
 * Restore previously made purchases (e.g. after reinstall or new device).
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('[subscriptions] Restore purchases failed:', error);
    throw error;
  }
}

/**
 * Check the current user's subscription status by inspecting active entitlements.
 */
export async function checkSubscriptionStatus(): Promise<{
  isPremium: boolean;
  plan: 'free' | 'premium' | 'lifetime';
  expiryDate?: string;
}> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return mapCustomerInfo(customerInfo);
  } catch (error) {
    console.error('[subscriptions] Failed to check subscription status:', error);
    return { isPremium: false, plan: 'free' };
  }
}

/**
 * Map RevenueCat CustomerInfo to our internal subscription representation.
 */
function mapCustomerInfo(info: CustomerInfo): {
  isPremium: boolean;
  plan: 'free' | 'premium' | 'lifetime';
  expiryDate?: string;
} {
  const lifetime = info.entitlements.active['lifetime'];
  if (lifetime) {
    return {
      isPremium: true,
      plan: 'lifetime',
      expiryDate: undefined,
    };
  }

  const premium = info.entitlements.active['premium'];
  if (premium) {
    return {
      isPremium: true,
      plan: 'premium',
      expiryDate: premium.expirationDate ?? undefined,
    };
  }

  return { isPremium: false, plan: 'free' };
}
