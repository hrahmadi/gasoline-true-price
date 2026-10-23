/* Tiny dependency-free SVG chart kit: line/step charts and bar charts with Persian digits and tooltips. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const faNum = (v, d = 0) =>
    v == null || isNaN(v) ? "—" : Number(v).toLocaleString("fa-IR", { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  function niceTicks(min, max, count = 5) {
    const span = max - min || 1;
    const step0 = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const err = step0 / mag;
    const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  function tooltip(host) {
    let t = host.querySelector(".tt");
    if (!t) { t = document.createElement("div"); t.className = "tt"; host.appendChild(t); }
    return {
      show(html, x, y) {
        t.innerHTML = html; t.style.display = "block";
        const hw = host.clientWidth, tw = t.offsetWidth;
        let left = x + 14; if (left + tw > hw) left = x - tw - 14; if (left < 0) left = 4;
        t.style.left = left + "px"; t.style.top = Math.max(0, y - 10) + "px";
      },
      hide() { t.style.display = "none"; },
    };
  }

  /* opts: {series:[{key,name,color,dash,step,width}], data:[{y,...}], x:"y", yFmt, yMin, yMax, log, height,
            annotations:[{x,label}], xTicks:[], endLabels:true, tipFmt(row)->html} */
  function line(host, opts) {
    const draw = () => {
      host.querySelectorAll("svg").forEach((s) => s.remove());
      const W = Math.max(300, host.clientWidth), H = opts.height || (W < 560 ? 280 : 340);
      const m = { t: 18, r: opts.endLabels === false ? 16 : (W < 560 ? 70 : 96), b: 34, l: 50 };
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": opts.label || "" });
      host.prepend(svg);
      const data = opts.data, xk = opts.x || "y";
      const xs = data.map((d) => d[xk]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs);
      let vals = [];
      opts.series.forEach((s) => data.forEach((d) => d[s.key] != null && vals.push(d[s.key])));
      let y0 = opts.yMin != null ? opts.yMin : Math.min(0, ...vals), y1 = opts.yMax != null ? opts.yMax : Math.max(...vals) * 1.08;
      const log = !!opts.log;
      const ly = (v) => (log ? Math.log10(Math.max(v, 1e-6)) : v);
      if (log) { y0 = opts.yMin || Math.min(...vals) * 0.8; }
      const X = (v) => m.l + ((v - x0) / (x1 - x0 || 1)) * (W - m.l - m.r);
      const Y = (v) => H - m.b - ((ly(v) - ly(y0)) / (ly(y1) - ly(y0) || 1)) * (H - m.t - m.b);
      const grid = css("--grid"), ink = css("--ink-2");
      // y grid
      let ticks = log ? [] : niceTicks(y0, y1, 5);
      if (log) { for (let p = Math.floor(Math.log10(y0)); p <= Math.ceil(Math.log10(y1)); p++) [1, 3].forEach((k) => { const v = k * 10 ** p; if (v >= y0 && v <= y1) ticks.push(v); }); }
      ticks.forEach((v) => {
        el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: grid, "stroke-width": 1 }, svg);
        const t = el("text", { x: m.l - 8, y: Y(v) + 4, "text-anchor": "end", class: "ax" }, svg);
        t.textContent = opts.yFmt ? opts.yFmt(v) : faNum(v);
      });
      // x ticks
      const xt = opts.xTicks || niceTicks(x0, x1, W < 560 ? 4 : 7).filter((v) => Number.isInteger(v));
      xt.forEach((v) => {
        const t = el("text", { x: X(v), y: H - m.b + 20, "text-anchor": "middle", class: "ax" }, svg);
        t.textContent = faNum(v).replace(/٬/g, "");
      });
      // annotations
      (opts.annotations || []).forEach((a) => {
        el("line", { x1: X(a.x), x2: X(a.x), y1: m.t, y2: H - m.b, stroke: css("--accent"), "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0.55 }, svg);
        if (a.label) {
          const nearEnd = X(a.x) > W - m.r - 60;
          const t = el("text", { x: X(a.x) + (nearEnd ? -4 : 4), y: m.t + 10 + (a.dy || 0), class: "ann", "text-anchor": nearEnd ? "end" : "start" }, svg);
          t.textContent = a.label;
        }
      });
      // series
      opts.series.forEach((s) => {
        const pts = data.filter((d) => d[s.key] != null);
        if (!pts.length) return;
        let dstr = "";
        pts.forEach((d, i) => {
          const px = X(d[xk]), py = Y(d[s.key]);
          if (i === 0) dstr += `M${px},${py}`;
          else if (s.step) dstr += `H${px}V${py}`;
          else dstr += `L${px},${py}`;
        });
        el("path", { d: dstr, fill: "none", stroke: s.color, "stroke-width": s.width || 2.5, "stroke-dasharray": s.dash || "", "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
        if (opts.endLabels !== false) {
          const last = pts[pts.length - 1];
          el("circle", { cx: X(last[xk]), cy: Y(last[s.key]), r: 3.5, fill: s.color }, svg);
          const t = el("text", { x: X(last[xk]) + 8, y: Y(last[s.key]) + 4 + (s.labelDy || 0), class: "lab", fill: s.color }, svg);
          t.textContent = s.name;
        }
      });
      // hover
      const tip = tooltip(host);
      const cross = el("line", { y1: m.t, y2: H - m.b, stroke: ink, "stroke-width": 1, opacity: 0 }, svg);
      const dots = opts.series.map((s) => el("circle", { r: 4.5, fill: css("--bg"), stroke: s.color, "stroke-width": 2, opacity: 0 }, svg));
      const hit = el("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" }, svg);
      const move = (ev) => {
        const r = svg.getBoundingClientRect();
        const px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * (W / r.width);
        let best = data[0];
        data.forEach((d) => { if (Math.abs(X(d[xk]) - px) < Math.abs(X(best[xk]) - px)) best = d; });
        cross.setAttribute("x1", X(best[xk])); cross.setAttribute("x2", X(best[xk])); cross.setAttribute("opacity", 0.35);
        opts.series.forEach((s, i) => {
          if (best[s.key] == null) return dots[i].setAttribute("opacity", 0);
          dots[i].setAttribute("cx", X(best[xk])); dots[i].setAttribute("cy", Y(best[s.key])); dots[i].setAttribute("opacity", 1);
        });
        const html = opts.tipFmt ? opts.tipFmt(best) :
          `<b>${faNum(best[xk]).replace(/٬/g, "")}</b>` + opts.series.filter((s) => best[s.key] != null).map((s) =>
            `<div><i style="background:${s.color}"></i>${s.name}: ${opts.yFmt ? opts.yFmt(best[s.key]) : faNum(best[s.key], 1)}</div>`).join("");
        tip.show(html, (X(best[xk]) / W) * r.width, (m.t / H) * r.height);
      };
      hit.addEventListener("mousemove", move); hit.addEventListener("touchstart", move, { passive: true }); hit.addEventListener("touchmove", move, { passive: true });
      hit.addEventListener("mouseleave", () => { tip.hide(); cross.setAttribute("opacity", 0); dots.forEach((d) => d.setAttribute("opacity", 0)); });
    };
    draw();
    if (host._ro) host._ro.disconnect();
    host._ro = new ResizeObserver(() => { clearTimeout(host._rt); host._rt = setTimeout(draw, 60); });
    host._ro.observe(host);
    host._redraw = draw;
  }

  /* Horizontal bars. opts: {bars:[{label,value,color,note}], fmt, max, height} */
  function bars(host, opts) {
    const draw = () => {
      host.querySelectorAll("svg").forEach((s) => s.remove());
      const W = Math.max(300, host.clientWidth), rowH = opts.rowH || 34;
      const m = { t: 6, r: 12, b: 8, l: W < 560 ? 92 : 128 };
      const H = m.t + m.b + rowH * opts.bars.length;
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": opts.label || "" });
      host.prepend(svg);
      const max = opts.max || Math.max(...opts.bars.map((b) => b.value)) * 1.12;
      const valW = 64;
      const X = (v) => (v / max) * (W - m.l - m.r - valW);
      const tip = tooltip(host);
      opts.bars.forEach((b, i) => {
        const y = m.t + i * rowH;
        // RTL: label on the right, bar grows leftward
        const t = el("text", { x: W - 4, y: y + rowH / 2 + 5, "text-anchor": "end", class: "barlab" + (b.strong ? " strong" : "") }, svg);
        t.textContent = b.label;
        const bw = Math.max(2, X(b.value));
        const bx = W - m.l - bw;
        const r = el("rect", { x: bx, y: y + 6, width: bw, height: rowH - 12, rx: 4, fill: b.color || css("--muted-bar") }, svg);
        const v = el("text", { x: bx - 6, y: y + rowH / 2 + 5, "text-anchor": "end", class: "barval" + (b.strong ? " strong" : "") }, svg);
        v.textContent = opts.fmt ? opts.fmt(b.value) : faNum(b.value, 2);
        if (b.note) {
          r.addEventListener("mousemove", (ev) => { const R = svg.getBoundingClientRect(); tip.show(b.note, ev.clientX - R.left, ev.clientY - R.top - 30); });
          r.addEventListener("mouseleave", () => tip.hide());
        }
      });
    };
    draw();
    if (host._ro) host._ro.disconnect();
    host._ro = new ResizeObserver(() => { clearTimeout(host._rt); host._rt = setTimeout(draw, 60); });
    host._ro.observe(host);
    host._redraw = draw;
  }

  /* Vertical column chart for deciles. opts: {cols:[{label,value,color}], fmt, max} */
  function columns(host, opts) {
    const draw = () => {
      host.querySelectorAll("svg").forEach((s) => s.remove());
      const W = Math.max(300, host.clientWidth), H = opts.height || 260;
      const m = { t: 24, r: 8, b: 40, l: 8 };
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-label": opts.label || "" });
      host.prepend(svg);
      const n = opts.cols.length, max = opts.max || Math.max(...opts.cols.map((c) => c.value)) * 1.15;
      const slot = (W - m.l - m.r) / n, bw = Math.min(46, slot * 0.66);
      opts.cols.forEach((c, i) => {
        const cx = m.l + slot * i + slot / 2;
        const h = (c.value / max) * (H - m.t - m.b);
        el("rect", { x: cx - bw / 2, y: H - m.b - h, width: bw, height: h, rx: 4, fill: c.color }, svg);
        const v = el("text", { x: cx, y: H - m.b - h - 6, "text-anchor": "middle", class: "barval" }, svg);
        v.textContent = opts.fmt ? opts.fmt(c.value) : faNum(c.value, 2);
        const l = el("text", { x: cx, y: H - m.b + 18, "text-anchor": "middle", class: "ax" }, svg);
        l.textContent = c.label;
      });
      if (opts.caption) {
        const a = el("text", { x: W / 2, y: H - 4, "text-anchor": "middle", class: "ax" }, svg);
        a.textContent = opts.caption;
      }
    };
    draw();
    if (host._ro) host._ro.disconnect();
    host._ro = new ResizeObserver(() => { clearTimeout(host._rt); host._rt = setTimeout(draw, 60); });
    host._ro.observe(host);
    host._redraw = draw;
  }

  window.Charts = { line, bars, columns, faNum, css };
})();
