(function () {
  const D = window.DATA, C = window.Charts, fa = C.faNum, v = C.css;
  const yr = (y) => fa(y).replace(/٬/g, "");

  /* 1. pump price and consumption, two separate charts */
  const hikes = [
    { x: 1389, label: "هدفمندی" }, { x: 1394, label: "۱۳۹۴", dy: 14 }, { x: 1398, label: "آبان ۹۸" }, { x: 1404, label: "نرخ سوم", dy: 30 },
  ];
  const notes = Object.fromEntries([[1386, "سهمیه‌بندی از تیر ۱۳۸۶"], [1389, "هدفمندی یارانه‌ها، آذر ۱۳۸۹"], [1393, "افزایش اردیبهشت ۱۳۹۳"],
    [1394, "تک‌نرخی شدن، خرداد ۱۳۹۴"], [1398, "افزایش آبان ۱۳۹۸"], [1404, "نرخ سوم ۵ هزار تومانی، آذر ۱۴۰۴"], [1405, "سهمیه‌ی نرخ دوم ۵۰ لیتر، نرخ سوم ۱۰ هزار تومان از شهریور"]]);
  C.line(document.getElementById("c1a"), {
    data: D.pumpPrice, label: "قیمت بنزین", endLabels: false,
    series: [{ key: "quota", name: "سهمیه‌ای", color: v("--gas"), step: true, width: 3 }],
    annotations: hikes, yFmt: (x) => fa(x),
    tipFmt: (d) => `<b>${yr(d.y)}</b><div>سهمیه‌ای: ${fa(d.quota)} تومان</div>` + (d.free ? `<div>آزاد: ${fa(d.free)} تومان</div>` : "") +
      (d.y === 1404 ? `<div>نرخ سوم: ۵٬۰۰۰ تومان</div>` : d.y >= 1405 ? `<div>نرخ سوم: ۱۰٬۰۰۰ تومان</div>` : "") + (notes[d.y] ? `<div style="opacity:.8">${notes[d.y]}</div>` : ""),
  });
  C.line(document.getElementById("c1b"), {
    data: D.consumption, label: "مصرف بنزین", endLabels: false,
    series: [{ key: "c", name: "مصرف", color: v("--ink"), width: 2.5 }],
    yFmt: (x) => fa(x),
    tipFmt: (d) => `<b>${yr(d.y)}</b><div>${fa(d.c, 1)} میلیون لیتر در روز</div>` + (d.y === 1402 ? `<div style="opacity:.8">برآورد بر پایه‌ی آمار رسانه‌ای</div>` : ""),
  });

  /* 2. cents */
  C.line(document.getElementById("c2"), {
    data: D.cents, label: "قیمت بنزین به سنت",
    series: [{ key: "c", name: "سنت در لیتر", color: v("--gas"), width: 3 }],
    annotations: [{ x: 1394, label: "۲۹ سنت" }, { x: 1405, label: "کمتر از ۱ سنت", dy: 14 }],
    yFmt: (x) => fa(x) + "¢",
    tipFmt: (d) => `<b>${yr(d.y)}</b><div>${fa(d.c, 1)} سنت در هر لیتر</div>`,
  });

  /* 3. regional */
  const names = { "Iran": "ایران", "Iraq": "عراق", "Saudi Arabia": "عربستان", "United Arab Emirates": "امارات", "Azerbaijan": "آذربایجان",
    "Pakistan": "پاکستان", "Afghanistan": "افغانستان", "Turkey": "ترکیه", "Armenia": "ارمنستان", "World average": "میانگین جهان" };
  C.bars(document.getElementById("c3"), {
    label: "قیمت بنزین در منطقه",
    bars: D.regional.filter((r) => ["Iran", "United Arab Emirates", "Pakistan", "Turkey", "World average"].includes(r.c)).sort((a, b) => a.p - b.p).map((r) => ({
      label: names[r.c] || r.c, value: r.p, strong: r.c === "Iran" || r.c === "World average",
      color: r.c === "Iran" ? v("--gas") : r.c === "World average" ? v("--ink-2") : v("--muted-bar"),
    })),
    fmt: (x) => "$" + fa(x, 2),
  });

  /* 4. housing vs usd vs cpi */
  C.line(document.getElementById("c4"), {
    data: D.index, label: "شاخص مسکن، دلار و تورم",
    series: [
      { key: "house", name: "خرید مسکن", color: v("--house"), width: 3, labelDy: -6 },
      { key: "usd", name: "دلار", color: v("--usd"), width: 3, labelDy: 8 },
      { key: "rent", name: "اجاره", color: v("--rent"), width: 2.5 },
      { key: "cpi", name: "تورم", color: v("--cpi"), width: 2.5 },
    ],
    xTicks: [1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403],
    tipFmt: (d) => `<b>${yr(d.y)}</b><div><i style="background:${v("--house")}"></i>خرید مسکن: ${fa(d.house)}</div><div><i style="background:${v("--usd")}"></i>دلار: ${fa(d.usd)}</div><div><i style="background:${v("--cpi")}"></i>تورم: ${fa(d.cpi)}</div><div><i style="background:${v("--rent")}"></i>اجاره: ${fa(d.rent)}</div>`,
  });

  /* 5. ring towns growth */
  C.bars(document.getElementById("c5"), {
    label: "رشد جمعیت شهرهای اطراف تهران",
    bars: D.ringGrowth.map((r) => ({ label: r.city, value: r.m, strong: r.city === "تهران", color: r.city === "تهران" ? v("--ink-2") : v("--house") })),
    fmt: (x) => fa(x, 1) + " برابر",
  });

  /* 6. frozen price */
  C.line(document.getElementById("c6"), {
    data: D.frozen, label: "قدرت خرید دستمزد",
    series: [
      { key: "gas", name: "بنزین", color: v("--gas"), width: 3.5 },
      { key: "house", name: "مسکن", color: v("--house"), width: 3.5 },
    ],
    xTicks: [1396, 1397, 1398, 1399, 1400, 1401, 1402],
    yMin: 0,
    tipFmt: (d) => `<b>${yr(d.y)}</b><div><i style="background:${v("--gas")}"></i>بنزین: ${fa(d.liters)} لیتر با یک ماه دستمزد</div>` +
      (d.months ? `<div><i style="background:${v("--house")}"></i>مسکن: هر متر = ${fa(d.months, 1)} ماه دستمزد</div>` : ""),
  });

  /* 7. deciles */
  const c7 = document.getElementById("c7");
  function drawDec(y) {
    const rows = D.deciles[y].filter((r) => r.d !== "all");
    const max = Math.max(...rows.map((r) => r.s));
    C.columns(c7, {
      label: "سهم بنزین به تفکیک دهک",
      cols: rows.map((r) => ({ label: fa(+r.d), value: r.s, color: r.s >= max * 0.9 ? v("--gas") : v("--muted-bar") })),
      fmt: (x) => fa(x, 2) + "٪", max: 2.1, caption: "دهک (۱ = کم‌هزینه‌ترین، ۱۰ = پرهزینه‌ترین)",
    });
  }
  segmented(c7.closest("figure").querySelector(".seg"), (b) => drawDec(b.dataset.y));
  drawDec("1400");

  /* 8. trip purpose */
  const c8 = document.getElementById("c8");
  const purp = { work: "کار", edu: "تحصیل", leis: "تفریح و دیدار", shop: "خرید", nhb: "سایر" };
  function drawPurpose(key) {
    C.bars(c8, {
      label: "هدف سفرهای روزانه در تهران",
      bars: D.tripPurpose.map((r) => ({ label: purp[r.k], value: r[key], strong: r.k === "work" || r.k === "edu",
        color: r.k === "work" || r.k === "edu" ? v("--gas") : v("--muted-bar") })),
      fmt: (x) => fa(x, 0) + "٪", max: 55,
    });
  }
  segmented(c8.closest("figure").querySelector(".seg"), (b) => drawPurpose(b.dataset.k));
  drawPurpose("trips");

  /* calculator */
  const $ = (id) => document.getElementById(id);
  const toman = (x) => (x >= 1e6 ? fa(x / 1e6, 1) + " میلیون تومان" : fa(Math.round(x / 1000) * 1000) + " تومان");
  let priceMode = "ir";
  function cost(liters) {
    if (priceMode === "tr") return liters * 1.23 * D.fx1405;
    const tiers = [[60, 1500], [50, 3000], [Infinity, 10000]];
    let left = liters, c = 0;
    for (const [q, p] of tiers) { const u = Math.min(left, q); c += u * p; left -= u; if (left <= 0) break; }
    return c;
  }
  function calc() {
    const km = +$("i-km").value, days = +$("i-days").value, eff = +$("i-eff").value, inc = +$("i-inc").value * 1e6;
    $("o-km").textContent = fa(km); $("o-days").textContent = fa(days); $("o-inc").textContent = fa(+$("i-inc").value, 1) + " میلیون تومان";
    const L = (km * days * eff) / 100, c = cost(L), p = (100 * c) / inc;
    $("r-l").textContent = fa(Math.round(L));
    $("r-c").textContent = toman(c);
    $("r-p").textContent = fa(p, 1) + "٪";
    $("m-1").style.width = Math.min(100, p) + "%";
    document.querySelectorAll("#presets button").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.km === km));
  }
  ["i-km", "i-days", "i-eff", "i-inc"].forEach((id) => $(id).addEventListener("input", calc));
  document.querySelectorAll("#presets button").forEach((b) => b.addEventListener("click", () => {
    $("i-km").value = b.dataset.km; $("i-days").value = b.dataset.km === "160" ? 26 : 22; calc();
  }));
  document.querySelectorAll("#i-price button").forEach((b) => b.addEventListener("click", () => {
    priceMode = b.dataset.p;
    document.querySelectorAll("#i-price button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    calc();
  }));
  calc();


  /* comparison cards: 1390 vs selected year */
  const byY = Object.fromEntries(D.cards.map((r) => [r.y, r]));
  const base = 1390, ARW = '<svg class="arw" viewBox="0 0 64 16" aria-hidden="true"><path d="M62 8H4M10 2L3 8l7 6"/></svg>';
  let endY = 1405;
  function drawCards() {
    $("cmp-year-o").textContent = yr(endY);
    $("cmp-prev").disabled = endY <= 1391; $("cmp-next").disabled = endY >= 1405;
    const A = byY[base], B = byY[endY], pa = A.pride != null ? base : 1391;
    const card = (t, from, to, d) =>
      `<div class="card"><p class="ct">${t}</p><div class="nums"><span class="from">${from}</span>${ARW}<b>${to}</b></div><span>${d}</span></div>`;
    $("cmp-cards").innerHTML =
      card("دستمزد به دلار", fa(A.wageUsd), fa(B.wageUsd), "حداقل دستمزد ماهانه، دلار") +
      card("پراید", fa(byY[pa].pride), fa(B.pride), "ماه حداقل دستمزد برای ارزان‌ترین خودرو") +
      card("مسکن تهران", fa(A.sqm, 1), fa(B.sqm, 1), "ماه حداقل دستمزد برای یک متر مربع");
    const notes = ["دستمزد به نرخ میانگین سالانه‌ی دلار آزاد" + (endY === 1405 ? "، ۱۴۰۵ تا پایان شهریور" : ""),
      `قیمت پراید از گزارش‌های رسانه‌ای، برای ${yr(base)} داده نیست و ${yr(1391)} آمده است`,
      "مسکن: بانک مرکزی و مرکز آمار، محاسبه‌ی نگارنده" + (B.sqmEst ? `. رقم ${yr(endY)} برآورد است از روند قیمت‌های آگهی‌شده در کیلید` : "")];
    $("cmp-notes").innerHTML = notes.map((n) => `<li>${n}</li>`).join("");
  }
  $("cmp-prev").addEventListener("click", () => { if (endY > 1391) { endY--; drawCards(); } });
  $("cmp-next").addEventListener("click", () => { if (endY < 1405) { endY++; drawCards(); } });
  drawCards();

  /* loop diagram */
  const svg = $("loop"), NS = "http://www.w3.org/2000/svg";
  const mk = (tag, a, p) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); (p || svg).appendChild(n); return n; };
  const nodes = [
    { x: 630, y: 70, t: "ریال ارزش خود را از دست می‌دهد", s: "دلار هر سال گران‌تر" },
    { x: 630, y: 250, t: "مسکن و خودرو با دلار بالا می‌روند", s: "دستمزد عقب می‌ماند" },
    { x: 371, y: 250, t: "دورتر زندگی کن، بیشتر بران", s: "حاشیه‌نشینی و شغل دوم با خودرو" },
    { x: 371, y: 70, t: "بنزین ارزان، ضربه‌گیر", s: "تنها قیمتی که یخ زده" },
    { x: 112, y: 70, t: "افزایش قیمت بنزین", s: "ضربه‌گیر برداشته می‌شود ← اعتراض", hot: true },
  ];
  const links = [
    { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 },
    { a: 3, b: 0, dash: true, label: "هزینه‌ی یارانه و واردات؟", label2: "(پرسش باز)" },
    { a: 3, b: 4, hot: true },
  ];
  const defs = mk("defs", {});
  [["ah", v("--ink-3")], ["ahh", v("--accent")]].forEach(([id, col]) => {
    const m = mk("marker", { id, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    mk("path", { d: "M0,0L10,5L0,10z", fill: col }, m);
  });
  const W = 210, H = 74;
  const edge = (n, ux, uy) => { // point on box border in direction (ux,uy)
    const tx = ux ? (W / 2 + 6) / Math.abs(ux) : Infinity, ty = uy ? (H / 2 + 6) / Math.abs(uy) : Infinity, t = Math.min(tx, ty);
    return [n.x + ux * t, n.y + uy * t];
  };
  const arrows = links.map((l) => {
    const A = nodes[l.a], B = nodes[l.b];
    let dx = B.x - A.x, dy = B.y - A.y; const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    const [sx, sy] = edge(A, dx, dy), [ex, ey] = edge(B, -dx, -dy);
    const p = mk("path", { d: `M${sx},${sy} L${ex},${ey}`, class: "arrow" + (l.hot ? " hot" : ""), "stroke-dasharray": l.dash ? "5 5" : "",
      "marker-end": l.hot ? "url(#ahh)" : "url(#ah)" });
    if (l.label) { const t = mk("text", { x: (sx + ex) / 2, y: (sy + ey) / 2 - 10, "text-anchor": "middle", class: "ax", style: "font-size:13px;fill:var(--ink-3)" }); t.textContent = l.label; t.setAttribute("y", 18); const t2 = mk("text", { x: (sx + ex) / 2, y: 128, "text-anchor": "middle", class: "ax", style: "font-size:12px;fill:var(--ink-3)" }); t2.textContent = l.label2 || ""; }
    return p;
  });
  nodes.forEach((n, i) => {
    const g = mk("g", { class: "node" + (n.hot ? " hot" : ""), transform: `translate(${n.x - W / 2},${n.y - H / 2})`, tabindex: 0 });
    mk("rect", { width: W, height: H, rx: 14 }, g);
    const t = mk("text", { x: W / 2, y: 31, "text-anchor": "middle" }, g); t.textContent = n.t;
    const s = mk("text", { x: W / 2, y: 54, "text-anchor": "middle", class: "s" }, g); s.textContent = n.s;
    const mine = links.map((l, k) => (l.a === i || l.b === i ? k : -1)).filter((k) => k >= 0);
    const on = () => { g.classList.add("hot"); mine.forEach((k) => arrows[k].classList.add("hot")); };
    const off = () => { if (!n.hot) g.classList.remove("hot"); arrows.forEach((a, k) => { if (!links[k].hot) a.classList.remove("hot"); }); };
    g.addEventListener("mouseenter", on); g.addEventListener("mouseleave", off); g.addEventListener("focus", on); g.addEventListener("blur", off);
  });

  function segmented(group, cb) {
    group.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      group.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      cb(b);
    }));
  }
})();
