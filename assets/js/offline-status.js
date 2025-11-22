let offlineFlag = false;

export function setOfflineFlag(flag) {
  offlineFlag = !!flag;
}

export function notifyOffline() {
  offlineFlag = true;
  window.dispatchEvent(new Event('offline'));
}

export function notifyOnline() {
  offlineFlag = false;
  window.dispatchEvent(new Event('online'));
}

export function isOffline() {
  return offlineFlag || !navigator.onLine;
}

export async function probeOnline(url = './manifest.json', timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { method: 'HEAD', signal: controller.signal });
    const ok = resp && resp.ok;
    clearTimeout(timer);
    return ok;
  } catch (_) {
    clearTimeout(timer);
    return false;
  }
}
