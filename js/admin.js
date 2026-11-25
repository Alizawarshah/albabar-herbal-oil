/* البابر Herbal Oil — admin page (orders, messages, prices).
   Only accounts listed in the `admins` table can read or change anything:
   the database security rules enforce this, not this page. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  // everything customers typed is escaped before it is shown
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rs = (n) => "Rs." + Math.round(n).toLocaleString("en-PK");
  const when = (d) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const STATUSES = ["new", "confirmed", "dispatched", "delivered", "cancelled"];
  const LABEL = { all: "All", new: "New", confirmed: "Confirmed", dispatched: "Dispatched", delivered: "Delivered", cancelled: "Cancelled" };
  let filter = "new";

  let toastTimer;
  const toast = (m) => { const el = $("#toast"); el.textContent = m; el.classList.add("is-show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("is-show"), 2500); };

  function show(view) {
    ["loginView", "notAdmin", "dash"].forEach((id) => ($("#" + id).hidden = id !== view));
  }

  async function boot() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { $("#who").hidden = true; return show("loginView"); }
    $("#who").hidden = false;
    $("#whoEmail").textContent = session.user.email;
    const { data: adminRow } = await sb.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
    if (!adminRow) { $("#uid").textContent = session.user.id; return show("notAdmin"); }
    show("dash");
    renderFilters();
    loadOrders();
  }

  /* ---------- Orders ---------- */
  function renderFilters() {
    $("#statusFilters").innerHTML = ["new", "confirmed", "dispatched", "delivered", "cancelled", "all"]
      .map((s) => `<button data-filter="${s}" class="${s === filter ? "is-active" : ""}">${LABEL[s]}</button>`).join("");
  }

  async function loadOrders() {
    $("#ordersInfo").textContent = "Loading…";
    let q = sb.from("orders").select("*, order_items(name, qty, unit_price, line_total)").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) { $("#ordersInfo").textContent = "Couldn't load orders: " + error.message; return; }
    $("#ordersInfo").textContent = `${data.length} ${filter === "all" ? "" : LABEL[filter].toLowerCase() + " "}order${data.length === 1 ? "" : "s"}`;
    $("#orders").innerHTML = data.length ? data.map(orderRow).join("") : `<p class="empty">No ${filter === "all" ? "" : LABEL[filter].toLowerCase() + " "}orders.</p>`;
  }

  function orderRow(o) {
    const wa = "https://wa.me/92" + esc(o.phone).slice(1) + "?text=" + encodeURIComponent(`Assalam o Alaikum ${o.customer_name}, this is البابر Herbal Oil about your order ${o.order_no} (${rs(o.total)}). Can you confirm the delivery address?`);
    return `<details class="order">
      <summary>
        <span class="order__no">${esc(o.order_no)}<span class="order__when">${when(o.created_at)}</span></span>
        <span class="order__who">${esc(o.customer_name)}<small>${esc(o.city)} · ${esc(o.phone)}</small></span>
        <span class="order__total">${rs(o.total)}</span>
        <span><span class="status status--${o.status}">${LABEL[o.status]}</span></span>
        <span class="muted small">${o.payment_method === "cod" ? "Cash on Delivery" : "Bank / JazzCash"}</span>
      </summary>
      <div class="order__body">
        <dl>
          <dt>Phone</dt><dd><a class="text-link" href="tel:${esc(o.phone)}">${esc(o.phone)}</a></dd>
          ${o.email ? `<dt>Email</dt><dd>${esc(o.email)}</dd>` : ""}
          <dt>Address</dt><dd>${esc(o.address)}, ${esc(o.city)}</dd>
          ${o.landmark ? `<dt>Landmark</dt><dd>${esc(o.landmark)}</dd>` : ""}
          ${o.notes ? `<dt>Notes</dt><dd>${esc(o.notes)}</dd>` : ""}
          <dt>Language</dt><dd>${o.lang === "ur" ? "Urdu" : "English"}</dd>
        </dl>
        <div>
          <ul class="order__items">${o.order_items.map((i) => `<li><span>${esc(i.name)} × ${i.qty}</span><span>${rs(i.line_total)}</span></li>`).join("")}
            ${o.discount ? `<li><span>Discount ${esc(o.discount_code)}</span><span>− ${rs(o.discount)}</span></li>` : ""}
            <li><b>Total</b><b>${rs(o.total)}</b></li></ul>
          <div class="order__actions">
            <label class="mini" for="st-${o.id}" style="margin:0">Status</label>
            <select id="st-${o.id}" data-order="${o.id}">${STATUSES.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${LABEL[s]}</option>`).join("")}</select>
            <a class="btn btn--wa" href="${wa}" target="_blank" rel="noopener">WhatsApp customer</a>
          </div>
        </div>
      </div>
    </details>`;
  }

  /* ---------- Messages ---------- */
  async function loadMessages() {
    const { data, error } = await sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) { $("#messages").innerHTML = `<p class="empty">Couldn't load messages: ${esc(error.message)}</p>`; return; }
    $("#messages").innerHTML = data.length ? data.map((m) => `
      <article class="msg ${m.handled ? "is-done" : ""}">
        <header><b>${esc(m.name)}</b><span class="muted small">${when(m.created_at)}</span></header>
        <span class="small"><a class="text-link" href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.phone ? ` · ${esc(m.phone)}` : ""}</span>
        <p>${esc(m.message)}</p>
        <label class="check"><input type="checkbox" data-msg="${m.id}" ${m.handled ? "checked" : ""} /> Replied</label>
      </article>`).join("") : `<p class="empty">No messages yet.</p>`;
  }

  /* ---------- Prices and stock ---------- */
  async function loadProducts() {
    const { data, error } = await sb.from("products").select("*").order("sort");
    if (error) { $("#products").innerHTML = `<p class="empty">${esc(error.message)}</p>`; return; }
    $("#products").innerHTML = data.map((p) => `
      <form class="prod-row" data-prod="${esc(p.id)}">
        <b>${esc(p.name_en)}<br /><span class="muted small">${p.sold} sold</span></b>
        <label><span class="mini">Price (Rs)</span><input type="number" name="price" min="1" value="${p.price}" required /></label>
        <label><span class="mini">Was price (Rs)</span><input type="number" name="compare_price" min="1" value="${p.compare_price ?? ""}" /></label>
        <label class="check"><input type="checkbox" name="in_stock" ${p.in_stock ? "checked" : ""} /> In stock</label>
        <button class="btn btn--green" type="submit">Save</button>
      </form>`).join("");
  }

  /* ---------- Events ---------- */
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#loginError"); err.hidden = true;
    const btn = e.target.querySelector("button"); btn.disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email: $("#aEmail").value.trim(), password: $("#aPass").value });
    btn.disabled = false;
    if (error) { err.hidden = false; err.textContent = /confirm/i.test(error.message) ? "This email isn't confirmed yet. Open the confirmation email from Supabase, then sign in." : "Email or password is wrong. Check both and try again."; return; }
    boot();
  });
  $("#signOut").addEventListener("click", async () => { await sb.auth.signOut(); boot(); });
  $("#refresh").addEventListener("click", loadOrders);

  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-filter]");
    if (f) { filter = f.dataset.filter; renderFilters(); return loadOrders(); }
    const v = e.target.closest("[data-view]");
    if (v) {
      $$("[data-view]").forEach((b) => b.classList.toggle("is-active", b === v));
      $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== v.dataset.view));
      $(".admin__top h1").textContent = v.textContent;
      if (v.dataset.view === "messages") loadMessages();
      if (v.dataset.view === "products") loadProducts();
      if (v.dataset.view === "orders") loadOrders();
    }
  });

  document.addEventListener("change", async (e) => {
    const el = e.target;
    if (el.dataset.order) {
      const { error } = await sb.from("orders").update({ status: el.value }).eq("id", el.dataset.order);
      if (error) return toast("Couldn't save: " + error.message);
      toast("Status changed to " + LABEL[el.value]);
      const badge = el.closest(".order").querySelector(".status");
      badge.className = "status status--" + el.value; badge.textContent = LABEL[el.value];
    }
    if (el.dataset.msg) {
      const { error } = await sb.from("contact_messages").update({ handled: el.checked }).eq("id", el.dataset.msg);
      if (error) return toast("Couldn't save: " + error.message);
      el.closest(".msg").classList.toggle("is-done", el.checked);
    }
  });

  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("[data-prod]");
    if (!f) return;
    e.preventDefault();
    const price = +f.price.value, compare = f.compare_price.value ? +f.compare_price.value : null;
    if (compare && compare < price) return toast("The 'was' price must be higher than the price.");
    const { error } = await sb.from("products").update({ price, compare_price: compare, in_stock: f.in_stock.checked }).eq("id", f.dataset.prod);
    toast(error ? "Couldn't save: " + error.message : "Saved");
  });

  boot();
})();
