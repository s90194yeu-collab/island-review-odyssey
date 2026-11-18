/**
 * 3D 群島場景引擎 (3F 造島世界 × 島嶼建設養成 × SVG 繪本風格 × 可控主角南山豹 × 海洋天空生態)
 * 包含：Q版南山豹主角(8向動態/男女性別制服/雙段跳/衝刺/歡呼/熱舞/水面衝浪)、
 *       中央自強廣場主島、跨海拱橋、1F→2F→3F 高低差與動態瀑布、夜景發光小屋、
 *       群聚森林、海豚跳躍、藍鯨噴水、熱氣球、海鷗、彩虹、3D 建設實體
 */

(function () {
  /* ==================== Q 版南山豹 SVG 向量描繪引擎 ==================== */
  const OL = "#1d1b2b";
  const f2 = (n) => Math.round(n * 100) / 100;
  const hexRGB = (h) => {
    const clean = String(h).replace("#", "");
    return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
  };
  function shade(h, f) {
    const [r, g, b] = hexRGB(h);
    const m = (v) => Math.max(0, Math.min(255, Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1))));
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  }
  const P_ = (d, fill, stroke, sw) => ({ d, fill, stroke, sw });
  const ELp = (cx, cy, rx, ry) =>
    `M${f2(cx - rx)} ${f2(cy)}a${f2(rx)} ${f2(ry)} 0 1 0 ${f2(2 * rx)} 0a${f2(rx)} ${f2(ry)} 0 1 0 ${f2(-2 * rx)} 0Z`;
  const EL = (cx, cy, rx, ry, fill, stroke = OL, sw = 0.8) => P_(ELp(cx, cy, rx, ry), fill, stroke, sw);
  const RRp = (x, y, w, h, r) =>
    `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  const RR = (x, y, w, h, r, fill, stroke = OL, sw = 0.8) => P_(RRp(x, y, w, h, r), fill, stroke, sw);
  const CAPp = (x1, y1, x2, y2, r) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const L = Math.hypot(dx, dy) || 0.001;
    const nx = (-dy / L) * r;
    const ny = (dx / L) * r;
    return `M${f2(x1 + nx)} ${f2(y1 + ny)}L${f2(x2 + nx)} ${f2(y2 + ny)}A${r} ${r} 0 0 0 ${f2(x2 - nx)} ${f2(y2 - ny)}L${f2(x1 - nx)} ${f2(y1 - ny)}A${r} ${r} 0 0 0 ${f2(x1 + nx)} ${f2(y1 + ny)}Z`;
  };
  const CAP = (x1, y1, x2, y2, r, fill, stroke = OL, sw = 0.8) => P_(CAPp(x1, y1, x2, y2, r), fill, stroke, sw);
  const PT = (d, fill, stroke = OL, sw = 0.8) => P_(d, fill, stroke, sw);
  const LN = (d, stroke, sw = 1) => P_(d, "none", stroke, sw);

  const UNI = { m: { trim: "#2f5fb5" }, f: { trim: "#d8343f" } };
  const pantherCfg = (sex) => ({
    species: "panther",
    sex: sex === "f" ? "f" : "m",
    shirt: sex === "f" ? "#f6bfd0" : "#a9c8ea",
    vest: "#8f2130",
    trim: UNI[sex === "f" ? "f" : "m"].trim,
    bottom: sex === "f" ? "#ef6aa6" : "#9da1a8",
    shorts: sex !== "f"
  });

  function pantherQ(c, qf, f) {
    const S = [];
    const sw = [0, 1, 0, -1][f];
    const fur = "#2d2c3e";
    const fur2 = "#43425c";
    const farC = shade(fur, 0.82);
    const top = c.shirt || "#fbfbf8";
    const bottom = c.bottom;
    const skirt = c.sex === "f";
    const inner = "#8f8b98";
    const muz = "#f8f4ea";
    const iris = "#f2a91e";

    if (qf) S.push(LN("M12.5 32Q5 33.5 5 26Q5.2 22 7.8 21", fur, 2.7), LN("M7.2 22Q7.4 21.3 7.8 21", fur2, 2.7));
    const lL = sw > 0 ? 1.4 : 0;
    const lR = sw < 0 ? 1.4 : 0;
    const aL = sw * 1.1;
    const aR = -sw * 1.1;
    S.push(CAP(14, 32, 13.4, 43.4 - lL, 2.05, farC), EL(14.4, 45 - lL, 2.8, 1.5, farC));
    S.push(CAP(19.2, 32, 19.6, 43.4 - lR, 2.15, fur), EL(20.4, 45 - lR, 3, 1.6, fur));
    S.push(CAP(10.6, 23, 9.4 + aL, 30, 1.6, farC), EL(9.4 + aL, 30.8, 1.45, 1.4, shade(fur2, 0.82)));
    const bx = 10;
    const bw = 12.4;
    const sk = sw * 0.55;
    S.push(
      RR(bx, 21, bw, 13, 4, top),
      PT(qf ? "M19.6 21.4Q22.4 21.6 22.4 25V30Q22.4 34 19.6 34Z" : "M10 25Q10 21.6 12.8 21.4V34Q10 34 10 30Z", "rgba(40,40,80,.12)", null)
    );
    if (skirt) {
      S.push(
        PT(`M10 29.5H22.4L${24.6 + sk} 36.6Q${16.8 + sk} 38.3 ${8.4 + sk} 36.6Z`, bottom),
        LN("M13 30.5L12 36.9M16.6 30.5V37.4M20 30.5L21 36.9", "rgba(0,0,0,.35)", 0.55)
      );
    } else {
      S.push(RR(bx + 0.2, 29.6, bw - 0.4, 5.4, 1.6, bottom), LN("M17.2 30.4V35", "rgba(0,0,0,.25)", 0.5));
    }
    if (qf) {
      S.push(PT("M10 25Q10 21.3 12.4 21.2L17.4 26.8L20.6 21.2Q22.4 21.3 22.4 25V31.6Q16.2 33.4 10 31.6Z", c.vest || "#8f2130"));
      if (c.sex === "m") {
        S.push(
          PT("M13 21.1L17.4 23.3L15.9 24.5Z", shade(top, 1.15), OL, 0.4),
          PT("M20.4 21.1L17.4 23.3L18.7 24.5Z", shade(top, 1.15), OL, 0.4),
          PT("M16.7 22.8H18.1L18.5 26.4L17.4 27.6L16.3 26.4Z", "#22305e", OL, 0.45)
        );
      } else {
        S.push(
          PT("M12.8 21.1Q12.6 23.8 15.6 23.7Q17.2 23.4 17.4 22.2Z", "#fde3ea", OL, 0.45),
          PT("M20.6 21.1Q20.8 23.6 18.6 23.7Q17.5 23.4 17.4 22.2Z", "#fde3ea", OL, 0.45)
        );
      }
      S.push(
        PT("M18.5 28.4L19.05 27.4L19.6 28.4Z", "#3aa655", null),
        PT("M19.6 28.4L20.15 27.4L20.7 28.4Z", "#e0453c", null),
        PT("M20.7 28.4L21.25 27.4L21.8 28.4Z", "#3f6fd1", null)
      );
    } else {
      S.push(RR(bx, 21.4, bw, 10.8, 3.2, c.vest || "#8f2130"));
    }
    S.push(CAP(21.8, 23, 23.4 + aR, 30.4, 1.75, fur), EL(23.4 + aR, 31.2, 1.6, 1.5, fur2), CAP(21.8, 22.8, 22.3 + aR * 0.3, 25.4, 2.1, top));
    if (!qf) S.push(LN("M15 32Q14.5 39.5 9.5 37.6Q5.4 35.6 6.6 29.4", fur, 2.9), LN("M6.3 30.6Q6.4 29.8 6.6 29.4", fur2, 2.9));
    if (qf) {
      S.push(EL(9.6, 5.6, 3.4, 3.4, fur), EL(23.8, 5.2, 3.6, 3.6, fur), EL(9.8, 5.8, 1.9, 1.9, inner, null), EL(23.7, 5.4, 2.1, 2.1, inner, null));
      S.push(EL(16.6, 13, 11.1, 9.6, fur), EL(13.4, 8.2, 4.4, 2.2, "rgba(255,255,255,.07)", null));
      [
        [14.4, 2.9],
        [22.3, 3.55]
      ].forEach(([x, r]) =>
        S.push(
          EL(x, 12.7, r * 0.92, r, "#f3ead8", OL, 0.8),
          EL(x + 0.2, 12.8, r * 0.78, r * 0.8, iris, null),
          EL(x + 0.35, 13, r * 0.48, r * 0.49, "#1a1410", null),
          EL(x - 0.6, 11.8, r * 0.22, r * 0.22, "#ffffff", null)
        )
      );
      S.push(EL(17.7, 17.7, 2.8, 2.6, muz, null), EL(22.4, 17.7, 3.4, 2.7, muz, null), EL(20.2, 19.4, 2.5, 1.7, muz, null));
      S.push(PT("M17.4 15Q20.2 14.2 23 15Q22.7 17 20.2 17.7Q17.7 17 17.4 15Z", "#f07b2c", OL, 0.6));
      S.push(PT("M18.1 18.7Q20.2 18.3 22.3 18.7Q21.9 21.3 20.2 21.5Q18.5 21.3 18.1 18.7Z", "#d93a3f", OL, 0.55), EL(20.2, 20.6, 1.1, 0.6, "#ff8a8f", null));
    } else {
      S.push(EL(8.6, 5.6, 3.4, 3.4, fur), EL(22.6, 5.2, 3.6, 3.6, fur));
      S.push(
        EL(26.4, 16.6, 2.3, 2.5, muz, OL, 0.8),
        EL(15.6, 13, 11.2, 9.6, fur),
        EL(12.6, 8.2, 4.6, 2.3, "rgba(255,255,255,.07)", null),
        PT("M25.2 7.6Q27.8 10.4 26.9 15.6Q25.4 12 24.2 9Z", "rgba(255,255,255,.06)", null)
      );
    }
    return S;
  }

  function charShapes(c, d, f) {
    if (d === "fr" || d === "br") {
      return pantherQ(c, d === "fr", f);
    }
    const S = [];
    const side = d === "right";
    const back = d === "back";
    const front = d === "front";
    const sw = [0, 1, 0, -1][f];
    const fur = "#2d2c3e";
    const fur2 = "#43425c";
    const top = c.shirt || "#fbfbf8";
    const bottom = c.bottom || "#9da1a8";
    const skirt = c.sex === "f";
    const shoe = fur;

    if (front) S.push(LN("M20 33Q27.5 34 27.6 27Q27.8 23 25.2 21.8", fur, 2.7), LN("M26.4 23.2Q25.9 22.2 25.2 21.8", fur2, 2.7));
    if (side) S.push(LN("M12 32Q4 33 4.4 25.5Q4.8 21.4 7.4 20.6", fur, 2.7));

    if (!side) {
      const lL = sw > 0 ? 1.4 : 0;
      const lR = sw < 0 ? 1.4 : 0;
      S.push(CAP(13.2, 32, 13.2, 43.4 - lL, 2.15, fur), CAP(18.8, 32, 18.8, 43.4 - lR, 2.15, fur));
      S.push(EL(13.2, 45 - lL, 2.9, 1.6, shoe), EL(18.8, 45 - lR, 2.9, 1.6, shoe));
    } else {
      const a = sw * 3.2;
      S.push(CAP(16, 32, 16 + a, 43.4, 2.1, shade(fur, 0.72)), EL(17 + a, 45, 3, 1.5, shade(shoe, 0.8)));
      S.push(CAP(16, 32, 16 - a, 43.4, 2.15, fur), EL(17 - a, 45, 3, 1.55, shoe));
    }

    const bx = side ? 11 : 9.5;
    const bw = side ? 10 : 13;
    S.push(RR(bx, 21, bw, 13, 4, top));
    S.push(
      PT(
        side ? `M${bx + bw - 3} 21.4Q${bx + bw} 21.6 ${bx + bw} 25V30Q${bx + bw} 34 ${bx + bw - 3} 34Z` : "M19.5 21.4Q22.5 21.6 22.5 25V30Q22.5 34 19.5 34Z",
        "rgba(40,40,80,.10)",
        null
      )
    );
    const sk = sw * 0.55;
    if (skirt) {
      S.push(
        PT(
          side
            ? `M10.5 29.5H21.5L${23.6 - sk} 36.6Q${16 - sk} 38.2 ${8.4 - sk} 36.6Z`
            : `M9.5 29.5H22.5L${25 + sk} 36.6Q${16 + sk} ${38.4 - Math.abs(sk) * 0.4} ${7 + sk} 36.6Z`,
          bottom
        ),
        LN(
          side ? "M13.5 30.5L12.7 36.8M17 30.5V37.2M20 30.5L20.9 36.9" : "M12.5 30.5L11.4 36.9M16 30.5V37.4M19.5 30.5L20.6 36.9",
          "rgba(0,0,0,.35)",
          0.55
        )
      );
    } else {
      S.push(RR(bx + 0.2, 29.6, bw - 0.4, 5.4, 1.6, bottom), LN(side ? "" : "M16 30.4V35", "rgba(0,0,0,.25)", 0.5));
    }

    if (c.vest) {
      if (front) {
        S.push(PT("M9.5 25Q9.5 21.3 12.2 21.2L16 26.8L19.8 21.2Q22.5 21.3 22.5 25V31.6Q16 33.4 9.5 31.6Z", c.vest));
        if (c.sex === "m") {
          S.push(
            PT("M12.4 21.1L16 23.3L14.5 24.5Z", shade(top, 1.15), OL, 0.4),
            PT("M19.6 21.1L16 23.3L17.5 24.5Z", shade(top, 1.15), OL, 0.4),
            PT("M15.25 22.8H16.75L17.2 26.4L16 27.6L14.8 26.4Z", "#22305e", OL, 0.45)
          );
        } else {
          S.push(
            PT("M12.2 21.1Q12 23.8 14.6 23.7Q15.9 23.4 16 22.2Z", "#fde3ea", OL, 0.45),
            PT("M19.8 21.1Q20 23.8 17.4 23.7Q16.1 23.4 16 22.2Z", "#fde3ea", OL, 0.45)
          );
        }
        S.push(
          PT("M17.9 28.4L18.45 27.4L19 28.4Z", "#3aa655", null),
          PT("M19 28.4L19.55 27.4L20.1 28.4Z", "#e0453c", null),
          PT("M20.1 28.4L20.65 27.4L21.2 28.4Z", "#3f6fd1", null)
        );
      } else {
        S.push(RR(bx, 21.4, bw, 10.8, 3.2, c.vest));
      }
    }

    if (!side) {
      const aL = sw * 1.1;
      const aR = -sw * 1.1;
      S.push(CAP(9.8, 23, 8 + aL, 30.4, 1.75, fur), EL(8 + aL, 31.2, 1.6, 1.5, fur2));
      S.push(CAP(22.2, 23, 24 + aR, 30.4, 1.75, fur), EL(24 + aR, 31.2, 1.6, 1.5, fur2));
      S.push(CAP(9.8, 22.8, 9.3 + aL * 0.3, 25.4, 2.1, top), CAP(22.2, 22.8, 22.7 + aR * 0.3, 25.4, 2.1, top));
    } else {
      const a = -sw * 3;
      S.push(CAP(16, 23, 16 + a, 30.4, 1.75, fur), EL(16 + a, 31.2, 1.6, 1.5, fur2), CAP(16, 22.8, 16 + a * 0.35, 25.8, 2.1, top));
    }
    if (back) S.push(LN("M16 32Q16.5 39.5 21.5 37.6Q26 35.6 25 29.4", fur, 2.9), LN("M25.3 30.6Q25.2 29.8 25 29.4", fur2, 2.9));

    const inner = "#8f8b98";
    const muz = "#f8f4ea";
    const iris = "#f2a91e";
    if (!side) {
      S.push(EL(8.3, 5.4, 3.6, 3.6, fur), EL(23.7, 5.4, 3.6, 3.6, fur));
      if (front) S.push(EL(8.4, 5.6, 2.1, 2.1, inner, null), EL(23.6, 5.6, 2.1, 2.1, inner, null));
      S.push(EL(16, 13, 11.2, 9.6, fur), EL(12.4, 8.2, 4.6, 2.3, "rgba(255,255,255,.07)", null));
      if (front) {
        S.push(EL(11.2, 7.4, 1, 0.65, inner, null), EL(20.8, 7.4, 1, 0.65, inner, null));
        [11.3, 20.7].forEach((x) =>
          S.push(
            EL(x, 12.7, 3.55, 3.55, "#f3ead8", OL, 0.8),
            EL(x, 12.8, 2.85, 2.85, iris, null),
            EL(x, 13, 1.75, 1.75, "#1a1410", null),
            EL(x - 0.95, 11.8, 0.8, 0.8, "#ffffff", null),
            EL(x + 0.9, 13.9, 0.35, 0.35, "#ffffff", null)
          )
        );
        S.push(EL(13.5, 17.7, 3.4, 2.7, muz, null), EL(18.5, 17.7, 3.4, 2.7, muz, null), EL(16, 19.4, 2.5, 1.7, muz, null));
        S.push(PT("M13.2 15Q16 14.2 18.8 15Q18.5 17 16 17.7Q13.5 17 13.2 15Z", "#f07b2c", OL, 0.6));
        S.push(PT("M13.9 18.7Q16 18.3 18.1 18.7Q17.7 21.3 16 21.5Q14.3 21.3 13.9 18.7Z", "#d93a3f", OL, 0.55), EL(16, 20.6, 1.1, 0.6, "#ff8a8f", null));
      }
    } else {
      S.push(EL(15, 5.2, 3.4, 3.4, fur), EL(15.1, 5.4, 1.9, 1.9, inner, null));
      S.push(EL(17, 13, 10.4, 9.4, fur), EL(14, 8.4, 4, 2.2, "rgba(255,255,255,.07)", null));
      S.push(
        EL(21.4, 12.6, 2.9, 2.9, "#f3ead8", OL, 0.75),
        EL(21.7, 12.7, 2.25, 2.25, iris, null),
        EL(22, 12.9, 1.35, 1.35, "#1a1410", null),
        EL(21.3, 11.9, 0.65, 0.65, "#ffffff", null)
      );
      S.push(EL(24.2, 17.4, 3.6, 2.8, muz, null), PT("M25.4 14.9Q27.7 14.5 28 15.4Q27.5 17 26.2 17.1Q25.3 16.3 25.4 14.9Z", "#f07b2c", OL, 0.55));
      S.push(PT("M24.2 18.7Q26.5 18.5 27 18.9Q26.4 20.6 25 20.4Z", "#d93a3f", OL, 0.5));
    }
    return S;
  }

  function drawShapes(x, S, mirror) {
    x.save();
    if (mirror) {
      x.translate(32, 0);
      x.scale(-1, 1);
    }
    x.lineCap = "round";
    x.lineJoin = "round";
    S.forEach((s) => {
      if (!s.d) return;
      const p = new Path2D(s.d);
      if (s.fill && s.fill !== "none") {
        x.fillStyle = s.fill;
        x.fill(p);
      }
      if (s.stroke) {
        x.strokeStyle = s.stroke;
        x.lineWidth = s.sw || 1;
        x.stroke(p);
      }
    });
    x.restore();
  }

  class IslandSceneManager {
    constructor(containerEl, labelsContainerEl, callbacks) {
      this.container = containerEl;
      this.labelsContainer = labelsContainerEl;
      this.callbacks = callbacks || {};
      this.islandsData = [];
      this.progressGetter = null;

      this.isWebGL = false;
      this.islandGroups = new Map();
      this.nodeMeshes = new Map();
      this.lighthouseMeshes = new Map();
      this.islandCats = new Map();
      this.islandPaths = new Map();
      this.decorationMeshes = new Map(); // buildingId -> THREE.Group
      this.nightGlowMaterials = []; // window & lamp materials that glow at night
      this.rainbowMesh = null;
      this.labelEls = new Map();
      this.clickTargets = [];
      this.interactableSpots = []; // { type, kind, islandId, nodeId, label, x, z }

      this.selectedIslandId = null;
      this.atmosphereMode = "day"; // day | sunset | night
      this.nearIslandId = null;
      this.nearInteractable = null;

      // Camera & boat tween targets
      this.cameraMode = "follow"; // follow | overview
      this.chaseCam = true; // 跑酷追逐視角：跑動時鏡頭自動繞到角色背後（C 鍵切換）
      this.chaseDist = 11; // 鏡頭與角色的水平距離
      this.chaseHeight = 4.6; // 鏡頭高於注視點的高度（越小越接近背後平視）
      this.cameraTargetPos = null;
      this.controlsTargetPos = null;
      this.isTweening = false;
      this.groundWalkPlane = null;

      // Free-roam sailboat state
      this.boat = null;
      this.captainCat = null;
      this.boatMode = "auto"; // auto | free
      this.boatInput = { forward: 0, turn: 0 };
      this.boatTarget = { x: 0, z: 18.5 };
      this.boatCurrent = { x: 0, z: 10.5 };
      this.boatAngle = 0;

      // Controllable Q-version Nanshan Panther hero
      this.panther = null;
      this.pantherTexCache = new Map();
      this.use3DFigurine = true;
      this.pantherRenderMode = "sprite"; // sprite (Higgsfield 8-dir Chibi figurine, default) | mesh | glb
      this.figurineImages = {};
      this.colliders = [];
      this.campusBoards = new Map();
      this.customGlbs = {};
      this.dioramaBillboards = [];
      this.pantherState = {
        sex: "m",
        x: 0,
        y: 1.76,
        z: 3.35,
        groundY: 1.76,
        onWater: false,
        vy: 0,
        onGround: true,
        doubleJumped: false,
        spinTimer: 0,
        dir: "front",
        frame: 0,
        walkPhase: 0,
        faceX: 0,
        faceZ: 1,
        faceAngle: 0,
        input: { ix: 0, iy: 0, sprint: false },
        boostTimer: 0,
        boostX: 0,
        boostY: 0,
        autoTarget: null,
        sprintToggle: false,
        action: { type: null, timer: 0 },
        emoteTimer: 0,
        dustAccum: 0,
        emoteText: ""
      };

      // Roaming Walker Cat on active island
      this.walkerCat = null;
      this.walkerState = {
        islandId: null,
        waypointIdx: 0,
        currentAngle: 0,
        targetAngle: 0,
        isMoving: false,
        pendingCallback: null
      };
      this.pawPrints = [];
      this.pawSpawnAccum = 0;

      // Dynamic FX pools
      this.oceanGeo = null;
      this.oceanMat = null;
      this.oceanBaseY = [];
      this.clouds = [];
      this.starField = null;
      this.hemiLight = null;
      this.sunLight = null;
      this.rimLight = null;

      this.ambientUpdaters = [];
      this.burstParticles = [];
      this.wakeRings = [];
      this.wakeSpawnAccum = 0;

      this.clockTime = 0;
      this.rafId = null;
    }

    _getViewportSize() {
      const cw = this.container ? this.container.clientWidth : 0;
      const ch = this.container ? this.container.clientHeight : 0;
      const winW = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 390;
      const winH = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || 780;
      return {
        width: Math.max(cw >= 20 ? cw : winW, 280),
        height: Math.max(ch >= 20 ? ch : winH, 280)
      };
    }

    init(islandsData, progressGetter) {
      this.islandsData = islandsData;
      this.progressGetter = progressGetter;
      this._preloadFigurineSprites();

      if (window.THREE && this._canUseWebGL()) {
        try {
          this._initThree();
          this.isWebGL = true;
        } catch (err) {
          console.warn("WebGL init failed, switching to 2D isometric fallback:", err);
          this.isWebGL = false;
          this._init2DFallback();
        }
      } else {
        this.isWebGL = false;
        this._init2DFallback();
      }

      if (typeof window.ResizeObserver === "function" && this.container) {
        this._resizeObserver = new window.ResizeObserver(() => this.onResize());
        this._resizeObserver.observe(this.container);
      }
      setTimeout(() => this.onResize(), 120);
      setTimeout(() => this.onResize(), 500);

      this._createFloatingLabels();
      this.refreshAllStates();
      this._animate();
    }

    _canUseWebGL() {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch (e) {
        return false;
      }
    }

    /* ==================== SVG 轉 Three.js CanvasTexture 工具 ==================== */
    _svgToTexture(svgStr, size = 512) {
      const THREE = window.THREE;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const tex = new THREE.CanvasTexture(canvas);
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        tex.needsUpdate = true;
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
      return tex;
    }

    _createShoreSvgTexture(accentColor) {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <circle cx="256" cy="256" r="240" fill="none" stroke="${accentColor}" stroke-width="5" stroke-dasharray="16 14" stroke-opacity="0.55" stroke-linecap="round"/>
          <circle cx="256" cy="256" r="222" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="6 18" stroke-opacity="0.45" stroke-linecap="round"/>
          <circle cx="256" cy="16" r="7" fill="#ffd32a" fill-opacity="0.85"/>
          <circle cx="496" cy="256" r="7" fill="#ffd32a" fill-opacity="0.85"/>
          <circle cx="256" cy="496" r="7" fill="#ffd32a" fill-opacity="0.85"/>
          <circle cx="16" cy="256" r="7" fill="#ffd32a" fill-opacity="0.85"/>
        </svg>
      `;
      return this._svgToTexture(svg, 512);
    }

    _createPawBadgeTexture(bgColor = "#ffffff", pawColor = "#ff7675") {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <circle cx="128" cy="128" r="118" fill="${bgColor}" fill-opacity="0.95" stroke="#ffd32a" stroke-width="8"/>
          <ellipse cx="128" cy="158" rx="44" ry="34" fill="${pawColor}"/>
          <circle cx="80" cy="108" r="18" fill="${pawColor}"/>
          <circle cx="112" cy="88" r="18" fill="${pawColor}"/>
          <circle cx="146" cy="88" r="18" fill="${pawColor}"/>
          <circle cx="176" cy="108" r="18" fill="${pawColor}"/>
        </svg>
      `;
      return this._svgToTexture(svg, 256);
    }

    _createCatSvgTexture(cfg) {
      const coat = cfg.coatColor || "#f5b041";
      const belly = cfg.bellyColor || "#fff7ea";
      const ear = cfg.earColor || "#ffb8b8";
      const accent = cfg.accentColor || "#ffd32a";
      const acc = cfg.accessoryType || "scarf";

      let accessorySvg = "";
      if (acc === "scarf") {
        accessorySvg = `
          <path d="M96 178 Q128 198 160 178 L164 196 Q128 214 92 196 Z" fill="${accent}" stroke="#7f1d1d" stroke-width="3"/>
          <path d="M142 188 L164 222 L144 226 L128 194 Z" fill="${accent}" stroke="#7f1d1d" stroke-width="3"/>
        `;
      } else if (acc === "crown") {
        accessorySvg = `
          <polygon points="94,70 104,40 122,58 128,34 134,58 152,40 162,70" fill="${accent}" stroke="#92400e" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="128" cy="56" r="5" fill="#ff7675"/>
        `;
      } else if (acc === "headphones") {
        accessorySvg = `
          <path d="M74 126 C74 62, 182 62, 182 126" fill="none" stroke="${accent}" stroke-width="11" stroke-linecap="round"/>
          <rect x="60" y="108" width="22" height="42" rx="10" fill="${accent}" stroke="#0f172a" stroke-width="3"/>
          <rect x="174" y="108" width="22" height="42" rx="10" fill="${accent}" stroke="#0f172a" stroke-width="3"/>
        `;
      } else if (acc === "explorerHat") {
        accessorySvg = `
          <ellipse cx="128" cy="72" rx="64" ry="14" fill="${accent}" stroke="#78350f" stroke-width="3"/>
          <path d="M92 70 C94 40, 162 40, 164 70 Z" fill="#d97706" stroke="#78350f" stroke-width="3"/>
          <rect x="93" y="61" width="70" height="7" rx="3" fill="#b91c1c"/>
        `;
      } else if (acc === "bowtie") {
        accessorySvg = `
          <polygon points="128,188 100,174 100,202" fill="${accent}" stroke="#064e3b" stroke-width="3" stroke-linejoin="round"/>
          <polygon points="128,188 156,174 156,202" fill="${accent}" stroke="#064e3b" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="128" cy="188" r="8" fill="#ffd32a" stroke="#064e3b" stroke-width="2.5"/>
        `;
      } else if (acc === "scroll") {
        accessorySvg = `
          <circle cx="148" cy="126" r="16" fill="rgba(255,245,180,0.28)" stroke="${accent}" stroke-width="4"/>
          <line x1="162" y1="136" x2="178" y2="156" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
          <rect x="166" y="176" width="26" height="44" rx="8" transform="rotate(-15 179 198)" fill="#fef3c7" stroke="#92400e" stroke-width="3"/>
        `;
      } else if (acc === "captain") {
        accessorySvg = `
          <path d="M84 72 C88 44, 168 44, 172 72 Z" fill="#ffffff" stroke="#1e3a8a" stroke-width="3.5"/>
          <rect x="82" y="66" width="92" height="12" rx="5" fill="#1e3a8a"/>
          <circle cx="128" cy="57" r="7" fill="#ffd32a"/>
        `;
      } else if (acc === "backpack") {
        accessorySvg = `
          <rect x="74" y="182" width="108" height="36" rx="14" fill="#0ea5e9" stroke="#0c4a6e" stroke-width="3"/>
          <path d="M100 182 L106 232 M156 182 L150 232" stroke="#bae6fd" stroke-width="6" stroke-linecap="round"/>
          <polygon points="128,184 114,204 142,204" fill="#ffd32a"/>
        `;
      }

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
          <defs>
            <radialGradient id="toyHeadGlow" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34"/>
              <stop offset="55%" stop-color="#ffffff" stop-opacity="0.0"/>
              <stop offset="100%" stop-color="#1e293b" stop-opacity="0.22"/>
            </radialGradient>
            <radialGradient id="toyBodyShade" cx="42%" cy="35%" r="68%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.26"/>
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0.22"/>
            </radialGradient>
          </defs>
          <ellipse cx="128" cy="240" rx="58" ry="12" fill="rgba(0,0,0,0.22)"/>
          <path d="M168 214 C214 206, 224 156, 198 144" fill="none" stroke="${coat}" stroke-width="18" stroke-linecap="round"/>
          <path d="M168 214 C214 206, 224 156, 198 144" fill="none" stroke="#334155" stroke-width="3" stroke-opacity="0.35" stroke-linecap="round"/>
          <path d="M78 232 C74 176, 94 156, 128 156 C162 156, 182 176, 178 232 Z" fill="${coat}" stroke="#334155" stroke-width="4" stroke-linejoin="round"/>
          <path d="M78 232 C74 176, 94 156, 128 156 C162 156, 182 176, 178 232 Z" fill="url(#toyBodyShade)"/>
          <ellipse cx="128" cy="206" rx="28" ry="26" fill="${belly}"/>
          <polygon points="74,106 68,52 110,78" fill="${coat}" stroke="#334155" stroke-width="4" stroke-linejoin="round"/>
          <polygon points="79,98 75,65 102,82" fill="${ear}"/>
          <polygon points="182,106 188,52 146,78" fill="${coat}" stroke="#334155" stroke-width="4" stroke-linejoin="round"/>
          <polygon points="177,98 181,65 154,82" fill="${ear}"/>
          <ellipse cx="128" cy="124" rx="58" ry="48" fill="${coat}" stroke="#334155" stroke-width="4"/>
          <ellipse cx="128" cy="124" rx="57" ry="47" fill="url(#toyHeadGlow)"/>
          <ellipse cx="89" cy="136" rx="10" ry="6" fill="#ff9ff3" fill-opacity="0.65"/>
          <ellipse cx="167" cy="136" rx="10" ry="6" fill="#ff9ff3" fill-opacity="0.65"/>
          <circle cx="105" cy="122" r="10.5" fill="#1e293b"/>
          <circle cx="102" cy="118" r="3.8" fill="#ffffff"/>
          <circle cx="108" cy="126" r="1.8" fill="#ffffff"/>
          <circle cx="151" cy="122" r="10.5" fill="#1e293b"/>
          <circle cx="148" cy="118" r="3.8" fill="#ffffff"/>
          <circle cx="154" cy="126" r="1.8" fill="#ffffff"/>
          <polygon points="123,131 133,131 128,137" fill="#ff7675"/>
          <path d="M116 140 Q122 146 128 139 Q134 146 140 140" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
          <path d="M64 124 L84 127 M62 135 L84 134 M192 124 L172 127 M194 135 L172 134" stroke="#64748b" stroke-width="2.6" stroke-linecap="round"/>
          <ellipse cx="104" cy="231" rx="14" ry="9" fill="${belly}" stroke="#334155" stroke-width="3"/>
          <ellipse cx="152" cy="231" rx="14" ry="9" fill="${belly}" stroke="#334155" stroke-width="3"/>
          ${accessorySvg}
        </svg>
      `;
      return this._svgToTexture(svg, 512);
    }

    _createOrganicShape(radius, seed = 0) {
      const THREE = window.THREE;
      const pts = [];
      const count = 20;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const mod = 1 + 0.08 * Math.sin(a * 3 + seed) + 0.045 * Math.cos(a * 5 - seed * 1.4);
        const r = radius * mod;
        pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
      }
      const shape = new THREE.Shape();
      shape.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < count; i++) {
        const curr = pts[i];
        const next = pts[(i + 1) % count];
        shape.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) * 0.5, (curr.y + next.y) * 0.5);
      }
      shape.closePath();
      return shape;
    }

    _loadTileTex(url, rx = 1, ry = 1) {
      const THREE = window.THREE;
      if (!THREE) return null;
      if (!this._texLoader) this._texLoader = new THREE.TextureLoader();
      const tex = this._texLoader.load(url);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(rx, ry);
      return tex;
    }

    _getEnvTextures() {
      const THREE = window.THREE;
      if (this._envTex) return this._envTex;
      // 貼圖以 world-unit 比例平鋪，ExtrudeGeometry 使用世界座標 UV（約 0.14~0.22/m）
      const env = {
        ocean: this._loadTileTex("assets/tex_ocean.jpg?v=7", 42, 42),
        oceanBump: this._loadTileTex("assets/tex_ocean_bump.jpg?v=7", 42, 42),
        sand: this._loadTileTex("assets/tex_sand.jpg?v=7", 0.15, 0.15),
        sandBump: this._loadTileTex("assets/tex_sand_bump.jpg?v=7", 0.15, 0.15),
        grass: this._loadTileTex("assets/tex_grass.jpg?v=7", 0.16, 0.16),
        grassBump: this._loadTileTex("assets/tex_grass_bump.jpg?v=7", 0.16, 0.16),
        plaza: this._loadTileTex("assets/tex_plaza.jpg?v=7", 4.6, 4.6),
        plazaBump: this._loadTileTex("assets/tex_plaza_bump.jpg?v=7", 4.6, 4.6),
        pathStone: this._loadTileTex("assets/tex_plaza.jpg?v=7", 7.5, 7.5),
        wood: this._loadTileTex("assets/tex_wood.jpg?v=7", 1.4, 1.0),
        woodBump: this._loadTileTex("assets/tex_wood_bump.jpg?v=7", 1.4, 1.0),
        cliff: this._loadTileTex("assets/tex_cliff.jpg?v=7", 0.22, 0.22),
        cliffTile: this._loadTileTex("assets/tex_cliff.jpg?v=7", 1.2, 0.8),
      };
      env.cliffWallMat = new THREE.MeshStandardMaterial({
        color: "#f2e2c8",
        map: env.cliff,
        roughness: 0.88,
      });
      this._envTex = env;
      return env;
    }

    _createExtrudedLayer(radius, seed, depth, bevelSize, material, sideMaterial = null) {
      const THREE = window.THREE;
      const shape = this._createOrganicShape(radius, seed);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevelSize,
        bevelSize: bevelSize,
        bevelSegments: 3,
        curveSegments: 26
      });
      geo.rotateX(Math.PI / 2);
      const matArg = sideMaterial ? [material, sideMaterial] : material;
      const mesh = new THREE.Mesh(geo, matArg);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    _initThree() {
      const THREE = window.THREE;
      const { width, height } = this._getViewportSize();

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color("#8fd8ff");
      this.scene.fog = new THREE.FogExp2("#bce8ff", 0.0017);

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 760);
      const psInit = this.pantherState;
      const initPose = this._getFollowPose(psInit.x, psInit.y, psInit.z, width, height);
      this.camera.position.copy(initPose.camPos);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.container.appendChild(this.renderer.domElement);

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.minPolarAngle = 0.25;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 420;
        this.controls.target.copy(initPose.targetPos);
        // 記錄使用者是否正在手動轉鏡頭，避免追逐鏡頭跟他搶控制
        this._orbitHoldUntil = 0;
        this.controls.addEventListener("start", () => {
          this._orbitHoldUntil = Infinity;
        });
        this.controls.addEventListener("end", () => {
          this._orbitHoldUntil = performance.now() + 900;
        });
      }

      this.hemiLight = new THREE.HemisphereLight("#e0f4ff", "#4c89b5", 1.08);
      this.scene.add(this.hemiLight);

      this.sunLight = new THREE.DirectionalLight("#fff9e6", 1.2);
      this.sunLight.position.set(36, 68, 34);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 1024;
      this.sunLight.shadow.mapSize.height = 1024;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 260;
      const d = 105;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.scene.add(this.sunLight);

      this.rimLight = new THREE.DirectionalLight("#74b9ff", 0.35);
      this.rimLight.position.set(-30, 18, -28);
      this.scene.add(this.rimLight);

      this.colliders = [];
      this.landmarkGroups = new Map();
      this.campusBoards = new Map();
      this._buildStarField();
      this._buildOcean();
      this._buildClouds();
      this._buildSkyAndOceanLife();
      this._buildCentralHub();
      this.islandsData.forEach((island, idx) => this._buildIsland(island, idx));
      this._buildRadiatingBridges();
      this._buildDecorationsPool();
      this._buildBoat();
      this._buildWalkerCat();
      this._buildPanther();
      this._pantherRigUrls = {
        m: "assets/panther_3d.glb?v=5",
        f: "assets/panther_f_3d.glb?v=5",
      };
      this._pantherRigLoading = {};
      window.__pantherLoadStatus = "loading";
      const initSex = (this.pantherState && this.pantherState.sex) || "m";
      this._loadPantherRigForSex(initSex, (err) => {
        window.__pantherLoadStatus = err ? "failed: " + (err.message || err) : "ok";
        if (err) this._setPantherEmote("⚠️ 3D 南山豹載入失敗，改用插畫版", 4);
      });
      this._loadSceneDioramas();

      this.raycaster = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();
      this._pointerDownPos = { x: 0, y: 0 };

      this.renderer.domElement.addEventListener("pointerdown", (e) => {
        this._pointerDownPos = { x: e.clientX, y: e.clientY };
        this.isTweening = false;
      });

      this.renderer.domElement.addEventListener("pointerup", (e) => {
        const dx = e.clientX - this._pointerDownPos.x;
        const dy = e.clientY - this._pointerDownPos.y;
        if (Math.hypot(dx, dy) > 6) return;
        this._handlePointerClick(e);
      });

      this.renderer.domElement.addEventListener("pointermove", (e) => {
        this._handlePointerHover(e);
      });

      window.addEventListener("resize", () => this.onResize());
    }

    _buildStarField() {
      const THREE = window.THREE;
      const starCount = 460;
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.44;
        const r = 100 + Math.random() * 45;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = 20 + r * Math.cos(phi) * 0.65;
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const starMat = new THREE.PointsMaterial({
        color: "#fff8d6",
        size: 0.95,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
      });
      this.starField = new THREE.Points(starGeo, starMat);
      this.scene.add(this.starField);
    }

    _buildOcean() {
      const THREE = window.THREE;
      const oceanGeo = new THREE.PlaneGeometry(520, 520, 36, 36);
      oceanGeo.rotateX(-Math.PI / 2);

      const posAttr = oceanGeo.attributes.position;
      this.oceanBaseY = [];
      for (let i = 0; i < posAttr.count; i++) {
        this.oceanBaseY.push(posAttr.getY(i));
      }

      const env = this._getEnvTextures();
      const oceanMat = new THREE.MeshStandardMaterial({
        color: "#c4f1ff",
        map: env.ocean,
        bumpMap: env.oceanBump,
        bumpScale: 0.15,
        roughness: 0.28,
        metalness: 0.08
      });

      const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
      oceanMesh.position.y = -0.35;
      oceanMesh.receiveShadow = true;
      this.scene.add(oceanMesh);
      this.oceanGeo = oceanGeo;
      this.oceanMat = oceanMat;

      const deepGeo = new THREE.PlaneGeometry(560, 560);
      deepGeo.rotateX(-Math.PI / 2);
      const deepMat = new THREE.MeshBasicMaterial({ color: "#1579ad" });
      const deepMesh = new THREE.Mesh(deepGeo, deepMat);
      deepMesh.position.y = -1.8;
      this.scene.add(deepMesh);
    }

    _buildClouds() {
      const THREE = window.THREE;
      const cloudMat = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.85,
        transparent: true,
        opacity: 0.92
      });

      const cloudPositions = [
        [-68, 25, -58],
        [34, 27, -64],
        [72, 24, -10],
        [-64, 25, 56],
        [44, 26, 62],
        [-8, 30, 4]
      ];

      cloudPositions.forEach(([x, y, z], idx) => {
        const group = new THREE.Group();
        for (let i = 0; i < 4; i++) {
          const r = 1.45 + ((i + idx) % 2) * 0.65;
          const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), cloudMat);
          puff.position.set((i - 1.5) * 1.4, (i % 2) * 0.42, ((i * 5) % 3) * 0.35);
          puff.scale.set(1.25, 0.72, 1.0);
          group.add(puff);
        }
        group.position.set(x, y, z);
        group.userData = { speed: 0.32 + (idx % 3) * 0.14 };
        this.scene.add(group);
        this.clouds.push(group);
      });
    }

    /* ==================== 豐富海洋與天空生態 (海豚/藍鯨/海鷗/熱氣球/彩虹/浮標) ==================== */
    _buildSkyAndOceanLife() {
      const THREE = window.THREE;

      // 1. Cross-sea Rainbow Arch (Daylight)
      const rainbowGroup = new THREE.Group();
      const rainbowColors = ["#ff6b6b", "#ffa502", "#ffd32a", "#2ed573", "#1e90ff", "#9b59b6"];
      rainbowColors.forEach((col, i) => {
        const arc = new THREE.Mesh(
          new THREE.TorusGeometry(62 - i * 0.72, 0.38, 8, 56, Math.PI),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 })
        );
        rainbowGroup.add(arc);
      });
      rainbowGroup.position.set(0, -1.5, -82);
      this.scene.add(rainbowGroup);
      this.rainbowMesh = rainbowGroup;

      // 2. 3 Colorful Hot Air Balloons floating in the sky
      const balloonSpots = [
        { x: -16, y: 15, z: -24, c1: "#ff6b6b", c2: "#ffd32a" },
        { x: 20, y: 17, z: -4, c1: "#38bdf8", c2: "#a29bfe" },
        { x: -12, y: 16, z: 22, c1: "#10b981", c2: "#ff9ff3" }
      ];
      balloonSpots.forEach((bCfg, idx) => {
        const bg = new THREE.Group();
        const env = new THREE.Mesh(
          new THREE.SphereGeometry(1.35, 16, 14),
          new THREE.MeshStandardMaterial({ color: bCfg.c1, roughness: 0.5 })
        );
        env.scale.set(1, 1.2, 1);
        env.position.y = 1.6;
        const stripe = new THREE.Mesh(
          new THREE.TorusGeometry(1.26, 0.14, 8, 20),
          new THREE.MeshStandardMaterial({ color: bCfg.c2 })
        );
        stripe.rotation.x = Math.PI / 2;
        stripe.position.y = 1.5;
        const basket = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.5, 0.6),
          new THREE.MeshStandardMaterial({ color: "#8d5524" })
        );
        basket.position.y = -0.35;
        bg.add(env, stripe, basket);
        bg.position.set(bCfg.x, bCfg.y, bCfg.z);
        this.scene.add(bg);
        this.ambientUpdaters.push((t) => {
          bg.position.y = bCfg.y + Math.sin(t * 0.9 + idx * 2) * 1.4;
          bg.position.x = bCfg.x + Math.cos(t * 0.28 + idx) * 2.5;
          bg.rotation.y = t * 0.35;
        });
      });

      // 3. 6 Soaring Seagulls with flapping wings
      const gullMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 });
      for (let i = 0; i < 6; i++) {
        const gull = new THREE.Group();
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), gullMat);
        body.rotation.x = Math.PI / 2;
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.22), gullMat);
        wingL.position.x = -0.32;
        const wingR = wingL.clone();
        wingR.position.x = 0.32;
        gull.add(body, wingL, wingR);
        this.scene.add(gull);

        const orbitR = 12 + (i % 3) * 8;
        const heightY = 9 + (i % 3) * 2.2;
        const speed = 0.42 + (i % 2) * 0.16;
        this.ambientUpdaters.push((t) => {
          const a = t * speed + i * 1.1;
          gull.position.set(Math.cos(a) * orbitR, heightY + Math.sin(t * 2 + i) * 0.5, Math.sin(a) * orbitR);
          gull.rotation.y = -a;
          const flap = Math.sin(t * 10 + i * 2) * 0.45;
          wingL.rotation.z = flap;
          wingR.rotation.z = -flap;
        });
      }

      // 4. 2 Pairs of Jumping Dolphins arcing above ocean waves
      const dolphinMat = new THREE.MeshStandardMaterial({ color: "#48dbfb", roughness: 0.3 });
      const dolphinCenters = [
        { x: -12, z: -4, r: 4.5 },
        { x: 13, z: 4, r: 4.8 }
      ];
      dolphinCenters.forEach((dc, dIdx) => {
        for (let k = 0; k < 2; k++) {
          const dGroup = new THREE.Group();
          const dBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 1.35, 10), dolphinMat);
          dBody.rotation.z = Math.PI / 2;
          const dSnout = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 8), dolphinMat);
          dSnout.rotation.z = -Math.PI / 2;
          dSnout.position.x = 0.85;
          const dFin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 4), dolphinMat);
          dFin.position.set(-0.05, 0.32, 0);
          dGroup.add(dBody, dSnout, dFin);
          this.scene.add(dGroup);

          this.ambientUpdaters.push((t) => {
            const phase = t * 1.25 + dIdx * 2.1 + k * 0.65;
            const ang = phase * 0.5;
            const arc = Math.sin(phase * 1.6);
            dGroup.position.set(
              dc.x + Math.cos(ang) * dc.r,
              -0.45 + arc * 1.85,
              dc.z + Math.sin(ang) * dc.r
            );
            dGroup.rotation.y = -ang + Math.PI / 2;
            dGroup.rotation.z = Math.cos(phase * 1.6) * 0.55;
            dGroup.visible = arc > -0.35;
          });
        }
      });

      // 5. Giant Spouting Whale cruising in outer sea
      const whaleGroup = new THREE.Group();
      const whaleMat = new THREE.MeshStandardMaterial({ color: "#2c6e91", roughness: 0.4 });
      const wBody = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), whaleMat);
      wBody.scale.set(1.9, 0.9, 1.0);
      const wTail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 1.6), whaleMat);
      wTail.position.set(-2.6, 0.15, 0);
      const spout = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 1.6, 10),
        new THREE.MeshBasicMaterial({ color: "#dff9fb", transparent: true, opacity: 0.72 })
      );
      spout.position.set(0.9, 1.75, 0);
      spout.rotation.x = Math.PI;
      whaleGroup.add(wBody, wTail, spout);
      this.scene.add(whaleGroup);

      this.ambientUpdaters.push((t) => {
        const a = t * 0.14;
        whaleGroup.position.set(Math.cos(a) * 35, -0.25 + Math.sin(t * 1.5) * 0.18, Math.sin(a) * 34);
        whaleGroup.rotation.y = -a + Math.PI / 2;
        const spoutPulse = Math.max(0, Math.sin(t * 1.4));
        spout.scale.set(0.7 + spoutPulse * 0.5, spoutPulse * 1.2, 0.7 + spoutPulse * 0.5);
        spout.visible = spoutPulse > 0.12;
      });

      // 6. Floating Channel Buoys with blinking light
      const buoySpots = [
        [-11, -11],
        [11, -11],
        [-11, 11],
        [11, 11]
      ];
      buoySpots.forEach(([bx, bz], idx) => {
        const buoy = new THREE.Group();
        const bBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.5, 0.5, 12),
          new THREE.MeshStandardMaterial({ color: "#ef4444", roughness: 0.5 })
        );
        const bTop = new THREE.Mesh(
          new THREE.ConeGeometry(0.28, 0.55, 10),
          new THREE.MeshStandardMaterial({ color: "#ffffff" })
        );
        bTop.position.y = 0.5;
        const bGlow = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 8, 8),
          new THREE.MeshBasicMaterial({ color: "#ffd32a" })
        );
        bGlow.position.y = 0.85;
        this.nightGlowMaterials.push(bGlow.material);
        buoy.add(bBase, bTop, bGlow);
        buoy.position.set(bx, -0.05, bz);
        this.scene.add(buoy);
        this.ambientUpdaters.push((t) => {
          buoy.position.y = -0.05 + Math.sin(t * 2.5 + idx) * 0.12;
          buoy.rotation.z = Math.sin(t * 2.0 + idx) * 0.1;
        });
      });
    }

    /* ==================== 六科專屬地景配色表與 Higgsfield 3D 景觀系統 ==================== */
    _getIslandTheme(island) {
      const THEMES = {
        chinese: {
          grassColor: "#63b37a",
          hillColor: "#539b66",
          sandColor: "#f3e3c3",
          cottageWall: "#fff5e4",
          cottageRoof: "#b91c1c",
          treeStyle: "cherry",
          foliageColors: ["#ff9ff3", "#ffc8dd", "#f48fb1"],
          dioramaScale: [6.0, 5.4]
        },
        english: {
          grassColor: "#6ec05f",
          hillColor: "#58a449",
          sandColor: "#f7e3af",
          cottageWall: "#f5e1c0",
          cottageRoof: "#d64531",
          treeStyle: "blossom",
          foliageColors: ["#ffd32a", "#a29bfe", "#ff9ff3"],
          dioramaScale: [5.9, 5.3]
        },
        listening: {
          grassColor: "#4668a6",
          hillColor: "#36508a",
          sandColor: "#a5c4d4",
          cottageWall: "#1e293b",
          cottageRoof: "#7c3aed",
          treeStyle: "crystal",
          foliageColors: ["#a29bfe", "#48dbfb", "#ff7eb3"],
          dioramaScale: [5.5, 5.8]
        },
        geography: {
          grassColor: "#5b8c6e",
          hillColor: "#4d785e",
          sandColor: "#e6dcc8",
          cottageWall: "#d9b382",
          cottageRoof: "#e67e22",
          treeStyle: "ice_lava",
          foliageColors: ["#e0f7ff", "#3b8d99", "#2f855a"],
          dioramaScale: [6.0, 5.5]
        },
        civics: {
          grassColor: "#52b788",
          hillColor: "#40916c",
          sandColor: "#f1eee6",
          cottageWall: "#f8fafc",
          cottageRoof: "#0f766e",
          treeStyle: "cypress",
          foliageColors: ["#2d6a4f", "#40916c", "#52b788"],
          dioramaScale: [5.8, 5.5]
        },
        history: {
          grassColor: "#8fb359",
          hillColor: "#c59b57",
          sandColor: "#ead3a8",
          cottageWall: "#ede0c8",
          cottageRoof: "#b45309",
          treeStyle: "ginkgo",
          foliageColors: ["#f6b93b", "#e58e26", "#f8c291"],
          dioramaScale: [5.8, 5.5]
        }
      };
      return (
        THEMES[island.id] || {
          grassColor: island.colors.ground,
          hillColor: "#4e9a59",
          sandColor: island.colors.sand,
          cottageWall: "#fff5e4",
          cottageRoof: island.colors.primary,
          treeStyle: "default",
          foliageColors: [island.colors.ground],
          dioramaScale: [5.6, 5.2]
        }
      );
    }

    /* ==================== 碰撞防穿模系統 (Circles & Oriented Boxes) ==================== */
    _addCircleCollider(x, z, r, maxClimbY = Infinity, groupRef = null) {
      this.colliders.push({ type: "circle", x, z, r, maxClimbY, groupRef });
    }

    _addBoxCollider(x, z, halfW, halfD, rotY = 0, maxClimbY = Infinity, groupRef = null) {
      this.colliders.push({ type: "box", x, z, halfW, halfD, rotY, maxClimbY, groupRef });
    }

    _resolveCollisions(nx, nz, currentY, pRad = 0.56) {
      let x = nx;
      let z = nz;
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < this.colliders.length; i++) {
          const c = this.colliders[i];
          if (c.groupRef && !c.groupRef.visible) continue;
          if (currentY > c.maxClimbY) continue;

          if (c.type === "circle") {
            const dx = x - c.x;
            const dz = z - c.z;
            const dist = Math.hypot(dx, dz);
            const minD = c.r + pRad;
            if (dist < minD) {
              if (dist > 0.0001) {
                x = c.x + (dx / dist) * minD;
                z = c.z + (dz / dist) * minD;
              } else {
                z = c.z + minD;
              }
            }
          } else {
            const cos = Math.cos(-c.rotY);
            const sin = Math.sin(-c.rotY);
            const relX = x - c.x;
            const relZ = z - c.z;
            const lx = relX * cos - relZ * sin;
            const lz = relX * sin + relZ * cos;
            const clampedX = Math.max(-c.halfW, Math.min(c.halfW, lx));
            const clampedZ = Math.max(-c.halfD, Math.min(c.halfD, lz));
            const dlx = lx - clampedX;
            const dlz = lz - clampedZ;
            const dist = Math.hypot(dlx, dlz);
            if (dist < pRad) {
              let pushLx = 0;
              let pushLz = 0;
              if (dist > 0.0001) {
                const over = pRad - dist;
                pushLx = (dlx / dist) * over;
                pushLz = (dlz / dist) * over;
              } else {
                const penX = c.halfW - Math.abs(lx);
                const penZ = c.halfD - Math.abs(lz);
                if (penX < penZ) {
                  pushLx = (lx >= 0 ? 1 : -1) * (penX + pRad);
                } else {
                  pushLz = (lz >= 0 ? 1 : -1) * (penZ + pRad);
                }
              }
              const wCos = Math.cos(c.rotY);
              const wSin = Math.sin(c.rotY);
              x += pushLx * wCos - pushLz * wSin;
              z += pushLx * wSin + pushLz * wCos;
            }
          }
        }
      }
      return { x, z };
    }

    /* ==================== Blender .glb & Higgsfield .svg 轉 3D 模型擴充介面 ==================== */
    _measureModelBox(model) {
      const THREE = window.THREE;
      const boneBox = new THREE.Box3();
      model.updateMatrixWorld(true);
      model.traverse((o) => {
        if (o.isBone) boneBox.expandByPoint(o.getWorldPosition(new THREE.Vector3()));
      });
      if (!boneBox.isEmpty()) return boneBox;
      return new THREE.Box3().setFromObject(model);
    }

    _prepareGltfMeshes(model, isPantherSlot, clickData = null) {
      const THREE = window.THREE;
      const useShadows = Boolean(isPantherSlot || (clickData && clickData.isHub));
      model.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = useShadows;
          n.receiveShadow = Boolean(clickData && clickData.isHub);
          if (n.isSkinnedMesh) n.frustumCulled = false;
          // Meshy / Higgsfield 3D 匯出材質 metalness=1 在無環境貼圖時會全黑，統一補亮
          const mat = n.material;
          if (mat && mat.isMeshStandardMaterial) {
            mat.metalnessMap = null;
            mat.metalness = 0;
            mat.roughness = 0.85;
            if (mat.map) {
              mat.emissive = new THREE.Color(0xffffff);
              mat.emissiveMap = mat.map;
              mat.emissiveIntensity = 0.25;
            }
            mat.needsUpdate = true;
          }
          if (isPantherSlot) {
            n.userData = Object.assign({}, n.userData, { isPanther: true });
            this.clickTargets.push(n);
          } else if (clickData) {
            n.userData = Object.assign({}, n.userData, clickData);
            this.clickTargets.push(n);
          }
        }
      });
    }

    _mountCustomSlotModel(slot, wrapper, mountAsActive = true) {
      if (slot === "panther" && this.panther) {
        if (!wrapper.parent) this.panther.group.add(wrapper);
        if (!mountAsActive) {
          wrapper.visible = false;
          return;
        }
        if (this.panther.customGlbGroup && this.panther.customGlbGroup !== wrapper) {
          this.panther.customGlbGroup.visible = false;
        }
        this.panther.customGlbGroup = wrapper;
        const showGlb = !this._pantherUserPickedMode || this.pantherRenderMode === "glb";
        if (showGlb) {
          wrapper.visible = true;
          this.panther.meshHolder.visible = false;
          this.panther.spriteHolder.visible = false;
          this.pantherRenderMode = "glb";
        } else {
          wrapper.visible = false;
        }
      } else if (slot === "hub" && this.hubGroup) {
        if (this.hubHallGroup) this.hubHallGroup.visible = false;
        wrapper.position.set(0, 1.74, -4.6);
        if (this.customGlbs.hub) this.hubGroup.remove(this.customGlbs.hub);
        this.customGlbs.hub = wrapper;
        this.hubGroup.add(wrapper);
      } else if (this.islandGroups.has(slot)) {
        const islGroup = this.islandGroups.get(slot);
        const lm = this.landmarkGroups && this.landmarkGroups.get(slot);
        if (lm) lm.visible = false;
        wrapper.position.set(-2.6, 3.22, -2.8);
        if (this.customGlbs[slot]) islGroup.remove(this.customGlbs[slot]);
        this.customGlbs[slot] = wrapper;
        islGroup.add(wrapper);
      }
    }

    /* 依 clip 名稱建立動作狀態機（待機 0／走路 30／奔跑 16／跳躍 466／歡呼 28／熱舞 64） */
    _bindPantherMixer(model, animations) {
      const THREE = window.THREE;
      if (!THREE || !animations || !animations.length) return null;
      const mixer = new THREE.AnimationMixer(model);
      const actions = {};
      const matchers = [
        ["idle", /^idle$/i],
        ["walk", /^walk$/i],
        ["run", /^run$/i],
        ["jump", /^jump$/i],
        ["cheer", /^(cheer|wave)$/i],
        ["dance", /^dance$/i],
      ];
      animations.forEach((clip) => {
        const cname = clip.name || "";
        let key = null;
        for (const [k, rx] of matchers) {
          if (rx.test(cname)) { key = k; break; }
        }
        if (!key) {
          if (/idle/i.test(cname)) key = "idle";
          else if (/walk/i.test(cname)) key = "walk";
          else if (/run/i.test(cname)) key = "run";
          else if (/jump/i.test(cname)) key = "jump";
          else if (/wave|cheer/i.test(cname)) key = "cheer";
          else if (/dance/i.test(cname)) key = "dance";
        }
        if (key && !actions[key]) {
          const act = mixer.clipAction(clip);
          act.enabled = true;
          if (key === "jump") {
            act.setLoop(THREE.LoopOnce, 1);
            act.clampWhenFinished = true;
          }
          actions[key] = act;
        }
      });
      if (!Object.keys(actions).length) {
        const fallback = mixer.clipAction(animations[0]);
        fallback.enabled = true;
        actions.single = fallback;
      }
      const initKey = actions.idle ? "idle" : Object.keys(actions)[0];
      const initAct = actions[initKey];
      initAct.setEffectiveWeight(1);
      initAct.play();
      return { mixer, actions, currentAnim: initKey };
    }

    _activatePantherRig(rigData) {
      if (!this.panther || !rigData) return;
      this._mountCustomSlotModel("panther", rigData.wrapper, true);
      if (rigData.rig && rigData.rig.mixer) {
        this.panther.glbMixer = rigData.rig.mixer;
        this.panther.glbActions = rigData.rig.actions;
        this.panther.glbRun = rigData.rig.actions.run || rigData.rig.actions.single || Object.values(rigData.rig.actions)[0] || null;
        this.panther.glbCurrentAnim = rigData.rig.currentAnim;
      }
    }

    _loadPantherRigForSex(sex, onDone) {
      const targetSex = sex === "f" ? "f" : "m";
      if (!this.panther) return;
      if (!this.panther.glbRigs) this.panther.glbRigs = {};
      if (this.panther.glbRigs[targetSex]) {
        if (this.pantherState.sex === targetSex) {
          this._activatePantherRig(this.panther.glbRigs[targetSex]);
        }
        if (onDone) onDone(null, this.panther.glbRigs[targetSex].wrapper);
        return;
      }
      if (this._pantherRigLoading && this._pantherRigLoading[targetSex]) return;
      if (!this._pantherRigLoading) this._pantherRigLoading = {};
      this._pantherRigLoading[targetSex] = true;
      const url = (this._pantherRigUrls && this._pantherRigUrls[targetSex]) || "assets/panther_3d.glb?v=4";
      this.loadPantherRig(
        url,
        (err, wrapper) => {
          this._pantherRigLoading[targetSex] = false;
          if (onDone) onDone(err, wrapper);
        },
        0,
        targetSex
      );
    }

    loadGLBModel(slot, urlOrFile, onDone, tries = 0) {
      const THREE = window.THREE;
      if (!THREE || !THREE.GLTFLoader) {
        if (tries < 50) setTimeout(() => this.loadGLBModel(slot, urlOrFile, onDone, tries + 1), 200);
        else if (onDone) onDone(new Error("GLTFLoader 尚未載入"));
        return;
      }
      const loader = new THREE.GLTFLoader();
      const handleGltf = (gltf) => {
        const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!model) return;
        let box = this._measureModelBox(model);
        const targetH = slot === "panther" ? 3.8 : slot === "hub" ? 7.6 : 7.8;
        const scale = targetH / Math.max(box.max.y - box.min.y, 0.001);
        model.scale.setScalar(scale);
        box = this._measureModelBox(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(model.position.x - center.x, model.position.y - box.min.y, model.position.z - center.z);
        const clickTag = slot === "hub" ? { isHub: true } : this.islandGroups.has(slot) ? { islandId: slot } : null;
        this._prepareGltfMeshes(model, slot === "panther", clickTag);
        const wrapper = new THREE.Group();
        wrapper.add(model);
        if (slot === "panther" && this.panther) {
          const rig = this._bindPantherMixer(model, gltf.animations);
          this._activatePantherRig({ wrapper, rig });
        } else {
          this._mountCustomSlotModel(slot, wrapper);
        }
        if (onDone) onDone(null, wrapper);
      };

      if (typeof urlOrFile === "string") {
        loader.load(urlOrFile, handleGltf, undefined, (err) => onDone && onDone(err));
      } else if (urlOrFile && typeof urlOrFile.arrayBuffer === "function") {
        urlOrFile.arrayBuffer().then((buf) => loader.parse(buf, "", handleGltf, (err) => onDone && onDone(err)));
      }
    }

    /* 載入場景建築、6 科島嶼地標與守護貓 3D GLB 模型（限流並行避免行動裝置爆記憶體） */
    _loadSceneDioramas() {
      const queue = [
        ["hub", "assets/hub_3d.glb?v=6"],
        ["chinese", "assets/island_chinese.glb?v=6"],
        ["english", "assets/island_english.glb?v=6"],
        ["listening", "assets/island_listening.glb?v=6"],
        ["history", "assets/island_history.glb?v=6"],
        ["geography", "assets/island_geography.glb?v=6"],
        ["civics", "assets/island_civics.glb?v=6"],
      ];
      let idx = 0;
      const runNext = () => {
        if (idx >= queue.length) return;
        const [slot, url] = queue[idx++];
        this.loadGLBModel(slot, url, () => runNext());
      };
      setTimeout(() => {
        runNext();
        runNext();
      }, 450);
      setTimeout(() => {
        this._loadCatMascots("assets/cat_3d.glb?v=6");
      }, 650);
    }

    _loadCatMascots(url, tries = 0) {
      const THREE = window.THREE;
      if (!THREE || !THREE.GLTFLoader) {
        if (tries < 50) setTimeout(() => this._loadCatMascots(url, tries + 1), 200);
        return;
      }
      new THREE.GLTFLoader().load(
        url,
        (gltf) => {
          const base = gltf.scene || (gltf.scenes && gltf.scenes[0]);
          if (!base) return;
          let box = this._measureModelBox(base);
          const normScale = 2.05 / Math.max(box.max.y - box.min.y, 0.001);
          base.scale.setScalar(normScale);
          box = this._measureModelBox(base);
          const center = box.getCenter(new THREE.Vector3());
          base.position.set(base.position.x - center.x, base.position.y - box.min.y, base.position.z - center.z);
          this._prepareGltfMeshes(base, false);

          // 1. 中央廣場迎賓守護貓（點擊可看提示）
          if (this.hubGroup) {
            const hubCatWrap = new THREE.Group();
            const hubCatMesh = base.clone();
            hubCatMesh.traverse((n) => {
              if (n.isMesh) {
                n.userData = Object.assign({}, n.userData, { isHub: true });
                this.clickTargets.push(n);
              }
            });
            hubCatWrap.add(hubCatMesh);
            hubCatWrap.position.set(-3.8, 1.76, 4.4);
            hubCatWrap.rotation.y = 0.42;
            this.hubGroup.add(hubCatWrap);
            this._addCircleCollider(-3.8, 4.4, 0.72, 3.8);
          }

          // 2. 島嶼巡邏學士貓同步升級為真 3D 公仔
          if (this.walkerCat && this.walkerCat.group) {
            const walkerClone = base.clone();
            walkerClone.scale.multiplyScalar(0.72);
            while (this.walkerCat.group.children.length) {
              this.walkerCat.group.remove(this.walkerCat.group.children[0]);
            }
            this.walkerCat.group.add(walkerClone);
          }
        },
        undefined,
        () => {}
      );
    }

    /* 載入有骨架與動畫的 3D 南山豹（Higgsfield / Meshy 產生）。
       骨架單位為公分且外層 Armature 有 0.01 縮放，網格 Box3 量不準，因此改用骨頭世界座標量身高。 */
    loadPantherRig(url, onDone, tries = 0, sexKey = null) {
      const THREE = window.THREE;
      if (!THREE || !THREE.GLTFLoader) {
        if (tries < 50) setTimeout(() => this.loadPantherRig(url, onDone, tries + 1, sexKey), 200);
        else if (onDone) onDone(new Error("GLTFLoader 尚未載入"));
        return;
      }
      new THREE.GLTFLoader().load(
        url,
        (gltf) => {
          if (!this.panther) return;
          const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
          if (!model) return;
          let box = this._measureModelBox(model);
          const targetH = 3.8;
          model.scale.setScalar(targetH / Math.max(box.max.y - box.min.y, 0.001));
          box = this._measureModelBox(model);
          model.position.y -= box.min.y;
          this._prepareGltfMeshes(model, true);
          const wrapper = new THREE.Group();
          wrapper.add(model);
          const rig = this._bindPantherMixer(model, gltf.animations);
          const slotSex = sexKey === "f" || sexKey === "m" ? sexKey : (this.pantherState.sex || "m");
          if (!this.panther.glbRigs) this.panther.glbRigs = {};
          const rigData = { wrapper, rig };
          this.panther.glbRigs[slotSex] = rigData;
          if (!sexKey || this.pantherState.sex === slotSex) {
            this._activatePantherRig(rigData);
          } else {
            this._mountCustomSlotModel("panther", wrapper, false);
          }
          if (onDone) onDone(null, wrapper);
        },
        undefined,
        (err) => {
          console.warn("3D 南山豹載入失敗，維持插畫模式：", err);
          if (onDone) onDone(err);
        }
      );
    }

    loadSVGModel(slot, svgTextOrFile, onDone, tries = 0) {
      const THREE = window.THREE;
      if (!THREE || !THREE.SVGLoader) {
        if (tries < 25) setTimeout(() => this.loadSVGModel(slot, svgTextOrFile, onDone, tries + 1), 200);
        else if (onDone) onDone(new Error("SVGLoader 尚未載入"));
        return;
      }
      const buildFromSvgText = (svgText) => {
        try {
          // Resolve <linearGradient>/<radialGradient> url(#id) fills (used by Ideogram Vector 1.0)
          const gradMap = {};
          const gradRegex = /<(?:linearGradient|radialGradient)[^>]*id="([^"]+)"[\s\S]*?stop-color="([^"]+)"/g;
          let gm;
          while ((gm = gradRegex.exec(svgText)) !== null) {
            gradMap[gm[1]] = gm[2];
          }
          const resolvedSvg = svgText.replace(/url\(#([^)]+)\)/g, (_, id) => gradMap[id] || "#d97706");

          const vbMatch = resolvedSvg.match(/viewBox="[\d.\s-]+?([\d.]+)\s+([\d.]+)"/);
          const vbW = vbMatch ? Number(vbMatch[1]) || 2048 : 2048;
          const vbH = vbMatch ? Number(vbMatch[2]) || 2048 : 2048;

          const loader = new THREE.SVGLoader();
          const data = loader.parse(resolvedSvg);
          const rawGroup = new THREE.Group();
          const paths = data.paths || [];
          const matCache = new Map();
          const denseSvg = paths.length > 300;
          const baseThick = Math.max(vbH * 0.08, 28);

          paths.forEach((path, pIdx) => {
            const fillColor = path.userData && path.userData.style && path.userData.style.fill;
            if (!fillColor || fillColor === "none" || fillColor.startsWith("url(")) return;

            let mat = matCache.get(fillColor);
            if (!mat) {
              mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(fillColor),
                roughness: 0.45,
                metalness: 0.1,
                side: THREE.DoubleSide
              });
              matCache.set(fillColor, mat);
            }

            const shapes = THREE.SVGLoader.createShapes(path);
            shapes.forEach((shape) => {
              const pts = shape.getPoints(denseSvg ? 6 : 12);
              if (!pts || pts.length < 3) return;
              let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
              pts.forEach((pt) => {
                if (pt.x < minX) minX = pt.x;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.y > maxY) maxY = pt.y;
              });
              const sw = maxX - minX;
              const sh = maxY - minY;
              // Skip full-canvas white backdrop or sub-pixel dust in dense vectorizations
              const normHex = fillColor.toLowerCase();
              if ((normHex === "#ffffff" || normHex === "#fff" || normHex === "white") && sw > vbW * 0.85 && sh > vbH * 0.85) {
                return;
              }
              if (denseSvg && sw < vbW * 0.008 && sh < vbH * 0.008) return;

              const layerDepth = baseThick * (0.6 + ((pIdx % 5) * 0.14));
              const geo = new THREE.ExtrudeGeometry(shape, {
                depth: layerDepth,
                curveSegments: denseSvg ? 3 : 6,
                bevelEnabled: !denseSvg
              });
              const mesh = new THREE.Mesh(geo, mat);
              mesh.position.z = -layerDepth * 0.5;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              rawGroup.add(mesh);
            });
          });

          const box = new THREE.Box3().setFromObject(rawGroup);
          const size = new THREE.Vector3();
          box.getSize(size);
          const targetH = slot === "panther" ? 3.8 : 5.2;
          const scale = targetH / Math.max(size.y, 0.01);
          const wrapper = new THREE.Group();
          rawGroup.scale.set(scale, -scale, scale);
          const fitted = new THREE.Box3().setFromObject(rawGroup);
          const fCenter = new THREE.Vector3();
          fitted.getCenter(fCenter);
          rawGroup.position.set(-fCenter.x, -fitted.min.y, -fCenter.z);
          wrapper.add(rawGroup);
          this._mountCustomSlotModel(slot, wrapper);
          if (onDone) onDone(null, wrapper);
        } catch (err) {
          if (onDone) onDone(err);
        }
      };
      if (typeof svgTextOrFile === "string") {
        buildFromSvgText(svgTextOrFile);
      } else if (svgTextOrFile && typeof svgTextOrFile.text === "function") {
        svgTextOrFile.text().then(buildFromSvgText).catch((err) => onDone && onDone(err));
      }
    }

    /* ==================== SVG 輪廓轉 3D 擠出浮雕 & 校園生活模組 ==================== */
    _createSvgExtrudedMesh(pointsXY, depth, color, opts = {}) {
      const THREE = window.THREE;
      const shape = new THREE.Shape();
      pointsXY.forEach(([px, py], idx) => {
        if (idx === 0) shape.moveTo(px, py);
        else shape.lineTo(px, py);
      });
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: depth || 0.16,
        bevelEnabled: opts.bevel !== false,
        bevelThickness: opts.bevelThickness || 0.03,
        bevelSize: opts.bevelSize || 0.03,
        bevelSegments: 2
      });
      geo.center();
      const mat = opts.material || new THREE.MeshStandardMaterial({
        color,
        roughness: opts.roughness !== undefined ? opts.roughness : 0.45,
        metalness: opts.metalness || 0.15,
        emissive: opts.emissive || "#000000",
        emissiveIntensity: opts.emissiveIntensity || 0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    _buildCampusBench() {
      const THREE = window.THREE;
      const bench = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.72 });
      const legMat = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.65 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 0.42), woodMat);
      seat.position.y = 0.34;
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.34, 0.08), woodMat);
      back.position.set(0, 0.56, -0.18);
      back.rotation.x = -0.14;
      [-0.45, 0.45].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.36), legMat);
        leg.position.set(lx, 0.17, 0);
        bench.add(leg);
      });
      bench.add(seat, back);
      return bench;
    }

    _drawBulletinCanvas(canvas, title, pct, done, total, accent) {
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep campus chalkboard green
      ctx.fillStyle = "#16382b";
      ctx.fillRect(0, 0, w, h);

      // Warm wooden inner border
      ctx.strokeStyle = "#f3d19c";
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      // Header ribbon
      ctx.fillStyle = accent || "#8f2130";
      ctx.fillRect(20, 20, w - 40, 44);
      ctx.fillStyle = "#fff8dc";
      ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(title, w / 2, 50);

      // Campus motto & progress stats
      ctx.fillStyle = "#fde68a";
      ctx.font = 'bold 18px "Noto Sans TC", sans-serif';
      ctx.fillText(`🔥 自強不息・複習榜  ${done}/${total} 站 (${pct}%)`, w / 2, 100);

      // Chalk progress bar
      const bx = 36;
      const by = 122;
      const bw = w - 72;
      const bh = 24;
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = pct >= 100 ? "#22c55e" : "#ffd32a";
      ctx.fillRect(bx, by, Math.max(8, Math.round((bw * Math.min(100, pct)) / 100)), bh);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
    }

    _buildCampusBulletinBoard(key, title, accentColor) {
      const THREE = window.THREE;
      const board = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: "#7c2d12", roughness: 0.72 });
      const roofMat = new THREE.MeshStandardMaterial({ color: accentColor || "#8f2130", roughness: 0.5 });

      [-0.78, 0.78].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.55, 8), woodMat);
        post.position.set(px, 0.78, 0);
        post.castShadow = true;
        board.add(post);
      });

      const canvas = document.createElement("canvas");
      canvas.width = 420;
      canvas.height = 175;
      this._drawBulletinCanvas(canvas, title, 0, 0, key === "hub" ? 25 : 4, accentColor);
      const tex = new THREE.CanvasTexture(canvas);
      const faceMat = new THREE.MeshBasicMaterial({ map: tex });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.84, 0.1), woodMat);
      frame.position.y = 1.18;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 0.74), faceMat);
      face.position.set(0, 1.18, 0.06);

      // SVG-extruded pitched bulletin canopy + gold school emblem badge
      const canopy = this._createSvgExtrudedMesh(
        [[-0.98, 0], [0, 0.36], [0.98, 0], [0.88, -0.06], [0, 0.26], [-0.88, -0.06]],
        0.32,
        accentColor || "#8f2130"
      );
      canopy.position.set(0, 1.72, 0);

      board.add(frame, face, canopy);
      this.campusBoards.set(key, { canvas, tex, title, accent: accentColor });
      return board;
    }

    /* ==================== 中央主島：真 3D 南山自強鐘塔校園廣場 + 羅盤噴泉 ==================== */
    _buildCentralHub() {
      const THREE = window.THREE;
      const hub = new THREE.Group();
      hub.position.set(0, 0, 0);

      const env = this._getEnvTextures();
      const sandMat = new THREE.MeshStandardMaterial({
        color: "#fff4df",
        map: env.sand,
        bumpMap: env.sandBump,
        bumpScale: 0.09,
        roughness: 0.86
      });
      const grassMat = new THREE.MeshStandardMaterial({
        color: "#89d697",
        map: env.grass,
        bumpMap: env.grassBump,
        bumpScale: 0.08,
        roughness: 0.78
      });
      const plazaMat = new THREE.MeshStandardMaterial({
        color: "#fffaf0",
        map: env.plaza,
        bumpMap: env.plazaBump,
        bumpScale: 0.12,
        roughness: 0.74
      });

      const sandBase = this._createExtrudedLayer(13.5, 0.8, 0.65, 0.25, sandMat);
      sandBase.position.y = 0.55;
      const grassTop = this._createExtrudedLayer(11.4, 0.8, 0.7, 0.25, grassMat, env.cliffWallMat);
      grassTop.position.y = 1.3;
      const plazaCircle = new THREE.Mesh(new THREE.CylinderGeometry(8.1, 8.35, 0.16, 40), plazaMat);
      plazaCircle.position.y = 1.68;

      // 真 3D 南山紅磚白柱鐘塔校園大廳（未載入 hub_3d.glb 前之備援模型）
      const hallGroup = new THREE.Group();
      hallGroup.position.set(0, 1.74, -4.6);
      const brickMat = new THREE.MeshStandardMaterial({ color: "#b34b3b", roughness: 0.72 });
      const trimMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.5 });
      const slateMat = new THREE.MeshStandardMaterial({ color: "#2b425c", roughness: 0.45 });
      const goldMat = new THREE.MeshStandardMaterial({ color: "#ffd32a", metalness: 0.55, roughness: 0.25 });

      // 左右校舍翼樓
      [-1.52, 1.52].forEach((wx) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(1.56, 1.55, 1.32), brickMat);
        wing.position.set(wx, 0.78, 0.08);
        wing.castShadow = true;
        wing.receiveShadow = true;
        const wRoof = new THREE.Mesh(new THREE.ConeGeometry(1.22, 0.78, 4), slateMat);
        wRoof.rotation.y = Math.PI / 4;
        wRoof.position.set(wx, 1.94, 0.08);
        wRoof.castShadow = true;
        hallGroup.add(wing, wRoof);
        const winMat = new THREE.MeshBasicMaterial({ color: "#fef08a" });
        this.nightGlowMaterials.push(winMat);
        [-0.32, 0.32].forEach((ox) => {
          const wPane = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.44, 0.08), winMat);
          wPane.position.set(wx + ox, 0.84, 0.76);
          hallGroup.add(wPane);
        });
      });

      // 中央主鐘樓塔身 + SVG 擠出「自強不息」正門山牆拱門
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.58, 2.95, 1.58), brickMat);
      tower.position.y = 1.48;
      tower.castShadow = true;
      tower.receiveShadow = true;
      const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.24, 1.78), trimMat);
      basePlinth.position.y = 0.12;
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.18, 1.74), trimMat);
      cornice.position.y = 2.95;
      const spireRoof = new THREE.Mesh(new THREE.ConeGeometry(1.26, 1.48, 4), slateMat);
      spireRoof.rotation.y = Math.PI / 4;
      spireRoof.position.y = 3.76;
      spireRoof.castShadow = true;
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.78, 6), goldMat);
      flagPole.position.y = 4.78;
      const pennant = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.26, 0.04), new THREE.MeshStandardMaterial({ color: "#b91c1c" }));
      pennant.position.set(0.24, 5.02, 0);

      const archGable = this._createSvgExtrudedMesh(
        [[-0.86, 0], [0, 0.56], [0.86, 0], [0.72, -0.08], [0, 0.38], [-0.72, -0.08]],
        0.24,
        "#f8fafc"
      );
      archGable.position.set(0, 1.18, 0.84);
      const mottoStar = this._createSvgExtrudedMesh(
        [[0, 0.18], [0.06, 0.06], [0.18, 0.05], [0.09, -0.04], [0.12, -0.17], [0, -0.1], [-0.12, -0.17], [-0.09, -0.04], [-0.18, 0.05], [-0.06, 0.06]],
        0.08,
        "#ffd32a"
      );
      mottoStar.position.set(0, 1.38, 0.96);

      // 正面拱門與四向發光時鐘面
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.88, 0.12), new THREE.MeshStandardMaterial({ color: "#4a2c18" }));
      door.position.set(0, 0.44, 0.8);
      const clockGlowMat = new THREE.MeshBasicMaterial({ color: "#fff5b8" });
      this.nightGlowMaterials.push(clockGlowMat);
      [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((ry) => {
        const cf = new THREE.Group();
        cf.rotation.y = ry;
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 16), goldMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(0, 2.34, 0.79);
        const dial = new THREE.Mesh(new THREE.CircleGeometry(0.31, 16), clockGlowMat);
        dial.position.set(0, 2.34, 0.83);
        cf.add(rim, dial);
        hallGroup.add(cf);
      });

      hallGroup.add(tower, basePlinth, cornice, spireRoof, flagPole, pennant, door, archGable, mottoStar);
      hallGroup.traverse((c) => {
        if (c.isMesh) {
          c.userData = { isHub: true };
          this.clickTargets.push(c);
        }
      });
      this.hubHallGroup = hallGroup;
      hub.add(hallGroup);
      this._addBoxCollider(0, -4.6, 3.6, 2.35, 0, 8.2);

      // 中央羅盤許願水池
      const fountain = new THREE.Group();
      fountain.position.set(0, 1.76, 0.8);
      const fRim = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.08, 0.24, 24), trimMat);
      fRim.position.y = 0.12;
      const fWater = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.26, 24), new THREE.MeshBasicMaterial({ color: "#38bdf8" }));
      fWater.position.y = 0.13;
      const starRing = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), goldMat);
      starRing.position.y = 0.4;
      starRing.scale.set(1.2, 0.45, 1.2);
      fountain.add(fRim, fWater, starRing);
      fountain.traverse((c) => {
        if (c.isMesh) {
          c.userData = { isHub: true };
          this.clickTargets.push(c);
        }
      });
      this.ambientUpdaters.push((t) => {
        starRing.rotation.y = t * 0.9;
      });
      hub.add(fountain);
      this._addCircleCollider(0, 0.8, 0.98, 3.0);

      // Hub 自強不息總進度公佈欄 + 校園長椅
      const hubBoard = this._buildCampusBulletinBoard("hub", "🏫 南山自強複習榜", "#8f2130");
      hubBoard.position.set(4.8, 1.76, 2.8);
      hubBoard.rotation.y = -0.35;
      hubBoard.traverse((c) => {
        if (c.isMesh) {
          c.userData = { isHub: true };
          this.clickTargets.push(c);
        }
      });
      hub.add(hubBoard);
      this._addBoxCollider(4.8, 2.8, 0.92, 0.32, -0.35, 3.8);

      [-5.4, 5.4].forEach((bx) => {
        const b = this._buildCampusBench();
        b.position.set(bx, 1.76, -0.3);
        b.rotation.y = bx < 0 ? 0.55 : -0.55;
        hub.add(b);
        this._addCircleCollider(bx, -0.3, 0.58, 2.6);
      });

      // Hub 可愛路燈 & 草坡粉彩花叢
      const hubLampMat = new THREE.MeshBasicMaterial({ color: "#fef08a" });
      this.nightGlowMaterials.push(hubLampMat);
      [-5.6, 5.6].forEach((lx) => {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.09, 1.65, 8),
          new THREE.MeshStandardMaterial({ color: "#475569" })
        );
        post.position.set(lx, 2.48, 3.3);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), hubLampMat);
        bulb.position.set(lx, 3.36, 3.3);
        hub.add(post, bulb);
        this._addCircleCollider(lx, 3.3, 0.28, 3.5);
      });
      const flowerColors = ["#ff8ab4", "#ffd13b", "#a78bfa", "#34d399"];
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2 + 0.18;
        const fr = 9.2 + (i % 3) * 0.55;
        const flGroup = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.25, 6), grassMat);
        stem.position.y = 0.12;
        const bud = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 8, 8),
          new THREE.MeshStandardMaterial({ color: flowerColors[i % flowerColors.length], roughness: 0.5 })
        );
        bud.scale.set(1.2, 0.72, 1.2);
        bud.position.y = 0.28;
        flGroup.add(stem, bud);
        flGroup.position.set(Math.cos(ang) * fr, 1.56, Math.sin(ang) * fr);
        hub.add(flGroup);
      }

      hub.add(sandBase, grassTop, plazaCircle);
      this.scene.add(hub);
      this.hubGroup = hub;
    }

    _buildRadiatingBridges() {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const woodCreamMat = new THREE.MeshStandardMaterial({
        color: "#fff5e4",
        map: env.wood,
        bumpMap: env.woodBump,
        bumpScale: 0.08,
        roughness: 0.72
      });
      const woodWarmMat = new THREE.MeshStandardMaterial({
        color: "#f3cb9d",
        map: env.wood,
        bumpMap: env.woodBump,
        bumpScale: 0.08,
        roughness: 0.76
      });
      const trimBeamMat = new THREE.MeshStandardMaterial({
        color: "#c27d48",
        map: env.wood,
        roughness: 0.78
      });
      const stonePierMat = new THREE.MeshStandardMaterial({
        color: "#f1e8d6",
        map: env.cliffTile,
        roughness: 0.78
      });
      const foamMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.72 });

      this.islandsData.forEach((island) => {
        const target = new THREE.Vector3(island.position.x, 0, island.position.z);
        const dir = target.clone().normalize();
        const perpAxis = new THREE.Vector3(-dir.z, 0, dir.x);
        const totalDist = target.length();
        const startDist = 11.4;
        const endDist = totalDist - island.radius * 0.86;
        if (endDist <= startDist) return;

        const bridgeGroup = new THREE.Group();
        const accentMat = new THREE.MeshStandardMaterial({ color: island.colors.primary, roughness: 0.5 });
        const goldMat = new THREE.MeshStandardMaterial({ color: "#ffd32a", roughness: 0.3 });
        const lanternGlowMat = new THREE.MeshBasicMaterial({ color: "#fff5b8" });
        this.nightGlowMaterials.push(lanternGlowMat);

        const steps = 24;
        const deckW = 2.55;
        const railOffset = 1.22;
        const segLen = (endDist - startDist) / steps;
        let prevPts = null;

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const dist = startDist + (endDist - startDist) * t;
          const archY = 0.78 + Math.sin(t * Math.PI) * 1.45;
          const cx = dir.x * dist;
          const cz = dir.z * dist;

          // 雙色糖果木紋橋面
          const plank = new THREE.Mesh(
            new THREE.BoxGeometry(deckW, 0.2, segLen * 0.92),
            i % 2 === 0 ? woodCreamMat : woodWarmMat
          );
          plank.position.set(cx, archY, cz);
          plank.lookAt(dir.x * (dist + 1), archY, dir.z * (dist + 1));
          plank.castShadow = true;
          plank.receiveShadow = true;
          bridgeGroup.add(plank);

          // 兩側緣石邊條
          [-1, 1].forEach((side) => {
            const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, segLen * 0.98), trimBeamMat);
            curb.position.set(cx + perpAxis.x * railOffset * side, archY + 0.05, cz + perpAxis.z * railOffset * side);
            curb.lookAt(
              dir.x * (dist + 1) + perpAxis.x * railOffset * side,
              archY + 0.05,
              dir.z * (dist + 1) + perpAxis.z * railOffset * side
            );
            bridgeGroup.add(curb);
          });

          // 欄杆與連續扶手
          const curPts = [-1, 1].map((side) =>
            new THREE.Vector3(cx + perpAxis.x * railOffset * side, archY + 0.62, cz + perpAxis.z * railOffset * side)
          );
          if (prevPts) {
            curPts.forEach((pNow, sideIdx) => {
              const pPrev = prevPts[sideIdx];
              const mid = pNow.clone().add(pPrev).multiplyScalar(0.5);
              const railLen = pNow.distanceTo(pPrev);
              const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, railLen + 0.06), accentMat);
              rail.position.copy(mid);
              rail.lookAt(pNow);
              bridgeGroup.add(rail);
            });
          }
          prevPts = curPts;

          if (i % 3 === 0) {
            [-1, 1].forEach((side) => {
              const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.72, 8), woodCreamMat);
              post.position.set(cx + perpAxis.x * railOffset * side, archY + 0.36, cz + perpAxis.z * railOffset * side);
              const orb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), lanternGlowMat);
              orb.position.set(cx + perpAxis.x * railOffset * side, archY + 0.78, cz + perpAxis.z * railOffset * side);
              bridgeGroup.add(post, orb);
            });
          }

          // 海面石墩柱與浪花圈
          if (i === 5 || i === 12 || i === 19) {
            [-0.85, 0.85].forEach((side) => {
              const px = cx + perpAxis.x * side;
              const pz = cz + perpAxis.z * side;
              const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, archY + 1.1, 8), stonePierMat);
              pier.position.set(px, (archY - 1.1) * 0.5, pz);
              const foam = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.46, 12), foamMat);
              foam.rotation.x = -Math.PI / 2;
              foam.position.set(px, 0.25, pz);
              bridgeGroup.add(pier, foam);
            });
          }
        }

        // 橋頭＆島口迎賓彩門拱門（搭配金星徽章）
        [0.04, 0.96].forEach((gateT) => {
          const gDist = startDist + (endDist - startDist) * gateT;
          const gY = 0.78 + Math.sin(gateT * Math.PI) * 1.45;
          const gate = new THREE.Group();
          gate.position.set(dir.x * gDist, gY, dir.z * gDist);
          gate.lookAt(dir.x * (gDist + 1), gY, dir.z * (gDist + 1));

          [-railOffset, railOffset].forEach((gx) => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 2.35, 10), woodCreamMat);
            pillar.position.set(gx, 1.18, 0);
            pillar.castShadow = true;
            const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.25, 10), accentMat);
            cuff.position.set(gx, 1.85, 0);
            gate.add(pillar, cuff);
          });
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(deckW + 0.55, 0.34, 0.32), accentMat);
          lintel.position.set(0, 2.35, 0);
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), goldMat);
          star.position.set(0, 2.7, 0);
          gate.add(lintel, star);
          bridgeGroup.add(gate);
        });

        this.scene.add(bridgeGroup);
      });
    }

    /* ==================== 島嶼 3D 實體建設裝飾池（含動態開關碰撞箱） ==================== */
    _buildDecorationsPool() {
      const THREE = window.THREE;
      const islPos = (id) => {
        const found = this.islandsData.find((i) => i.id === id);
        return found ? found.position : { x: 0, z: 0 };
      };

      const makeDeco = (id, parentPos, radiusCol, buildFn) => {
        const g = new THREE.Group();
        g.position.set(parentPos.x, parentPos.y, parentPos.z);
        buildFn(g);
        g.visible = false;
        this.scene.add(g);
        this.decorationMeshes.set(id, g);
        if (radiusCol > 0) {
          this._addCircleCollider(parentPos.x, parentPos.z, radiusCol, parentPos.y + 2.5, g);
        }
      };

      // 1. 海島露營帳篷 (Hub 左側草坡)
      makeDeco("bld-tent", { x: -8.6, y: 1.66, z: 1.6 }, 0.95, (g) => {
        const tent = new THREE.Mesh(
          new THREE.ConeGeometry(1.05, 1.35, 4),
          new THREE.MeshStandardMaterial({ color: "#ff7f50", roughness: 0.7 })
        );
        tent.rotation.y = Math.PI / 4;
        tent.position.y = 0.68;
        const doorGlow = new THREE.Mesh(
          new THREE.CircleGeometry(0.26, 12),
          new THREE.MeshBasicMaterial({ color: "#fde047" })
        );
        doorGlow.position.set(0, 0.34, 0.72);
        this.nightGlowMaterials.push(doorGlow.material);
        g.add(tent, doorGlow);
      });

      // 2. 貝殼許願噴泉 (Hub 右側草坡)
      makeDeco("bld-fountain", { x: 8.6, y: 1.66, z: 1.6 }, 0.98, (g) => {
        const basin = new THREE.Mesh(
          new THREE.CylinderGeometry(1.0, 1.12, 0.35, 16),
          new THREE.MeshStandardMaterial({ color: "#e2e8f0" })
        );
        basin.position.y = 0.18;
        const water = new THREE.Mesh(
          new THREE.CylinderGeometry(0.84, 0.84, 0.4, 16),
          new THREE.MeshBasicMaterial({ color: "#38bdf8" })
        );
        water.position.y = 0.2;
        const jet = new THREE.Mesh(
          new THREE.ConeGeometry(0.24, 1.35, 10),
          new THREE.MeshBasicMaterial({ color: "#bae6fd", transparent: true, opacity: 0.8 })
        );
        jet.rotation.x = Math.PI;
        jet.position.y = 0.95;
        g.add(basin, water, jet);
        this.ambientUpdaters.push((t) => {
          if (g.visible) jet.scale.y = 0.85 + Math.sin(t * 5) * 0.2;
        });
      });

      // 3. 櫻花野餐墊 (Chinese Island — 平鋪不擋路)
      const pChi = islPos("chinese");
      makeDeco("bld-picnic", { x: pChi.x + 8.6, y: 1.86, z: pChi.z + 3.2 }, 0, (g) => {
        const mat = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.08, 1.2),
          new THREE.MeshStandardMaterial({ color: "#ff9ff3" })
        );
        const basket = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.32, 0.32),
          new THREE.MeshStandardMaterial({ color: "#d97706" })
        );
        basket.position.set(0.2, 0.2, 0);
        g.add(mat, basket);
      });

      // 4. 和風石燈籠組 (English Island)
      const pEng = islPos("english");
      makeDeco("bld-lantern", { x: pEng.x + 8.8, y: 1.85, z: pEng.z + 2.8 }, 0.5, (g) => {
        const stone = new THREE.MeshStandardMaterial({ color: "#94a3b8" });
        const glow = new THREE.MeshBasicMaterial({ color: "#fde047" });
        this.nightGlowMaterials.push(glow);
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.85, 8), stone);
        p.position.y = 0.42;
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.45), glow);
        box.position.y = 0.98;
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.35, 4), stone);
        cap.rotation.y = Math.PI / 4;
        cap.position.y = 1.32;
        g.add(p, box, cap);
      });

      // 5. 天文觀星台 (Geography Island)
      const pGeo = islPos("geography");
      makeDeco("bld-telescope", { x: pGeo.x + 8.8, y: 1.85, z: pGeo.z + 2.8 }, 0.8, (g) => {
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.72, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: "#38bdf8" })
        );
        dome.position.y = 0.5;
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.74, 0.8, 0.5, 14),
          new THREE.MeshStandardMaterial({ color: "#f8fafc" })
        );
        base.position.y = 0.25;
        const scope = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.16, 1.1, 10),
          new THREE.MeshStandardMaterial({ color: "#ffd32a" })
        );
        scope.rotation.z = -0.6;
        scope.position.set(0.35, 1.0, 0);
        g.add(base, dome, scope);
      });

      // 6. 夢幻旋轉木馬 (Listening Island)
      const pLis = islPos("listening");
      makeDeco("bld-carousel", { x: pLis.x + 8.6, y: 1.85, z: pLis.z + 2.8 }, 0.95, (g) => {
        const spinner = new THREE.Group();
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(1.15, 0.72, 12),
          new THREE.MeshStandardMaterial({ color: "#a29bfe" })
        );
        roof.position.y = 1.65;
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.14, 1.4, 10),
          new THREE.MeshStandardMaterial({ color: "#ffd32a" })
        );
        pole.position.y = 0.7;
        spinner.add(roof, pole);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const horse = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 8, 8),
            new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? "#ff9ff3" : "#48dbfb" })
          );
          horse.position.set(Math.cos(a) * 0.72, 0.65, Math.sin(a) * 0.72);
          spinner.add(horse);
        }
        g.add(spinner);
        this.ambientUpdaters.push((t) => {
          if (g.visible) spinner.rotation.y = t * 1.4;
        });
      });

      // 7. 海景摩天輪 (Civics Island)
      const pCiv = islPos("civics");
      makeDeco("bld-ferris", { x: pCiv.x + 9.0, y: 1.85, z: pCiv.z + 2.8 }, 0.92, (g) => {
        const standL = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 2.2, 8),
          new THREE.MeshStandardMaterial({ color: "#f8fafc" })
        );
        standL.position.set(0, 1.05, 0.25);
        standL.rotation.x = 0.18;
        const standR = standL.clone();
        standR.position.z = -0.25;
        standR.rotation.x = -0.18;
        const wheel = new THREE.Group();
        wheel.position.y = 1.95;
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(1.25, 0.08, 8, 20),
          new THREE.MeshBasicMaterial({ color: "#ffd32a" })
        );
        wheel.add(rim);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const cab = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.28, 0.28),
            new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? "#ff6b81" : "#1dd1a1" })
          );
          cab.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
          wheel.add(cab);
        }
        g.add(standL, standR, wheel);
        this.ambientUpdaters.push((t) => {
          if (g.visible) wheel.rotation.z = t * 0.65;
        });
      });

      // 8. 自強不息黃金貓雕像 (History Island)
      const pHis = islPos("history");
      makeDeco("bld-statue", { x: pHis.x + 8.8, y: 1.85, z: pHis.z + 2.8 }, 0.78, (g) => {
        const goldMat = new THREE.MeshStandardMaterial({
          color: "#ffd32a",
          emissive: "#d97706",
          emissiveIntensity: 0.35,
          metalness: 0.6,
          roughness: 0.25
        });
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 0.6, 12), new THREE.MeshStandardMaterial({ color: "#f8fafc" }));
        ped.position.y = 0.3;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 0.9, 12), goldMat);
        body.position.y = 1.0;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), goldMat);
        head.position.y = 1.65;
        [-0.22, 0.22].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 6), goldMat);
          ear.position.set(ex, 2.02, 0);
          g.add(ear);
        });
        g.add(ped, body, head);
      });
    }

    syncDecorations(ownedBuildingIds) {
      const ownedSet = new Set(ownedBuildingIds || []);
      this.decorationMeshes.forEach((group, id) => {
        group.visible = ownedSet.has(id);
      });
    }

    /* ==================== 真 360° 3D 盲盒守護貓公仔雕塑（非旋轉紙片） ==================== */
    _createSvgCatStandee(cfg, scale = 1, clickUserData = null) {
      const THREE = window.THREE;
      const group = new THREE.Group();
      const coatMat = new THREE.MeshStandardMaterial({ color: cfg.coatColor || "#f5b041", roughness: 0.52 });
      const bellyMat = new THREE.MeshStandardMaterial({ color: cfg.bellyColor || "#fff7ea", roughness: 0.65 });
      const earMat = new THREE.MeshStandardMaterial({ color: cfg.earColor || "#ffb8b8", roughness: 0.55 });
      const accMat = new THREE.MeshStandardMaterial({ color: cfg.accentColor || "#ffd32a", roughness: 0.4 });
      const darkMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.2 });
      const whiteMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });

      // 絨毛圓座墊
      const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.68 * scale, 0.78 * scale, 0.18 * scale, 20), accMat);
      cushion.position.y = 0.09 * scale;
      cushion.castShadow = true;
      group.add(cushion);

      const catRoot = new THREE.Group();
      catRoot.scale.setScalar(scale);

      // 圓潤胖肚軀幹＋白肚腩＋四肢小肉球＋捲翹立體貓尾
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.56, 16, 14), coatMat);
      body.scale.set(1.0, 1.15, 0.94);
      body.position.y = 0.74;
      body.castShadow = true;
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), bellyMat);
      belly.position.set(0, 0.7, 0.34);

      [-0.25, 0.25].forEach((px) => {
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), coatMat);
        foot.scale.set(1, 0.72, 1.25);
        foot.position.set(px, 0.24, 0.22);
        const arm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), coatMat);
        arm.scale.set(0.88, 1.35, 0.88);
        arm.position.set(px * 1.95, 0.76, 0.14);
        arm.rotation.z = px > 0 ? -0.35 : 0.35;
        catRoot.add(foot, arm);
      });

      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.45, -0.45),
        new THREE.Vector3(0.28, 0.55, -0.78),
        new THREE.Vector3(0.45, 0.95, -0.68)
      ]);
      const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 12, 0.1, 8, false), coatMat);
      catRoot.add(body, belly, tail);

      // Q版大貓頭＋粉紅內耳＋大眼高光＋奶油嘴吻
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.68, 20, 16), coatMat);
      head.scale.set(1.08, 0.96, 1.0);
      head.position.y = 1.62;
      head.castShadow = true;
      catRoot.add(head);

      [-0.44, 0.44].forEach((ex) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.44, 8), coatMat);
        ear.position.set(ex, 2.22, -0.02);
        ear.rotation.z = ex > 0 ? -0.26 : 0.26;
        const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 6), earMat);
        innerEar.position.set(ex * 0.98, 2.18, 0.08);
        innerEar.rotation.z = ear.rotation.z;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), darkMat);
        eye.position.set(ex * 0.54, 1.66, 0.62);
        const glint = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), whiteMat);
        glint.position.set(ex * 0.54 - 0.03, 1.7, 0.71);
        const blush = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), earMat);
        blush.scale.set(1.2, 0.75, 0.4);
        blush.position.set(ex * 0.85, 1.48, 0.58);
        catRoot.add(ear, innerEar, eye, glint, blush);
      });

      const muz = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), bellyMat);
      muz.scale.set(1.25, 0.85, 0.85);
      muz.position.set(0, 1.46, 0.6);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), earMat);
      nose.position.set(0, 1.54, 0.74);
      catRoot.add(muz, nose);

      // 3D 專屬科別飾品
      const acc = cfg.accessoryType || "scarf";
      if (acc === "scarf") {
        const sc = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.11, 8, 16), accMat);
        sc.rotation.x = Math.PI / 2;
        sc.position.y = 1.08;
        catRoot.add(sc);
      } else if (acc === "crown") {
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.22, 6), accMat);
        crown.position.y = 2.34;
        catRoot.add(crown);
      } else if (acc === "headphones") {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.07, 8, 18, Math.PI), accMat);
        band.position.y = 1.64;
        [-0.74, 0.74].forEach((hx) => {
          const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 10), accMat);
          cup.rotation.z = Math.PI / 2;
          cup.position.set(hx, 1.62, 0);
          catRoot.add(cup);
        });
        catRoot.add(band);
      } else if (acc === "explorerHat") {
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.06, 16), accMat);
        brim.position.y = 2.22;
        const topHat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.34, 14), new THREE.MeshStandardMaterial({ color: "#d97706" }));
        topHat.position.y = 2.4;
        catRoot.add(brim, topHat);
      } else if (acc === "bowtie") {
        const bL = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 4), accMat);
        bL.rotation.z = -Math.PI / 2;
        bL.position.set(-0.14, 1.06, 0.56);
        const bR = bL.clone();
        bR.rotation.z = Math.PI / 2;
        bR.position.set(0.14, 1.06, 0.56);
        catRoot.add(bL, bR);
      } else if (acc === "scroll") {
        const scr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.65, 10), new THREE.MeshStandardMaterial({ color: "#fef3c7" }));
        scr.rotation.z = 0.5;
        scr.position.set(0.56, 0.82, 0.35);
        catRoot.add(scr);
      } else if (acc === "captain") {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.42, 0.24, 14), new THREE.MeshStandardMaterial({ color: "#ffffff" }));
        cap.position.y = 2.32;
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.32), new THREE.MeshStandardMaterial({ color: "#1e3a8a" }));
        visor.position.set(0, 2.22, 0.35);
        catRoot.add(cap, visor);
      } else if (acc === "backpack") {
        const pack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.65, 0.38), new THREE.MeshStandardMaterial({ color: "#0ea5e9" }));
        pack.position.set(0, 0.78, -0.58);
        catRoot.add(pack);
      }

      group.add(catRoot);
      if (clickUserData) {
        group.traverse((c) => {
          if (c.isMesh) {
            c.userData = { ...clickUserData };
            this.clickTargets.push(c);
          }
        });
      }

      return { group };
    }

    /* ==================== 3F 造島地形、特色主題小屋、瀑布與森林 ==================== */
    _buildIsland(island, islandIdx) {
      const THREE = window.THREE;
      const group = new THREE.Group();
      group.position.set(island.position.x, 0, island.position.z);
      const r = island.radius;
      const seed = islandIdx * 1.7 + 0.4;
      const theme = this._getIslandTheme(island);

      // 1F: Coral Reef & Beach
      const reefMat = new THREE.MeshStandardMaterial({
        color: island.id === "listening" ? "#3b5998" : "#2b6c8c",
        roughness: 0.75,
        transparent: true,
        opacity: 0.88
      });
      const reefMesh = this._createExtrudedLayer(r * 1.06, seed, 1.2, 0.35, reefMat);
      reefMesh.position.y = -0.35;
      group.add(reefMesh);

      const env = this._getEnvTextures();
      const sandTint = new THREE.Color(theme.sandColor || island.colors.sand).lerp(new THREE.Color("#ffffff"), 0.25);
      const sandMat = new THREE.MeshStandardMaterial({
        color: sandTint,
        map: env.sand,
        bumpMap: env.sandBump,
        bumpScale: 0.09,
        roughness: 0.84
      });
      const sandMesh = this._createExtrudedLayer(r * 0.94, seed, 0.7, 0.25, sandMat);
      sandMesh.position.y = 0.72;
      sandMesh.userData = { islandId: island.id };
      group.add(sandMesh);
      this.clickTargets.push(sandMesh);

      // 2F: Theme-customized Grassy / Scenic Plateau
      const grassTint = new THREE.Color(theme.grassColor || island.colors.ground).lerp(new THREE.Color("#ffffff"), 0.24);
      const grassMat = new THREE.MeshStandardMaterial({
        color: grassTint,
        map: env.grass,
        bumpMap: env.grassBump,
        bumpScale: 0.08,
        roughness: 0.76
      });
      const grassMesh = this._createExtrudedLayer(r * 0.78, seed, 0.75, 0.28, grassMat, env.cliffWallMat);
      grassMesh.position.y = 1.55;
      grassMesh.userData = { islandId: island.id };
      group.add(grassMesh);
      this.clickTargets.push(grassMesh);

      // 3F: Elevated Scenic Hill & Waterfall Cliff behind the landmark
      const hillTint = new THREE.Color(theme.hillColor || "#4e9a59").lerp(new THREE.Color("#ffffff"), 0.22);
      const hillMat = new THREE.MeshStandardMaterial({
        color: hillTint,
        map: env.grass,
        bumpMap: env.grassBump,
        bumpScale: 0.08,
        roughness: 0.76
      });
      const hillMesh = this._createExtrudedLayer(r * 0.36, seed + 2.1, 1.35, 0.3, hillMat, env.cliffWallMat);
      hillMesh.position.set(-2.6, 2.95, -2.8);
      hillMesh.userData = { islandId: island.id };
      group.add(hillMesh);
      this.clickTargets.push(hillMesh);
      // 3D 地標台座安全碰撞圈，防止穿進山丘中央 3D 模型內部
      this._addCircleCollider(island.position.x - 2.6, island.position.z - 2.8, 3.05, 11.5);

      // Geography island gets contrasting volcanic rock & glacier ice shelf on 2F/3F
      if (island.id === "geography") {
        const lavaSlab = new THREE.Mesh(
          new THREE.CylinderGeometry(3.4, 4.0, 0.38, 12),
          new THREE.MeshStandardMaterial({ color: "#3d312d", roughness: 0.9 })
        );
        lavaSlab.position.set(-6.4, 1.78, -0.8);
        const iceShelf = new THREE.Mesh(
          new THREE.CylinderGeometry(3.2, 3.8, 0.36, 12),
          new THREE.MeshStandardMaterial({ color: "#dcf6ff", roughness: 0.35 })
        );
        iceShelf.position.set(4.8, 1.78, -1.4);
        group.add(lavaSlab, iceShelf);
      }

      // 3F Dynamic Waterfall cascading down the hill cliff!
      this._buildWaterfall(group, 2.8, -0.5);

      // Walkable 2F -> 3F stone stairs on south flank of hill terrace
      this._buildHillStairs(group, island);

      // Campus Bulletin Board ("自強不息・各科進度榜") & Campus Bench on South Entrance Plaza
      const islBoard = this._buildCampusBulletinBoard(island.id, `🏫 ${island.name} · 進度榜`, island.colors.primary);
      islBoard.position.set(-3.4, 1.78, 8.8);
      islBoard.rotation.y = 0.18;
      islBoard.traverse((c) => {
        if (c.isMesh) {
          c.userData = { islandId: island.id };
          this.clickTargets.push(c);
        }
      });
      group.add(islBoard);
      this._addBoxCollider(island.position.x - 3.4, island.position.z + 8.8, 0.92, 0.32, 0.18, 4.0);

      const bench = this._buildCampusBench();
      bench.position.set(1.8, 1.78, 9.2);
      bench.rotation.y = -0.15;
      group.add(bench);
      this._addCircleCollider(island.position.x + 1.8, island.position.z + 9.2, 0.58, 2.6);

      // 可愛草坪花叢點綴放大後的綠地廣場
      const lawnColors = [island.colors.accent || "#ff9ff3", "#ffd32a", "#7dd3fc", "#ffffff"];
      for (let fi = 0; fi < 16; fi++) {
        const ang = (fi / 16) * Math.PI * 2 + seed * 0.25;
        const fr = r * (0.46 + (fi % 3) * 0.11);
        const fx = Math.cos(ang) * fr;
        const fz = Math.sin(ang) * fr;
        if (Math.hypot(fx + 2.6, fz + 2.8) < r * 0.4) continue;
        const fGroup = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.22, 6), grassMat);
        stem.position.y = 0.11;
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.19, 8, 8),
          new THREE.MeshStandardMaterial({ color: lawnColors[fi % lawnColors.length], roughness: 0.45 })
        );
        petal.scale.set(1.25, 0.72, 1.25);
        petal.position.y = 0.25;
        fGroup.add(stem, petal);
        fGroup.position.set(fx, 1.84, fz);
        group.add(fGroup);
      }

      // Wooden Dock on 1F Shoreline
      const dockMat = new THREE.MeshStandardMaterial({
        color: "#e6b88a",
        map: env.wood,
        bumpMap: env.woodBump,
        bumpScale: 0.08,
        roughness: 0.82
      });
      const dock = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 2.4), dockMat);
      dock.position.set(0, 0.55, r * 0.98);
      dock.castShadow = true;
      group.add(dock);

      // Cozy 2F Subject Cottage (Box + Prism Roof + Night-Glowing Glass Window)
      this._buildSubjectCottage(group, island);

      // Glowing Knowledge Treasure Chest on 2F
      this._buildTreasureChest(group, island);

      // SVG Dashed Contour Shoreline Ring
      const shoreTex = this._createShoreSvgTexture(island.colors.accent || "#8de4ff");
      const shorePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(r * 2.65, r * 2.65),
        new THREE.MeshBasicMaterial({
          map: shoreTex,
          transparent: true,
          opacity: 0.85,
          depthWrite: false
        })
      );
      shorePlane.rotation.x = -Math.PI / 2;
      shorePlane.position.y = -0.18;
      group.add(shorePlane);
      this.ambientUpdaters.push((t) => {
        shorePlane.rotation.z = t * 0.08 * (islandIdx % 2 === 0 ? 1 : -1);
      });

      // Clustered Forest using randomized scale/rotation
      this._buildClusteredForest(group, island, r, seed);

      // Subject-specific Landmark on 3F Hill Terrace + Special FX
      const lmRef = this._buildLandmark(group, island);
      this._buildIslandSpecialFX(group, island, lmRef);

      // Central Lighthouse
      this._buildLighthouse(group, island);

      // SVG Guardian Cat Standee
      if (island.guardianCat) {
        const catObj = this._createSvgCatStandee(island.guardianCat, 1.22, {
          islandId: island.id,
          isCat: true
        });
        const catPos = new THREE.Vector3(5.6, 1.82, 7.2);
        catObj.group.position.copy(catPos);
        group.add(catObj.group);
        this.islandCats.set(island.id, {
          group: catObj.group,
          basePos: catPos,
          jumpTime: 0,
          phase: Math.random() * Math.PI * 2
        });
        this._addCircleCollider(island.position.x + 5.6, island.position.z + 7.2, 0.62, 3.6);
      }

      // Walking Path & Waypoints
      this._buildWalkingPath(group, island, r);

      this.scene.add(group);
      this.islandGroups.set(island.id, group);
    }

    _buildHillStairs(group, island) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const stairGroup = new THREE.Group();
      const stepCount = 8;
      const startZ = 6.35;
      const endZ = 3.75;
      const startY = 1.84;
      const endY = 3.22;
      const stepMat = new THREE.MeshStandardMaterial({
        color: "#f9efe0",
        map: env.cliffTile,
        roughness: 0.78
      });
      const trimMat = new THREE.MeshStandardMaterial({ color: island.colors.primary, roughness: 0.55 });

      for (let i = 0; i < stepCount; i++) {
        const t = (i + 0.5) / stepCount;
        const stepH = 0.24;
        const step = new THREE.Mesh(new THREE.BoxGeometry(2.05, stepH, 0.42), stepMat);
        step.position.set(-2.2, startY + t * (endY - startY) - stepH * 0.42, startZ + t * (endZ - startZ));
        step.castShadow = true;
        step.receiveShadow = true;
        stairGroup.add(step);
      }

      [-1.08, 1.08].forEach((rx) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 2.75), trimMat);
        rail.position.set(-2.2 + rx, (startY + endY) * 0.5 + 0.18, (startZ + endZ) * 0.5);
        rail.rotation.x = Math.atan2(endY - startY, startZ - endZ);
        stairGroup.add(rail);
      });
      group.add(stairGroup);
    }

    _buildWaterfall(group, x, z) {
      const THREE = window.THREE;
      const wfGroup = new THREE.Group();
      wfGroup.position.set(x + 1.5, 2.0, z + 0.55);

      const streamMat = new THREE.MeshBasicMaterial({
        color: "#5ce1e6",
        transparent: true,
        opacity: 0.82
      });
      const stream = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.55, 0.25), streamMat);
      stream.position.y = 0.65;
      stream.rotation.x = 0.25;
      wfGroup.add(stream);

      const splashPool = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.85, 0.14, 14),
        new THREE.MeshBasicMaterial({ color: "#a5f3fc", transparent: true, opacity: 0.78 })
      );
      splashPool.position.set(0, -0.05, 0.22);
      wfGroup.add(splashPool);

      const foams = [];
      for (let i = 0; i < 6; i++) {
        const f = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 8, 8),
          new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 })
        );
        wfGroup.add(f);
        foams.push(f);
      }

      this.ambientUpdaters.push((t) => {
        foams.forEach((f, i) => {
          const c = (t * 1.6 + i / 6) % 1;
          f.position.set(((i % 3) - 1) * 0.28, Math.sin(c * Math.PI) * 0.45, 0.15 + c * 0.45);
          f.scale.setScalar(1.1 - c * 0.6);
        });
      });

      group.add(wfGroup);
    }

    _buildSubjectCottage(group, island) {
      const THREE = window.THREE;
      const theme = this._getIslandTheme(island);
      const house = new THREE.Group();
      house.position.set(-9.6, 1.85, 4.4);
      house.rotation.y = 0.45;
      house.scale.setScalar(1.24);

      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.95, 1.05),
        new THREE.MeshStandardMaterial({ color: theme.cottageWall, roughness: 0.75 })
      );
      wall.position.y = 0.48;
      wall.castShadow = true;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.08, 0.72, 4),
        new THREE.MeshStandardMaterial({ color: theme.cottageRoof, roughness: 0.55 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 1.28;
      roof.castShadow = true;

      // Glass window that glows warmly at dusk & night!
      const winColor = island.id === "listening" ? "#00f2fe" : "#bae6fd";
      const winMat = new THREE.MeshBasicMaterial({ color: winColor });
      this.nightGlowMaterials.push(winMat);
      const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.08), winMat);
      win1.position.set(-0.28, 0.52, 0.54);
      const win2 = win1.clone();
      win2.position.set(0.28, 0.52, 0.54);

      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.46, 0.08),
        new THREE.MeshStandardMaterial({ color: island.id === "civics" ? "#0f766e" : "#8d5524" })
      );
      door.position.set(0, 0.24, 0.54);

      house.add(wall, roof, win1, win2, door);

      // Unique architectural accent per subject cottage
      if (island.id === "chinese") {
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshStandardMaterial({ color: "#ffd32a", metalness: 0.5 }));
        finial.position.y = 1.72;
        house.add(finial);
      } else if (island.id === "english") {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), new THREE.MeshStandardMaterial({ color: "#ffd32a" }));
        bush.position.set(0.8, 0.24, 0.4);
        house.add(bush);
      } else if (island.id === "listening") {
        const neonRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 20), winMat);
        neonRing.rotation.x = Math.PI / 2;
        neonRing.position.y = 0.98;
        house.add(neonRing);
      } else if (island.id === "civics") {
        [-0.48, 0.48].forEach((cx) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.95, 10), new THREE.MeshStandardMaterial({ color: "#ffffff" }));
          col.position.set(cx, 0.48, 0.62);
          house.add(col);
        });
      } else if (island.id === "history") {
        const scrollSign = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.65, 8), new THREE.MeshStandardMaterial({ color: "#f8c291" }));
        scrollSign.rotation.z = Math.PI / 2;
        scrollSign.position.set(0, 0.85, 0.56);
        house.add(scrollSign);
      }

      house.traverse((c) => {
        if (c.isMesh) {
          c.userData = { islandId: island.id };
          this.clickTargets.push(c);
        }
      });
      group.add(house);
      this._addBoxCollider(island.position.x - 5.6, island.position.z + 2.8, 0.88, 0.78, 0.45, 3.6);
    }

    _buildTreasureChest(group, island) {
      const THREE = window.THREE;
      const chest = new THREE.Group();
      chest.position.set(9.2, 1.88, -1.2);
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.48, 0.52),
        new THREE.MeshStandardMaterial({ color: "#a0522d", roughness: 0.7 })
      );
      box.position.y = 0.24;
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 0.14, 0.56),
        new THREE.MeshStandardMaterial({ color: "#ffd32a", metalness: 0.5, roughness: 0.3 })
      );
      trim.position.y = 0.42;
      chest.add(box, trim);
      chest.traverse((c) => {
        if (c.isMesh && island.nodes[0]) {
          c.userData = { islandId: island.id, nodeId: island.nodes[0].id, isEncounter: true };
          this.clickTargets.push(c);
        }
      });
      group.add(chest);
      this._addBoxCollider(island.position.x + 9.2, island.position.z - 1.2, 0.46, 0.38, 0, 2.8);
    }

    _buildClusteredForest(group, island, r, seed) {
      const THREE = window.THREE;
      const theme = this._getIslandTheme(island);
      const trunkMat = new THREE.MeshStandardMaterial({
        color: theme.treeStyle === "crystal" ? "#475569" : "#795548",
        roughness: 0.85
      });
      const palette = theme.foliageColors || [island.colors.ground];

      const treeAngles = [Math.PI * 0.84, Math.PI * 1.0, Math.PI * 1.18, Math.PI * 1.38, Math.PI * 1.6, Math.PI * 1.8, Math.PI * 1.96];
      treeAngles.forEach((ang, idx) => {
        const distFactor = 0.54 + ((idx * 3 + Math.round(seed)) % 3) * 0.08;
        const tx = Math.cos(ang) * r * distFactor;
        const tz = Math.sin(ang) * r * distFactor;
        if (Math.hypot(tx + 2.2, tz + 2.5) < r * 0.46) return;
        const tree = new THREE.Group();
        const scale = 0.76 + ((idx + Math.floor(seed)) % 3) * 0.16;
        const leafColor = palette[idx % palette.length];
        const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.65 });

        if (theme.treeStyle === "ice_lava" && idx < 2) {
          // Volcanic obsidian boulders on left flank of Geography island
          const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.68, 0),
            new THREE.MeshStandardMaterial({ color: "#4a403a", roughness: 0.9 })
          );
          rock.position.y = 0.42;
          rock.rotation.set(idx, idx * 0.6, 0);
          const magmaVein = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 8, 8),
            new THREE.MeshBasicMaterial({ color: "#ff6b35" })
          );
          magmaVein.position.y = 0.65;
          tree.add(rock, magmaVein);
        } else if (theme.treeStyle === "cypress") {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.55, 8), trunkMat);
          trunk.position.y = 0.28;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.55, 12), leafMat);
          cone.position.y = 1.15;
          cone.castShadow = true;
          tree.add(trunk, cone);
        } else if (theme.treeStyle === "ice_lava") {
          // Layered snowy spruce pines on right side of Geography island
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 0.65, 8), trunkMat);
          trunk.position.y = 0.32;
          const tier1 = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.85, 10), new THREE.MeshStandardMaterial({ color: "#2c7873" }));
          tier1.position.y = 0.92;
          const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.72, 10), new THREE.MeshStandardMaterial({ color: "#e6fcff" }));
          tier2.position.y = 1.38;
          tree.add(trunk, tier1, tier2);
        } else if (theme.treeStyle === "crystal") {
          // Neon musical crystal trees for Listening island
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.65, 8), trunkMat);
          trunk.position.y = 0.32;
          const prism = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.62, 0),
            new THREE.MeshStandardMaterial({ color: leafColor, emissive: leafColor, emissiveIntensity: 0.25, roughness: 0.25 })
          );
          prism.position.y = 1.22;
          prism.scale.set(0.95, 1.32, 0.95);
          tree.add(trunk, prism);
        } else {
          // Cherry blossom / Honey meadow / Golden ginkgo multi-puff canopies
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.82, 10), trunkMat);
          trunk.position.y = 0.4;
          const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 1), leafMat);
          crown.position.y = 1.26;
          crown.scale.set(1.12, 0.92, 1.12);
          crown.rotation.y = idx * 0.9;
          crown.castShadow = true;
          tree.add(trunk, crown);
          if (theme.treeStyle === "cherry" || theme.treeStyle === "ginkgo") {
            const sub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), leafMat);
            sub.position.set(0.38, 1.05, 0.22);
            tree.add(sub);
          }
        }

        tree.scale.setScalar(scale);
        tree.position.set(tx, 1.78, tz);
        group.add(tree);
        this._addCircleCollider(island.position.x + tx, island.position.z + tz, 0.44 * scale, 3.6);
      });
    }

    _buildWalkingPath(group, island, r) {
      const THREE = window.THREE;
      const pathRadius = r * 0.69;

      // Textured cobblestone campus promenade walkway
      const env = this._getEnvTextures();
      const pathRing = new THREE.Mesh(
        new THREE.RingGeometry(pathRadius - 0.65, pathRadius + 0.65, 56),
        new THREE.MeshStandardMaterial({
          color: "#f7d4bf",
          map: env.pathStone,
          bumpMap: env.plazaBump,
          bumpScale: 0.08,
          roughness: 0.85,
          transparent: true,
          opacity: 0.92,
          side: THREE.DoubleSide
        })
      );
      pathRing.rotation.x = -Math.PI / 2;
      pathRing.position.y = 1.86;
      group.add(pathRing);

      const waypoints = [];
      const nodeCount = island.nodes.length;
      const pawTex = this._createPawBadgeTexture("#ffffff", island.colors.primary);

      island.nodes.forEach((node, idx) => {
        const nodeAngle = -Math.PI * 0.15 + (idx / Math.max(nodeCount, 1)) * Math.PI * 1.85;
        const nx = Math.cos(nodeAngle) * pathRadius;
        const nz = Math.sin(nodeAngle) * pathRadius;
        this._buildNodeBeacon(group, island.id, node, nx, nz, pawTex, nodeAngle);
        this._addCircleCollider(island.position.x + nx, island.position.z + nz, 0.58, 3.5);
        waypoints.push({ angle: nodeAngle, nodeId: node.id, kind: "node" });
        this.interactableSpots.push({
          type: "node",
          kind: "node",
          islandId: island.id,
          nodeId: node.id,
          label: `🏫 自強學習站：${node.title}`,
          x: island.position.x + nx,
          z: island.position.z + nz
        });

        const encAngle = nodeAngle + (Math.PI * 1.85) / (nodeCount * 2);
        const ex = Math.cos(encAngle) * pathRadius;
        const ez = Math.sin(encAngle) * pathRadius;
        const mailbox = new THREE.Group();
        mailbox.position.set(ex, 1.86, ez);
        const mPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.62, 8),
          new THREE.MeshStandardMaterial({ color: "#475569" })
        );
        mPost.position.y = 0.31;
        const mBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.28, 0.26),
          new THREE.MeshStandardMaterial({ color: "#fbbf24", emissive: "#d97706", emissiveIntensity: 0.35 })
        );
        mBox.position.y = 0.68;
        const mTop = new THREE.Mesh(
          new THREE.ConeGeometry(0.24, 0.16, 4),
          new THREE.MeshStandardMaterial({ color: "#b91c1c" })
        );
        mTop.rotation.y = Math.PI / 4;
        mTop.position.y = 0.88;
        mailbox.add(mPost, mBox, mTop);
        mailbox.traverse((c) => {
          if (c.isMesh) {
            c.userData = { islandId: island.id, nodeId: node.id, isEncounter: true };
            this.clickTargets.push(c);
          }
        });
        group.add(mailbox);

        waypoints.push({ angle: encAngle, nodeId: node.id, kind: "encounter" });
        this.interactableSpots.push({
          type: "node",
          kind: "encounter",
          islandId: island.id,
          nodeId: node.id,
          label: `📮 校園自強遇點：${node.title}`,
          x: island.position.x + ex,
          z: island.position.z + ez
        });
      });

      this.islandPaths.set(island.id, { radius: pathRadius, waypoints });
    }

    _buildLandmark(group, island) {
      const THREE = window.THREE;
      const lmGroup = new THREE.Group();
      lmGroup.position.set(-2.2, 3.02, -2.5); // Elevated onto enlarged 3F Hill Terrace!
      lmGroup.scale.setScalar(1.22);

      const theme = this._getIslandTheme(island);
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(1.58, 1.82, 0.28, 24),
        new THREE.MeshStandardMaterial({ color: theme.sandColor || "#f8fafc", roughness: 0.6 })
      );
      plinth.position.y = 0.14;
      plinth.receiveShadow = true;
      lmGroup.add(plinth);

      const refs = { lmGroup };
      const goldMat = new THREE.MeshStandardMaterial({ color: "#ffd32a", metalness: 0.55, roughness: 0.3 });
      const glowWarmMat = new THREE.MeshStandardMaterial({
        color: "#fef08a",
        emissive: "#f59e0b",
        emissiveIntensity: 0.55,
        roughness: 0.35
      });

      if (island.id === "chinese") {
        // Double-eave octagonal Chinese pagoda + front moon-bridge lotus pond + stone lantern
        const redWallMat = new THREE.MeshStandardMaterial({ color: "#b91c1c", roughness: 0.55 });
        const roofMat = new THREE.MeshStandardMaterial({ color: "#2c1810", roughness: 0.5 });

        const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.05, 8), redWallMat);
        tier1.position.y = 0.8;
        const winDoor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.58, 1.98), glowWarmMat);
        winDoor.position.y = 0.72;
        const eave1 = new THREE.Mesh(new THREE.ConeGeometry(1.48, 0.56, 8), roofMat);
        eave1.position.y = 1.56;
        const trim1 = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.05, 6, 8), goldMat);
        trim1.rotation.x = Math.PI / 2;
        trim1.position.y = 1.32;

        const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.88, 8), redWallMat);
        tier2.position.y = 2.05;
        const eave2 = new THREE.Mesh(new THREE.ConeGeometry(1.16, 0.54, 8), roofMat);
        eave2.position.y = 2.72;
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 0.55, 8), goldMat);
        spire.position.y = 3.22;
        const orbTop = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), goldMat);
        orbTop.position.y = 3.5;

        // Lotus pool & miniature arched wooden bridge in front
        const pond = new THREE.Mesh(
          new THREE.CylinderGeometry(0.68, 0.68, 0.08, 18),
          new THREE.MeshStandardMaterial({ color: "#38bdf8", roughness: 0.15, metalness: 0.25 })
        );
        pond.position.set(-0.72, 0.3, 1.02);
        const lotus = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 7), new THREE.MeshStandardMaterial({ color: "#ff9ff3" }));
        lotus.rotation.x = Math.PI;
        lotus.position.set(-0.72, 0.38, 1.02);

        const lanternPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.52, 8), new THREE.MeshStandardMaterial({ color: "#94a3b8" }));
        lanternPillar.position.set(1.05, 0.54, 0.9);
        const lanternBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), glowWarmMat);
        lanternBox.position.set(1.05, 0.9, 0.9);
        const lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.18, 4), roofMat);
        lanternRoof.rotation.y = Math.PI / 4;
        lanternRoof.position.set(1.05, 1.1, 0.9);

        lmGroup.add(tier1, winDoor, eave1, trim1, tier2, eave2, spire, orbTop, pond, lotus, lanternPillar, lanternBox, lanternRoof);
      } else if (island.id === "english") {
        // Vermilion double-beam Torii gate + golden honeycomb prism tower + A-B-C pastel blocks
        const toriiMat = new THREE.MeshStandardMaterial({ color: "#e11d48", roughness: 0.48 });
        const darkBaseMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.7 });

        [-0.85, 0.85].forEach((px) => {
          const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.28, 12), darkBaseMat);
          base.position.set(px * 0.65 - 0.35, 0.42, 0);
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 2.35, 14), toriiMat);
          col.position.set(px * 0.65 - 0.35, 1.65, 0);
          col.castShadow = true;
          lmGroup.add(base, col);
        });
        const nuki = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.16, 0.16), toriiMat);
        nuki.position.set(-0.35, 2.35, 0);
        const kasagi = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.2, 0.26), toriiMat);
        kasagi.position.set(-0.35, 2.86, 0);
        const kasagiCap = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 0.28), darkBaseMat);
        kasagiCap.position.set(-0.35, 2.98, 0);
        const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.14), goldMat);
        plaque.position.set(-0.35, 2.6, 0.04);

        // Honeycomb cluster on the right flank (matches buzzing bees orbit!)
        const hexOffsets = [
          [1.05, 0.75, 0.45, 0.9],
          [1.38, 0.95, 0.15, 1.3],
          [0.85, 1.05, 0.05, 1.55]
        ];
        hexOffsets.forEach(([hx, hy, hz, hLen]) => {
          const hex = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, hLen, 6),
            new THREE.MeshStandardMaterial({ color: "#fbbf24", emissive: "#f59e0b", emissiveIntensity: 0.22, roughness: 0.35 })
          );
          hex.position.set(hx, hy, hz);
          lmGroup.add(hex);
        });
        // Stacked Q-version ABC cubes
        [["#38bdf8", -1.05, 0.52, 0.85], ["#f472b6", -0.78, 0.52, 1.05], ["#34d399", -0.92, 0.88, 0.95]].forEach(([c, bx, by, bz]) => {
          const cube = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
          cube.position.set(bx, by, bz);
          cube.rotation.y = bx;
          lmGroup.add(cube);
        });
        lmGroup.add(nuki, kasagi, kasagiCap, plaque);
      } else if (island.id === "listening") {
        // Neon DJ vinyl stage + giant 3D headphones arch + broadcast spire & pulsing orb
        const stageMat = new THREE.MeshStandardMaterial({ color: "#1e1b4b", roughness: 0.4 });
        const neonCyan = new THREE.MeshStandardMaterial({ color: "#00f2fe", emissive: "#00f2fe", emissiveIntensity: 0.65 });
        const neonPink = new THREE.MeshStandardMaterial({ color: "#f43f5e", emissive: "#f43f5e", emissiveIntensity: 0.45 });

        const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.48, 0.42, 24), stageMat);
        stage.position.y = 0.49;
        const rimRing = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.05, 8, 32), neonCyan);
        rimRing.rotation.x = Math.PI / 2;
        rimRing.position.y = 0.68;

        const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 24), new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.25 }));
        vinyl.position.y = 0.74;
        const labelDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.09, 16), neonPink);
        labelDisc.position.y = 0.75;

        // Giant Headphone Arch over the turntable
        const band = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.12, 10, 28, Math.PI), neonCyan);
        band.position.y = 1.68;
        [-1.06, 1.06].forEach((ex) => {
          const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16), stageMat);
          cup.rotation.z = Math.PI / 2;
          cup.position.set(ex, 1.42, 0);
          const cupGlow = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 20), neonPink);
          cupGlow.rotation.y = Math.PI / 2;
          cupGlow.position.set(ex + (ex > 0 ? 0.14 : -0.14), 1.42, 0);
          lmGroup.add(cup, cupGlow);
        });

        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 2.25, 10), new THREE.MeshStandardMaterial({ color: "#a5b4fc", metalness: 0.6 }));
        spire.position.y = 2.45;
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), neonCyan);
        orb.position.y = 3.85;
        refs.orb = orb;

        lmGroup.add(stage, rimRing, vinyl, labelDisc, band, spire, orb);
      } else if (island.id === "geography") {
        // Volcanic magma cone + faceted glacier peaks + miniature bronze compass
        const volcano = new THREE.Mesh(
          new THREE.CylinderGeometry(0.48, 1.18, 1.85, 12),
          new THREE.MeshStandardMaterial({ color: "#443835", roughness: 0.9 })
        );
        volcano.position.set(-0.22, 1.2, -0.15);
        const craterRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.11, 8, 14), new THREE.MeshStandardMaterial({ color: "#2d2422", roughness: 0.9 }));
        craterRim.rotation.x = Math.PI / 2;
        craterRim.position.set(-0.22, 2.12, -0.15);

        const lava = new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 12, 10),
          new THREE.MeshBasicMaterial({ color: "#ff6b35" })
        );
        lava.position.set(-0.22, 2.08, -0.15);
        lava.scale.set(1.05, 0.55, 1.05);
        refs.lava = lava;

        // Glacier peaks on the right
        const iceMat = new THREE.MeshStandardMaterial({ color: "#bae6fd", emissive: "#38bdf8", emissiveIntensity: 0.18, roughness: 0.2 });
        const peak1 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.72, 5), iceMat);
        peak1.position.set(1.02, 1.14, 0.28);
        const peak2 = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.18, 5), iceMat);
        peak2.position.set(1.32, 0.86, -0.18);

        // Bronze compass dial on front plinth
        const compass = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.12, 16), goldMat);
        compass.position.set(0.25, 0.34, 1.05);
        const needle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.56), new THREE.MeshStandardMaterial({ color: "#e11d48" }));
        needle.position.set(0.25, 0.4, 1.05);
        needle.rotation.y = 0.5;

        lmGroup.add(volcano, craterRim, lava, peak1, peak2, compass, needle);
      } else if (island.id === "civics") {
        // White marble neoclassical dome temple + animated Golden Scales of Justice
        const marbleMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.42 });
        const domeTeal = new THREE.MeshStandardMaterial({ color: "#0f766e", roughness: 0.35 });

        const stepBase = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.48, 0.24, 16), marbleMat);
        stepBase.position.y = 0.4;
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.65, 10), marbleMat);
          col.position.set(Math.cos(ang) * 1.1, 1.32, Math.sin(ang) * 1.1);
          col.castShadow = true;
          lmGroup.add(col);
        }
        const entablature = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.24, 16), marbleMat);
        entablature.position.y = 2.25;
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeTeal);
        dome.position.y = 2.36;
        const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), goldMat);
        finial.position.y = 3.45;

        // Front-center Golden Scales of Justice
        const scaleStand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.15, 8), goldMat);
        scaleStand.position.set(0, 1.05, 0);
        const scaleGroup = new THREE.Group();
        scaleGroup.position.set(0, 1.6, 0);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.06), goldMat);
        [-0.48, 0.48].forEach((sx) => {
          const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.08, 12), goldMat);
          pan.position.set(sx, -0.35, 0);
          const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), goldMat);
          cord.position.set(sx, -0.18, 0);
          scaleGroup.add(pan, cord);
        });
        scaleGroup.add(beam);
        refs.scaleGroup = scaleGroup;
        this.ambientUpdaters.push((t) => {
          scaleGroup.rotation.z = Math.sin(t * 2.1) * 0.14;
        });

        lmGroup.add(stepBase, entablature, dome, finial, scaleStand, scaleGroup);
      } else {
        // History: Roman sandstone archway + fluted ruins + hourglass frame + floating Time Relic Crystal
        const stoneMat = new THREE.MeshStandardMaterial({ color: "#d6b07c", roughness: 0.78 });
        [-0.92, 0.92].forEach((px, idx) => {
          const h = idx === 0 ? 1.85 : 2.1;
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, h, 12), stoneMat);
          col.position.set(px, 0.28 + h / 2, -0.25);
          col.castShadow = true;
          lmGroup.add(col);
        });
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.18, 8, 20, Math.PI), stoneMat);
        arch.position.set(0, 2.05, -0.25);

        // Broken side pillar & stacked parchment books
        const brokenCol = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.95, 10), stoneMat);
        brokenCol.position.set(-1.12, 0.74, 0.65);
        const scrollBook = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.42), new THREE.MeshStandardMaterial({ color: "#8f2130" }));
        scrollBook.position.set(0.95, 0.35, 0.75);
        scrollBook.rotation.y = -0.4;

        // 3D Hourglass cones
        const coneTop = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.48, 12), glowWarmMat);
        coneTop.rotation.x = Math.PI;
        coneTop.position.set(0, 1.08, 0.35);
        const coneBot = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.48, 12), goldMat);
        coneBot.position.set(0, 0.6, 0.35);

        const relicCrystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.42, 0),
          new THREE.MeshStandardMaterial({ color: "#ffd32a", emissive: "#d97706", emissiveIntensity: 0.45, roughness: 0.2 })
        );
        relicCrystal.position.set(0, 1.55, -0.15);
        refs.relicCrystal = relicCrystal;

        lmGroup.add(arch, brokenCol, scrollBook, coneTop, coneBot, relicCrystal);
      }

      const auraRing = new THREE.Mesh(
        new THREE.RingGeometry(1.42, 1.72, 28),
        new THREE.MeshBasicMaterial({
          color: island.colors.accent || island.colors.primary,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide
        })
      );
      auraRing.rotation.x = -Math.PI / 2;
      auraRing.position.y = 0.3;
      lmGroup.add(auraRing);

      lmGroup.traverse((child) => {
        if (child.isMesh) {
          child.userData = { ...(child.userData || {}), islandId: island.id };
          this.clickTargets.push(child);
        }
      });

      group.add(lmGroup);
      this.landmarkGroups.set(island.id, lmGroup);
      this._addCircleCollider(island.position.x - 2.2, island.position.z - 2.5, 1.92, 7.0);
      return refs;
    }

    _buildIslandSpecialFX(group, island, lmRef) {
      const THREE = window.THREE;
      const fxRoot = lmRef.lmGroup;

      if (island.id === "chinese") {
        const petals = [];
        const petalGeo = new THREE.CircleGeometry(0.14, 8);
        for (let i = 0; i < 18; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: i % 3 === 0 ? "#ffd32a" : "#ff9ff3",
            transparent: true,
            opacity: 0.88,
            side: THREE.DoubleSide
          });
          const p = new THREE.Mesh(petalGeo, mat);
          const angle = (i / 18) * Math.PI * 2;
          const rad = 1.4 + (i % 4) * 0.55;
          p.userData = { angle, rad, speed: 0.45 + (i % 3) * 0.18, yOff: (i % 5) * 0.7 };
          fxRoot.add(p);
          petals.push(p);
        }
        this.ambientUpdaters.push((t) => {
          petals.forEach((p, idx) => {
            const a = p.userData.angle + t * p.userData.speed;
            p.position.set(
              Math.cos(a) * p.userData.rad,
              0.7 + (3.4 - ((t * 0.55 + p.userData.yOff) % 3.2)),
              Math.sin(a) * p.userData.rad
            );
            p.rotation.set(t + idx, t * 1.4, idx);
          });
        });
      } else if (island.id === "english") {
        const bees = [];
        const beeMat = new THREE.MeshBasicMaterial({ color: "#ffd32a" });
        for (let i = 0; i < 6; i++) {
          const bee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), beeMat);
          bee.userData = { phase: (i / 6) * Math.PI * 2, speed: 1.8 + (i % 2) * 0.5, radius: 0.75 + (i % 3) * 0.3 };
          fxRoot.add(bee);
          bees.push(bee);
        }
        this.ambientUpdaters.push((t) => {
          bees.forEach((b) => {
            const a = t * b.userData.speed + b.userData.phase;
            b.position.set(
              1.6 + Math.cos(a) * b.userData.radius,
              1.1 + Math.sin(t * 3.5 + b.userData.phase) * 0.4,
              0.6 + Math.sin(a) * b.userData.radius
            );
          });
        });
      } else if (island.id === "listening") {
        const rings = [];
        for (let i = 0; i < 3; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? "#00f2fe" : "#a29bfe",
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
          });
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.055, 8, 28), mat);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 3.95;
          fxRoot.add(ring);
          rings.push({ ring, mat, offset: i / 3 });
        }
        this.ambientUpdaters.push((t) => {
          if (lmRef.orb) {
            lmRef.orb.rotation.y = t * 2.5;
            lmRef.orb.scale.setScalar(1 + Math.sin(t * 5) * 0.14);
          }
          rings.forEach((rObj) => {
            const cycle = (t * 0.55 + rObj.offset) % 1;
            const scale = 0.6 + cycle * 2.3;
            rObj.ring.scale.setScalar(scale);
            rObj.ring.position.y = 3.95 + cycle * 1.4;
            rObj.mat.opacity = (1 - cycle) * 0.85;
          });
        });
      } else if (island.id === "geography") {
        const sparks = [];
        const snows = [];
        for (let i = 0; i < 12; i++) {
          const spMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? "#ff6b35" : "#ffd32a",
            transparent: true,
            opacity: 0.9
          });
          const sp = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), spMat);
          sp.userData = { offset: i / 12, spreadX: ((i % 5) - 2) * 0.14, spreadZ: (((i * 3) % 5) - 2) * 0.14 };
          fxRoot.add(sp);
          sparks.push({ mesh: sp, mat: spMat });
        }
        for (let i = 0; i < 12; i++) {
          const snMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.8 });
          const sn = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), snMat);
          sn.userData = { offset: i / 12, ang: (i / 12) * Math.PI * 2, rad: 0.5 + (i % 3) * 0.4 };
          fxRoot.add(sn);
          snows.push(sn);
        }
        this.ambientUpdaters.push((t) => {
          if (lmRef.lava) {
            lmRef.lava.scale.setScalar(1 + Math.sin(t * 4) * 0.12);
          }
          sparks.forEach((s) => {
            const c = (t * 0.75 + s.mesh.userData.offset) % 1;
            s.mesh.position.set(
              s.mesh.userData.spreadX * c * 2.0,
              2.35 + c * 2.2,
              s.mesh.userData.spreadZ * c * 2.0
            );
            s.mesh.scale.setScalar(1.1 - c * 0.8);
            s.mat.opacity = 1 - c;
          });
          snows.forEach((sn) => {
            const c = (t * 0.4 + sn.userData.offset) % 1;
            sn.position.set(
              1.45 + Math.cos(sn.userData.ang + t) * sn.userData.rad,
              2.8 - c * 2.2,
              0.6 + Math.sin(sn.userData.ang + t) * sn.userData.rad
            );
          });
        });
      } else if (island.id === "civics") {
        const orbs = [];
        for (let i = 0; i < 12; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? "#1dd1a1" : "#ffd32a",
            transparent: true,
            opacity: 0.85
          });
          const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat);
          orb.userData = { offset: i / 12, ang: (i / 12) * Math.PI * 2, rad: 1.25 + (i % 3) * 0.4 };
          fxRoot.add(orb);
          orbs.push({ orb, mat });
        }
        this.ambientUpdaters.push((t) => {
          if (lmRef.scaleGroup) {
            lmRef.scaleGroup.rotation.z = Math.sin(t * 1.6) * 0.18;
          }
          orbs.forEach((o) => {
            const c = (t * 0.45 + o.orb.userData.offset) % 1;
            o.orb.position.set(
              Math.cos(o.orb.userData.ang + t * 0.6) * o.orb.userData.rad,
              0.5 + c * 3.0,
              Math.sin(o.orb.userData.ang + t * 0.6) * o.orb.userData.rad
            );
            o.mat.opacity = Math.sin(c * Math.PI);
          });
        });
      } else if (island.id === "history") {
        const grains = [];
        for (let i = 0; i < 16; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? "#ffd32a" : "#ffbe76",
            transparent: true,
            opacity: 0.85
          });
          const g = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), mat);
          g.userData = { offset: i / 16, ang: (i / 16) * Math.PI * 2, rad: 1.15 + (i % 3) * 0.45 };
          fxRoot.add(g);
          grains.push({ g, mat });
        }
        this.ambientUpdaters.push((t) => {
          if (lmRef.relicCrystal) {
            lmRef.relicCrystal.rotation.y = t * 1.8;
            lmRef.relicCrystal.position.y = 1.5 + Math.sin(t * 2.5) * 0.22;
          }
          grains.forEach((item) => {
            const c = (t * 0.4 + item.g.userData.offset) % 1;
            const a = item.g.userData.ang + t * 1.1;
            item.g.position.set(
              Math.cos(a) * item.g.userData.rad,
              0.4 + c * 3.1,
              Math.sin(a) * item.g.userData.rad
            );
            item.mat.opacity = Math.sin(c * Math.PI);
          });
        });
      }
    }

    _buildLighthouse(group, island) {
      const THREE = window.THREE;
      const lhGroup = new THREE.Group();
      lhGroup.position.set(8.0, 1.82, -5.8);
      lhGroup.scale.setScalar(1.28);

      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.52, 2.3, 16),
        new THREE.MeshStandardMaterial({ color: "#f8f9fa", roughness: 0.5 })
      );
      body.position.y = 1.15;
      body.castShadow = true;

      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39, 0.45, 0.65, 16),
        new THREE.MeshStandardMaterial({ color: island.colors.primary, roughness: 0.5 })
      );
      stripe.position.y = 1.2;

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 14, 14),
        new THREE.MeshBasicMaterial({ color: "#7f8c8d" })
      );
      bulb.position.y = 2.55;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 0.5, 16),
        new THREE.MeshStandardMaterial({ color: island.colors.primary, roughness: 0.5 })
      );
      roof.position.y = 3.0;

      const beamGeo = new THREE.CylinderGeometry(0.18, 1.6, 11, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: "#ffeaa7",
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 8.0;

      lhGroup.add(body, stripe, bulb, roof, beam);
      lhGroup.traverse((child) => {
        if (child.isMesh && child !== beam) {
          child.userData = { islandId: island.id };
          this.clickTargets.push(child);
        }
      });

      group.add(lhGroup);
      this.lighthouseMeshes.set(island.id, { beam, bulb });
      this._addCircleCollider(island.position.x + 8.0, island.position.z - 5.8, 0.78, 5.6);
    }

    _buildNodeBeacon(group, islandId, node, x, z, pawTex, angle) {
      const THREE = window.THREE;
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, 1.82, z);

      // Campus courtyard red-brick pad + paw crest
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.86, 0.96, 0.16, 8),
        new THREE.MeshStandardMaterial({ color: "#e8d5c4", roughness: 0.72 })
      );
      pad.position.y = 0.08;
      pad.userData = { islandId, nodeId: node.id };
      nodeGroup.add(pad);
      this.clickTargets.push(pad);

      const badge = new THREE.Mesh(
        new THREE.CircleGeometry(0.68, 20),
        new THREE.MeshBasicMaterial({ map: pawTex, transparent: true })
      );
      badge.rotation.x = -Math.PI / 2;
      badge.position.y = 0.17;
      nodeGroup.add(badge);

      // Campus Wooden Study Desk & Chair ("校園生活・自強讀書角")
      const deskWood = new THREE.MeshStandardMaterial({ color: "#c27d38", roughness: 0.68 });
      const legMat = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.6 });
      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.56), deskWood);
      deskTop.position.set(-0.08, 0.58, 0);
      deskTop.castShadow = true;
      deskTop.userData = { islandId, nodeId: node.id };
      nodeGroup.add(deskTop);
      this.clickTargets.push(deskTop);

      [[-0.44, -0.22], [0.28, -0.22], [-0.44, 0.22], [0.28, 0.22]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6), legMat);
        leg.position.set(lx, 0.36, lz);
        nodeGroup.add(leg);
      });

      // Stacked Textbooks on Desk
      const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.22), new THREE.MeshStandardMaterial({ color: "#ef4444" }));
      book1.position.set(-0.24, 0.66, 0.02);
      book1.rotation.y = 0.18;
      const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.2), new THREE.MeshStandardMaterial({ color: "#3b82f6" }));
      book2.position.set(-0.22, 0.72, 0.02);
      nodeGroup.add(book1, book2);

      // Glowing Study Lamp / Achievement Gem above Desk (keeps .crystal ref for progress updates!)
      const crystalMat = new THREE.MeshStandardMaterial({
        color: "#7f8fa6",
        emissive: "#000000",
        roughness: 0.25
      });
      const lampNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.35, 6), legMat);
      lampNeck.position.set(0.18, 0.78, -0.1);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), crystalMat);
      crystal.position.set(0.18, 1.05, -0.1);
      crystal.castShadow = true;
      crystal.userData = { islandId, nodeId: node.id };
      nodeGroup.add(lampNeck, crystal);
      this.clickTargets.push(crystal);

      // Campus Flagpole + Nanshan Panther Crest Topper + School Pennant Flag
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.05, 1.85, 8),
        new THREE.MeshStandardMaterial({ color: "#f8fafc" })
      );
      pole.position.set(0.55, 1.02, 0.08);
      nodeGroup.add(pole);

      const topperMat = new THREE.MeshStandardMaterial({ color: "#95a5a6", roughness: 0.4 });
      const topperGroup = new THREE.Group();
      topperGroup.position.set(0.55, 2.0, 0.08);
      const tHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), topperMat);
      const tEarL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.13, 6), topperMat);
      tEarL.position.set(-0.08, 0.13, 0);
      tEarL.rotation.z = 0.25;
      const tEarR = tEarL.clone();
      tEarR.position.set(0.08, 0.13, 0);
      tEarR.rotation.z = -0.25;
      topperGroup.add(tHead, tEarL, tEarR);
      nodeGroup.add(topperGroup);

      const flagMat = new THREE.MeshStandardMaterial({ color: "#7f8fa6", side: THREE.DoubleSide });
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.4, 0.05), flagMat);
      flag.position.set(0.88, 0.72, 0.08);
      flag.userData = { islandId, nodeId: node.id };
      nodeGroup.add(flag);
      this.clickTargets.push(flag);

      group.add(nodeGroup);
      this.nodeMeshes.set(node.id, {
        crystal,
        flag,
        topperMat,
        baseY: 1.05,
        phase: Math.random() * Math.PI * 2,
        angle
      });
    }

    _buildBoat() {
      const THREE = window.THREE;
      const boat = new THREE.Group();

      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.55, 2.7),
        new THREE.MeshStandardMaterial({ color: "#b35c2e", roughness: 0.7 })
      );
      hull.position.y = 0.2;
      hull.castShadow = true;

      const bow = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 1.05, 8),
        new THREE.MeshStandardMaterial({ color: "#b35c2e", roughness: 0.7 })
      );
      bow.rotation.x = Math.PI / 2;
      bow.position.set(0, 0.2, 1.82);

      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 2.6, 10),
        new THREE.MeshStandardMaterial({ color: "#f5f6fa" })
      );
      mast.position.set(0, 1.5, -0.2);

      const sail = new THREE.Mesh(
        new THREE.ConeGeometry(1.0, 1.9, 6),
        new THREE.MeshStandardMaterial({ color: "#fff8e7", roughness: 0.8 })
      );
      sail.position.set(0, 1.65, 0.05);
      sail.scale.set(0.25, 1, 1.1);
      sail.castShadow = true;

      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 10),
        new THREE.MeshBasicMaterial({ color: "#ffd32a" })
      );
      lantern.position.set(0, 2.85, -0.2);
      this.nightGlowMaterials.push(lantern.material);

      const captain = this._createSvgCatStandee(
        {
          coatColor: "#f39c12",
          bellyColor: "#fff8e7",
          earColor: "#ffb8b8",
          accentColor: "#ffd32a",
          accessoryType: "captain"
        },
        0.72
      );
      captain.group.position.set(0, 0.45, 0.72);
      this.captainCat = captain;

      boat.add(hull, bow, mast, sail, lantern, captain.group);
      boat.position.set(this.boatCurrent.x, 0.05, this.boatCurrent.z);
      this.scene.add(boat);
      this.boat = boat;
    }

    /* ==================== 可控主角：AI 3D 公仔＆Q版南山豹系統 ==================== */
    _preloadFigurineSprites() {
      const sprites = window.PANTHER_3D_SPRITES;
      if (!sprites || typeof sprites !== "object") return;
      Object.keys(sprites).forEach((key) => {
        const src = sprites[key];
        if (!src) return;
        const img = new Image();
        img._loaded = false;
        img.onload = () => {
          img._loaded = true;
          this.figurineImages[key] = img;
          this.pantherTexCache.clear();
          if (this.panther && this.panther.spriteMat) {
            this.panther.spriteMat.map = this._getPantherTexture(
              this.pantherState.sex,
              this.pantherState.dir,
              this.pantherState.frame
            );
            this.panther.spriteMat.needsUpdate = true;
          }
        };
        img.src = src;
      });
    }

    _getPantherPoseImage(sex, dir) {
      const s = sex === "f" ? "f" : "m";
      const DIR_SPRITE_MAP = {
        front: ["front", false],
        fr: ["fr", false],
        right: ["right", false],
        br: ["br", false],
        back: ["back", false],
        bl: ["br", true],
        left: ["right", true],
        fl: ["fr", true]
      };
      const [poseKey, mirror] = DIR_SPRITE_MAP[dir] || ["front", false];
      const fallbackKey = dir === "back" || dir === "bl" || dir === "br" ? "back" : "front";
      const exactImg = this.figurineImages[`${s}_${poseKey}`];
      const figImg = this.use3DFigurine ? exactImg || this.figurineImages[`${s}_${fallbackKey}`] : null;
      return { figImg, exactImg, mirror };
    }

    _getPantherTexture(sex, dir, frame) {
      const THREE = window.THREE;
      const s = sex === "f" ? "f" : "m";
      const dk = this.atmosphereMode !== "day";
      const sxs = !this.sunLight || this.sunLight.position.x >= 0 ? "L" : "R";

      const { figImg, exactImg, mirror } = this._getPantherPoseImage(s, dir);
      const use3D = Boolean(figImg && figImg._loaded);

      const key = `${use3D ? "3d8" : "vec"}_${s}_${dir}_${frame}_${dk ? "d" : "l"}_${sxs}`;
      if (this.pantherTexCache.has(key)) return this.pantherTexCache.get(key);

      if (use3D) {
        const H = 280;
        const W = 216;
        const pad = 16;
        const base = document.createElement("canvas");
        base.width = W + pad * 2;
        base.height = H + pad * 2;
        const b = base.getContext("2d");

        const sw = [0, 1, 0, -1][frame] || 0;
        const isSideOrDiag = dir !== "front" && dir !== "back";
        const squeezeX = exactImg ? 1.0 : dir === "left" || dir === "right" ? 0.88 : isSideOrDiag ? 0.94 : 1.0;

        const aspect = figImg.width / Math.max(1, figImg.height);
        const drawH = H - 8;
        const drawW = Math.min(W, drawH * aspect);
        const cx = base.width / 2;
        const feetY = base.height - pad;
        const bobY = sw !== 0 ? -4 : 0;

        b.save();
        b.translate(cx, feetY + bobY);
        b.scale(mirror ? -squeezeX : squeezeX, 1);
        b.rotate(sw * (isSideOrDiag ? 0.038 : 0.028));

        if (sw === 0) {
          b.drawImage(figImg, -drawW / 2, -drawH, drawW, drawH);
        } else {
          // 4 幀行走動態：上半身隨步伐微傾＋雙腿（於側面／斜向加前後剪刀腳跨步、正背面交替抬腿）
          const splitRatio = 0.78;
          const srcSplitY = Math.round(figImg.height * splitRatio);
          const dstSplitY = -drawH * (1 - splitRatio);
          const upperH = drawH * splitRatio;
          const lowerH = drawH * (1 - splitRatio);

          b.drawImage(figImg, 0, 0, figImg.width, srcSplitY, -drawW / 2, -drawH, drawW, upperH + 2);

          const halfSrcW = Math.round(figImg.width / 2);
          const halfDstW = drawW / 2;
          const liftL = sw > 0 ? -11 : 1;
          const liftR = sw < 0 ? -11 : 1;
          const strideL = isSideOrDiag ? sw * 10 : 0;
          const strideR = isSideOrDiag ? -sw * 10 : 0;
          b.drawImage(
            figImg,
            0,
            srcSplitY,
            halfSrcW,
            figImg.height - srcSplitY,
            -halfDstW + strideL,
            dstSplitY + liftL,
            halfDstW,
            lowerH
          );
          b.drawImage(
            figImg,
            halfSrcW,
            srcSplitY,
            figImg.width - halfSrcW,
            figImg.height - srcSplitY,
            strideR,
            dstSplitY + liftR,
            halfDstW,
            lowerH
          );
        }
        b.restore();

        // 外圍輕量輪廓＋日落夜景暖色邊緣受光
        const cv = document.createElement("canvas");
        cv.width = base.width;
        cv.height = base.height;
        const x = cv.getContext("2d");

        const rim = document.createElement("canvas");
        rim.width = base.width;
        rim.height = base.height;
        const ri = rim.getContext("2d");
        ri.drawImage(base, 0, 0);
        ri.globalCompositeOperation = "source-in";
        ri.fillStyle = dk ? "rgba(255,196,130,.38)" : "rgba(255,250,232,.32)";
        ri.fillRect(0, 0, rim.width, rim.height);
        const lx = (sxs === "L" ? 1 : -1) * 4.2;
        ri.globalCompositeOperation = "destination-out";
        ri.drawImage(base, lx, 3.0);

        x.drawImage(base, 0, 0);
        x.globalCompositeOperation = "source-atop";
        x.drawImage(rim, 0, 0);
        x.globalCompositeOperation = "source-over";

        const tex = new THREE.CanvasTexture(cv);
        tex.needsUpdate = true;
        if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        this.pantherTexCache.set(key, tex);
        return tex;
      }

      const H = 240;
      const W = 160;
      const pad = 12;
      const t = 3.4;

      const base = document.createElement("canvas");
      base.width = W + pad * 2;
      base.height = H + pad * 2;
      const b = base.getContext("2d");
      b.translate(pad, pad);
      b.scale(H / 48, H / 48);
      const MIR = { left: "right", fl: "fr", bl: "br" };
      drawShapes(b, charShapes(pantherCfg(s), MIR[dir] || dir, frame), Boolean(MIR[dir]));

      const sil = document.createElement("canvas");
      sil.width = base.width;
      sil.height = base.height;
      const si = sil.getContext("2d");
      si.drawImage(base, 0, 0);
      si.globalCompositeOperation = "source-in";
      si.fillStyle = "#211c33";
      si.fillRect(0, 0, sil.width, sil.height);

      const cv = document.createElement("canvas");
      cv.width = base.width;
      cv.height = base.height;
      const x = cv.getContext("2d");
      x.globalAlpha = 0.86;
      for (let a = 0; a < 8; a++) {
        const r = (a * Math.PI) / 4;
        x.drawImage(sil, Math.cos(r) * t, Math.sin(r) * t);
      }
      x.globalAlpha = 1;
      x.drawImage(base, 0, 0);

      const rim = document.createElement("canvas");
      rim.width = base.width;
      rim.height = base.height;
      const ri = rim.getContext("2d");
      ri.drawImage(base, 0, 0);
      ri.globalCompositeOperation = "source-in";
      ri.fillStyle = dk ? "rgba(255,196,130,.44)" : "rgba(255,250,232,.52)";
      ri.fillRect(0, 0, rim.width, rim.height);
      const lx = (sxs === "L" ? 1 : -1) * t * 1.1;
      ri.globalCompositeOperation = "destination-out";
      ri.drawImage(base, lx, t * 0.8);

      x.globalCompositeOperation = "source-atop";
      x.drawImage(rim, 0, 0);
      x.globalCompositeOperation = "source-over";

      const tex = new THREE.CanvasTexture(cv);
      tex.needsUpdate = true;
      if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      this.pantherTexCache.set(key, tex);
      return tex;
    }

    _createSpeechBubbleTexture(text) {
      const THREE = window.THREE;
      const cv = document.createElement("canvas");
      cv.width = 480;
      cv.height = 120;
      const ctx = cv.getContext("2d");
      ctx.clearRect(0, 0, 480, 120);

      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeStyle = "#ffd32a";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(14, 12, 452, 76, 36);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(222, 86);
      ctx.lineTo(240, 110);
      ctx.lineTo(258, 86);
      ctx.closePath();
      ctx.fillStyle = "#ffd32a";
      ctx.fill();

      ctx.fillStyle = "#fff8dc";
      ctx.font = 'bold 31px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 240, 51);

      const tex = new THREE.CanvasTexture(cv);
      if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    _setPantherEmote(text, duration = 1.9) {
      this.pantherState.emoteText = text;
      this.pantherState.emoteTimer = duration;
      if (!this.panther || !this.panther.emoteSprite) return;
      const mat = this.panther.emoteMat;
      if (mat.map) mat.map.dispose();
      mat.map = this._createSpeechBubbleTexture(text);
      mat.needsUpdate = true;
      this.panther.emoteSprite.visible = true;
    }

    _build3DPantherMesh(sex) {
      const THREE = window.THREE;
      const root = new THREE.Group();
      const furMat = new THREE.MeshStandardMaterial({ color: "#1c202c", roughness: 0.42, metalness: 0.08 });
      const darkFurMat = new THREE.MeshStandardMaterial({ color: "#11141d", roughness: 0.55 });
      const earInnerMat = new THREE.MeshStandardMaterial({ color: "#f2a7b8", roughness: 0.5 });
      const muzzleMat = new THREE.MeshStandardMaterial({ color: "#f6e5c9", roughness: 0.55 });
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
      const irisMat = new THREE.MeshStandardMaterial({ color: "#f59e0b", emissive: "#d97706", emissiveIntensity: 0.35, roughness: 0.2 });
      const pupilMat = new THREE.MeshBasicMaterial({ color: "#0f172a" });
      const vestMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.65 });
      const shirtMat = new THREE.MeshStandardMaterial({
        color: sex === "f" ? "#f6bfd0" : "#7cb8eb",
        roughness: 0.55
      });
      const crimsonMat = new THREE.MeshStandardMaterial({ color: "#9f1239", roughness: 0.45 });
      const shortsMat = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.72 });
      const skirtMat = new THREE.MeshStandardMaterial({ color: "#475569", roughness: 0.6 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.4 });
      const soleMat = new THREE.MeshStandardMaterial({ color: "#e11d48", roughness: 0.5 });

      const bodyPivot = new THREE.Group();
      root.add(bodyPivot);

      // Torso (Nanshan V-neck vest + collared shirt + 3 RGB school emblem stripes)
      const shirtBody = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.64, 16), shirtMat);
      shirtBody.position.y = 0.88;
      shirtBody.castShadow = true;
      const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.375, 0.52, 16), vestMat);
      vest.position.y = 0.84;
      vest.castShadow = true;
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.055, 8, 18), shirtMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.16;

      // 3-color Nanshan Emblem Bars (R-G-B) on left chest
      ["#ef4444", "#22c55e", "#3b82f6"].forEach((col, i) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.04), new THREE.MeshBasicMaterial({ color: col }));
        bar.position.set(0.16 + (i - 1) * 0.045, 0.94, 0.34);
        bodyPivot.add(bar);
      });

      // Male Necktie vs Female Ribbon Bow
      const tieMesh = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.34, 4), crimsonMat);
      tieMesh.rotation.x = Math.PI;
      tieMesh.scale.set(1, 1, 0.45);
      tieMesh.position.set(0, 0.94, 0.35);
      tieMesh.visible = sex !== "f";

      const bowGroup = new THREE.Group();
      bowGroup.position.set(0, 1.08, 0.34);
      [-0.1, 0.1].forEach((bx) => {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), crimsonMat);
        wing.rotation.z = bx < 0 ? -Math.PI / 2 : Math.PI / 2;
        wing.position.x = bx * 0.7;
        bowGroup.add(wing);
      });
      const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), crimsonMat);
      bowGroup.add(bowKnot);
      bowGroup.visible = sex === "f";

      // Lower wear: Male Shorts vs Female Pleated Skirt
      const shortsGroup = new THREE.Group();
      const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.34, 0.24, 14), shortsMat);
      pelvis.position.y = 0.52;
      shortsGroup.add(pelvis);
      shortsGroup.visible = sex !== "f";

      const skirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.48, 0.32, 16), skirtMat);
      skirtMesh.position.y = 0.51;
      skirtMesh.visible = sex === "f";

      bodyPivot.add(shirtBody, vest, collar, tieMesh, bowGroup, shortsGroup, skirtMesh);

      // Articulated Arms (Sleeves + Black Panther Paws)
      const makeArm = (side) => {
        const arm = new THREE.Group();
        arm.position.set(side * 0.42, 1.06, 0);
        const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.3, 10), shirtMat);
        sleeve.position.y = -0.13;
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), furMat);
        paw.position.y = -0.32;
        arm.add(sleeve, paw);
        arm.rotation.z = side * 0.16;
        return arm;
      };
      const leftArm = makeArm(-1);
      const rightArm = makeArm(1);
      bodyPivot.add(leftArm, rightArm);

      // Articulated Legs (Black Panther Legs + Sneakers)
      const makeLeg = (side) => {
        const leg = new THREE.Group();
        leg.position.set(side * 0.17, 0.44, 0);
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.28, 10), darkFurMat);
        thigh.position.y = -0.14;
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.3), shoeMat);
        shoe.position.set(0, -0.35, 0.05);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.32), soleMat);
        sole.position.set(0, -0.41, 0.05);
        leg.add(thigh, shoe, sole);
        return leg;
      };
      const leftLeg = makeLeg(-1);
      const rightLeg = makeLeg(1);
      bodyPivot.add(leftLeg, rightLeg);

      // Curved 3D Panther Tail
      const tailCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.54, -0.3),
        new THREE.Vector3(0, 0.65, -0.68),
        new THREE.Vector3(0.08, 1.02, -0.82),
        new THREE.Vector3(0.12, 1.28, -0.62)
      ]);
      const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 14, 0.075, 8, false), furMat);
      const tailGroup = new THREE.Group();
      tailGroup.add(tailMesh);
      bodyPivot.add(tailGroup);

      // Chibi Blind-Box Panther Head (Large rounded head + ears + cream muzzle + glowing amber eyes)
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.62;
      const skull = new THREE.Mesh(new THREE.SphereGeometry(0.54, 22, 18), furMat);
      skull.scale.set(1.06, 0.94, 0.98);
      skull.castShadow = true;
      headGroup.add(skull);

      [-1, 1].forEach((side) => {
        const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), furMat);
        earOuter.scale.set(0.95, 1.15, 0.55);
        earOuter.position.set(side * 0.4, 0.42, -0.04);
        earOuter.rotation.z = side * -0.32;
        const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), earInnerMat);
        earInner.scale.set(0.9, 1.05, 0.35);
        earInner.position.set(side * 0.4, 0.41, 0.03);
        earInner.rotation.z = side * -0.32;

        // Expressive Amber Eyes
        const eyeBase = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 12), irisMat);
        eyeBase.scale.set(0.9, 1.15, 0.45);
        eyeBase.position.set(side * 0.21, 0.04, 0.47);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), pupilMat);
        pupil.position.set(side * 0.21, 0.04, 0.52);
        const glint = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), eyeWhiteMat);
        glint.position.set(side * 0.24, 0.09, 0.55);
        headGroup.add(earOuter, earInner, eyeBase, pupil, glint);
      });

      const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), muzzleMat);
      muzzle.scale.set(1.22, 0.78, 0.65);
      muzzle.position.set(0, -0.14, 0.45);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), new THREE.MeshStandardMaterial({ color: "#fb7185" }));
      nose.scale.set(1.2, 0.85, 0.8);
      nose.position.set(0, -0.08, 0.57);
      headGroup.add(muzzle, nose);

      bodyPivot.add(headGroup);

      // Register all meshes for click inspection
      root.traverse((c) => {
        if (c.isMesh) c.userData = { isPanther: true };
      });
      root.scale.setScalar(1.32);

      return {
        root,
        bodyPivot,
        headGroup,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        tailGroup,
        shirtMat,
        tieMesh,
        bowGroup,
        shortsGroup,
        skirtMesh
      };
    }

    _buildPanther() {
      const THREE = window.THREE;
      const group = new THREE.Group();
      const ps = this.pantherState;
      group.position.set(ps.x, ps.y, ps.z);

      // Dynamic surfboard shown automatically when Panther crosses ocean waters
      const surfboard = new THREE.Group();
      const boardGeo = new THREE.BoxGeometry(1.1, 0.14, 2.55);
      const boardMat = new THREE.MeshStandardMaterial({ color: "#38bdf8", roughness: 0.35, metalness: 0.1 });
      const boardMesh = new THREE.Mesh(boardGeo, boardMat);
      boardMesh.position.y = 0.08;
      boardMesh.castShadow = true;
      const stripeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.16, 2.35),
        new THREE.MeshStandardMaterial({ color: "#ffd32a", roughness: 0.3 })
      );
      stripeMesh.position.y = 0.09;
      const noseMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 0.72, 4),
        new THREE.MeshStandardMaterial({ color: "#8f2130", roughness: 0.4 })
      );
      noseMesh.rotation.x = Math.PI / 2;
      noseMesh.scale.y = 0.18;
      noseMesh.position.set(0, 0.09, 1.55);
      surfboard.add(boardMesh, stripeMesh, noseMesh);
      surfboard.visible = false;
      group.add(surfboard);

      // 1. Primary True 360° Volumetric 3D Chibi Nanshan Panther Mesh
      const pantherParts = this._build3DPantherMesh(ps.sex);
      const meshHolder = pantherParts.root;
      meshHolder.traverse((c) => {
        if (c.isMesh) this.clickTargets.push(c);
      });
      meshHolder.visible = this.pantherRenderMode === "mesh";
      group.add(meshHolder);

      // 2. Optional Higgsfield 8-direction Sprite Billboard mode
      const spriteHolder = new THREE.Group();
      const initTex = this._getPantherTexture(ps.sex, "front", 0);
      const spriteGeo = new THREE.PlaneGeometry(3.25, 4.65);
      spriteGeo.translate(0, 2.3, 0);
      const spriteMat = new THREE.MeshBasicMaterial({
        map: initTex,
        transparent: true,
        alphaTest: 0.08,
        side: THREE.DoubleSide
      });
      const spriteMesh = new THREE.Mesh(spriteGeo, spriteMat);
      spriteMesh.userData = { isPanther: true };
      this.clickTargets.push(spriteMesh);
      spriteHolder.add(spriteMesh);
      spriteHolder.visible = this.pantherRenderMode === "sprite";
      group.add(spriteHolder);

      // Overhead emote bubble (shared cleanly across 3D / Sprite / GLB modes)
      const emoteMat = new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const emoteSprite = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.2), emoteMat);
      emoteSprite.position.set(0, this.pantherRenderMode === "sprite" ? 5.2 : 3.45, 0.05);
      emoteSprite.visible = false;
      group.add(emoteSprite);

      this.scene.add(group);

      // Ground contact shadow independent of Y jump altitude
      const shadowMat = new THREE.MeshBasicMaterial({
        color: "#091322",
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(1.08, 22), shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(ps.x, ps.y + 0.04, ps.z);
      this.scene.add(shadowMesh);

      // Invisible horizontal plane for tap-to-walk world coordinate raycasting
      const groundWalkPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
      );
      groundWalkPlane.rotation.x = -Math.PI / 2;
      groundWalkPlane.position.y = 1.0;
      this.scene.add(groundWalkPlane);
      this.groundWalkPlane = groundWalkPlane;

      this.panther = {
        group,
        surfboard,
        meshHolder,
        pantherParts,
        spriteHolder,
        spriteMesh,
        spriteMat,
        customGlbGroup: null,
        emoteSprite,
        emoteMat,
        shadowMesh,
        shadowMat
      };
    }

    _getSurfaceInfoAt(x, z) {
      const waveY = 0.22 + Math.sin(x * 0.14 + this.clockTime * 1.4) * 0.14;
      let maxGround = -Infinity;
      let onLand = false;
      let onIsland = null;

      // 1. Central Nanshan Hub Island
      const hubDist = Math.hypot(x, z);
      if (hubDist <= 8.2) {
        maxGround = Math.max(maxGround, 1.76);
        onLand = true;
      } else if (hubDist <= 11.25) {
        maxGround = Math.max(maxGround, 1.56);
        onLand = true;
      } else if (hubDist <= 13.3) {
        maxGround = Math.max(maxGround, 0.82);
        onLand = true;
      }

      // 2. Radiating Bridges & 6 Subject Islands
      for (const island of this.islandsData) {
        const ix = island.position.x;
        const iz = island.position.z;
        const len = Math.hypot(ix, iz) || 1;
        const dxAxis = ix / len;
        const dzAxis = iz / len;
        const startDist = 11.1;
        const endDist = len - island.radius * 0.84;
        const proj = x * dxAxis + z * dzAxis;
        const perp = Math.abs(-x * dzAxis + z * dxAxis);
        if (proj >= startDist && proj <= endDist && perp <= 1.75) {
          const t = Math.max(0, Math.min(1, (proj - startDist) / Math.max(endDist - startDist, 0.01)));
          const bridgeY = 0.84 + Math.sin(t * Math.PI) * 1.45;
          if (bridgeY > maxGround) maxGround = bridgeY;
          onLand = true;
        }

        const dx = x - ix;
        const dz = z - iz;
        const dist = Math.hypot(dx, dz);
        const r = island.radius;

        // Wooden dock
        if (Math.abs(dx) <= 1.15 && dz >= r * 0.65 && dz <= r * 1.18) {
          maxGround = Math.max(maxGround, 0.66);
          onLand = true;
          onIsland = island;
        }
        // Walkable 2F -> 3F stone stairs on south flank of hill terrace
        if (Math.abs(dx + 2.2) <= 1.18 && dz >= 3.6 && dz <= 6.45) {
          const st = Math.max(0, Math.min(1, (6.45 - dz) / 2.85));
          maxGround = Math.max(maxGround, 1.84 + st * (3.25 - 1.84));
          onLand = true;
          onIsland = island;
        }
        // 3F Hill terrace
        const hillDist = Math.hypot(dx + 2.6, dz + 2.8);
        if (hillDist <= r * 0.37) {
          maxGround = Math.max(maxGround, 3.25);
          onLand = true;
          onIsland = island;
        } else if (dist <= r * 0.81) {
          // 2F Grass plateau
          maxGround = Math.max(maxGround, 1.84);
          onLand = true;
          onIsland = island;
        } else if (dist <= r * 0.98) {
          // 1F Sand shoreline
          maxGround = Math.max(maxGround, 0.98);
          onLand = true;
          onIsland = island;
        }
      }

      if (onLand) {
        return { groundY: maxGround, onWater: false, island: onIsland };
      }
      return { groundY: waveY, onWater: true, island: null };
    }

    setPantherInput(ix, iy, sprint) {
      this.pantherState.input.ix = ix;
      this.pantherState.input.iy = iy;
      if (typeof sprint === "boolean") {
        this.pantherState.input.sprint = sprint;
      }
      if (Math.hypot(ix, iy) > 0.04) {
        this.pantherState.autoTarget = null;
        this.pantherState.boostTimer = 0;
        this.isTweening = false;
        this.cameraMode = "follow";
      }
    }

    nudgePanther(ix, iy) {
      const len = Math.hypot(ix, iy);
      if (len < 0.05) return;
      this.pantherState.boostX = ix / len;
      this.pantherState.boostY = iy / len;
      this.pantherState.boostTimer = 0.34;
      this.pantherState.autoTarget = null;
      this.isTweening = false;
      this.cameraMode = "follow";
    }

    walkPantherTo(wx, wz, onArrive = null) {
      const tx = Math.max(-62, Math.min(62, wx));
      const tz = Math.max(-62, Math.min(62, wz));
      this.pantherState.autoTarget = { x: tx, z: tz, onArrive };
      this.pantherState.boostTimer = 0;
      this.isTweening = false;
      this.cameraMode = "follow";
      this._spawnDestinationRing(tx, tz);
    }

    _spawnDestinationRing(wx, wz) {
      if (!this.isWebGL) return;
      const THREE = window.THREE;
      const surf = this._getSurfaceInfoAt(wx, wz);
      const rMat = new THREE.MeshBasicMaterial({
        color: "#ffd32a",
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      const rMesh = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.56, 20), rMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.position.set(wx, surf.groundY + 0.08, wz);
      this.scene.add(rMesh);
      this.wakeRings.push({ mesh: rMesh, mat: rMat, life: 0.9 });
    }

    _isUserOrbiting() {
      return performance.now() < (this._orbitHoldUntil || 0);
    }

    toggleChaseCam() {
      this.chaseCam = !this.chaseCam;
      if (this.chaseCam) this.cameraMode = "follow";
      this._setPantherEmote(this.chaseCam ? "🏃 跑酷追逐視角" : "🎥 自由軌道視角", 1.4);
      return this.chaseCam;
    }

    togglePantherSprint() {
      this.pantherState.sprintToggle = !this.pantherState.sprintToggle;
      return this.pantherState.sprintToggle;
    }

    setPantherSex(sex, silent = false) {
      const next = sex === "f" ? "f" : "m";
      this.pantherState.sex = next;
      if (this.panther) {
        if (this.panther.spriteMat) {
          this.panther.spriteMat.map = this._getPantherTexture(next, this.pantherState.dir, this.pantherState.frame);
          this.panther.spriteMat.needsUpdate = true;
        }
        if (this.panther.pantherParts) {
          const p = this.panther.pantherParts;
          p.shirtMat.color.set(next === "f" ? "#f6bfd0" : "#7cb8eb");
          p.tieMesh.visible = next !== "f";
          p.bowGroup.visible = next === "f";
          p.shortsGroup.visible = next !== "f";
          p.skirtMesh.visible = next === "f";
        }
        if (this.panther.glbRigs && this.panther.glbRigs[next]) {
          this._activatePantherRig(this.panther.glbRigs[next]);
        } else if (this._pantherRigUrls && this._pantherRigUrls[next]) {
          if (!silent && this.pantherRenderMode === "glb") {
            this._setPantherEmote(next === "f" ? "👚 載入女款 3D 模型中…" : "👔 載入男款 3D 模型中…", 1.8);
          }
          this._loadPantherRigForSex(next);
        }
      }
      if (!silent) {
        this._spawnPantherFX(14, ["#f6bfd0", "#a9c8ea", "#ffd32a"]);
        this._setPantherEmote(next === "f" ? "👚 已換穿女款制服！" : "👔 已換穿男款制服！", 1.7);
      }
    }

    setPantherRenderMode(mode) {
      const next = mode === "sprite" ? "sprite" : mode === "glb" ? "glb" : "mesh";
      this._pantherUserPickedMode = true;
      this.pantherRenderMode = next;
      if (this.panther) {
        if (this.panther.customGlbGroup) {
          this.panther.customGlbGroup.visible = next === "glb";
        }
        if (this.panther.meshHolder) {
          this.panther.meshHolder.visible = next === "mesh" || (next === "glb" && !this.panther.customGlbGroup);
        }
        if (this.panther.spriteHolder) {
          this.panther.spriteHolder.visible = next === "sprite";
        }
        if (next === "glb" && this.panther.glbRigs && !this.panther.glbRigs[this.pantherState.sex]) {
          this._loadPantherRigForSex(this.pantherState.sex);
        }
      }
      this._setPantherEmote(next === "sprite" ? "🃏 切換為 8向插畫模式" : "🤖 切換為真 3D 立體模型", 1.6);
    }

    jumpPanther() {
      const ps = this.pantherState;
      if (ps.onGround) {
        ps.vy = 11.4;
        ps.onGround = false;
        ps.doubleJumped = false;
        this._spawnPantherFX(10, ps.onWater ? ["#ffffff", "#7dd3fc"] : ["#fde68a", "#ffffff"], 0.2);
      } else if (!ps.doubleJumped) {
        ps.vy = 9.8;
        ps.doubleJumped = true;
        ps.spinTimer = 0.48;
        this._spawnPantherFX(16, ["#ffd32a", "#38bdf8", "#f43f5e"], 0.35);
      }
    }

    doPantherAction(actionType) {
      const ps = this.pantherState;
      if (actionType === "cheer") {
        ps.action = { type: "cheer", timer: 2.6 };
        if (ps.onGround) {
          ps.vy = 6.8;
          ps.onGround = false;
        }
        this._setPantherEmote("🐾 自強不息！段考加油！", 2.5);
        this._spawnPantherFX(22, ["#ffd32a", "#8f2130", "#38bdf8", "#10b981"], 0.5);
        if (this.callbacks.onPantherAction) this.callbacks.onPantherAction("cheer");
      } else if (actionType === "dance") {
        ps.action = { type: "dance", timer: 3.6 };
        this._setPantherEmote("💃 熱舞應援中！", 3.0);
        this._spawnPantherFX(24, ["#ff9ff3", "#ffd32a", "#48dbfb", "#1dd1a1"], 0.55);
        if (this.callbacks.onPantherAction) this.callbacks.onPantherAction("dance");
      }
    }

    resetPantherToHub() {
      const ps = this.pantherState;
      ps.x = 0;
      ps.z = 3.35;
      ps.groundY = 1.76;
      ps.y = 1.76;
      ps.vy = 0;
      ps.onGround = true;
      ps.onWater = false;
      ps.doubleJumped = false;
      ps.autoTarget = null;
      ps.boostTimer = 0;
      this.cameraMode = "follow";
      this.isTweening = false;
      if (this.panther) {
        this.panther.group.position.set(ps.x, ps.y, ps.z);
        this.panther.surfboard.visible = false;
        this.panther.shadowMesh.position.set(ps.x, ps.y + 0.04, ps.z);
      }
      this._spawnPantherFX(16, ["#38bdf8", "#ffd32a", "#ffffff"], 0.35);
      this._setPantherEmote("⚓ 回到中央自強廣場！", 1.8);
      this.focusPanther();
      this._checkPantherProximity();
    }

    focusPanther() {
      this.cameraMode = "follow";
      if (!this.isWebGL) return;
      const { width, height } = this._getViewportSize();
      const ps = this.pantherState;
      const pose = this._getFollowPose(ps.x, ps.y, ps.z, width, height);
      this.cameraTargetPos = pose.camPos;
      this.controlsTargetPos = pose.targetPos;
      this.isTweening = true;
    }

    toggleCameraMode() {
      if (this.cameraMode === "follow") {
        this.flyToOverview();
        return "overview";
      }
      this.focusPanther();
      return "follow";
    }

    interactNearest() {
      const target = this.nearInteractable;
      if (!target) {
        this.doPantherAction("cheer");
        return false;
      }
      if (target.type === "node" && target.kind === "encounter" && this.callbacks.onWalkEncounter) {
        this.callbacks.onWalkEncounter(target.islandId, target.nodeId, "encounter");
        return true;
      }
      if (target.type === "node" && this.callbacks.onSelectNode) {
        this.callbacks.onSelectNode(target.islandId, target.nodeId);
        return true;
      }
      if (target.type === "island" && this.callbacks.onSelectIsland) {
        this.callbacks.onSelectIsland(target.islandId);
        return true;
      }
      if (target.type === "hub" && this.callbacks.onSelectHub) {
        this.callbacks.onSelectHub();
        return true;
      }
      return false;
    }

    _spawnPantherFX(count, palette, yOffset = 0.25) {
      if (!this.isWebGL) return;
      const THREE = window.THREE;
      const ps = this.pantherState;
      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: palette[i % palette.length],
          transparent: true,
          opacity: 1
        });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.11 + Math.random() * 0.08, 7, 7), mat);
        mesh.position.set(ps.x, ps.y + yOffset, ps.z);
        this.scene.add(mesh);
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.4 + Math.random() * 3.4;
        this.burstParticles.push({
          mesh,
          mat,
          vx: Math.cos(ang) * spd,
          vy: 2.2 + Math.random() * 3.6,
          vz: Math.sin(ang) * spd,
          life: 0.75 + Math.random() * 0.45
        });
      }
    }

    _checkPantherProximity() {
      const ps = this.pantherState;
      let nextSpot = null;
      let bestDist = 2.75;

      for (const spot of this.interactableSpots) {
        const d = Math.hypot(ps.x - spot.x, ps.z - spot.z);
        if (d < bestDist) {
          bestDist = d;
          nextSpot = spot;
        }
      }

      if (!nextSpot) {
        let nearIsl = null;
        let islDist = Infinity;
        for (const isl of this.islandsData) {
          const d = Math.hypot(ps.x - isl.position.x, ps.z - isl.position.z);
          if (d < isl.radius + 4.2 && d < islDist) {
            islDist = d;
            nearIsl = isl;
          }
        }
        if (nearIsl) {
          nextSpot = { type: "island", islandId: nearIsl.id, label: `🏝️ 登島：${nearIsl.name}` };
        } else if (Math.hypot(ps.x, ps.z) < 4.5) {
          nextSpot = { type: "hub", label: "🐾 自強廣場：簽到 / 建島" };
        }
      }

      const prevKey = this.nearInteractable ? `${this.nearInteractable.type}:${this.nearInteractable.islandId || ""}:${this.nearInteractable.nodeId || ""}:${this.nearInteractable.kind || ""}` : "";
      const nextKey = nextSpot ? `${nextSpot.type}:${nextSpot.islandId || ""}:${nextSpot.nodeId || ""}:${nextSpot.kind || ""}` : "";
      this.nearInteractable = nextSpot;
      if (prevKey !== nextKey && this.callbacks.onNearInteractable) {
        this.callbacks.onNearInteractable(nextSpot);
      }

      // Sync island banner when overview walking nears an island
      let bannerIsl = null;
      let bDist = Infinity;
      for (const isl of this.islandsData) {
        const d = Math.hypot(ps.x - isl.position.x, ps.z - isl.position.z);
        if (d < isl.radius + 5.2 && d < bDist) {
          bDist = d;
          bannerIsl = isl;
        }
      }
      const nextId = bannerIsl ? bannerIsl.id : null;
      if (nextId !== this.nearIslandId) {
        this.nearIslandId = nextId;
        if (this.callbacks.onNearIsland) {
          this.callbacks.onNearIsland(bannerIsl);
        }
      }
    }

    /* ==================== 自由航行控制 (Free-Roam Sailing) ==================== */
    setBoatInput(forward, turn) {
      this.boatInput.forward = forward;
      this.boatInput.turn = turn;
      if (forward !== 0 || turn !== 0) {
        this.boatMode = "free";
        this.isTweening = false;
      }
    }

    nudgeBoat(forwardStep, turnStep) {
      this.boatMode = "free";
      this.boatAngle += turnStep;
      const nx = Math.max(-62, Math.min(62, this.boatCurrent.x + Math.sin(this.boatAngle) * forwardStep));
      const nz = Math.max(-62, Math.min(62, this.boatCurrent.z + Math.cos(this.boatAngle) * forwardStep));
      this.boatCurrent.x = nx;
      this.boatCurrent.z = nz;
      this.boatTarget.x = nx;
      this.boatTarget.z = nz;
      if (this.boat) {
        this.boat.rotation.y = this.boatAngle;
      }
      if (this.controls && this.selectedIslandId === null) {
        this.controls.target.set(nx, 1.5, nz);
        this.camera.position.set(nx, 22, nz + 28);
      }
      this._checkNearIsland();
    }

    _checkNearIsland() {
      let nearest = null;
      let minDist = Infinity;
      for (const isl of this.islandsData) {
        const d = Math.hypot(this.boatCurrent.x - isl.position.x, this.boatCurrent.z - isl.position.z);
        if (d < isl.radius + 6.2 && d < minDist) {
          minDist = d;
          nearest = isl;
        }
      }
      const nextId = nearest ? nearest.id : null;
      if (nextId !== this.nearIslandId) {
        this.nearIslandId = nextId;
        if (this.callbacks.onNearIsland) {
          this.callbacks.onNearIsland(nearest);
        }
      }
    }

    _buildWalkerCat() {
      const walker = this._createSvgCatStandee(
        {
          coatColor: "#ffd166",
          bellyColor: "#fff9ec",
          earColor: "#ff9aa2",
          accentColor: "#38bdf8",
          accessoryType: "backpack"
        },
        0.82
      );
      walker.group.visible = false;
      this.scene.add(walker.group);
      this.walkerCat = walker;
    }

    placeWalkerOnIsland(islandId) {
      if (!this.isWebGL || !this.walkerCat) return;
      const island = this.islandsData.find((i) => i.id === islandId);
      const pathInfo = this.islandPaths.get(islandId);
      if (!island || !pathInfo || pathInfo.waypoints.length === 0) return;

      const startAngle = pathInfo.waypoints[0].angle;
      this.walkerState = {
        islandId,
        waypointIdx: 0,
        currentAngle: startAngle,
        targetAngle: startAngle,
        isMoving: false,
        pendingCallback: null
      };
      this.walkerCat.group.position.set(
        island.position.x + Math.cos(startAngle) * pathInfo.radius,
        1.92,
        island.position.z + Math.sin(startAngle) * pathInfo.radius
      );
      this.walkerCat.group.visible = true;
    }

    stepWalkOnIsland(islandId) {
      const island = this.islandsData.find((i) => i.id === islandId);
      const pathInfo = this.islandPaths.get(islandId);
      if (!this.isWebGL || !island || !pathInfo || pathInfo.waypoints.length === 0) {
        if (this.callbacks.onWalkEncounter && island && island.nodes.length > 0) {
          const idx = Math.floor(Math.random() * island.nodes.length);
          this.callbacks.onWalkEncounter(islandId, island.nodes[idx].id, "encounter");
        }
        return;
      }

      if (this.walkerCat && this.walkerState.islandId !== islandId) {
        this.placeWalkerOnIsland(islandId);
      }

      const nextIdx = (this.walkerState.waypointIdx + 1) % pathInfo.waypoints.length;
      const wp = pathInfo.waypoints[nextIdx];
      let targetAng = wp.angle;
      while (targetAng <= this.walkerState.currentAngle) {
        targetAng += Math.PI * 2;
      }
      this.walkerState.waypointIdx = nextIdx;
      this.walkerState.targetAngle = targetAng;
      this.walkerState.isMoving = true;
      this.walkerState.pendingCallback = null;

      const wx = island.position.x + Math.cos(wp.angle) * pathInfo.radius;
      const wz = island.position.z + Math.sin(wp.angle) * pathInfo.radius;
      this.walkPantherTo(wx, wz, () => {
        this.doPantherAction("cheer");
        if (this.callbacks.onWalkEncounter) {
          this.callbacks.onWalkEncounter(islandId, wp.nodeId, wp.kind);
        }
      });
    }

    triggerCatCelebration(islandId) {
      const catObj = this.islandCats.get(islandId);
      if (catObj) {
        catObj.jumpTime = 1.4;
      }
      if (!this.isWebGL) return;

      const island = this.islandsData.find((i) => i.id === islandId);
      if (!island) return;

      const THREE = window.THREE;
      const originX = island.position.x + 1.4;
      const originY = 3.4;
      const originZ = island.position.z + 1.8;
      const palette = ["#ff6b81", "#ffd32a", "#ff9ff3", "#48dbfb", "#1dd1a1"];

      for (let i = 0; i < 28; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: palette[i % palette.length],
          transparent: true,
          opacity: 1
        });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.16 + Math.random() * 0.12, 8, 8), mat);
        mesh.position.set(originX, originY, originZ);
        this.scene.add(mesh);

        const ang = Math.random() * Math.PI * 2;
        const spd = 1.5 + Math.random() * 3.8;
        this.burstParticles.push({
          mesh,
          mat,
          vx: Math.cos(ang) * spd,
          vy: 4.5 + Math.random() * 4.2,
          vz: Math.sin(ang) * spd,
          life: 1.4
        });
      }
    }

    setAtmosphereMode(mode) {
      this.atmosphereMode = mode;
      if (!this.isWebGL) return;

      const presets = {
        day: {
          bg: "#8fd8ff",
          fog: "#bce8ff",
          hemiSky: "#e0f4ff",
          hemiGround: "#4c89b5",
          hemiInt: 1.08,
          sunColor: "#fff9e6",
          sunInt: 1.2,
          ocean: "#c4f1ff",
          starOpacity: 0.12,
          rainbow: true,
          winColor: "#bae6fd"
        },
        sunset: {
          bg: "#2d193c",
          fog: "#512647",
          hemiSky: "#ff9f7f",
          hemiGround: "#281c45",
          hemiInt: 0.82,
          sunColor: "#ff9f43",
          sunInt: 1.25,
          ocean: "#78a2d4",
          starOpacity: 0.45,
          rainbow: false,
          winColor: "#fde047"
        },
        night: {
          bg: "#040b18",
          fog: "#07172e",
          hemiSky: "#487eb0",
          hemiGround: "#0a192f",
          hemiInt: 0.65,
          sunColor: "#a29bfe",
          sunInt: 0.85,
          ocean: "#3f70a6",
          starOpacity: 0.96,
          rainbow: false,
          winColor: "#fef08a"
        }
      };

      const p = presets[mode] || presets.day;
      this.scene.background.set(p.bg);
      this.scene.fog.color.set(p.fog);
      if (this.hemiLight) {
        this.hemiLight.color.set(p.hemiSky);
        this.hemiLight.groundColor.set(p.hemiGround);
        this.hemiLight.intensity = p.hemiInt;
      }
      if (this.sunLight) {
        this.sunLight.color.set(p.sunColor);
        this.sunLight.intensity = p.sunInt;
      }
      if (this.oceanMat) {
        this.oceanMat.color.set(p.ocean);
      }
      if (this.starField) {
        this.starField.material.opacity = p.starOpacity;
      }
      if (this.rainbowMesh) {
        this.rainbowMesh.visible = p.rainbow;
      }
      this.nightGlowMaterials.forEach((m) => m.color.set(p.winColor));
      if (this.panther) {
        this.panther.spriteMat.map = this._getPantherTexture(
          this.pantherState.sex,
          this.pantherState.dir,
          this.pantherState.frame
        );
        this.panther.spriteMat.needsUpdate = true;
      }
    }

    _createFloatingLabels() {
      this.labelsContainer.innerHTML = "";
      this.labelEls.clear();

      this.islandsData.forEach((island) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "island-map-label";
        el.style.setProperty("--island-color", island.colors.primary);
        const catEmoji = island.guardianCat ? island.guardianCat.emoji : "🐾";
        el.innerHTML = `
          <span class="label-badge">${catEmoji} ${island.subject}</span>
          <strong class="label-title">${island.name}</strong>
          <span class="label-stats" data-stats-for="${island.id}">0/${island.nodes.length} 🐾</span>
        `;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.callbacks.onSelectIsland) {
            this.callbacks.onSelectIsland(island.id);
          }
        });
        this.labelsContainer.appendChild(el);
        this.labelEls.set(island.id, el);
      });
    }

    refreshAllStates() {
      if (!this.progressGetter) return;
      let globalDone = 0;
      let globalTotal = 0;
      let globalPctSum = 0;

      this.islandsData.forEach((island) => {
        let conqueredCount = 0;
        let totalPct = 0;

        island.nodes.forEach((node) => {
          const status = this.progressGetter(island.id, node.id);
          totalPct += status.percent;
          globalPctSum += status.percent;
          globalTotal += 1;
          if (status.conquered) {
            conqueredCount += 1;
            globalDone += 1;
          }

          const meshObj = this.nodeMeshes.get(node.id);
          if (meshObj) {
            if (status.conquered) {
              meshObj.crystal.material.color.set("#00e676");
              meshObj.crystal.material.emissive.set("#00b894");
              meshObj.crystal.material.emissiveIntensity = 0.6;
              meshObj.flag.material.color.set("#ffd32a");
              meshObj.flag.position.y = 1.56;
              meshObj.topperMat.color.set("#ffd32a");
            } else if (status.percent > 0) {
              meshObj.crystal.material.color.set("#fbc531");
              meshObj.crystal.material.emissive.set("#e1b12c");
              meshObj.crystal.material.emissiveIntensity = 0.38;
              meshObj.flag.material.color.set("#ff9f43");
              meshObj.flag.position.y = 1.15;
              meshObj.topperMat.color.set("#ff9f43");
            } else {
              meshObj.crystal.material.color.set("#7f8fa6");
              meshObj.crystal.material.emissive.set("#000000");
              meshObj.crystal.material.emissiveIntensity = 0;
              meshObj.flag.material.color.set("#718093");
              meshObj.flag.position.y = 0.72;
              meshObj.topperMat.color.set("#95a5a6");
            }
          }
        });

        const avgPct = Math.round(totalPct / Math.max(island.nodes.length, 1));
        const allConquered = conqueredCount === island.nodes.length;

        const board = this.campusBoards && this.campusBoards.get(island.id);
        if (board) {
          this._drawBulletinCanvas(board.canvas, board.title, avgPct, conqueredCount, island.nodes.length, board.accent);
          board.tex.needsUpdate = true;
        }

        const lh = this.lighthouseMeshes.get(island.id);
        if (lh) {
          if (allConquered) {
            lh.bulb.material.color.set("#fff200");
            lh.beam.material.opacity = 0.32;
          } else if (conqueredCount > 0) {
            lh.bulb.material.color.set("#ffd32a");
            lh.beam.material.opacity = 0.1;
          } else {
            lh.bulb.material.color.set("#7f8c8d");
            lh.beam.material.opacity = 0;
          }
        }

        const labelEl = this.labelEls.get(island.id);
        if (labelEl) {
          const statsSpan = labelEl.querySelector(`[data-stats-for="${island.id}"]`);
          if (statsSpan) {
            statsSpan.textContent = `${conqueredCount}/${island.nodes.length} 🏅 · ${avgPct}%`;
          }
          labelEl.classList.toggle("is-conquered", allConquered);
          labelEl.classList.toggle("is-active", this.selectedIslandId === island.id);
        }
      });

      const hubBoard = this.campusBoards && this.campusBoards.get("hub");
      if (hubBoard) {
        const gPct = Math.round(globalPctSum / Math.max(globalTotal, 1));
        this._drawBulletinCanvas(hubBoard.canvas, hubBoard.title, gPct, globalDone, globalTotal, hubBoard.accent);
        hubBoard.tex.needsUpdate = true;
      }

      if (!this.isWebGL && this.fallbackCtx) {
        this._draw2DFallback();
      }
    }

    _getOverviewPose(width, height) {
      const THREE = window.THREE;
      const aspect = Math.max((width || 1200) / Math.max(height || 800, 1), 0.42);
      const distScale = Math.min(Math.max(1, 1.32 / aspect), 2.85);
      return {
        camPos: new THREE.Vector3(0, 98 * distScale, 134 * distScale),
        targetPos: new THREE.Vector3(0, 0, -2.5)
      };
    }

    _getFollowPose(x, y, z, width, height) {
      const THREE = window.THREE;
      const aspect = (width || 1200) / Math.max(height || 800, 1);
      const camHeight = aspect < 0.85 ? 11.8 : 9.8;
      const camBack = aspect < 0.85 ? 16.5 : 13.8;
      return {
        camPos: new THREE.Vector3(x, y + camHeight, z + camBack),
        targetPos: new THREE.Vector3(x, y + 1.6, z)
      };
    }

    flyToOverview() {
      this.cameraMode = "overview";
      this._orbitHoldUntil = 0;
      this.selectedIslandId = null;
      this.boatMode = "auto";
      this.boatTarget = { x: 0, z: 18.5 };
      if (this.walkerCat) this.walkerCat.group.visible = false;
      this.refreshAllStates();
      this._checkPantherProximity();
      if (!this.isWebGL) return;

      const { width, height } = this._getViewportSize();
      const pose = this._getOverviewPose(width, height);
      this.cameraTargetPos = pose.camPos;
      this.controlsTargetPos = pose.targetPos;
      this.isTweening = true;
    }

    flyToIsland(islandId) {
      const island = this.islandsData.find((i) => i.id === islandId);
      if (!island) return;
      this.cameraMode = "follow";
      this._orbitHoldUntil = 0;
      this.selectedIslandId = islandId;
      this.boatMode = "auto";
      this.boatTarget = {
        x: island.position.x * 0.72,
        z: island.position.z * 0.72 + 6.5
      };
      this.placeWalkerOnIsland(islandId);

      // Teleport Nanshan Panther onto the island's grassy welcome plaza so student can walk right away
      const ps = this.pantherState;
      ps.x = island.position.x + 0.35;
      ps.z = island.position.z + island.radius * 0.62;
      const surf = this._getSurfaceInfoAt(ps.x, ps.z);
      ps.groundY = surf.groundY;
      ps.y = surf.groundY;
      ps.vy = 0;
      ps.onGround = true;
      ps.onWater = surf.onWater;
      ps.doubleJumped = false;
      ps.autoTarget = null;
      ps.boostTimer = 0;
      ps.faceX = 0;
      ps.faceZ = 1;
      ps.dir = "front";
      if (this.panther) {
        this.panther.group.position.set(ps.x, ps.y, ps.z);
        this.panther.surfboard.visible = surf.onWater;
        this.panther.shadowMesh.position.set(ps.x, ps.y + 0.04, ps.z);
        this.panther.spriteMat.map = this._getPantherTexture(ps.sex, ps.dir, 0);
        this.panther.spriteMat.needsUpdate = true;
        this._setPantherEmote(`🏫 歡迎來到${island.name}・自強不息！`, 1.8);
      }
      this._checkPantherProximity();

      this.refreshAllStates();
      if (!this.isWebGL) return;

      const THREE = window.THREE;
      this.cameraTargetPos = new THREE.Vector3(
        island.position.x + 2.5,
        18.2,
        island.position.z + 23.5
      );
      this.controlsTargetPos = new THREE.Vector3(island.position.x, 1.8, island.position.z);
      this.isTweening = true;
    }

    _handlePointerClick(e) {
      if (!this.raycaster || !this.camera) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.clickTargets, false);
      if (intersects.length > 0) {
        const hitObj = intersects[0];
        const hit = hitObj.object.userData;
        if (hit && hit.isPanther) {
          this.doPantherAction("cheer");
          return;
        }
        if (hit && hit.isHub && this.callbacks.onSelectHub) {
          this.callbacks.onSelectHub();
          return;
        }
        if (hit && hit.isCat && this.callbacks.onPetCat) {
          this.callbacks.onPetCat(hit.islandId);
          return;
        }
        if (hit && hit.isEncounter && this.callbacks.onWalkEncounter) {
          this.callbacks.onWalkEncounter(hit.islandId, hit.nodeId, "encounter");
          return;
        }
        if (hit && hit.nodeId && this.callbacks.onSelectNode) {
          this.callbacks.onSelectNode(hit.islandId, hit.nodeId);
          return;
        }
        if (hit && hit.islandId) {
          if (this.selectedIslandId === hit.islandId) {
            this.walkPantherTo(hitObj.point.x, hitObj.point.z);
            return;
          }
          if (this.callbacks.onSelectIsland) {
            this.callbacks.onSelectIsland(hit.islandId);
            return;
          }
        }
      }

      if (this.groundWalkPlane) {
        const gHits = this.raycaster.intersectObject(this.groundWalkPlane, false);
        if (gHits.length > 0) {
          const pt = gHits[0].point;
          this.walkPantherTo(pt.x, pt.z);
        }
      }
    }

    _handlePointerHover(e) {
      if (!this.raycaster || !this.camera) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.clickTargets, false);
      this.renderer.domElement.style.cursor = intersects.length > 0 ? "pointer" : "grab";
    }

    _updateLabelsProjection() {
      const { width, height } = this._getViewportSize();

      if (!this.isWebGL) {
        this.islandsData.forEach((island) => {
          const el = this.labelEls.get(island.id);
          if (!el) return;
          const pos = this._project2D(island.position.x, island.position.z, width, height);
          el.style.transform = `translate(-50%, -100%) translate(${pos.x}px, ${pos.y - 38}px)`;
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        });
        return;
      }

      const THREE = window.THREE;
      const tempVec = new THREE.Vector3();
      const hideOffscreen = this.cameraMode === "follow" || width <= 780;
      this.islandsData.forEach((island) => {
        const el = this.labelEls.get(island.id);
        if (!el) return;
        tempVec.set(island.position.x, 6.8, island.position.z);
        tempVec.project(this.camera);

        if (
          tempVec.z > 1 ||
          (hideOffscreen && (Math.abs(tempVec.x) > 0.92 || Math.abs(tempVec.y) > 0.88))
        ) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          return;
        }

        let x = (tempVec.x * 0.5 + 0.5) * width;
        let y = (-tempVec.y * 0.5 + 0.5) * height;
        if (this.selectedIslandId === null && !hideOffscreen) {
          x = Math.min(Math.max(x, 76), Math.max(width - 76, 76));
          y = Math.min(Math.max(y, 132), Math.max(height - 98, 132));
        }
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
      });
    }

    _spawnBoatWake() {
      const THREE = window.THREE;
      const ringMat = new THREE.MeshBasicMaterial({
        color: "#b8f2ff",
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.72, 16), ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(
        this.boatCurrent.x - Math.sin(this.boatAngle) * 1.3,
        -0.12,
        this.boatCurrent.z - Math.cos(this.boatAngle) * 1.3
      );
      this.scene.add(ringMesh);
      this.wakeRings.push({ mesh: ringMesh, mat: ringMat, life: 1.0 });
    }

    _animate() {
      this.rafId = requestAnimationFrame(() => this._animate());
      const now = performance.now();
      const dt = Math.min(0.045, Math.max(0.008, (now - (this._lastTick || now)) / 1000));
      this._lastTick = now;
      this.clockTime += dt;

      if (this.isWebGL) {
        const THREE = window.THREE;

        if (this._envTex && this._envTex.ocean) {
          this._envTex.ocean.offset.x = (this._envTex.ocean.offset.x + dt * 0.032) % 1;
          this._envTex.ocean.offset.y = (this._envTex.ocean.offset.y + dt * 0.018) % 1;
          if (this._envTex.oceanBump) {
            this._envTex.oceanBump.offset.x = -this._envTex.ocean.offset.x * 0.8;
            this._envTex.oceanBump.offset.y = this._envTex.ocean.offset.y * 0.9;
          }
        }
        this._oceanFrame = (this._oceanFrame || 0) + 1;
        if (this.oceanGeo && this._oceanFrame % 3 === 0) {
          const pos = this.oceanGeo.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const wave =
              Math.sin(x * 0.14 + this.clockTime * 1.4) * 0.22 +
              Math.cos(z * 0.16 + this.clockTime * 1.1) * 0.18;
            pos.setY(i, this.oceanBaseY[i] + wave);
          }
          pos.needsUpdate = true;
          this.oceanGeo.computeVertexNormals();
        }

        if (this.starField) {
          this.starField.rotation.y += 0.0003;
        }

        this.clouds.forEach((c) => {
          c.position.x += c.userData.speed * 0.012;
          if (c.position.x > 48) c.position.x = -48;
        });

        this.nodeMeshes.forEach((obj) => {
          obj.crystal.position.y = obj.baseY + Math.sin(this.clockTime * 2.4 + obj.phase) * 0.13;
          obj.crystal.rotation.y += 0.015;
        });

        this.ambientUpdaters.forEach((fn) => fn(this.clockTime));

        this.islandCats.forEach((cat) => {
          cat.group.lookAt(this.camera.position.x, cat.group.position.y, this.camera.position.z);
          if (cat.jumpTime > 0) {
            cat.jumpTime = Math.max(0, cat.jumpTime - dt);
            const p = 1 - cat.jumpTime / 1.4;
            const hop = Math.abs(Math.sin(p * Math.PI * 3)) * 1.75;
            cat.group.position.y = cat.basePos.y + hop;
            cat.group.rotation.z = Math.sin(p * Math.PI * 6) * 0.18;
          } else {
            cat.group.position.y = cat.basePos.y + Math.sin(this.clockTime * 2.6 + cat.phase) * 0.06;
            cat.group.rotation.z = Math.sin(this.clockTime * 1.8 + cat.phase) * 0.04;
          }
        });

        // Walker Cat roaming
        if (this.walkerCat && this.walkerCat.group.visible && this.walkerState.islandId) {
          const isl = this.islandsData.find((i) => i.id === this.walkerState.islandId);
          const pInfo = this.islandPaths.get(this.walkerState.islandId);
          if (isl && pInfo) {
            if (this.walkerState.isMoving) {
              const diff = this.walkerState.targetAngle - this.walkerState.currentAngle;
              if (diff <= 0.04) {
                this.walkerState.currentAngle = this.walkerState.targetAngle % (Math.PI * 2);
                this.walkerState.isMoving = false;
                const cb = this.walkerState.pendingCallback;
                this.walkerState.pendingCallback = null;
                if (cb) cb();
              } else {
                this.walkerState.currentAngle += Math.min(diff, dt * 2.4);
                this.pawSpawnAccum += dt;
                if (this.pawSpawnAccum > 0.16) {
                  this.pawSpawnAccum = 0;
                  const pMat = new THREE.MeshBasicMaterial({
                    color: "#ffd32a",
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide
                  });
                  const pawMark = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), pMat);
                  pawMark.rotation.x = -Math.PI / 2;
                  pawMark.position.set(this.walkerCat.group.position.x, 1.9, this.walkerCat.group.position.z);
                  this.scene.add(pawMark);
                  this.pawPrints.push({ mesh: pawMark, mat: pMat, life: 1.3 });
                }
              }
            }
            const ang = this.walkerState.currentAngle;
            const hopOffset = this.walkerState.isMoving ? Math.abs(Math.sin(this.clockTime * 14)) * 0.28 : 0;
            this.walkerCat.group.position.set(
              isl.position.x + Math.cos(ang) * pInfo.radius,
              1.92 + hopOffset,
              isl.position.z + Math.sin(ang) * pInfo.radius
            );
            this.walkerCat.group.lookAt(
              this.camera.position.x,
              this.walkerCat.group.position.y,
              this.camera.position.z
            );
          }
        }

        for (let i = this.pawPrints.length - 1; i >= 0; i--) {
          const pp = this.pawPrints[i];
          pp.life -= dt * 0.85;
          if (pp.life <= 0) {
            this.scene.remove(pp.mesh);
            pp.mesh.geometry.dispose();
            pp.mat.dispose();
            this.pawPrints.splice(i, 1);
          } else {
            pp.mat.opacity = pp.life * 0.7;
          }
        }

        // Boat movement (Free-Roam vs Auto-Cruise)
        if (this.boat) {
          if (this.boatMode === "free" && (this.boatInput.forward !== 0 || this.boatInput.turn !== 0)) {
            this.boatAngle += this.boatInput.turn * dt * 2.2;
            const speed = this.boatInput.forward * 11 * dt;
            this.boatCurrent.x = Math.max(-44, Math.min(44, this.boatCurrent.x + Math.sin(this.boatAngle) * speed));
            this.boatCurrent.z = Math.max(-42, Math.min(42, this.boatCurrent.z + Math.cos(this.boatAngle) * speed));
            this.boat.rotation.y = this.boatAngle;

            if (this.controls && this.selectedIslandId === null) {
              this.controls.target.lerp(new THREE.Vector3(this.boatCurrent.x, 1.4, this.boatCurrent.z), 0.12);
              this.camera.position.lerp(
                new THREE.Vector3(this.boatCurrent.x, 22, this.boatCurrent.z + 28),
                0.08
              );
            }
            this.wakeSpawnAccum += dt;
            if (Math.abs(speed) > 0.01 && this.wakeSpawnAccum > 0.12) {
              this.wakeSpawnAccum = 0;
              this._spawnBoatWake();
            }
            this._checkNearIsland();
          } else if (this.boatMode === "auto") {
            const dx = this.boatTarget.x - this.boatCurrent.x;
            const dz = this.boatTarget.z - this.boatCurrent.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.15) {
              this.boatCurrent.x += dx * 0.038;
              this.boatCurrent.z += dz * 0.038;
              this.boatAngle = Math.atan2(dx, dz);
              this.boat.rotation.y = this.boatAngle;
              this.wakeSpawnAccum += dt;
              if (dist > 0.5 && this.wakeSpawnAccum > 0.14) {
                this.wakeSpawnAccum = 0;
                this._spawnBoatWake();
              }
            }
          }

          this.boat.position.set(
            this.boatCurrent.x,
            0.05 + Math.sin(this.clockTime * 3.0) * 0.08,
            this.boatCurrent.z
          );
          this.boat.rotation.z = Math.sin(this.clockTime * 2.2) * 0.04;
          if (this.captainCat) {
            this.captainCat.group.lookAt(
              this.camera.position.x,
              this.captainCat.group.position.y + this.boat.position.y,
              this.camera.position.z
            );
          }
        }

        // Controllable Nanshan Panther Physics, Terrain Conformity & Animation
        this._updatePanther(dt);

        for (let i = this.wakeRings.length - 1; i >= 0; i--) {
          const w = this.wakeRings[i];
          w.life -= dt * 0.75;
          if (w.life <= 0) {
            this.scene.remove(w.mesh);
            w.mesh.geometry.dispose();
            w.mat.dispose();
            this.wakeRings.splice(i, 1);
          } else {
            const s = 1 + (1 - w.life) * 2.6;
            w.mesh.scale.setScalar(s);
            w.mat.opacity = w.life * 0.55;
          }
        }

        for (let i = this.burstParticles.length - 1; i >= 0; i--) {
          const bp = this.burstParticles[i];
          bp.life -= dt;
          if (bp.life <= 0) {
            this.scene.remove(bp.mesh);
            bp.mesh.geometry.dispose();
            bp.mat.dispose();
            this.burstParticles.splice(i, 1);
          } else {
            bp.vy -= 7.8 * dt;
            bp.mesh.position.x += bp.vx * dt;
            bp.mesh.position.y += bp.vy * dt;
            bp.mesh.position.z += bp.vz * dt;
            bp.mat.opacity = Math.min(1, bp.life * 1.2);
          }
        }

        if (this.isTweening && this.cameraTargetPos && this.controlsTargetPos && this.controls) {
          this.camera.position.lerp(this.cameraTargetPos, 0.075);
          this.controls.target.lerp(this.controlsTargetPos, 0.085);
          if (
            this.camera.position.distanceTo(this.cameraTargetPos) < 0.2 &&
            this.controls.target.distanceTo(this.controlsTargetPos) < 0.2
          ) {
            this.isTweening = false;
          }
        }

        if (this.controls) {
          this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
      } else if (this.fallbackCtx) {
        this._updatePanther(dt);
        this._draw2DFallback();
      }

      this._updateLabelsProjection();
    }

    _updatePanther(dt) {
      const ps = this.pantherState;
      const inp = ps.input;
      let ix = inp.ix;
      let iy = inp.iy;
      let len = Math.hypot(ix, iy);
      if (len > 1) {
        ix /= len;
        iy /= len;
        len = 1;
      }

      let fx = 0;
      let fz = -1;
      if (this.isWebGL && this.controls && this.camera) {
        const dxC = this.controls.target.x - this.camera.position.x;
        const dzC = this.controls.target.z - this.camera.position.z;
        const cLen = Math.hypot(dxC, dzC);
        if (cLen > 0.001) {
          fx = dxC / cLen;
          fz = dzC / cLen;
        }
      }
      const rx = -fz;
      const rz = fx;

      const sprinting = Boolean(inp.sprint || ps.sprintToggle);
      const surfInfoBefore = this._getSurfaceInfoAt(ps.x, ps.z);
      const baseSpeed = surfInfoBefore.onWater ? 15.2 : 12.0;
      const speed = baseSpeed * (sprinting ? 1.65 : 1.0);

      let moved = false;
      let worldMoveX = 0;
      let worldMoveZ = 0;
      let moveStrength = 0;

      if (len > 0.05) {
        ps.autoTarget = null;
        worldMoveX = (ix * rx + iy * fx) / len;
        worldMoveZ = (ix * rz + iy * fz) / len;
        moveStrength = len;
      } else if (ps.boostTimer > 0) {
        ps.boostTimer = Math.max(0, ps.boostTimer - dt);
        const bLen = Math.hypot(ps.boostX, ps.boostY) || 1;
        worldMoveX = (ps.boostX * rx + ps.boostY * fx) / bLen;
        worldMoveZ = (ps.boostX * rz + ps.boostY * fz) / bLen;
        moveStrength = 0.95;
      } else if (ps.autoTarget) {
        const dxA = ps.autoTarget.x - ps.x;
        const dzA = ps.autoTarget.z - ps.z;
        const distA = Math.hypot(dxA, dzA);
        if (distA < 0.45) {
          const cb = ps.autoTarget.onArrive;
          ps.autoTarget = null;
          if (cb) cb();
        } else {
          worldMoveX = dxA / distA;
          worldMoveZ = dzA / distA;
          moveStrength = 1.0;
        }
      }

      if (moveStrength > 0.05) {
        const prevX = ps.x;
        const prevZ = ps.z;
        const rawX = Math.max(-95, Math.min(95, prevX + worldMoveX * speed * moveStrength * dt));
        const rawZ = Math.max(-95, Math.min(95, prevZ + worldMoveZ * speed * moveStrength * dt));
        const colRes = this._resolveCollisions(rawX, rawZ, ps.y, 0.42);
        let nextX = Math.max(-95, Math.min(95, colRes.x));
        let nextZ = Math.max(-95, Math.min(95, colRes.z));
        if (ps.onGround) {
          const cliffCheck = this._getSurfaceInfoAt(nextX, nextZ);
          if (cliffCheck.groundY - surfInfoBefore.groundY > 0.72) {
            const tryX = this._resolveCollisions(rawX, prevZ, ps.y, 0.42);
            const tryZ = this._resolveCollisions(prevX, rawZ, ps.y, 0.42);
            if (this._getSurfaceInfoAt(tryX.x, prevZ).groundY - surfInfoBefore.groundY <= 0.72) {
              nextX = tryX.x;
              nextZ = prevZ;
            } else if (this._getSurfaceInfoAt(prevX, tryZ.z).groundY - surfInfoBefore.groundY <= 0.72) {
              nextX = prevX;
              nextZ = tryZ.z;
            } else {
              nextX = prevX;
              nextZ = prevZ;
            }
          }
        }
        ps.x = nextX;
        ps.z = nextZ;
        ps.faceX = worldMoveX;
        ps.faceZ = worldMoveZ;
        ps.faceAngle = Math.atan2(worldMoveX, worldMoveZ);
        moved = Math.hypot(ps.x - prevX, ps.z - prevZ) > 0.0005;

        ps.walkPhase += dt * (8.5 + (sprinting ? 6.0 : 0)) * moveStrength;
        ps.frame = Math.floor(ps.walkPhase) % 4;
        this._checkPantherProximity();
      } else if (ps.action.type === "dance") {
        ps.walkPhase += dt * 13;
        ps.frame = Math.floor(ps.walkPhase) % 4;
      } else {
        ps.frame = 0;
      }

      const scrRight = ps.faceX * rx + ps.faceZ * rz;
      const scrUp = ps.faceX * fx + ps.faceZ * fz;
      const dirRing = ["front", "fl", "left", "bl", "back", "br", "right", "fr", "front"];
      const dirIdx = Math.round(Math.atan2(scrRight, scrUp) / (Math.PI / 4)) + 4;
      const nextDir = dirRing[Math.max(0, Math.min(8, dirIdx))];

      if (ps.action.type === "dance" && ps.action.timer > 0) {
        const spinDirs = ["front", "fr", "right", "br", "back", "bl", "left", "fl"];
        ps.dir = spinDirs[Math.floor((1.75 - ps.action.timer) * 10) % spinDirs.length];
      } else {
        ps.dir = nextDir;
      }

      const surf = this._getSurfaceInfoAt(ps.x, ps.z);
      ps.onWater = surf.onWater;
      ps.groundY += (surf.groundY - ps.groundY) * Math.min(1, dt * 16);

      if (!ps.onGround) {
        ps.vy -= 28 * dt;
        ps.y += ps.vy * dt;
        if (ps.y <= surf.groundY) {
          ps.y = surf.groundY;
          ps.vy = 0;
          ps.onGround = true;
          ps.doubleJumped = false;
          this._spawnPantherFX(10, surf.onWater ? ["#ffffff", "#7dd3fc"] : ["#fde68a", "#ffffff"], 0.15);
        }
      } else {
        ps.y = ps.groundY;
      }

      if (ps.action.timer > 0) {
        ps.action.timer = Math.max(0, ps.action.timer - dt);
        if (ps.action.timer === 0) {
          ps.action.type = null;
          if (this.panther) this.panther.spriteHolder.rotation.z = 0;
        }
      }
      if (ps.spinTimer > 0) {
        ps.spinTimer = Math.max(0, ps.spinTimer - dt);
      }
      if (ps.emoteTimer > 0) {
        ps.emoteTimer = Math.max(0, ps.emoteTimer - dt);
        if (ps.emoteTimer === 0 && this.panther && this.panther.emoteSprite) {
          this.panther.emoteSprite.visible = false;
        }
      }

      if (!this.isWebGL || !this.panther || !window.THREE) return;

      const THREE = window.THREE;
      const mode = this.pantherRenderMode || "mesh";
      if (this.panther.customGlbGroup) {
        this.panther.customGlbGroup.visible = mode === "glb";
      }
      if (this.panther.meshHolder) {
        this.panther.meshHolder.visible = mode === "mesh" || (mode === "glb" && !this.panther.customGlbGroup);
      }
      if (this.panther.spriteHolder) {
        this.panther.spriteHolder.visible = mode === "sprite";
      }

      if (mode === "sprite") {
        if (ps.spinTimer > 0) {
          const p = 1 - ps.spinTimer / 0.48;
          this.panther.spriteHolder.rotation.z = p * Math.PI * 2;
        } else if (ps.action.type === "dance") {
          this.panther.spriteHolder.rotation.z = Math.sin(this.clockTime * 15) * 0.14;
        } else if (ps.action.type === "cheer") {
          this.panther.spriteHolder.rotation.z = Math.sin(this.clockTime * 18) * 0.1;
        } else {
          this.panther.spriteHolder.rotation.z = 0;
        }
        const tex = this._getPantherTexture(ps.sex, ps.dir, ps.frame);
        if (this.panther.spriteMat.map !== tex) {
          this.panther.spriteMat.map = tex;
          this.panther.spriteMat.needsUpdate = true;
        }
      } else if (this.panther.pantherParts) {
        const parts = this.panther.pantherParts;
        const spinAdd = ps.spinTimer > 0 ? (1 - ps.spinTimer / 0.48) * Math.PI * 2 : 0;
        const danceSpin = ps.action.type === "dance" ? Math.sin(this.clockTime * 8) * 0.65 : 0;
        const targetYaw = ps.faceAngle + spinAdd + danceSpin;
        let curYaw = this.panther.meshHolder.rotation.y;
        let diffYaw = ((targetYaw - curYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        this.panther.meshHolder.rotation.y = curYaw + diffYaw * Math.min(1, dt * 16);

        const swing = moved ? Math.sin(ps.walkPhase * 1.45) * 0.72 : 0;
        parts.leftLeg.rotation.x = swing;
        parts.rightLeg.rotation.x = -swing;
        parts.tailGroup.rotation.y = Math.sin(this.clockTime * (moved ? 12 : 4.5)) * 0.28;

        if (ps.action.type === "cheer") {
          parts.leftArm.rotation.x = -Math.PI * 0.78 + Math.sin(this.clockTime * 18) * 0.22;
          parts.rightArm.rotation.x = -Math.PI * 0.78 - Math.sin(this.clockTime * 18) * 0.22;
          parts.bodyPivot.rotation.z = Math.sin(this.clockTime * 12) * 0.08;
        } else if (ps.action.type === "dance") {
          parts.leftArm.rotation.x = Math.sin(this.clockTime * 14) * 0.9;
          parts.rightArm.rotation.x = -Math.sin(this.clockTime * 14) * 0.9;
          parts.bodyPivot.rotation.z = Math.sin(this.clockTime * 10) * 0.14;
        } else {
          parts.leftArm.rotation.x = !ps.onGround ? -0.55 : -swing * 0.82;
          parts.rightArm.rotation.x = !ps.onGround ? -0.55 : swing * 0.82;
          parts.bodyPivot.rotation.z = moved ? Math.sin(ps.walkPhase * 1.45) * 0.045 : 0;
        }
        parts.headGroup.rotation.x = ps.onGround ? Math.sin(this.clockTime * 2.5) * 0.04 : -0.12;
      }

      if (mode === "glb" && this.panther.customGlbGroup) {
        const spinAdd = ps.spinTimer > 0 ? (1 - ps.spinTimer / 0.48) * Math.PI * 2 : 0;
        const hasRealMultiAnims = this.panther.glbActions && !this.panther.glbActions.single;
        const danceSpin = !hasRealMultiAnims && ps.action.type === "dance" ? Math.sin(this.clockTime * 8) * 0.55 : 0;
        this.panther.customGlbGroup.rotation.y = ps.faceAngle + spinAdd + danceSpin;
        this.panther.customGlbGroup.rotation.z = hasRealMultiAnims
          ? 0
          : ps.action.type === "cheer"
            ? Math.sin(this.clockTime * 16) * 0.14
            : ps.action.type === "dance"
              ? Math.sin(this.clockTime * 12) * 0.1
              : 0;

        const mixer = this.panther.glbMixer;
        const acts = this.panther.glbActions;
        if (mixer && acts && hasRealMultiAnims) {
          let want = "idle";
          if (ps.action.type === "dance" && acts.dance) want = "dance";
          else if (ps.action.type === "cheer" && acts.cheer) want = "cheer";
          else if (!ps.onGround && acts.jump) want = "jump";
          else if (moved) want = sprinting && acts.run ? "run" : acts.walk ? "walk" : "run";
          else want = acts.idle ? "idle" : Object.keys(acts)[0];

          const curKey = this.panther.glbCurrentAnim;
          const speedFor = (k) =>
            k === "jump" ? 1.65 :
            k === "cheer" ? 1.3 :
            k === "dance" ? 1.15 :
            k === "walk" ? Math.max(0.8, (moveStrength || 1) * 1.25) :
            k === "run" ? Math.max(0.85, (moveStrength || 1) * (sprinting ? 1.3 : 1.0)) : 1;

          if (want && want !== curKey && acts[want]) {
            const prev = curKey ? acts[curKey] : null;
            const nextAct = acts[want];
            Object.keys(acts).forEach((k) => {
              if (k !== want && acts[k] !== prev) acts[k].stop();
            });
            nextAct.enabled = true;
            nextAct.setEffectiveTimeScale(speedFor(want));
            nextAct.setEffectiveWeight(1);
            nextAct.reset();
            nextAct.play();
            if (prev && prev !== nextAct) {
              prev.enabled = true;
              prev.crossFadeTo(nextAct, want === "jump" ? 0.08 : 0.16, false);
            }
            this.panther.glbCurrentAnim = want;
          } else if (acts[this.panther.glbCurrentAnim]) {
            acts[this.panther.glbCurrentAnim].setEffectiveTimeScale(speedFor(this.panther.glbCurrentAnim));
          }
          mixer.update(dt);
        } else if (mixer && this.panther.glbRun) {
          const run = this.panther.glbRun;
          const active = moved || ps.action.type === "dance";
          const wantW = active ? 1 : 0;
          const w = run.getEffectiveWeight() + (wantW - run.getEffectiveWeight()) * Math.min(1, dt * 9);
          run.setEffectiveWeight(w < 0.01 ? 0 : w);
          mixer.update(active ? dt * (sprinting ? 1.5 : 1) * Math.max(0.5, moveStrength || 1) : 0);
        }
      }

      this.panther.surfboard.visible = ps.onWater;
      this.panther.surfboard.rotation.y = ps.faceAngle;
      this.panther.surfboard.rotation.z = Math.sin(this.clockTime * 3.2) * 0.06;

      if (moved) {
        ps.dustAccum += dt;
        const spawnGap = sprinting ? 0.09 : 0.18;
        if (ps.dustAccum >= spawnGap) {
          ps.dustAccum = 0;
          if (ps.onWater) {
            const wMat = new THREE.MeshBasicMaterial({
              color: "#ffffff",
              transparent: true,
              opacity: 0.65,
              side: THREE.DoubleSide
            });
            const wRing = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.52, 16), wMat);
            wRing.rotation.x = -Math.PI / 2;
            wRing.position.set(ps.x - ps.faceX * 0.85, surf.groundY + 0.05, ps.z - ps.faceZ * 0.85);
            this.scene.add(wRing);
            this.wakeRings.push({ mesh: wRing, mat: wMat, life: 0.85 });
          } else if (sprinting) {
            this._spawnPantherFX(2, ["#7dd3fc", "#fef08a", "#ffffff"], 0.18);
          }
        }
      }

      const bob = ps.action.type === "dance" ? Math.abs(Math.sin(this.clockTime * 11)) * 0.32 : ps.onWater && ps.onGround ? Math.sin(this.clockTime * 3.5) * 0.06 : 0;
      this.panther.group.position.set(ps.x, ps.y + bob, ps.z);
      if (mode === "sprite") {
        this.panther.spriteHolder.lookAt(this.camera.position.x, this.panther.group.position.y, this.camera.position.z);
      }
      if (this.panther.emoteSprite && this.panther.emoteSprite.visible) {
        this.panther.emoteSprite.position.y = mode === "sprite" ? 5.2 : mode === "glb" ? 4.35 : 3.45;
        this.panther.emoteSprite.lookAt(
          this.camera.position.x,
          this.panther.group.position.y + this.panther.emoteSprite.position.y,
          this.camera.position.z
        );
      }

      const heightAboveGround = Math.max(0, ps.y - surf.groundY);
      const shadowScale = Math.max(0.42, 1 - heightAboveGround * 0.14);
      this.panther.shadowMesh.position.set(ps.x, surf.groundY + 0.05, ps.z);
      this.panther.shadowMesh.scale.setScalar(shadowScale);
      this.panther.shadowMat.opacity = Math.max(0.14, 0.42 - heightAboveGround * 0.06);

      if ((moved || this.cameraMode === "follow") && this.controls && !this.isTweening) {
        const oldT = this.controls.target.clone();
        const desiredT = new THREE.Vector3(ps.x, ps.y + 1.5, ps.z);
        this.controls.target.lerp(desiredT, moved ? 0.22 : 0.12);
        const deltaT = this.controls.target.clone().sub(oldT);
        this.camera.position.add(deltaT);

        if (this.chaseCam && moved && !this._isUserOrbiting()) {
          // 跑酷追逐視角：往前／斜向跑動時鏡頭繞到背後；按住 S 往鏡頭反方向倒退時鎖定鏡頭方位避免原地繞圈
          const tgt = this.controls.target;
          const cam = this.camera.position;
          const dx = cam.x - tgt.x;
          const dz = cam.z - tgt.z;
          let r = Math.hypot(dx, dz) || 1;
          let ang = Math.atan2(dx, dz);
          const want = ps.faceAngle + Math.PI;
          const diff = ((want - ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          const movingTowardCam = len > 0.05 && (iy < -0.25 || (iy <= 0.1 && Math.abs(diff) > Math.PI * 0.78));
          if (!movingTowardCam) {
            ang += diff * Math.min(1, dt * 2.6);
          }
          r += (this.chaseDist - r) * Math.min(1, dt * 2.2);
          const h = cam.y - tgt.y;
          const hNew = h + (this.chaseHeight - h) * Math.min(1, dt * 2.2);
          cam.set(tgt.x + Math.sin(ang) * r, tgt.y + hNew, tgt.z + Math.cos(ang) * r);
        } else if (moved && !this.chaseCam) {
          const distToCam = this.camera.position.distanceTo(desiredT);
          if (distToCam > 24) {
            const horizDirX = this.camera.position.x - desiredT.x;
            const horizDirZ = this.camera.position.z - desiredT.z;
            const hLen = Math.hypot(horizDirX, horizDirZ) || 1;
            const goalPos = new THREE.Vector3(
              desiredT.x + (horizDirX / hLen) * 15.5,
              ps.y + 10.5,
              desiredT.z + (horizDirZ / hLen) * 15.5
            );
            this.camera.position.lerp(goalPos, 0.09);
          }
        }
      }
    }

    onResize() {
      const { width, height } = this._getViewportSize();
      if (this.isWebGL && this.camera && this.renderer) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      } else if (this.fallbackCanvas) {
        this.fallbackCanvas.width = width;
        this.fallbackCanvas.height = height;
        this._draw2DFallback();
      }
    }

    /* ================= 2D Canvas Fallback ================= */
    _init2DFallback() {
      const { width, height } = this._getViewportSize();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      this.container.appendChild(canvas);
      this.fallbackCanvas = canvas;
      this.fallbackCtx = canvas.getContext("2d");

      canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        for (const island of this.islandsData) {
          const p = this._project2D(island.position.x, island.position.z, canvas.width, canvas.height);
          if (Math.hypot(cx - p.x, cy - p.y) < 52) {
            if (this.callbacks.onSelectIsland) this.callbacks.onSelectIsland(island.id);
            return;
          }
        }
        const centerX = canvas.width * 0.5;
        const centerY = canvas.height * 0.54;
        const scaleX = Math.min(canvas.width / 112, 11);
        const scaleZ = Math.min(canvas.height / 102, 9);
        this.walkPantherTo((cx - centerX) / scaleX, (cy - centerY) / scaleZ);
      });

      window.addEventListener("resize", () => this.onResize());
    }

    _project2D(worldX, worldZ, width, height) {
      const cx = width * 0.5;
      const cy = height * 0.54;
      const scaleX = Math.min(width / 112, 11);
      const scaleZ = Math.min(height / 102, 9);
      return {
        x: cx + worldX * scaleX,
        y: cy + worldZ * scaleZ
      };
    }

    _draw2DFallback() {
      const ctx = this.fallbackCtx;
      const w = this.fallbackCanvas.width;
      const h = this.fallbackCanvas.height;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, this.atmosphereMode === "night" ? "#040b18" : "#0b2a44");
      grad.addColorStop(1, this.atmosphereMode === "sunset" ? "#3b1d4a" : "#124e73");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(135, 215, 255, 0.14)";
      ctx.lineWidth = 2;
      for (let y = 70; y < h; y += 56) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 40) {
          const offset = Math.sin(x * 0.02 + this.clockTime * 1.4 + y) * 6;
          if (x === 0) ctx.moveTo(x, y + offset);
          else ctx.lineTo(x, y + offset);
        }
        ctx.stroke();
      }

      const hubPos = this._project2D(0, 0, w, h);

      // Bridges radiating from Central Hub to Islands
      ctx.strokeStyle = "rgba(217, 179, 130, 0.72)";
      ctx.lineWidth = 6;
      this.islandsData.forEach((island) => {
        const ip = this._project2D(island.position.x, island.position.z, w, h);
        ctx.beginPath();
        ctx.moveTo(hubPos.x, hubPos.y);
        ctx.lineTo(ip.x, ip.y);
        ctx.stroke();
      });

      // Central Nanshan Hub
      ctx.beginPath();
      ctx.ellipse(hubPos.x, hubPos.y + 4, 34, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#f4d799";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(hubPos.x, hubPos.y, 26, 17, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#62b56e";
      ctx.fill();
      ctx.fillStyle = "#8f2130";
      ctx.fillRect(hubPos.x - 10, hubPos.y - 16, 20, 14);
      ctx.fillStyle = "#ffd32a";
      ctx.beginPath();
      ctx.arc(hubPos.x, hubPos.y - 18, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff8dc";
      ctx.font = 'bold 11px "Noto Sans TC", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("🏛️ 自強廣場", hubPos.x, hubPos.y + 30);

      const scaleFactor = Math.max(0.62, Math.min(w / 620, 1.05));
      this.islandsData.forEach((island) => {
        const p = this._project2D(island.position.x, island.position.z, w, h);
        const theme = this._getIslandTheme(island);
        const rx = 50 * scaleFactor;
        const ry = 32 * scaleFactor;

        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 8, rx + 9, ry + 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(141, 228, 255, 0.25)";
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(p.x, p.y + 4, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = theme.sandColor || island.colors.sand;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(p.x, p.y - 2, rx * 0.82, ry * 0.82, 0, 0, Math.PI * 2);
        ctx.fillStyle = theme.grassColor || island.colors.ground;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y - 12 * scaleFactor, 12 * scaleFactor, 0, Math.PI * 2);
        ctx.fillStyle = island.colors.primary;
        ctx.fill();
      });

      // Controllable Nanshan Panther on 2D Ocean/Island Map
      const ps = this.pantherState;
      const pp = this._project2D(ps.x, ps.z, w, h);
      const jumpLift = Math.max(0, ps.y - ps.groundY) * 10;
      const bob2d = ps.action.type === "dance" ? Math.abs(Math.sin(this.clockTime * 11)) * 6 : 0;

      ctx.beginPath();
      ctx.ellipse(pp.x, pp.y + 6, 16, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = ps.onWater ? "rgba(56, 189, 248, 0.65)" : "rgba(9, 19, 34, 0.42)";
      ctx.fill();

      const { figImg, mirror } = this._getPantherPoseImage(ps.sex, ps.dir);
      const drawY = pp.y - jumpLift - bob2d;
      if (figImg && figImg._loaded) {
        const aspect = figImg.width / Math.max(1, figImg.height);
        const ph = 56;
        const pw = ph * aspect;
        ctx.save();
        ctx.translate(pp.x, drawY + 6);
        if (mirror) ctx.scale(-1, 1);
        ctx.drawImage(figImg, -pw / 2, -ph, pw, ph);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(pp.x, drawY - 14, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#2d2c3e";
        ctx.fill();
        ctx.strokeStyle = "#ffd32a";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      if (ps.emoteTimer > 0 && ps.emoteText) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
        const tw = Math.min(200, ctx.measureText(ps.emoteText).width + 20);
        ctx.beginPath();
        ctx.roundRect(pp.x - tw / 2, drawY - 76, tw, 24, 12);
        ctx.fill();
        ctx.strokeStyle = "#ffd32a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#fff8dc";
        ctx.textAlign = "center";
        ctx.fillText(ps.emoteText, pp.x, drawY - 60);
      }
    }

    upgradeToWebGL() {
      if (this.isWebGL || !window.THREE || !this._canUseWebGL()) return;
      try {
        if (this.fallbackCanvas && this.fallbackCanvas.parentNode) {
          this.fallbackCanvas.parentNode.removeChild(this.fallbackCanvas);
        }
        this.fallbackCanvas = null;
        this.fallbackCtx = null;
        this.clickTargets = [];
        this.interactableSpots = [];
        this.ambientUpdaters = [];
        this.nightGlowMaterials = [];
        this.clouds = [];
        this.pawPrints = [];
        this.wakeRings = [];
        this.burstParticles = [];
        this.dioramaBillboards = [];
        this.catTexRefreshers = [];
        this.colliders = [];
        this.landmarkGroups.clear();
        this.campusBoards.clear();
        this.islandGroups.clear();
        this.nodeMeshes.clear();
        this.lighthouseMeshes.clear();
        this.islandCats.clear();
        this.islandPaths.clear();
        this.decorationMeshes.clear();
        this._initThree();
        this.isWebGL = true;
        this.setAtmosphereMode(this.atmosphereMode);
        this.refreshAllStates();
        this.onResize();
      } catch (err) {
        console.warn("Upgrade to WebGL failed:", err);
      }
    }
  }

  window.IslandSceneManager = IslandSceneManager;
})();
