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
const SHA_KEY = 'shichusuimei_synced_sha';    // 最後に取り込み/送信したクラウドの版（sha）
const BASE_KEY = 'shichusuimei_sync_base';   // 前回そろえた時点のクラウド内容（3者統合の基準）

// 人生メモ・家族の保管キー：生年月日＋名前で分ける（2026-09-29〜。旧形式は生年月日だけ）
export const personSuffix = (name, bd) => `${bd}_${name}`;
export const memoKeyOf = (name, bd) => 'shichusuimei_memo_' + personSuffix(name, bd);
export const childrenKeyOf = (name, bd) => 'shichusuimei_children_' + personSuffix(name, bd);
// 新キーが無ければ旧キー（生年月日だけ）を読む
export function readPersonData(kind, name, bd) {
  const pre = 'shichusuimei_' + kind + '_';
  try {
    const v = localStorage.getItem(pre + personSuffix(name, bd)) ?? localStorage.getItem(pre + bd);
    const a = v ? JSON.parse(v) : [];
    return Array.isArray(a) ? a : [];
  } catch { return []; }
}

const memoId = (m) => (m && m.year) + '|' + (m && m.text);
const childId = (c) => [c && c.name, c && c.birthYear, c && c.birthMonth, c && c.birthDay].join('|');
function unionBy(a, b, idf) {
  const out = [...a];
  const have = new Set(a.map(idf));
  b.forEach((x) => { if (!have.has(idf(x))) { out.push(x); have.add(idf(x)); } });
  return out;
}

// 旧キー（生年月日だけ）を、保存リストの同じ生年月日の人ごとの新キーへ移す。
// 同じ生年月日の人が複数いれば全員にコピー（これまで共有で見えていた内容なので消さない）。
// 保存リストに該当者がいない旧キーはそのまま残す（readPersonData で読める）。
export function migrateLegacyKeys() {
  let persons = [];
  try { persons = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch { return; }
  const legacy = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const m = k && /^shichusuimei_(memo|children)_(\d{4}-\d{2}-\d{2})$/.exec(k);
    if (m) legacy.push([k, m[1], m[2]]);
  }
  legacy.forEach(([k, kind, bd]) => {
    const owners = persons.filter((p) => p && p.bd === bd && p.name);
    if (!owners.length) return;
    let old = [];
    try { old = JSON.parse(localStorage.getItem(k) || '[]'); } catch { old = []; }
    if (!Array.isArray(old)) old = [];
    owners.forEach((p) => {
      const nk = 'shichusuimei_' + kind + '_' + personSuffix(p.name, bd);
      let cur = [];
      try { cur = JSON.parse(localStorage.getItem(nk) || '[]'); } catch { cur = []; }
      const merged = unionBy(Array.isArray(cur) ? cur : [], old, kind === 'memo' ? memoId : childId);
      if (kind === 'memo') merged.sort((a, b) => a.year - b.year);
      try { localStorage.setItem(nk, JSON.stringify(merged)); } catch { /* 容量超過等 */ }
    });
    localStorage.removeItem(k);
  });
}

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
function applyRemote(data, sha) {
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
    if (sha) localStorage.setItem(SHA_KEY, sha);
    localStorage.removeItem(DIRTY_KEY);
    saveBase(data);
  } finally {
    applying = false;
  }
  migrateLegacyKeys(); // 旧形式の端末から来たデータを新キーへ（変更があれば自動送信される）
  window.dispatchEvent(new Event('shichuSynced'));
  window.dispatchEvent(new Event('shichuSaved'));
}

function saveBase(data) {
  try {
    localStorage.setItem(BASE_KEY, JSON.stringify({ persons: data.persons || [], memos: data.memos || {}, children: data.children || {} }));
  } catch { /* 容量超過等：基準なしでも統合（和集合）で動く */ }
}
function loadBase() {
  try { const b = JSON.parse(localStorage.getItem(BASE_KEY) || 'null'); if (b) return b; } catch { /* 破損は基準なし扱い */ }
  return { persons: [], memos: {}, children: {} };
}

// 3者統合：基準（前回そろえた時点）・端末・クラウドを比べ、片方だけの変更はその変更を採用、
// 両方で変わった項目は統合（人物は端末側優先・メモと家族は和集合）。
// 基準にあって片方で消えた項目は削除として扱う。
function merge3(base, local, remote, both) {
  const js = JSON.stringify;
  const out = {};
  new Set([...Object.keys(local), ...Object.keys(remote)]).forEach((k) => {
    const b = base[k], l = local[k], r = remote[k];
    if (l !== undefined && r !== undefined) {
      if (js(l) === js(r)) out[k] = l;
      else if (b !== undefined && js(l) === js(b)) out[k] = r;
      else if (b !== undefined && js(r) === js(b)) out[k] = l;
      else out[k] = both(l, r);
    } else if (l !== undefined) {
      if (b === undefined || js(l) !== js(b)) out[k] = l;
    } else if (b === undefined || js(r) !== js(b)) {
      out[k] = r;
    }
  });
  return out;
}
const personMap = (arr) => {
  const m = {};
  (arr || []).forEach((p) => { if (p && p.name && p.bd) m[p.name + '|' + p.bd] = p; });
  return m;
};

// クラウドの内容を端末へ統合する（送信の直前に呼ぶ）
function mergeIntoLocal(remoteData) {
  const base = loadBase();
  const local = collectLocal();
  const lp = personMap(local.persons);
  const rp = personMap(remoteData.persons);
  const mp = merge3(personMap(base.persons), lp, rp, (l) => l);
  const persons = [];
  (local.persons || []).forEach((p) => { const k = p && p.name + '|' + p.bd; if (mp[k]) { persons.push(mp[k]); delete mp[k]; } });
  (remoteData.persons || []).forEach((p) => { const k = p && p.name + '|' + p.bd; if (mp[k]) { persons.push(mp[k]); delete mp[k]; } });
  const memos = merge3(base.memos || {}, local.memos, remoteData.memos || {},
    (l, r) => unionBy(l, r, memoId).sort((a, b) => a.year - b.year));
  const children = merge3(base.children || {}, local.children, remoteData.children || {},
    (l, r) => unionBy(l, r, childId));
  applying = true;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(persons));
    const del = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('shichusuimei_memo_') || k.startsWith('shichusuimei_children_'))) del.push(k);
    }
    del.forEach((k) => localStorage.removeItem(k));
    Object.entries(memos).forEach(([s, arr]) => { try { localStorage.setItem('shichusuimei_memo_' + s, JSON.stringify(arr)); } catch { /* 容量超過等 */ } });
    Object.entries(children).forEach(([s, arr]) => { try { localStorage.setItem('shichusuimei_children_' + s, JSON.stringify(arr)); } catch { /* 容量超過等 */ } });
    migrateLegacyKeys();
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
  if (!res.ok) { const e = new Error('送信エラー ' + res.status); e.status = res.status; throw e; }
  return res.json();
}

// 前回そろえたあとにクラウドが更新されたか（版shaで判定。sha未記録の端末は更新時刻で判定）
function remoteChanged(remote, rdata) {
  const sha = localStorage.getItem(SHA_KEY);
  if (sha) return remote.sha !== sha;
  return (rdata.updatedAt || '') !== (localStorage.getItem(SYNCED_KEY) || '');
}

// ローカル→クラウドへ送信。前回の同期のあとに他の端末がクラウドを更新していたら、
// 先に端末へ統合してから送る（丸ごと上書きで他端末の変更を消さないため）
export async function pushNow(keepalive = false) {
  const token = getSyncToken();
  if (!token) return;
  clearTimeout(pushTimer);
  setStatus('syncing', '送信中…');
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const remote = await ghGet(token);
      if (remote) {
        const rdata = JSON.parse(b64decode(remote.content));
        if (remoteChanged(remote, rdata)) mergeIntoLocal(rdata);
      }
      const data = collectLocal();
      try {
        const put = await ghPut(token, JSON.stringify(data), remote ? remote.sha : undefined, keepalive);
        if (put && put.content && put.content.sha) localStorage.setItem(SHA_KEY, put.content.sha);
      } catch (e) {
        if (e.status === 409 && attempt === 0) continue; // 送信が重なった：取り直して統合し直す
        throw e;
      }
      localStorage.setItem(SYNCED_KEY, data.updatedAt);
      localStorage.removeItem(DIRTY_KEY);
      saveBase(data);
      setStatus('ok', '送信しました');
      return;
    }
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
    // 初回同期（端末にもデータあり）・未送信の修正あり：統合してから送信（pushNow内で統合）
    if ((!syncedAt && localPersons.length) || dirty) { await pushNow(); return; }
    const data = JSON.parse(b64decode(remote.content));
    if (remoteChanged(remote, data)) {
      applyRemote(data, remote.sha);
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
  migrateLegacyKeys(); // 旧形式（生年月日だけ）のメモ・家族を新キーへ
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
