// ── Auth guard ──────────────────────────────────────────────────
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'index.html';
  } else {
    document.getElementById('userEmail').textContent = user.email;
    loadProducts();
  }
});

function doLogout() {
  auth.signOut().then(() => window.location.href = 'index.html');
}

// ── State ───────────────────────────────────────────────────────
const PRODUCTS_REF = 'products';
const PAGE_SIZE = 50;
let allProducts = [];
let filtered = [];
let page = 1;
let editKey = null;

// ── Load from Firebase ──────────────────────────────────────────
function loadProducts() {
  document.getElementById('tbody').innerHTML =
    '<tr class="loading-row"><td colspan="7">กำลังโหลดข้อมูล...</td></tr>';

  db.ref(PRODUCTS_REF).on('value', snap => {
    allProducts = [];
    snap.forEach(child => {
      allProducts.push({ _key: child.key, ...child.val() });
    });
    // sort by id
    allProducts.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
    onSearch();
    updateStats();
  });
}

// ── Search & Filter ─────────────────────────────────────────────
function onSearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const field = document.getElementById('filterField').value;
  const priceFilter = document.getElementById('filterPrice').value;

  filtered = allProducts.filter(p => {
    // text filter
    let match = true;
    if (q) {
      if (field === 'all') {
        match = (p.id||'').includes(q) || (p.barcode||'').toLowerCase().includes(q) ||
                (p.nameShop||'').toLowerCase().includes(q) || (p.nameApp||'').toLowerCase().includes(q);
      } else {
        match = (p[field]||'').toLowerCase().includes(q);
      }
    }
    // price filter
    if (priceFilter === 'has-cost') match = match && !!(p.costPrice);
    if (priceFilter === 'no-cost') match = match && !(p.costPrice);
    return match;
  });

  page = 1;
  renderTable();
  updateStats();
}

// ── Render Table ────────────────────────────────────────────────
function renderTable() {
  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > maxPage) page = maxPage;

  const start = (page - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  const tbody = document.getElementById('tbody');
  if (slice.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-text">ไม่พบสินค้า</div></div></td></tr>';
  } else {
    tbody.innerHTML = slice.map(p => `
      <tr>
        <td class="td-id">${esc(p.id)}</td>
        <td class="td-id hide-mobile">${esc(p.barcode)}</td>
        <td>
          <div class="td-name-main">${esc(p.nameShop)}</div>
          ${p.nameApp ? `<div class="td-name-sub">${esc(p.nameApp)}</div>` : ''}
        </td>
        <td class="td-price cost hide-mobile">${fmt(p.costPrice)}</td>
        <td class="td-price shop">${fmt(p.shopPrice)}</td>
        <td class="td-price app hide-mobile">${fmt(p.appPrice)}</td>
        <td class="td-actions">
          <button class="btn btn-sm btn-secondary" onclick="openEdit('${p._key}')">แก้ไข</button>
          <button class="btn btn-sm btn-danger" onclick="openDelete('${p._key}','${esc(p.nameShop)}')">ลบ</button>
        </td>
      </tr>
    `).join('');
  }

  // pagination
  document.getElementById('pageInfo').textContent =
    `แสดง ${start + 1}–${Math.min(start + PAGE_SIZE, total)} จาก ${total.toLocaleString()} รายการ`;

  const pageBtns = document.getElementById('pageBtns');
  let btns = '';
  btns += `<button ${page===1?'disabled':''} onclick="goPage(${page-1})">◀</button>`;
  const range = getPageRange(page, maxPage);
  range.forEach(p2 => {
    if (p2 === '...') btns += `<button disabled>…</button>`;
    else btns += `<button class="${p2===page?'active':''}" onclick="goPage(${p2})">${p2}</button>`;
  });
  btns += `<button ${page===maxPage?'disabled':''} onclick="goPage(${page+1})">▶</button>`;
  pageBtns.innerHTML = btns;
}

function getPageRange(cur, max) {
  if (max <= 7) return Array.from({length:max},(_,i)=>i+1);
  if (cur <= 4) return [1,2,3,4,5,'...',max];
  if (cur >= max-3) return [1,'...',max-4,max-3,max-2,max-1,max];
  return [1,'...',cur-1,cur,cur+1,'...',max];
}

function goPage(p2) {
  page = p2;
  renderTable();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── Stats ───────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('statTotal').textContent = allProducts.length.toLocaleString();
  document.getElementById('statFound').textContent = filtered.length.toLocaleString();
  document.getElementById('statWithCost').textContent =
    allProducts.filter(p => p.costPrice).length.toLocaleString();
  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  document.getElementById('statPage').textContent = `${page} / ${maxPage}`;
}

// ── Helpers ─────────────────────────────────────────────────────
function fmt(v) {
  if (!v && v !== 0) return '—';
  const n = parseFloat(v);
  return isNaN(n) ? '—' : '฿' + n.toLocaleString('th-TH');
}
function esc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}

// ── Modal: Add/Edit ─────────────────────────────────────────────
function openAdd() {
  editKey = null;
  document.getElementById('modalTitle').textContent = 'เพิ่มสินค้าใหม่';
  document.getElementById('saveBtn').textContent = 'เพิ่มสินค้า';
  document.getElementById('fId').disabled = false;
  ['fId','fBarcode','fNameShop','fNameApp','fCostPrice','fShopPrice','fAppPrice','fImage']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('modalProduct').classList.add('open');
  setTimeout(() => document.getElementById('fId').focus(), 100);
}

function openEdit(key) {
  const p = allProducts.find(x => x._key === key);
  if (!p) return;
  editKey = key;
  document.getElementById('modalTitle').textContent = 'แก้ไขสินค้า';
  document.getElementById('saveBtn').textContent = 'บันทึกการแก้ไข';
  document.getElementById('fId').value = p.id || '';
  document.getElementById('fId').disabled = true;
  document.getElementById('fBarcode').value = p.barcode || '';
  document.getElementById('fNameShop').value = p.nameShop || '';
  document.getElementById('fNameApp').value = p.nameApp || '';
  document.getElementById('fCostPrice').value = p.costPrice || '';
  document.getElementById('fShopPrice').value = p.shopPrice || '';
  document.getElementById('fAppPrice').value = p.appPrice || '';
  document.getElementById('fImage').value = p.image || '';
  document.getElementById('modalProduct').classList.add('open');
  setTimeout(() => document.getElementById('fNameShop').focus(), 100);
}

function closeModal() {
  document.getElementById('modalProduct').classList.remove('open');
}

async function saveProduct() {
  const id = document.getElementById('fId').value.trim();
  const nameShop = document.getElementById('fNameShop').value.trim();
  if (!id) { showToast('กรุณากรอกรหัสสินค้า', 'error'); return; }
  if (!nameShop) { showToast('กรุณากรอกชื่อหน้าร้าน', 'error'); return; }

  const data = {
    id,
    barcode: document.getElementById('fBarcode').value.trim() || id,
    nameShop,
    nameApp: document.getElementById('fNameApp').value.trim(),
    costPrice: document.getElementById('fCostPrice').value.trim(),
    shopPrice: document.getElementById('fShopPrice').value.trim(),
    appPrice: document.getElementById('fAppPrice').value.trim(),
    image: document.getElementById('fImage').value.trim(),
    updatedAt: Date.now(),
  };

  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = 'กำลังบันทึก...';

  try {
    if (editKey) {
      await db.ref(`${PRODUCTS_REF}/${editKey}`).update(data);
      showToast('แก้ไขสินค้าเรียบร้อย ✓', 'success');
    } else {
      // check duplicate id
      const exists = allProducts.find(p => p.id === id);
      if (exists) { showToast('รหัส ' + id + ' มีอยู่แล้ว', 'error'); btn.disabled=false; btn.textContent='เพิ่มสินค้า'; return; }
      data.createdAt = Date.now();
      await db.ref(PRODUCTS_REF).push(data);
      showToast('เพิ่มสินค้าเรียบร้อย ✓', 'success');
    }
    closeModal();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด: ' + e.message, 'error');
  }
  btn.disabled = false;
}

// ── Modal: Delete ───────────────────────────────────────────────
let deleteTargetKey = null;

function openDelete(key, name) {
  deleteTargetKey = key;
  document.getElementById('deleteProductName').textContent = name;
  document.getElementById('modalDelete').classList.add('open');
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    document.getElementById('confirmDeleteBtn').disabled = true;
    document.getElementById('confirmDeleteBtn').textContent = 'กำลังลบ...';
    try {
      await db.ref(`${PRODUCTS_REF}/${deleteTargetKey}`).remove();
      showToast('ลบสินค้าเรียบร้อย', 'success');
      closeDelete();
    } catch (e) {
      showToast('เกิดข้อผิดพลาด: ' + e.message, 'error');
      document.getElementById('confirmDeleteBtn').disabled = false;
      document.getElementById('confirmDeleteBtn').textContent = 'ลบสินค้า';
    }
  };
}

function closeDelete() {
  document.getElementById('modalDelete').classList.remove('open');
  deleteTargetKey = null;
}

// ── Import from Google Sheets ───────────────────────────────────
function openImport() {
  document.getElementById('modalImport').classList.add('open');
  document.getElementById('importSheetId').value = '';
  document.getElementById('importApiKey').value = '';
  document.getElementById('importProgress').style.display = 'none';
  document.getElementById('importBtn').disabled = false;
  document.getElementById('importBtn').textContent = 'เริ่มนำเข้า';
}

function closeImport() {
  document.getElementById('modalImport').classList.remove('open');
}

async function doImport() {
  const sheetId = document.getElementById('importSheetId').value.trim();
  const sheetName = document.getElementById('importSheetName').value.trim() || 'สินค้า';
  const apiKey = document.getElementById('importApiKey').value.trim();

  if (!sheetId || !apiKey) {
    showToast('กรุณากรอก Sheet ID และ API Key', 'error');
    return;
  }

  const btn = document.getElementById('importBtn');
  btn.disabled = true;
  btn.textContent = 'กำลังนำเข้า...';
  document.getElementById('importProgress').style.display = 'block';
  setImportProgress(10, 'กำลังดึงข้อมูลจาก Google Sheets...');

  try {
    const range = encodeURIComponent(`${sheetName}!A:H`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('ดึงข้อมูล Sheets ไม่ได้ (HTTP ' + res.status + ')');
    const data = await res.json();
    const rows = data.values || [];

    if (rows.length < 2) throw new Error('ไม่พบข้อมูลในชีต');

    // skip header rows (row 0 = column headers, row 1 = example row)
    const dataRows = rows.slice(2).filter(r => r[0] && /^\d+$/.test(r[0].trim()));

    setImportProgress(30, `พบข้อมูล ${dataRows.length} รายการ กำลังนำเข้า...`);

    // batch write to Firebase
    const updates = {};
    let count = 0;
    for (const r of dataRows) {
      const id = (r[0] || '').trim();
      if (!id) continue;
      // column mapping: A=รหัส B=บาร์โค้ด C=ชื่อหน้าร้าน D=ชื่อในแอป E=รูปภาพ F=ราคาต้นทุน G=ราคาหน้าร้าน H=ราคาในแอป
      // find existing key or create new
      const existing = allProducts.find(p => p.id === id);
      const key = existing ? existing._key : db.ref(PRODUCTS_REF).push().key;
      updates[`${PRODUCTS_REF}/${key}`] = {
        id,
        barcode: (r[1] || id).replace(/\*/g, ''),
        nameShop: r[2] || '',
        nameApp: r[3] || '',
        image: r[4] || '',
        costPrice: r[5] || '',
        shopPrice: r[6] || '',
        appPrice: r[7] || '',
        updatedAt: Date.now(),
      };
      count++;
      if (count % 50 === 0) {
        setImportProgress(30 + Math.round((count / dataRows.length) * 60),
          `นำเข้าแล้ว ${count} / ${dataRows.length} รายการ...`);
      }
    }

    await db.ref('/').update(updates);
    setImportProgress(100, `✓ นำเข้าสำเร็จ ${count} รายการ`);
    showToast(`นำเข้าสำเร็จ ${count} รายการ ✓`, 'success');
    setTimeout(() => closeImport(), 1500);
  } catch (e) {
    setImportProgress(0, '');
    document.getElementById('importProgress').style.display = 'none';
    showToast('เกิดข้อผิดพลาด: ' + e.message, 'error');
    btn.disabled = false;
    btn.textContent = 'เริ่มนำเข้า';
  }
}

function setImportProgress(pct, msg) {
  document.getElementById('importBar').style.width = pct + '%';
  document.getElementById('importMsg').textContent = msg;
}

// ── Toast ───────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Keyboard ────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeDelete();
    closeImport();
  }
});
