import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  NotificationEventType,
  NotificationTemplate,
  TemplateVariables,
  RenderedTemplateResult,
} from '../types';

/**
 * Recognized, safe template placeholders
 */
export const ALLOWED_TEMPLATE_VARIABLES: { key: keyof TemplateVariables; label: string; description: string; sample: string }[] = [
  { key: 'userName', label: 'User Name', description: "Recipient's display name", sample: 'Noor' },
  { key: 'letterTitle', label: 'Letter Title', description: 'Title of the letter', sample: 'Starry Thoughts' },
  { key: 'openWhenTitle', label: 'Open-When Title', description: 'Title of the Open-When envelope', sample: 'When You Need a Smile' },
  { key: 'momentTitle', label: 'Moment Title', description: 'Title of the photo memory moment', sample: 'Sunset in Capri' },
  { key: 'secretTitle', label: 'Secret Title', description: 'Title of the secret vault memory', sample: 'Constellation of Wishes' },
  { key: 'scheduledDate', label: 'Scheduled Date', description: 'Target date or milestone time', sample: 'tomorrow at 9:00 AM' },
  { key: 'appName', label: 'App Name', description: 'Application brand name', sample: 'Starlit Letters' },
];

/**
 * Authoritative default templates for all 6 core categories
 */
export const DEFAULT_NOTIFICATION_TEMPLATES: Record<NotificationEventType, NotificationTemplate> = {
  LETTER_AVAILABLE: {
    id: 'tmpl_letter_available',
    category: 'LETTER_AVAILABLE',
    title: 'A little letter is waiting for you 💌',
    body: '{{letterTitle}} is waiting for you 💌',
    enabled: true,
    version: 1,
    variables: ['userName', 'letterTitle', 'appName'],
    actionRoute: '/letters',
    updatedAt: new Date().toISOString(),
    description: 'Triggered when a heartfelt letter is delivered to the inbox',
  },
  OPEN_WHEN_AVAILABLE: {
    id: 'tmpl_open_when_available',
    category: 'OPEN_WHEN_AVAILABLE',
    title: 'An Open When envelope is ready 📬',
    body: '{{openWhenTitle}} is waiting for you.',
    enabled: true,
    version: 1,
    variables: ['userName', 'openWhenTitle', 'scheduledDate', 'appName'],
    actionRoute: '/open-when',
    updatedAt: new Date().toISOString(),
    description: 'Triggered when a scheduled or condition-based Open When envelope unlocks',
  },
  SECRET_UNLOCKED: {
    id: 'tmpl_secret_unlocked',
    category: 'SECRET_UNLOCKED',
    title: 'A little secret has been unlocked ✨',
    body: '{{secretTitle}} has been revealed in your Secret Vault.',
    enabled: true,
    version: 1,
    variables: ['userName', 'secretTitle', 'appName'],
    actionRoute: '/secret-vault',
    updatedAt: new Date().toISOString(),
    description: 'Triggered when a secret vault entry is unlocked or solved',
  },
  MOMENT_AVAILABLE: {
    id: 'tmpl_moment_available',
    category: 'MOMENT_AVAILABLE',
    title: 'A new memory is waiting for you 🌙',
    body: 'A new moment has been added to your Starlit Letters.',
    enabled: true,
    version: 1,
    variables: ['userName', 'momentTitle', 'appName'],
    actionRoute: '/moments',
    updatedAt: new Date().toISOString(),
    description: 'Triggered when a photo or timeline moment memory is added',
  },
  BIRTHDAY: {
    id: 'tmpl_birthday',
    category: 'BIRTHDAY',
    title: 'Happy Birthday 🎂✨',
    body: 'Happy Birthday, {{userName}}! A starlit birthday message is waiting for you.',
    enabled: true,
    version: 1,
    variables: ['userName', 'scheduledDate', 'appName'],
    actionRoute: '/settings',
    updatedAt: new Date().toISOString(),
    description: 'Triggered on the annual birthday milestone',
  },
  GENERAL: {
    id: 'tmpl_general',
    category: 'GENERAL',
    title: 'A little message for you ✨',
    body: 'Something new is waiting for you in Starlit Letters.',
    enabled: true,
    version: 1,
    variables: ['userName', 'appName'],
    actionRoute: '/',
    updatedAt: new Date().toISOString(),
    description: 'General announcements and fallback messages',
  },
};

/**
 * In-memory template cache to avoid repetitive Firestore queries
 */
interface TemplateCacheEntry {
  template: NotificationTemplate;
  timestamp: number;
}
const templateCache = new Map<string, TemplateCacheEntry>();
const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Sample variable dictionary used for Admin preview and validation tests
 */
export const SAMPLE_TEMPLATE_VARIABLES: TemplateVariables = {
  userName: 'Noor',
  letterTitle: 'Midnight Starlight Thoughts',
  openWhenTitle: 'When You Need a Smile',
  momentTitle: 'Under the Evening Sky',
  secretTitle: 'The Hidden Constellation',
  scheduledDate: 'August 26',
  appName: 'Starlit Letters',
};

/**
 * Safe variable fallback mapping to prevent rendering 'undefined' or 'null'
 */
function getSafeVariableFallback(key: string, category?: NotificationEventType): string {
  switch (key) {
    case 'userName':
      return 'Friend';
    case 'letterTitle':
      return 'A little letter';
    case 'openWhenTitle':
      return 'Your Open When envelope';
    case 'momentTitle':
      return 'A new moment';
    case 'secretTitle':
      return 'A new secret';
    case 'scheduledDate':
      return 'today';
    case 'appName':
      return 'Starlit Letters';
    default:
      return '';
  }
}

/**
 * Pure, safe variable interpolation function.
 * Strictly prevents arbitrary JS execution, code injection, and unhandled placeholders.
 */
export function interpolateTemplateText(
  rawText: string,
  variables: TemplateVariables = {},
  category?: NotificationEventType
): string {
  if (!rawText) return '';

  // 1. Remove dangerous script or HTML tags
  let sanitized = rawText.replace(/<[^>]*>?/gm, '');

  // 2. Perform placeholder replacements for {{varName}} pattern
  sanitized = sanitized.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, varName) => {
    const rawVal = variables[varName];
    if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
      // Escape HTML entities if any
      return String(rawVal).replace(/<[^>]*>?/gm, '').trim();
    }
    // Safe context fallback
    return getSafeVariableFallback(varName, category);
  });

  // 3. Clean up any leftover malformed braces or duplicate spaces
  return sanitized.replace(/\s+/g, ' ').trim();
}

/**
 * Validates a NotificationTemplate object before saving
 */
export function validateNotificationTemplate(template: Partial<NotificationTemplate>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.title || template.title.trim().length === 0) {
    errors.push('Notification title cannot be empty.');
  } else if (template.title.length > 200) {
    errors.push('Notification title cannot exceed 200 characters.');
  }

  if (!template.body || template.body.trim().length === 0) {
    errors.push('Notification body cannot be empty.');
  } else if (template.body.length > 1000) {
    errors.push('Notification body cannot exceed 1000 characters.');
  }

  // Check for HTML/Script injection
  if (/<[a-z][\s\S]*>/i.test(template.title || '') || /<[a-z][\s\S]*>/i.test(template.body || '')) {
    errors.push('HTML tags and executable script code are forbidden in notification templates.');
  }

  // Check for unclosed or invalid braces
  const checkBraces = (str: string, field: string) => {
    const openCount = (str.match(/\{\{/g) || []).length;
    const closeCount = (str.match(/\}\}/g) || []).length;
    if (openCount !== closeCount) {
      errors.push(`${field} contains unclosed placeholder braces "{{...}}".`);
    }

    // Match all placeholders and ensure they are recognized
    const allowedKeys = new Set(ALLOWED_TEMPLATE_VARIABLES.map((v) => v.key));
    const matches = str.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
    for (const match of matches) {
      const varName = match[1];
      if (!allowedKeys.has(varName as keyof TemplateVariables)) {
        errors.push(`Unrecognized placeholder "{{${varName}}}" in ${field}. Supported variables: ${Array.from(allowedKeys).join(', ')}.`);
      }
    }
  };

  if (template.title) checkBraces(template.title, 'Title');
  if (template.body) checkBraces(template.body, 'Body');

  // Check action route safety
  if (template.actionRoute && (!template.actionRoute.startsWith('/') || template.actionRoute.includes('javascript:'))) {
    errors.push('Action route must be a valid relative path starting with "/".');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Fetches the active template for a given notification category.
 * If customized in Firestore, returns the customized version.
 * If disabled, missing, or offline, seamlessly falls back to the authoritative default.
 */
export async function getTemplateForCategory(
  category: NotificationEventType | string
): Promise<NotificationTemplate> {
  const normCategory = (category as NotificationEventType) || 'GENERAL';
  const defaultTemplate = DEFAULT_NOTIFICATION_TEMPLATES[normCategory] || DEFAULT_NOTIFICATION_TEMPLATES.GENERAL;
  const templateId = defaultTemplate.id;

  // Check in-memory cache
  const cached = templateCache.get(templateId);
  if (cached && Date.now() - cached.timestamp < TEMPLATE_CACHE_TTL_MS) {
    return cached.template;
  }

  if (!isFirebaseConfigured) {
    return defaultTemplate;
  }

  try {
    const docRef = doc(db, 'notificationTemplates', templateId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<NotificationTemplate>;
      const resolvedTemplate: NotificationTemplate = {
        id: templateId,
        category: normCategory,
        title: data.title || defaultTemplate.title,
        body: data.body || defaultTemplate.body,
        enabled: data.enabled !== false,
        version: typeof data.version === 'number' ? data.version : 1,
        variables: Array.isArray(data.variables) ? data.variables : defaultTemplate.variables,
        actionRoute: data.actionRoute || defaultTemplate.actionRoute,
        updatedAt: data.updatedAt || defaultTemplate.updatedAt,
        updatedBy: data.updatedBy,
        description: data.description || defaultTemplate.description,
      };

      templateCache.set(templateId, {
        template: resolvedTemplate,
        timestamp: Date.now(),
      });

      // If explicitly disabled by admin, fall back to default template for safe delivery
      if (!resolvedTemplate.enabled) {
        return defaultTemplate;
      }

      return resolvedTemplate;
    }
  } catch (err) {
    console.warn(`[NotificationTemplates] Notice fetching template for ${category}:`, err);
  }

  return defaultTemplate;
}

/**
 * Fetches all templates for Admin workspace management
 */
export async function fetchAllNotificationTemplates(): Promise<NotificationTemplate[]> {
  const categories: NotificationEventType[] = [
    'LETTER_AVAILABLE',
    'OPEN_WHEN_AVAILABLE',
    'SECRET_UNLOCKED',
    'MOMENT_AVAILABLE',
    'BIRTHDAY',
    'GENERAL',
  ];

  const resultMap = new Map<string, NotificationTemplate>();

  // Populate default base
  for (const cat of categories) {
    const def = DEFAULT_NOTIFICATION_TEMPLATES[cat];
    resultMap.set(def.id, { ...def });
  }

  if (!isFirebaseConfigured) {
    return Array.from(resultMap.values());
  }

  try {
    const colRef = collection(db, 'notificationTemplates');
    const snapshot = await getDocs(colRef);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Partial<NotificationTemplate>;
      const existing = resultMap.get(docSnap.id);
      if (existing) {
        resultMap.set(docSnap.id, {
          ...existing,
          ...data,
          id: docSnap.id,
          version: typeof data.version === 'number' ? data.version : existing.version,
          enabled: data.enabled !== false,
        });
      }
    });
  } catch (err) {
    console.warn('[NotificationTemplates] Notice loading template collection:', err);
  }

  return Array.from(resultMap.values());
}

/**
 * Saves or updates a notification template in Firestore (Admin only)
 * Automatically increments template version and clears local cache
 */
export async function saveNotificationTemplate(
  template: Partial<NotificationTemplate> & { id: string; category: NotificationEventType },
  adminUid: string
): Promise<{ success: boolean; template?: NotificationTemplate; error?: string; errors?: string[] }> {
  if (!template.id || !template.category) {
    return { success: false, error: 'Template ID and Category are required.' };
  }

  const validation = validateNotificationTemplate(template);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors[0] || 'Template validation failed.',
      errors: validation.errors,
    };
  }

  const def = DEFAULT_NOTIFICATION_TEMPLATES[template.category] || DEFAULT_NOTIFICATION_TEMPLATES.GENERAL;
  const current = await getTemplateForCategory(template.category);

  const newVersion = (current.version || 1) + 1;
  const now = new Date().toISOString();

  const finalTemplate: NotificationTemplate = {
    id: template.id,
    category: template.category,
    title: (template.title || def.title).trim(),
    body: (template.body || def.body).trim(),
    enabled: template.enabled !== false,
    version: newVersion,
    variables: template.variables || def.variables,
    actionRoute: template.actionRoute || def.actionRoute,
    updatedAt: now,
    updatedBy: adminUid,
    description: template.description || def.description,
  };

  if (!isFirebaseConfigured) {
    templateCache.set(template.id, { template: finalTemplate, timestamp: Date.now() });
    return { success: true, template: finalTemplate };
  }

  try {
    const docRef = doc(db, 'notificationTemplates', template.id);
    await setDoc(docRef, finalTemplate);

    templateCache.set(template.id, {
      template: finalTemplate,
      timestamp: Date.now(),
    });

    console.log(`[NotificationTemplates] Template ${template.id} saved with version ${newVersion}`);
    return { success: true, template: finalTemplate };
  } catch (err: any) {
    console.error('[NotificationTemplates] Error saving template:', err);
    return {
      success: false,
      error: err?.message || 'Failed to save template to database.',
    };
  }
}

/**
 * Resets a template back to its built-in default wording in Firestore
 */
export async function resetNotificationTemplate(
  templateId: string,
  adminUid: string
): Promise<{ success: boolean; template?: NotificationTemplate; error?: string }> {
  const matchingDefault = Object.values(DEFAULT_NOTIFICATION_TEMPLATES).find((t) => t.id === templateId);
  if (!matchingDefault) {
    return { success: false, error: 'Default template not found.' };
  }

  const current = await getTemplateForCategory(matchingDefault.category);
  const newVersion = (current.version || 1) + 1;

  const resetTemplate: NotificationTemplate = {
    ...matchingDefault,
    version: newVersion,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUid,
  };

  return saveNotificationTemplate(resetTemplate, adminUid);
}

/**
 * Centralized template rendering engine.
 * Given an event category and optional variable dictionary,
 * resolves active template, interpolates safe variables, and returns final immutable payload.
 */
export async function renderNotificationContent(params: {
  category: NotificationEventType | string;
  variables?: TemplateVariables;
  customTemplate?: NotificationTemplate;
}): Promise<RenderedTemplateResult> {
  const { category, variables = {}, customTemplate } = params;
  const normCategory = (category as NotificationEventType) || 'GENERAL';

  // 1. Select template
  const template = customTemplate || (await getTemplateForCategory(normCategory));

  // 2. Resolve variables and interpolate text
  const renderedTitle = interpolateTemplateText(template.title, variables, normCategory).slice(0, 200);
  const renderedBody = interpolateTemplateText(template.body, variables, normCategory).slice(0, 1000);

  return {
    title: renderedTitle,
    body: renderedBody,
    templateId: template.id,
    templateVersion: template.version,
    actionRoute: template.actionRoute,
  };
}
