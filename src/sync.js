// ═══════════════════════════════════════════════════════
// GitHub非公開リポジトリ（shichusuimei-data）との保存リスト自動同期
//
// 同期対象キー：shichuPersons / shichusuimei_memo_* / shichusuimei_children_*
// 仕組み：
//   - アプリ起動時・タブ復帰時にクラウドから取得（pull）
//   - 対象キーへの書き込みを検知したら3秒後に自動送信（push）
//   - 初回（一度も同期していない端末）にデータがあれば端末側を正として送信
//   - トークンは端末ごとに localStorage（shichusuimei_gh_token）へ1回だけ設定
// ═══════════════════════════════════════════════════════
const REPO = 'wandererharu-sudo/shichusuimei-data';
const API = `https://api.github.com/repos/${REPO}/contents/data.json`;
const SAVE_KEY = 'shichuPersons';
const TOKEN_KEY = 'shichusuimei_gh_token';
const SYNCED_KEY = 'shichusuimei_synced_at'; // 最後に取り込み/送信した updatedAt
const DIRTY_KEY = 'shichusuimei_sync_dirty'; // '1'=未送信の修正あり

let applying = false;   // applyRemote中はsetItem検知を止める
let pushTimer = null;
let lastPull = 0;
let cur = { status: 'off', msg: '' }; // off | syncing | ok | error

export const getSyncToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
export const setSyncToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t.trim()) : localStorage.removeItem(TOKEN_KEY); } catch { /* 保存不可環境 */ }
};
export const getSyncStatus = () => cur;

function setStatus(status, msg = '') {
  cur = { status, msg };
  window.dispatchEvent(new CustomEvent('shichuSyncStatus', { detail: cur }));
}

const isSyncKey = (k) => k === SAVE_KEY || k.startsWith('shichusuimei_memo_') || k.startsWith('shichusuimei_children_');

// UTF-8文字列 <-> base64（日本語対応・大きめデータでもスタックを溢れさせない）
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// ローカルの同期対象データをバックアップJSONと同じ形式で収集
function collectLocal() {
  let persons = [];
  try { persons = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch { persons = []; }
  const memos = {}, children = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith('shichusuimei_memo_')) {
      try { const v = JSON.parse(localStorage.getItem(k)); if (Array.isArray(v) && v.length) memos[k.slice('shichusuimei_memo_'.length)] = v; } catch { /* 破損は無視 */ }
    } else if (k.startsWith('shichusuimei_children_')) {
      try { const v = JSON.parse(localStorage.getItem(k)); if (Array.isArray(v) && v.length) children[k.slice('shichusuimei_children_'.length)] = v; } catch { /* 破損は無視 */ }
    }
  }
  return { app: 'shichusuimei', type: 'persons_backup', updatedAt: new Date().toISOString(), persons, memos, children };
}

// クラウドのデータをローカルへ丸ごと反映（削除も反映するため一旦消して入れ直す）
function applyRemote(data) {
  applying = true;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data.persons || []));
    const del = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('shichusuimei_memo_') || k.startsWith('shichusuimei_children_'))) del.push(k);
    }
    del.forEach((k) => localStorage.removeItem(k));
    Object.entries(data.memos || {}).forEach(([bd, arr]) => {
      try { localStorage.setItem('shichusuimei_memo_' + bd, JSON.stringify(arr)); } catch { /* 容量超過等 */ }
    });
    Object.entries(data.children || {}).forEach(([bd, arr]) => {
      try { localStorage.setItem('shichusuimei_children_' + bd, JSON.stringify(arr)); } catch { /* 容量超過等 */ }
    });
    localStorage.setItem(SYNCED_KEY, data.updatedAt || '');
    localStorage.removeItem(DIRTY_KEY);
  } finally {
    applying = false;
  }
  window.dispatchEvent(new Event('shichuSynced'));
  window.dispatchEvent(new Event('shichuSaved'));
}

async function ghGet(token) {
  const res = await fetch(API, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) throw new Error('トークンが無効です（' + res.status + '）');
  if (!res.ok) throw new Error('取得エラー ' + res.status);
  return res.json();
}

async function ghPut(token, jsonText, sha, keepalive) {
  const body = { message: 'sync: 保存リスト更新', content: b64encode(jsonText) };
  if (sha) body.sha = sha;
  const res = await fetch(API, {
    method: 'PUT',
    keepalive: !!keepalive,
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('送信エラー ' + res.status);
  return res.json();
}

// ローカル→クラウドへ送信
export async function pushNow(keepalive = false) {
  const token = getSyncToken();
  if (!token) return;
  clearTimeout(pushTimer);
  setStatus('syncing', '送信中…');
  try {
    const data = collectLocal();
    let sha;
    const remote = await ghGet(token);
    sha = remote ? remote.sha : undefined;
    await ghPut(token, JSON.stringify(data), sha, keepalive);
    localStorage.setItem(SYNCED_KEY, data.updatedAt);
    localStorage.removeItem(DIRTY_KEY);
    setStatus('ok', '送信しました');
  } catch (e) {
    setStatus('error', e.message);
  }
}

// クラウド→ローカルへ取得（状況に応じて送信に切り替える）
export async function pullNow() {
  const token = getSyncToken();
  if (!token) { setStatus('off'); return; }
  setStatus('syncing', '確認中…');
  lastPull = Date.now();
  try {
    const remote = await ghGet(token);
    let localPersons = [];
    try { localPersons = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch { localPersons = []; }
    if (!remote) {
      if (localPersons.length) await pushNow();
      else setStatus('ok', 'クラウドは空です');
      return;
    }
    const syncedAt = localStorage.getItem(SYNCED_KEY);
    const dirty = localStorage.getItem(DIRTY_KEY) === '1';
    // 初回同期：この端末にデータがあれば端末側を正として送信する
    if (!syncedAt && localPersons.length) { await pushNow(); return; }
    // 未送信の修正がある：送信を優先（後勝ち）
    if (dirty) { await pushNow(); return; }
    const data = JSON.parse(b64decode(remote.content));
    if ((data.updatedAt || '') !== syncedAt) {
      applyRemote(data);
      setStatus('ok', '最新を取り込みました');
    } else {
      setStatus('ok', '最新です');
    }
  } catch (e) {
    setStatus('error', e.message);
  }
}

function markDirty() {
  applying = true; // DIRTY_KEY自体の書き込みで再検知しないよう一時停止
  try { localStorage.setItem(DIRTY_KEY, '1'); } catch { /* 保存不可環境 */ }
  applying = false;
  if (!getSyncToken()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushNow(), 3000);
}

// 起動時に1回だけ呼ぶ：書き込み検知＋タブ復帰時pull＋初回pull
export function initSync() {
  if (window.__shichuSyncInit) return;
  window.__shichuSyncInit = true;
  const origSet = localStorage.setItem.bind(localStorage);
  const origRemove = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = (k, v) => { origSet(k, v); if (!applying && isSyncKey(k)) markDirty(); };
  localStorage.removeItem = (k) => { origRemove(k); if (!applying && isSyncKey(k)) markDirty(); };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // タブを閉じる・切り替える前に未送信分を送っておく
      if (localStorage.getItem(DIRTY_KEY) === '1' && getSyncToken()) { clearTimeout(pushTimer); pushNow(true); }
    } else if (document.visibilityState === 'visible') {
      if (getSyncToken() && localStorage.getItem(DIRTY_KEY) !== '1' && Date.now() - lastPull > 60000) pullNow();
    }
  });
  if (getSyncToken()) pullNow();
  else setStatus('off');
}
