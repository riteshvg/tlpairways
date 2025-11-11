/**
 * Adobe Target helper utilities for SPA view tracking and page parameter management.
 */

const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 400;

const isBrowser = () => typeof window !== 'undefined';

const getTargetHelper = () => (isBrowser() ? window.TLAirwaysTarget : undefined);

/**
 * Returns the current Target page parameters snapshot.
 */
export const getTargetPageParams = () => {
  if (!isBrowser()) return {};
  return window.__tlTargetPageParams || {};
};

/**
 * Merges new page parameters that Target can use for audience targeting.
 */
export const setTargetPageParams = (params = {}) => {
  if (!isBrowser()) return;

  const helper = getTargetHelper();
  if (helper && typeof helper.setPageParams === 'function') {
    helper.setPageParams(params);
    return;
  }

  const current = getTargetPageParams();
  window.__tlTargetPageParams = {
    ...current,
    ...params,
  };
};

/**
 * Registers a callback so Target (via at.js) can pull page parameters.
 * This is idempotent and safe to call multiple times.
 */
export const ensureTargetPageParamsCallback = () => {
  if (!isBrowser()) return;
  if (typeof window.targetPageParamsAll === 'function') return;

  window.targetPageParamsAll = () => getTargetPageParams();
};

/**
 * Safely triggers an Adobe Target view for SPA navigations.
 */
export const triggerAdobeTargetView = (viewName, data = {}) => {
  if (!isBrowser() || !viewName) return;

  const helper = getTargetHelper();
  if (helper && typeof helper.triggerView === 'function') {
    helper.triggerView(viewName, data);
    return;
  }

  let attempts = 0;

  const attemptTrigger = () => {
    const triggerFn = window.adobe?.target?.triggerView;

    if (typeof triggerFn === 'function') {
      try {
        triggerFn.call(window.adobe.target, viewName, data);
        console.log(`✅ Adobe Target view triggered: ${viewName}`, data);
      } catch (error) {
        console.error('❌ Failed to trigger Adobe Target view:', error);
      }
      return;
    }

    attempts += 1;

    if (attempts >= MAX_ATTEMPTS) {
      console.warn(
        `⚠️ Adobe Target triggerView unavailable for "${viewName}" after ${MAX_ATTEMPTS} attempts.`,
        data
      );
      return;
    }

    setTimeout(attemptTrigger, RETRY_DELAY);
  };

  attemptTrigger();
};

/**
 * Convenience helper to both set page params and trigger a view for a given page.
 */
export const syncTargetForView = (viewName, params = {}, viewData = {}) => {
  setTargetPageParams(params);
  ensureTargetPageParamsCallback();
  triggerAdobeTargetView(viewName, viewData);
};

export default {
  getTargetPageParams,
  setTargetPageParams,
  ensureTargetPageParamsCallback,
  triggerAdobeTargetView,
  syncTargetForView,
};

