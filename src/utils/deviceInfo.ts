import { DeviceCategory, DeviceInfo } from '../types/tracking';

/**
 * Parses user agent into normalized browser name and version.
 */
function parseBrowser(ua: string): { browser: string; version?: string } {
  if (!ua) return { browser: 'Unknown' };

  // Edge / Edg
  const edgeMatch = ua.match(/Edg(?:e)?\/([0-9.]+)/i);
  if (edgeMatch) return { browser: 'Microsoft Edge', version: edgeMatch[1] };

  // Opera / OPR
  const operaMatch = ua.match(/(?:OPR|Opera)\/([0-9.]+)/i);
  if (operaMatch) return { browser: 'Opera', version: operaMatch[1] };

  // Samsung Internet
  const samsungMatch = ua.match(/SamsungBrowser\/([0-9.]+)/i);
  if (samsungMatch) return { browser: 'Samsung Internet', version: samsungMatch[1] };

  // Chrome
  const chromeMatch = ua.match(/Chrome\/([0-9.]+)/i);
  if (chromeMatch && !ua.includes('Chromium')) {
    return { browser: 'Chrome', version: chromeMatch[1] };
  }

  // Firefox
  const firefoxMatch = ua.match(/Firefox\/([0-9.]+)/i);
  if (firefoxMatch) return { browser: 'Firefox', version: firefoxMatch[1] };

  // Safari (ensure not Chrome masquerading as Safari)
  const safariMatch = ua.match(/Version\/([0-9.]+).*Safari/i);
  if (safariMatch) return { browser: 'Safari', version: safariMatch[1] };

  // Generic Safari fallback
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    return { browser: 'Safari' };
  }

  return { browser: 'Other' };
}

/**
 * Parses user agent into normalized operating system and version.
 */
function parseOperatingSystem(ua: string): { os: string; version?: string } {
  if (!ua) return { os: 'Unknown' };

  // iOS (iPhone / iPad / iPod)
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS ([0-9_]+)/i);
    return {
      os: 'iOS',
      version: match ? match[1].replace(/_/g, '.') : undefined,
    };
  }

  // Android
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android ([0-9.]+)/i);
    return {
      os: 'Android',
      version: match ? match[1] : undefined,
    };
  }

  // macOS
  if (/Mac OS X/i.test(ua)) {
    const match = ua.match(/Mac OS X ([0-9_.]+)/i);
    return {
      os: 'macOS',
      version: match ? match[1].replace(/_/g, '.') : undefined,
    };
  }

  // Windows
  if (/Windows/i.test(ua)) {
    if (/Windows NT 10.0/i.test(ua)) return { os: 'Windows', version: '10/11' };
    if (/Windows NT 6.3/i.test(ua)) return { os: 'Windows', version: '8.1' };
    if (/Windows NT 6.2/i.test(ua)) return { os: 'Windows', version: '8' };
    if (/Windows NT 6.1/i.test(ua)) return { os: 'Windows', version: '7' };
    return { os: 'Windows' };
  }

  // Chrome OS
  if (/CrOS/i.test(ua)) return { os: 'Chrome OS' };

  // Linux
  if (/Linux/i.test(ua)) return { os: 'Linux' };

  return { os: 'Unknown' };
}

/**
 * Determines device category (mobile, tablet, desktop, unknown)
 */
function determineDeviceCategory(ua: string): DeviceCategory {
  if (typeof window === 'undefined') return 'unknown';

  const isTablet =
    /(?:iPad|PlayBook|Tablet|Kindle|Silk)|(?:Android(?!.*Mobile))/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua) && window.screen.width >= 768);

  if (isTablet) return 'tablet';

  const isMobile =
    /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (window.innerWidth < 768 && navigator.maxTouchPoints > 0);

  if (isMobile) return 'mobile';

  return 'desktop';
}

/**
 * Collects normalized, non-invasive device, screen, and browser metadata.
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      category: 'unknown',
      browser: 'Unknown',
      os: 'Unknown',
      userAgent: 'Unknown',
      language: 'en',
      timezone: 'UTC',
      screenWidth: 0,
      screenHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      devicePixelRatio: 1,
      touchCapable: false,
    };
  }

  const ua = navigator.userAgent || '';
  const browserInfo = parseBrowser(ua);
  const osInfo = parseOperatingSystem(ua);
  const category = determineDeviceCategory(ua);

  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    timezone = 'UTC';
  }

  const touchCapable =
    typeof navigator.maxTouchPoints === 'number'
      ? navigator.maxTouchPoints > 0
      : 'ontouchstart' in window;

  const orientation =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(orientation: portrait)').matches
        ? 'portrait'
        : 'landscape'
      : undefined;

  return {
    category,
    browser: browserInfo.browser,
    browserVersion: browserInfo.version,
    os: osInfo.os,
    osVersion: osInfo.version,
    userAgent: ua.substring(0, 500), // Bounded length to prevent excessive size
    language: (navigator.language || 'en').substring(0, 20),
    timezone: timezone.substring(0, 50),
    screenWidth: window.screen ? window.screen.width : window.innerWidth,
    screenHeight: window.screen ? window.screen.height : window.innerHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: Number((window.devicePixelRatio || 1).toFixed(2)),
    orientation,
    touchCapable,
  };
}
