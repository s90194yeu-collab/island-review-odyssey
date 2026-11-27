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
      this.balloonRefs = [];
      this.campusBenchGroups = [];
      this.islandChests = [];
      this.hubLampGroups = [];
      this.encounterMailboxes = [];
      this.seaBuoyGroups = [];
      this.nightGlowMaterials = []; // window & lamp materials that glow at night
      this.hubNightLight = null;
      this.fireflyPoints = null;
      this.fireflyMat = null;
      this.catSpeech = null;
      this.catSpeechEl = null;
      this.intelGuideBeam = null;
      this.buoyVisited = new Set();
      this.buoyRoundCount = 0;
      this.rainbowMesh = null;
      this.outlineEffect = null;
      this.toonGradientMap = null;
      this.softGlowTex = null;
      this.stylizedMaterials = [];
      this.oceanUniforms = null;
      this.skyUniforms = null;
      this.terrainUniformList = [];
      this.grassUniformList = [];
      this.sanctuaryLights = [];
      this.islandGrowthGroups = new Map();
      this.islandTreeSlots = [];
      this.islandCottageSlots = [];
      this.islandLighthouseSlots = [];
      this.nodeDeskSlots = [];
      this.victoryOrbit = null;
      this.countdownFxEnabled = false;
      this.sakuraGroup = null;
      this.meteorList = [];
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
      this.chaseDist = 6.2; // 原神／星鐵過肩探索鏡頭水平距離
      this.chaseHeight = 0.42; // 相對注視點（胸肩上方）的鏡頭高度，呈微俯平視構圖
      this.cameraTargetPos = null;
      this.controlsTargetPos = null;
      this.isTweening = false;
      this.groundWalkPlane = null;

      // Free-roam sailboat state
      this.boat = null;
      this.captainCat = null;
      this.boatMode = "auto"; // auto | free
      this.boatInput = { forward: 0, turn: 0 };
      this.boatTarget = { x: 22.0, z: 22.0 };
      this.boatCurrent = { x: 22.0, z: 22.0 };
      this.boatAngle = -0.6;

      // Controllable Q-version Nanshan Panther hero
      this.panther = null;
      this.pantherTexCache = new Map();
      this.use3DFigurine = true;
      this.pantherRenderMode = "sprite"; // sprite (Higgsfield 8-dir Chibi figurine, default) | mesh | glb
      this.figurineImages = {};
      this.colliders = [];
      this.campusBoards = new Map();
      this.intelMeshes = new Map();
      this.collectedIntelSet = new Set();
      this.customGlbs = {};
      this.dioramaBillboards = [];
      this.pantherState = {
        sex: "m",
        x: 0,
        y: 4.4,
        z: 7.6,
        groundY: 4.4,
        onWater: false,
        onBridgeId: null,
        jumpedFromWater: false,
        vy: 0,
        onGround: true,
        doubleJumped: false,
        spinTimer: 0,
        dir: "back",
        frame: 0,
        walkPhase: 0,
        faceX: 0,
        faceZ: -1,
        faceAngle: Math.PI,
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

    _disableOutline(mat, thickness = null) {
      if (!mat) return mat;
      mat.userData = Object.assign({}, mat.userData, {
        outlineParameters: thickness === null ? { visible: false } : { thickness }
      });
      return mat;
    }

    _getToonGradientMap() {
      const THREE = window.THREE;
      if (this.toonGradientMap) return this.toonGradientMap;
      if (!THREE) return null;
      const colors = new Uint8Array([138, 178, 212, 240]);
      const gMap = new THREE.DataTexture(colors, 4, 1, THREE.LuminanceFormat);
      gMap.minFilter = THREE.NearestFilter;
      gMap.magFilter = THREE.NearestFilter;
      gMap.generateMipmaps = false;
      gMap.needsUpdate = true;
      this.toonGradientMap = gMap;
      return gMap;
    }

    _makeToonMat(opts = {}, noOutline = false) {
      const THREE = window.THREE;
      const mat = new THREE.MeshToonMaterial({
        gradientMap: this._getToonGradientMap(),
        ...opts
      });
      if (noOutline) this._disableOutline(mat);
      return mat;
    }

    _getSoftGlowTex() {
      const THREE = window.THREE;
      if (this.softGlowTex) return this.softGlowTex;
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, "rgba(255, 255, 255, 1)");
      g.addColorStop(0.35, "rgba(255, 250, 210, 0.85)");
      g.addColorStop(0.7, "rgba(255, 240, 170, 0.28)");
      g.addColorStop(1, "rgba(255, 240, 170, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      this.softGlowTex = tex;
      return tex;
    }

    _getAtmoEmissiveIntensity(mode) {
      const m = mode || this.atmosphereMode || "day";
      if (m === "night") return 0.03;
      if (m === "sunset") return 0.06;
      return 0.08;
    }

    _getArchEmissiveIntensity(mode) {
      const m = mode || this.atmosphereMode || "day";
      if (m === "night") return 0.18;
      if (m === "sunset") return 0.25;
      return 0.24;
    }

    _ensureOutlineEffect() {
      const THREE = window.THREE;
      if (!this.outlineEffect && THREE && THREE.OutlineEffect && this.renderer) {
        this.outlineEffect = new THREE.OutlineEffect(this.renderer, {
          defaultThickness: 0.0022,
          defaultColor: [0.18, 0.13, 0.12],
          defaultAlpha: 0.85,
          defaultKeepAlive: true
        });
      }
      return this.outlineEffect;
    }

    _renderScene() {
      if (!this.isWebGL || !this.renderer || !this.scene || !this.camera) return;
      const effect = this._ensureOutlineEffect();
      if (effect) {
        effect.render(this.scene, this.camera);
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    }

    captureSnapshotDataUrl() {
      if (this.isWebGL && this.renderer && this.renderer.domElement) {
        this._renderScene();
        return this.renderer.domElement.toDataURL("image/png");
      }
      if (this.fallbackCanvas) {
        this._draw2DFallback();
        return this.fallbackCanvas.toDataURL("image/png");
      }
      return "";
    }

    _createShoreSvgTexture(accentColor) {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <circle cx="256" cy="256" r="240" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="20 22" stroke-opacity="0.34" stroke-linecap="round"/>
          <circle cx="256" cy="256" r="224" fill="none" stroke="${accentColor || "#e0f7ff"}" stroke-width="3" stroke-dasharray="10 24" stroke-opacity="0.28" stroke-linecap="round"/>
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
      if (this.renderer && this.renderer.capabilities && typeof this.renderer.capabilities.getMaxAnisotropy === "function") {
        tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      }
      return tex;
    }

    _makeStorybookCanvasTex(kind, rx = 1, ry = 1) {
      const THREE = window.THREE;
      const cv = document.createElement("canvas");
      cv.width = 512;
      cv.height = 512;
      const ctx = cv.getContext("2d");

      if (kind === "plaza") {
        ctx.fillStyle = "#e6d6be";
        ctx.fillRect(0, 0, 512, 512);
        const rows = 8;
        const cellH = 512 / rows;
        const cellW = 512 / 6;
        for (let r = 0; r < rows; r++) {
          const offset = (r % 2) * (cellW * 0.5);
          for (let c = -1; c <= 6; c++) {
            const x = c * cellW + offset + 3;
            const y = r * cellH + 3;
            const w = cellW - 6;
            const h = cellH - 6;
            const shade = 237 + (((r * 7 + c * 13) & 7) - 3) * 1.5;
            ctx.fillStyle = `rgb(${Math.round(shade)}, ${Math.round(shade - 13)}, ${Math.round(shade - 29)})`;
            ctx.beginPath();
            if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 8);
            else ctx.rect(x, y, w, h);
            ctx.fill();
            ctx.strokeStyle = "rgba(148, 126, 102, 0.48)";
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        }
      } else if (kind === "grass") {
        ctx.fillStyle = "#f4f7ef";
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 160; i++) {
          const x = ((i * 97) % 512);
          const y = ((i * 173) % 512);
          const rad = 16 + (i % 4) * 9;
          ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.22)" : "rgba(216,229,204,0.26)";
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = "rgba(188, 210, 175, 0.42)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (let i = 0; i < 72; i++) {
          const x = ((i * 131 + 23) % 490) + 11;
          const y = ((i * 211 + 41) % 490) + 11;
          ctx.beginPath();
          ctx.moveTo(x - 3, y + 4);
          ctx.lineTo(x - 5, y - 3);
          ctx.moveTo(x + 2, y + 4);
          ctx.lineTo(x + 4, y - 4);
          ctx.stroke();
        }
      } else if (kind === "sand") {
        ctx.fillStyle = "#f7eedb";
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = "rgba(225, 206, 178, 0.38)";
        ctx.lineWidth = 4;
        for (let y = 24; y < 512; y += 64) {
          ctx.beginPath();
          for (let x = 0; x <= 512; x += 32) {
            const dy = Math.sin((x / 512) * Math.PI * 2) * 8;
            if (x === 0) ctx.moveTo(x, y + dy);
            else ctx.lineTo(x, y + dy);
          }
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = "#efe0ca";
        ctx.fillRect(0, 0, 512, 512);
        for (let r = 0; r < 6; r++) {
          ctx.fillStyle = r % 2 === 0 ? "rgba(214, 189, 158, 0.25)" : "rgba(255, 249, 238, 0.22)";
          ctx.fillRect(0, r * 86, 512, 42);
        }
      }

      const tex = new THREE.CanvasTexture(cv);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(rx, ry);
      tex.needsUpdate = true;
      return tex;
    }

    _getEnvTextures() {
      if (this._envTex) return this._envTex;
      const env = {
        sand: this._loadTileTex("assets/tex_sand.jpg?v=8", 1.0, 1.0) || this._makeStorybookCanvasTex("sand", 0.22, 0.22),
        grass: this._loadTileTex("assets/tex_grass.jpg?v=8", 1.0, 1.0) || this._makeStorybookCanvasTex("grass", 0.24, 0.24),
        plaza: this._loadTileTex("assets/tex_plaza.jpg?v=8", 1.0, 1.0) || this._makeStorybookCanvasTex("plaza", 9.0, 9.0),
        pathStone: this._loadTileTex("assets/tex_plaza.jpg?v=8", 2.0, 2.0) || this._makeStorybookCanvasTex("plaza", 11.0, 11.0),
        wood: this._loadTileTex("assets/tex_wood.jpg?v=8", 1.4, 1.0),
        cliff: this._loadTileTex("assets/tex_cliff.jpg?v=8", 1.0, 1.0) || this._makeStorybookCanvasTex("cliff", 0.24, 0.24),
        cliffTile: this._loadTileTex("assets/tex_cliff.jpg?v=8", 1.4, 1.0) || this._makeStorybookCanvasTex("cliff", 1.2, 0.8),
      };
      env.cliffWallMat = this._makeToonMat({
        color: "#ead7be",
        map: env.cliff,
      }, true);
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
      this.scene.background = new THREE.Color("#7ec9f5");
      this.scene.fog = new THREE.FogExp2("#b8e2f8", 0.0011);

      this.camera = new THREE.PerspectiveCamera(56, width / height, 0.35, 920);
      const psInit = this.pantherState;
      const initPose = this._getFollowPose(psInit.x, psInit.y, psInit.z, width, height);
      this.camera.position.copy(initPose.camPos);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.container.appendChild(this.renderer.domElement);
      this._ensureOutlineEffect();

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.maxPolarAngle = Math.PI * 0.54;
        this.controls.minPolarAngle = 0.22;
        this.controls.minDistance = 3.8;
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

      this.hemiLight = new THREE.HemisphereLight("#e8f5ff", "#5c8ca8", 0.5);
      this.scene.add(this.hemiLight);

      this.sunLight = new THREE.DirectionalLight("#fff5dc", 0.48);
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

      this.rimLight = new THREE.DirectionalLight("#9ad0ff", 0.16);
      this.rimLight.position.set(-30, 18, -36);
      this.scene.add(this.rimLight);

      this.colliders = [];
      this.islandOccupied = new Map();
      this.landmarkGroups = new Map();
      this.campusBoards = new Map();
      this.activityStations = new Map();
      this.terrainUniformList = [];
      this.grassUniformList = [];
      this.sanctuaryLights = [];
      this.activeActivity = null;
      this.fishingBiteActive = false;
      this.focusModeActive = false;
      this._focusSavedPose = null;
      this._buildSkyDome();
      this._buildStarField();
      this._buildOcean();
      this._buildClouds();
      this._buildSkyAndOceanLife();
      this._buildCountdownSkyFX();
      this.islandGrassConfigs = [];
      this._buildCentralHub();
      this.islandsData.forEach((island, idx) => this._buildIsland(island, idx));
      this._buildRadiatingBridges();
      this._buildDecorationsPool();
      this._buildIntelCollectibles((window.ISLAND_DATA && window.ISLAND_DATA.intelItems) || []);
      this._buildLifeActivities((window.ISLAND_DATA && window.ISLAND_DATA.lifeActivities) || []);
      this._buildAllIslandMeadowGrass();
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

    _buildSkyDome() {
      const THREE = window.THREE;
      this.skyUniforms = {
        uTime: { value: 0 },
        uTopColor: { value: new THREE.Color("#2b7ce5") },
        uMidColor: { value: new THREE.Color("#73c5f8") },
        uHorizonColor: { value: new THREE.Color("#d9f2ff") },
        uFogColor: { value: new THREE.Color("#b8e2f8") },
        uSunDir: { value: new THREE.Vector3(0.32, 0.34, -0.88).normalize() },
        uSunColor: { value: new THREE.Color("#fff5d2") },
        uCloudColor: { value: new THREE.Color("#ffffff") },
        uCloudShade: { value: new THREE.Color("#cfe6fb") },
        uMountainNear: { value: new THREE.Color("#7cb5df") },
        uMountainFar: { value: new THREE.Color("#9cc7ea") },
        uNightMix: { value: 0.0 }
      };

      const skyGeo = new THREE.SphereGeometry(430, 32, 20);
      const skyMat = new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: [
          "varying vec3 vDir;",
          "void main() {",
          "  vDir = normalize(position);",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform float uTime;",
          "uniform vec3 uTopColor;",
          "uniform vec3 uMidColor;",
          "uniform vec3 uHorizonColor;",
          "uniform vec3 uFogColor;",
          "uniform vec3 uSunDir;",
          "uniform vec3 uSunColor;",
          "uniform vec3 uCloudColor;",
          "uniform vec3 uCloudShade;",
          "uniform float uNightMix;",
          "varying vec3 vDir;",
          "float hash21(vec2 p) {",
          "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);",
          "}",
          "float vnoise(vec2 p) {",
          "  vec2 i = floor(p);",
          "  vec2 f = fract(p);",
          "  f = f * f * (3.0 - 2.0 * f);",
          "  float a = hash21(i);",
          "  float b = hash21(i + vec2(1.0, 0.0));",
          "  float c = hash21(i + vec2(0.0, 1.0));",
          "  float d = hash21(i + vec2(1.0, 1.0));",
          "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
          "}",
          "float fbm(vec2 p) {",
          "  float v = 0.0;",
          "  float a = 0.5;",
          "  for (int i = 0; i < 4; i++) {",
          "    v += a * vnoise(p);",
          "    p = p * 2.03 + vec2(17.1, 31.7);",
          "    a *= 0.5;",
          "  }",
          "  return v;",
          "}",
          "void main() {",
          "  vec3 d = normalize(vDir);",
          "  float h = clamp(d.y, 0.0, 1.0);",
          "  vec3 sky = mix(uHorizonColor, uMidColor, smoothstep(0.0, 0.24, h));",
          "  sky = mix(sky, uTopColor, smoothstep(0.18, 0.78, h));",
          "  if (d.y < 0.0) {",
          "    sky = mix(uHorizonColor, uFogColor, smoothstep(0.0, -0.18, d.y));",
          "  }",
          "  float sunDot = max(dot(d, normalize(uSunDir)), 0.0);",
          "  sky += uSunColor * (pow(sunDot, 10.0) * mix(0.32, 0.14, uNightMix) + smoothstep(0.9965, 0.9994, sunDot) * 0.95);",
          "  if (d.y > 0.03) {",
          "    vec2 cuv = d.xz / (d.y + 0.16) * 0.62 + vec2(uTime * 0.012, uTime * 0.004);",
          "    float n = fbm(cuv * 1.45);",
          "    float cMask = smoothstep(0.50, 0.74, n) * smoothstep(0.03, 0.22, d.y) * (1.0 - smoothstep(0.68, 0.95, d.y));",
          "    float lightSide = smoothstep(0.45, 0.78, fbm(cuv * 1.45 + uSunDir.xz * 0.08));",
          "    vec3 cloudCol = mix(uCloudShade, uCloudColor, lightSide);",
          "    sky = mix(sky, cloudCol, cMask * mix(0.76, 0.22, uNightMix));",
          "  }",
          "  gl_FragColor = vec4(sky, 1.0);",
          "}"
        ].join("\n")
      });
      this._disableOutline(skyMat, null);
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      this.scene.add(skyMesh);

      // 遠海地平線群島與青黛山嵐剪影環（增添《原神》開闊大世界視距層次）
      const ridgeGeo = new THREE.CylinderGeometry(285, 292, 46, 72, 1, true);
      const ridgeMat = new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        fog: false,
        vertexShader: [
          "varying float vAngle;",
          "varying float vV;",
          "void main() {",
          "  vAngle = atan(position.z, position.x);",
          "  vV = uv.y;",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 uMountainNear;",
          "uniform vec3 uMountainFar;",
          "uniform vec3 uFogColor;",
          "varying float vAngle;",
          "varying float vV;",
          "float ridgeWave(float a, float ph) {",
          "  return 0.28 + 0.12 * sin(a * 5.0 + ph) + 0.08 * sin(a * 11.0 - ph * 1.7) + 0.04 * cos(a * 19.0 + ph * 0.5);",
          "}",
          "void main() {",
          "  float farH = ridgeWave(vAngle, 1.1) + 0.10;",
          "  float nearH = ridgeWave(vAngle + 0.7, 3.4) * 0.86;",
          "  float inFar = 1.0 - smoothstep(farH - 0.025, farH + 0.025, vV);",
          "  float inNear = 1.0 - smoothstep(nearH - 0.02, nearH + 0.02, vV);",
          "  float alpha = max(inFar * 0.48, inNear * 0.72) * smoothstep(0.06, 0.20, vV);",
          "  if (alpha < 0.01) discard;",
          "  vec3 col = mix(uMountainFar, uMountainNear, inNear);",
          "  col = mix(uFogColor, col, smoothstep(0.10, 0.36, vV));",
          "  gl_FragColor = vec4(col, alpha);",
          "}"
        ].join("\n")
      });
      this._disableOutline(ridgeMat, null);
      const ridgeMesh = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridgeMesh.position.y = 8.5;
      this.scene.add(ridgeMesh);
    }

    _buildStarField() {
      const THREE = window.THREE;
      const starCount = 460;
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.44;
        const r = 220 + Math.random() * 60;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = 35 + r * Math.cos(phi) * 0.7;
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const starMat = new THREE.PointsMaterial({
        color: "#fff8d6",
        map: this._getSoftGlowTex(),
        size: 2.2,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.01,
        depthWrite: false
      });
      this._disableOutline(starMat);
      this.starField = new THREE.Points(starGeo, starMat);
      this.scene.add(this.starField);
    }

    _buildOcean() {
      const THREE = window.THREE;
      const oceanGeo = new THREE.PlaneGeometry(760, 760, 56, 56);
      oceanGeo.rotateX(-Math.PI / 2);

      const posAttr = oceanGeo.attributes.position;
      this.oceanBaseY = [];
      for (let i = 0; i < posAttr.count; i++) {
        this.oceanBaseY.push(posAttr.getY(i));
      }

      const islVecs = [new THREE.Vector3(0, 0, 16.0)];
      (this.islandsData || []).slice(0, 6).forEach((isl) => {
        islVecs.push(new THREE.Vector3(isl.position.x, isl.position.z, (isl.radius || 26.5) * 0.88));
      });
      while (islVecs.length < 7) islVecs.push(new THREE.Vector3(999, 999, 1));
      const reefIsl = (this.islandsData || []).find((i) => i.id === "listening");
      const reefPos = reefIsl ? new THREE.Vector2(reefIsl.position.x, reefIsl.position.z) : new THREE.Vector2(68, -40);

      this.oceanUniforms = {
        uTime: { value: 0 },
        uShallowColor: { value: new THREE.Color("#5fd0e8") },
        uDeepColor: { value: new THREE.Color("#257fb8") },
        uLagoonColor: { value: new THREE.Color("#45ece0") },
        uFoamColor: { value: new THREE.Color("#ffffff") },
        uFogColor: { value: new THREE.Color("#b8e2f8") },
        uFogDensity: { value: 0.0011 },
        uReefCenter: { value: reefPos },
        uReefRadius: { value: 40.0 },
        uIslands: { value: islVecs }
      };

      const oceanMat = new THREE.ShaderMaterial({
        uniforms: this.oceanUniforms,
        vertexShader: [
          "varying vec3 vWorldPos;",
          "void main() {",
          "  vec4 wp = modelMatrix * vec4(position, 1.0);",
          "  vWorldPos = wp.xyz;",
          "  gl_Position = projectionMatrix * viewMatrix * wp;",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform float uTime;",
          "uniform vec3 uShallowColor;",
          "uniform vec3 uDeepColor;",
          "uniform vec3 uLagoonColor;",
          "uniform vec3 uFoamColor;",
          "uniform vec3 uFogColor;",
          "uniform float uFogDensity;",
          "uniform vec2 uReefCenter;",
          "uniform float uReefRadius;",
          "uniform vec3 uIslands[7];",
          "varying vec3 vWorldPos;",
          "float hash2(vec2 p) {",
          "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);",
          "}",
          "float vnoise(vec2 p) {",
          "  vec2 i = floor(p);",
          "  vec2 f = fract(p);",
          "  vec2 u = f * f * (3.0 - 2.0 * f);",
          "  float a = hash2(i);",
          "  float b = hash2(i + vec2(1.0, 0.0));",
          "  float c = hash2(i + vec2(0.0, 1.0));",
          "  float d = hash2(i + vec2(1.0, 1.0));",
          "  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);",
          "}",
          "float fbmWater(vec2 p) {",
          "  float v = 0.0;",
          "  float a = 0.5;",
          "  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);",
          "  for (int i = 0; i < 3; i++) {",
          "    v += a * vnoise(p);",
          "    p = rot * p * 2.03 + vec2(13.1, 17.7);",
          "    a *= 0.5;",
          "  }",
          "  return v;",
          "}",
          "void main() {",
          "  vec2 wpUv = vWorldPos.xz * 0.045;",
          "  float warpOff = fbmWater(wpUv * 0.75 + vec2(uTime * 0.04, uTime * 0.025));",
          "  float coastWarp = (fbmWater(vWorldPos.xz * 0.08 + vec2(uTime * 0.05, -uTime * 0.04)) - 0.5) * 2.8;",
          "  float minDist = 100.0;",
          "  for (int i = 0; i < 7; i++) {",
          "    float d = length(vWorldPos.xz - uIslands[i].xy) - uIslands[i].z + coastWarp;",
          "    minDist = min(minDist, d);",
          "  }",
          "  float shallowBlend = smoothstep(0.0, 6.2, max(0.0, minDist));",
          "  vec3 col = mix(uShallowColor, uDeepColor, shallowBlend);",
          "  float reefDist = length(vWorldPos.xz - uReefCenter) + coastWarp * 1.05;",
          "  float reefLagoon = 1.0 - smoothstep(18.0, uReefRadius, reefDist);",
          "  col = mix(col, uLagoonColor, reefLagoon * 0.84);",
          "  float swell = fbmWater(wpUv + vec2(warpOff * 0.85, -warpOff * 0.65) + vec2(uTime * 0.07, -uTime * 0.05));",
          "  float ripple = fbmWater(vWorldPos.xz * 0.13 + vec2(swell * 1.15, warpOff * 0.9) - vec2(uTime * 0.12, uTime * 0.08));",
          "  float distCam = length(cameraPosition - vWorldPos);",
          "  float distFade = 1.0 - smoothstep(95.0, 240.0, distCam);",
          "  col = mix(col, mix(uDeepColor, uShallowColor, 0.55), smoothstep(0.32, 0.74, swell) * 0.42);",
          "  float crest = smoothstep(0.62, 0.82, ripple) * distFade;",
          "  col = mix(col, mix(uShallowColor, uFoamColor, 0.50), crest * 0.28);",
          "  float outerReefFoam = (1.0 - smoothstep(0.0, 2.2, abs(reefDist - (uReefRadius - 2.2)))) * smoothstep(0.25, 0.75, sin(reefDist * 2.2 - uTime * 2.4) * 0.5 + 0.5);",
          "  float shorePulse = sin(minDist * 3.4 - uTime * 2.4 + (warpOff - 0.5) * 2.6);",
          "  float shoreFoam = (1.0 - smoothstep(0.0, 2.5, max(0.0, minDist))) * smoothstep(0.32, 0.80, shorePulse + 0.3);",
          "  float tightEdge = 1.0 - smoothstep(0.0, 0.9, max(0.0, minDist));",
          "  col = mix(col, uFoamColor, clamp(max(max(shoreFoam * 0.52, tightEdge * 0.55), outerReefFoam * 0.65), 0.0, 0.85));",
          "  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * distCam * distCam);",
          "  col = mix(col, uFogColor, clamp(fogFactor, 0.0, 1.0));",
          "  gl_FragColor = vec4(col, 1.0);",
          "}"
        ].join("\n")
      });
      this._disableOutline(oceanMat);

      const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
      oceanMesh.position.y = -0.35;
      oceanMesh.receiveShadow = true;
      this.scene.add(oceanMesh);
      this.oceanGeo = oceanGeo;
      this.oceanMat = oceanMat;

      const deepGeo = new THREE.PlaneGeometry(820, 820);
      deepGeo.rotateX(-Math.PI / 2);
      const deepMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#1d6ea0" }));
      const deepMesh = new THREE.Mesh(deepGeo, deepMat);
      deepMesh.position.y = -1.8;
      this.scene.add(deepMesh);
    }

    _buildClouds() {
      const THREE = window.THREE;
      const cloudMat = this._disableOutline(
        new THREE.MeshToonMaterial({
          color: "#ffffff",
          emissive: "#edf6ff",
          emissiveIntensity: 0.72,
          transparent: true,
          opacity: 0.90,
          gradientMap: this._getToonGradientMap()
        }),
        null
      );
      this.cloudMat = cloudMat;

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
      const rainbowColors = ["#f9a8d4", "#fdba74", "#fde68a", "#a7f3d0", "#93c5fd", "#c4b5fd"];
      rainbowColors.forEach((col, i) => {
        const arcMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.42 }));
        const arc = new THREE.Mesh(
          new THREE.TorusGeometry(84 - i * 0.82, 0.45, 8, 56, Math.PI),
          arcMat
        );
        rainbowGroup.add(arc);
      });
      rainbowGroup.position.set(0, -1.5, -110);
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
        this.balloonRefs.push({
          group: bg,
          tint: idx === 0 ? "#ffffff" : idx === 1 ? "#e6f4ff" : "#fff7d6"
        });
        this.ambientUpdaters.push((t) => {
          bg.position.y = bCfg.y + Math.sin(t * 0.9 + idx * 2) * 1.4;
          bg.position.x = bCfg.x + Math.cos(t * 0.28 + idx) * 2.5;
          bg.rotation.y = t * 0.35;
        });
      });

      // 3. 6 Soaring Seagulls with flapping / gliding wings
      const gullMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 });
      this.seagullRefs = [];
      for (let i = 0; i < 6; i++) {
        const gull = new THREE.Group();
        const gullVis = new THREE.Group();
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), gullMat);
        body.rotation.x = Math.PI / 2;
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.22), gullMat);
        wingL.position.x = -0.32;
        const wingR = wingL.clone();
        wingR.position.x = 0.32;
        gullVis.add(body, wingL, wingR);
        gull.add(gullVis);
        this.scene.add(gull);
        this.seagullRefs.push({ group: gull, visual: gullVis, wingL, wingR, isGlb: false });

        const orbitR = 12 + (i % 3) * 8;
        const heightY = 9 + (i % 3) * 2.2;
        const speed = 0.42 + (i % 2) * 0.16;
        this.ambientUpdaters.push((t) => {
          const a = t * speed + i * 1.1;
          gull.position.set(Math.cos(a) * orbitR, heightY + Math.sin(t * 2 + i) * 0.5, Math.sin(a) * orbitR);
          gull.rotation.y = -a;
          const ref = this.seagullRefs[i];
          if (ref && ref.isGlb) {
            gullVis.rotation.z = Math.sin(t * 2.8 + i * 1.4) * 0.22;
            gullVis.rotation.x = Math.cos(t * 2.0 + i) * 0.09;
          } else {
            const flap = Math.sin(t * 10 + i * 2) * 0.45;
            wingL.rotation.z = flap;
            wingR.rotation.z = -flap;
          }
        });
      }

      // 4. 2 Pairs of Jumping Dolphins arcing in wide-open East/West bays (+Z forward aligned)
      const dolphinMat = new THREE.MeshStandardMaterial({ color: "#48dbfb", roughness: 0.3 });
      this.dolphinRefs = [];
      const dolphinCenters = [
        { x: -27, z: 0, r: 4.5 },
        { x: 27, z: 0, r: 4.5 }
      ];
      dolphinCenters.forEach((dc, dIdx) => {
        for (let k = 0; k < 2; k++) {
          const dGroup = new THREE.Group();
          const dBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 1.35, 10), dolphinMat);
          dBody.rotation.x = Math.PI / 2;
          const dSnout = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 8), dolphinMat);
          dSnout.rotation.x = Math.PI / 2;
          dSnout.position.z = 0.85;
          const dFin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 4), dolphinMat);
          dFin.position.set(0, 0.32, -0.05);
          dGroup.add(dBody, dSnout, dFin);
          this.scene.add(dGroup);
          this.dolphinRefs.push(dGroup);

          this.ambientUpdaters.push((t) => {
            const phase = t * 1.25 + dIdx * 2.1 + k * 0.65;
            const ang = phase * 0.5;
            const arc = Math.sin(phase * 1.6);
            dGroup.position.set(
              dc.x + Math.cos(ang) * dc.r,
              -0.45 + arc * 1.85,
              dc.z + Math.sin(ang) * dc.r
            );
            dGroup.rotation.y = -ang;
            dGroup.rotation.x = -Math.cos(phase * 1.6) * 0.55;
            dGroup.rotation.z = 0;
            dGroup.visible = arc > -0.35;
          });
        }
      });

      // 5. Giant Spouting Whale cruising strictly in open outer sea (R=85 clears all islands)
      const whaleGroup = new THREE.Group();
      const whaleBodyGroup = new THREE.Group();
      const whaleMat = new THREE.MeshStandardMaterial({ color: "#2c6e91", roughness: 0.4 });
      const wBody = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), whaleMat);
      wBody.scale.set(1.0, 0.9, 1.9);
      const wTail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.9), whaleMat);
      wTail.position.set(0, 0.15, -2.6);
      whaleBodyGroup.add(wBody, wTail);
      const spout = new THREE.Mesh(
        new THREE.ConeGeometry(0.48, 1.8, 10),
        new THREE.MeshBasicMaterial({ color: "#dff9fb", transparent: true, opacity: 0.72 })
      );
      spout.position.set(0, 1.85, 1.85);
      spout.rotation.x = Math.PI;
      whaleGroup.add(whaleBodyGroup, spout);
      this.scene.add(whaleGroup);
      this.whaleBodyGroup = whaleBodyGroup;
      this.whaleSpout = spout;

      this.ambientUpdaters.push((t) => {
        const a = t * 0.11;
        whaleGroup.position.set(Math.cos(a) * 118, -0.25 + Math.sin(t * 1.5) * 0.18, Math.sin(a) * 118);
        whaleGroup.rotation.y = -a;
        const spoutPulse = Math.max(0, Math.sin(t * 1.4));
        spout.scale.set(0.7 + spoutPulse * 0.5, spoutPulse * 1.25, 0.7 + spoutPulse * 0.5);
        spout.visible = spoutPulse > 0.12;
      });

      // 6. Floating Channel Buoys with blinking light
      const buoySpots = [
        [-19, -19],
        [19, -19],
        [-19, 19],
        [19, 19]
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
        buoy.userData = { buoyIdx: idx, x: bx, z: bz };
        bGlow.userData = { isBuoy: true, buoyIdx: idx };
        bBase.userData = { isBuoy: true, buoyIdx: idx };
        bTop.userData = { isBuoy: true, buoyIdx: idx };
        this.clickTargets.push(bBase, bTop, bGlow);
        this.scene.add(buoy);
        this.seaBuoyGroups.push(buoy);
        this.ambientUpdaters.push((t) => {
          buoy.position.y = -0.05 + Math.sin(t * 2.5 + idx) * 0.12;
          buoy.rotation.z = Math.sin(t * 2.0 + idx) * 0.1;
        });
      });

      // 7. Gentle Fireflies & Evening Sea Sparkles (active during Sunset & Night)
      const ffCount = 60;
      const ffPos = new Float32Array(ffCount * 3);
      const ffBaseY = new Float32Array(ffCount);
      for (let i = 0; i < ffCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 3 + Math.random() * 34;
        const y = 1.6 + Math.random() * 4.8;
        ffPos[i * 3] = Math.cos(ang) * dist;
        ffPos[i * 3 + 1] = y;
        ffPos[i * 3 + 2] = Math.sin(ang) * dist;
        ffBaseY[i] = y;
      }
      const ffGeo = new THREE.BufferGeometry();
      ffGeo.setAttribute("position", new THREE.BufferAttribute(ffPos, 3));
      const ffMat = new THREE.PointsMaterial({
        color: "#fff3a6",
        map: this._getSoftGlowTex(),
        size: 0.76,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.01,
        depthWrite: false
      });
      this._disableOutline(ffMat);
      const ffPoints = new THREE.Points(ffGeo, ffMat);
      ffPoints.visible = false;
      this.scene.add(ffPoints);
      this.fireflyPoints = ffPoints;
      this.fireflyMat = ffMat;
      this.ambientUpdaters.push((t) => {
        if (!ffPoints.visible) return;
        const arr = ffGeo.attributes.position.array;
        for (let i = 0; i < ffCount; i++) {
          arr[i * 3 + 1] = ffBaseY[i] + Math.sin(t * 1.45 + i * 0.7) * 0.42;
        }
        ffGeo.attributes.position.needsUpdate = true;
      });
    }

    _buildCountdownSkyFX() {
      const THREE = window.THREE;
      if (!this.scene) return;
      const glowTex = this._getSoftGlowTex();

      // 1) Daytime/Sunset cherry-blossom petals
      const sCount = 52;
      const sPos = new Float32Array(sCount * 3);
      const sSeeds = [];
      for (let i = 0; i < sCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 4 + Math.random() * 44;
        sPos[i * 3] = Math.cos(ang) * dist;
        sPos[i * 3 + 1] = 2 + Math.random() * 20;
        sPos[i * 3 + 2] = Math.sin(ang) * dist;
        sSeeds.push({
          bx: sPos[i * 3],
          bz: sPos[i * 3 + 2],
          spd: 0.9 + Math.random() * 0.85,
          ph: Math.random() * Math.PI * 2
        });
      }
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
      const sMat = this._disableOutline(
        new THREE.PointsMaterial({
          color: "#ffb7d5",
          map: glowTex,
          size: 0.56,
          transparent: true,
          opacity: 0.88,
          depthWrite: false,
          alphaTest: 0.02
        })
      );
      const sakura = new THREE.Points(sGeo, sMat);
      sakura.visible = false;
      this.scene.add(sakura);
      this.sakuraGroup = sakura;

      // 2) Starry-night shooting meteors
      this.meteorList = [];
      for (let m = 0; m < 3; m++) {
        const mGeo = new THREE.CylinderGeometry(0.02, 0.14, 4.4, 6);
        const mMat = this._disableOutline(
          new THREE.MeshBasicMaterial({
            color: m === 0 ? "#fef08a" : "#e0f2fe",
            transparent: true,
            opacity: 0,
            depthWrite: false
          })
        );
        const mesh = new THREE.Mesh(mGeo, mMat);
        mesh.rotation.z = Math.PI * 0.34;
        mesh.rotation.x = 0.25;
        mesh.visible = false;
        this.scene.add(mesh);
        this.meteorList.push({
          mesh,
          mat: mMat,
          offset: m * 3.1,
          period: 7.5 + m * 2.2
        });
      }

      this.ambientUpdaters.push((t) => {
        const on = Boolean(this.countdownFxEnabled);
        const isNight = this.atmosphereMode === "night";
        if (this.sakuraGroup) {
          this.sakuraGroup.visible = on && !isNight;
          if (this.sakuraGroup.visible) {
            const arr = sGeo.attributes.position.array;
            for (let i = 0; i < sCount; i++) {
              const sd = sSeeds[i];
              const fall = 21 - ((t * sd.spd + sd.ph * 3) % 19);
              arr[i * 3] = sd.bx + Math.sin(t * 0.9 + sd.ph) * 1.8;
              arr[i * 3 + 1] = fall;
              arr[i * 3 + 2] = sd.bz + Math.cos(t * 0.8 + sd.ph) * 1.4;
            }
            sGeo.attributes.position.needsUpdate = true;
          }
        }
        this.meteorList.forEach((mt, idx) => {
          if (!on || !isNight) {
            mt.mesh.visible = false;
            return;
          }
          const cyc = ((t + mt.offset) % mt.period) / 1.4;
          if (cyc <= 1) {
            mt.mesh.visible = true;
            const startX = -52 + idx * 34;
            const startZ = -65 + idx * 14;
            mt.mesh.position.set(startX + cyc * 46, 44 - cyc * 22, startZ + cyc * 14);
            mt.mat.opacity = Math.sin(cyc * Math.PI) * 0.92;
          } else {
            mt.mesh.visible = false;
          }
        });
      });
    }

    setCountdownSpecialFX(enabled) {
      this.countdownFxEnabled = Boolean(enabled);
    }

    /* ==================== 六科專屬地景配色表與繪本模型屋統一色票 ==================== */
    _getIslandTheme(island) {
      const THEMES = {
        chinese: {
          grassColor: "#7bc47f",
          hillColor: "#62ad6b",
          sandColor: "#f6e6c8",
          cottageWall: "#fff7ea",
          cottageRoof: "#d96b6b",
          treeStyle: "cherry",
          foliageColors: ["#f9b4c4", "#ffd5df", "#95d59c"],
          dioramaScale: [6.0, 5.4]
        },
        english: {
          grassColor: "#82c97a",
          hillColor: "#68b064",
          sandColor: "#f7e8c4",
          cottageWall: "#fff6e5",
          cottageRoof: "#e07a5f",
          treeStyle: "blossom",
          foliageColors: ["#f7d060", "#a8d88e", "#f9c6cf"],
          dioramaScale: [5.9, 5.3]
        },
        listening: {
          grassColor: "#6faea8",
          hillColor: "#589691",
          sandColor: "#e9ece8",
          cottageWall: "#eef5f9",
          cottageRoof: "#6c8cd5",
          treeStyle: "crystal",
          foliageColors: ["#9bc4e2", "#b8b5e8", "#8dd3c7"],
          dioramaScale: [5.5, 5.8]
        },
        geography: {
          grassColor: "#77b278",
          hillColor: "#619965",
          sandColor: "#efe3cc",
          cottageWall: "#f6ead4",
          cottageRoof: "#d88c51",
          treeStyle: "ice_lava",
          foliageColors: ["#5fa38b", "#92c4a8", "#e8f6f8"],
          dioramaScale: [6.0, 5.5]
        },
        civics: {
          grassColor: "#73be89",
          hillColor: "#5aa474",
          sandColor: "#f4efe2",
          cottageWall: "#faf7f0",
          cottageRoof: "#4a9d8f",
          treeStyle: "cypress",
          foliageColors: ["#63b083", "#88c999", "#b7dfc0"],
          dioramaScale: [5.8, 5.5]
        },
        history: {
          grassColor: "#95bc6c",
          hillColor: "#80a65a",
          sandColor: "#f1dfbc",
          cottageWall: "#f7edd8",
          cottageRoof: "#c98548",
          treeStyle: "ginkgo",
          foliageColors: ["#f4c45c", "#eab04d", "#a6c975"],
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
    _addCircleCollider(x, z, r, maxClimbY = Infinity, groupRef = null, tag = null) {
      this.colliders.push({ type: "circle", x, z, r, maxClimbY, groupRef, tag });
    }

    _addBoxCollider(x, z, halfW, halfD, rotY = 0, maxClimbY = Infinity, groupRef = null, tag = null) {
      this.colliders.push({ type: "box", x, z, halfW, halfD, rotY, maxClimbY, groupRef, tag });
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

    _getGlbEnvMap() {
      const THREE = window.THREE;
      if (this._glbEnvMap !== undefined) return this._glbEnvMap;
      if (!THREE || !THREE.PMREMGenerator || !this.renderer) {
        this._glbEnvMap = null;
        return null;
      }
      try {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        if (typeof pmrem.compileEquirectangularShader === "function") {
          pmrem.compileEquirectangularShader();
        }
        const envScene = new THREE.Scene();
        envScene.background = new THREE.Color("#2b3e58");
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(20, 24, 16),
          new THREE.MeshBasicMaterial({ color: "#4d78a8", side: THREE.BackSide })
        );
        envScene.add(dome);
        const sunCard = new THREE.Mesh(
          new THREE.PlaneGeometry(5, 5),
          new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide })
        );
        sunCard.position.set(6, 8, 9);
        sunCard.lookAt(0, 0, 0);
        envScene.add(sunCard);
        const fillCard = new THREE.Mesh(
          new THREE.PlaneGeometry(4, 4),
          new THREE.MeshBasicMaterial({ color: "#dbeafe", side: THREE.DoubleSide })
        );
        fillCard.position.set(-7, 5, 8);
        fillCard.lookAt(0, 0, 0);
        envScene.add(fillCard);
        const rt = pmrem.fromScene(envScene, 0.04);
        dome.geometry.dispose();
        dome.material.dispose();
        sunCard.geometry.dispose();
        sunCard.material.dispose();
        fillCard.geometry.dispose();
        fillCard.material.dispose();
        pmrem.dispose();
        this._glbEnvMap = rt ? rt.texture : null;
      } catch (_) {
        this._glbEnvMap = null;
      }
      return this._glbEnvMap;
    }

    _prepareGltfMeshes(model, isPantherSlot, clickData = null) {
      const THREE = window.THREE;
      const useShadows = Boolean(isPantherSlot || (clickData && clickData.isHub));
      const isArchitectural = Boolean(clickData && (clickData.isHub || clickData.islandId));
      const outlineThickness = isPantherSlot ? 0.0016 : null;
      const gradMap = this._getToonGradientMap();
      const maxAniso =
        this.renderer && this.renderer.capabilities && typeof this.renderer.capabilities.getMaxAnisotropy === "function"
          ? Math.min(8, this.renderer.capabilities.getMaxAnisotropy())
          : 4;

      model.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = useShadows;
          n.receiveShadow = Boolean(clickData && clickData.isHub);
          if (n.isSkinnedMesh) n.frustumCulled = false;

          const mat = n.material;
          if (mat && (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial)) {
            const toonParams = {
              color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
              map: mat.map || null,
              gradientMap: gradMap,
              transparent: Boolean(mat.transparent),
              opacity: typeof mat.opacity === "number" ? mat.opacity : 1,
              alphaTest: mat.alphaTest || 0,
              side: mat.side !== undefined ? mat.side : THREE.FrontSide,
              skinning: Boolean(n.isSkinnedMesh),
              morphTargets: Boolean(mat.morphTargets),
              vertexColors: Boolean(mat.vertexColors)
            };
            if (mat.normalMap) {
              mat.normalMap.anisotropy = maxAniso;
              toonParams.normalMap = mat.normalMap;
              toonParams.normalScale = new THREE.Vector2(0.35, 0.35);
            }
            if (mat.map) {
              mat.map.anisotropy = maxAniso;
              toonParams.emissive = new THREE.Color(0xffffff);
              toonParams.emissiveMap = mat.map;
              toonParams.emissiveIntensity = isArchitectural
                ? this._getArchEmissiveIntensity()
                : this._getAtmoEmissiveIntensity();
            } else if (mat.emissive) {
              toonParams.emissive = mat.emissive.clone();
              toonParams.emissiveIntensity = Math.min(mat.emissiveIntensity || 0, 0.3);
            }
            const toonMat = new THREE.MeshToonMaterial(toonParams);
            toonMat.userData = Object.assign({}, toonMat.userData, { isArchMat: isArchitectural });
            this._disableOutline(toonMat, outlineThickness);
            n.material = toonMat;
            if (toonParams.emissiveMap) {
              this.stylizedMaterials.push(toonMat);
            }
          } else if (mat && mat.isMeshToonMaterial) {
            this._disableOutline(mat, outlineThickness);
          }

          if (isPantherSlot && n.material && n.material.isMeshToonMaterial && !n.material.userData._rimPatched) {
            n.material.userData = Object.assign({}, n.material.userData, { _rimPatched: true });
            n.material.onBeforeCompile = (shader) => {
              if (shader.fragmentShader && shader.fragmentShader.includes("#include <dithering_fragment>")) {
                shader.fragmentShader = shader.fragmentShader.replace(
                  "#include <dithering_fragment>",
                  [
                    "vec3 rimN = normalize(normal);",
                    "vec3 rimV = normalize(vViewPosition);",
                    "float rimAmt = pow(1.0 - clamp(abs(dot(rimN, rimV)), 0.0, 1.0), 2.4);",
                    "gl_FragColor.rgb += vec3(0.32, 0.46, 0.68) * rimAmt * 0.65;",
                    "#include <dithering_fragment>"
                  ].join("\n")
                );
              }
            };
            n.material.needsUpdate = true;
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
        const hubY = this._getHubPlazaY();
        wrapper.position.set(0, hubY - 0.06, -7.6);
        if (this.customGlbs.hub) this.hubGroup.remove(this.customGlbs.hub);
        this.customGlbs.hub = wrapper;
        this.hubGroup.add(wrapper);
        const fp = wrapper.userData && wrapper.userData.footprint;
        if (fp) {
          this.colliders = this.colliders.filter((c) => c.tag !== "landmark_hub");
          this._addBoxCollider(0, -7.6, fp.halfW, fp.halfD, 0, hubY + 14.0, null, "landmark_hub");
        }
      } else if (this.islandGroups.has(slot)) {
        const islGroup = this.islandGroups.get(slot);
        const lm = this.landmarkGroups && this.landmarkGroups.get(slot);
        if (lm) lm.visible = false;
        const islData = this.islandsData.find((i) => i.id === slot);
        const prof = this._getIslandProfile(islData);
        wrapper.position.set(0, prof.sanctY - 0.08, -7.8);
        if (this.customGlbs[slot]) islGroup.remove(this.customGlbs[slot]);
        this.customGlbs[slot] = wrapper;
        islGroup.add(wrapper);
        const fp = wrapper.userData && wrapper.userData.footprint;
        if (fp && islData) {
          const tag = `landmark_${slot}`;
          this.colliders = this.colliders.filter((c) => c.tag !== tag);
          this._addBoxCollider(islData.position.x, islData.position.z - 7.8, fp.halfW, fp.halfD, 0, prof.sanctY + 14.0, null, tag);
        }
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
        const sz = new THREE.Vector3();
        box.getSize(sz);
        let scale = 1.0;
        if (slot === "panther") {
          scale = 1.85 / Math.max(sz.y, 0.001);
        } else if (slot === "hub") {
          scale = Math.min(10.0 / Math.max(sz.y, 0.001), 13.4 / Math.max(sz.x, sz.z, 0.001));
        } else {
          scale = Math.min(11.6 / Math.max(sz.y, 0.001), 13.8 / Math.max(sz.x, sz.z, 0.001));
        }
        model.scale.setScalar(scale);
        box = this._measureModelBox(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(model.position.x - center.x, model.position.y - box.min.y, model.position.z - center.z);
        const clickTag = slot === "hub" ? { isHub: true } : this.islandGroups.has(slot) ? { islandId: slot } : null;
        this._prepareGltfMeshes(model, slot === "panther", clickTag);
        const wrapper = new THREE.Group();
        wrapper.add(model);
        const slotRotY = { hub: 0, chinese: 0, english: 0, listening: 0, history: 0, geography: 0, civics: 0 };
        if (Object.prototype.hasOwnProperty.call(slotRotY, slot)) {
          wrapper.rotation.y = slotRotY[slot];
        }
        if (slot === "hub" || this.islandGroups.has(slot)) {
          box = this._measureModelBox(wrapper);
          wrapper.userData.footprint = {
            halfW: Math.max(2.8, (box.max.x - box.min.x) * 0.50 + 0.18),
            halfD: Math.max(2.4, (box.max.z - box.min.z) * 0.50 + 0.22),
            height: box.max.y - box.min.y
          };
        }
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
        ["hub", "assets/hub_3d.glb?v=7"],
        ["chinese", "assets/island_chinese.glb?v=7"],
        ["english", "assets/island_english.glb?v=7"],
        ["listening", "assets/island_listening.glb?v=7"],
        ["history", "assets/island_history.glb?v=7"],
        ["geography", "assets/island_geography.glb?v=7"],
        ["civics", "assets/island_civics.glb?v=7"],
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
      setTimeout(() => {
        this._loadWildlifeAndDecorations();
      }, 1150);
    }

    _clearGroupChildren(group) {
      while (group && group.children.length) {
        group.remove(group.children[0]);
      }
    }

    _loadPropGLB(url, targetSize, sizeMode, onReady, tries = 0) {
      const THREE = window.THREE;
      if (!THREE || !THREE.GLTFLoader) {
        if (tries < 50) setTimeout(() => this._loadPropGLB(url, targetSize, sizeMode, onReady, tries + 1), 200);
        return;
      }
      new THREE.GLTFLoader().load(
        url,
        (gltf) => {
          const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
          if (!model) return;
          let box = this._measureModelBox(model);
          const sz = new THREE.Vector3();
          box.getSize(sz);
          const refDim = sizeMode === "max" ? Math.max(sz.x, sz.y, sz.z, 0.001) : Math.max(sz.y, 0.001);
          model.scale.setScalar(targetSize / refDim);
          box = this._measureModelBox(model);
          const center = box.getCenter(new THREE.Vector3());
          model.position.set(
            model.position.x - center.x,
            sizeMode === "max" ? model.position.y - center.y : model.position.y - box.min.y,
            model.position.z - center.z
          );
          this._prepareGltfMeshes(model, false);
          if (onReady) onReady(model);
        },
        undefined,
        () => {}
      );
    }

    _loadWildlifeAndDecorations() {
      const THREE = window.THREE;
      const tasks = [
        () => {
          this._loadPropGLB("assets/dolphin_3d.glb?v=9", 2.1, "max", (base) => {
            if (!this.dolphinRefs) return;
            this.dolphinRefs.forEach((dGroup) => {
              this._clearGroupChildren(dGroup);
              const clone = base.clone();
              dGroup.add(clone);
            });
          });
        },
        () => {
          this._loadPropGLB("assets/seagull_3d.glb?v=9", 1.55, "max", (base) => {
            if (!this.seagullRefs) return;
            this.seagullRefs.forEach((ref) => {
              this._clearGroupChildren(ref.visual);
              const clone = base.clone();
              clone.rotation.y = -Math.PI / 2;
              ref.visual.add(clone);
              ref.isGlb = true;
            });
          });
        },
        () => {
          this._loadPropGLB("assets/whale_3d.glb?v=9", 8.2, "max", (base) => {
            if (!this.whaleBodyGroup) return;
            this._clearGroupChildren(this.whaleBodyGroup);
            base.rotation.y = -0.7347;
            base.position.y = -0.22;
            this.whaleBodyGroup.add(base);
            if (this.whaleSpout) this.whaleSpout.position.set(0, 1.85, 1.85);
          });
        },
        () => {
          this._loadPropGLB("assets/surfboard_3d.glb?v=9", 1.65, "max", (base) => {
            if (!this.panther || !this.panther.surfboard) return;
            this._clearGroupChildren(this.panther.surfboard);
            base.rotation.y = 1.9915;
            base.position.set(0, 0.05, 0);
            this.panther.surfboard.scale.setScalar(1);
            this.panther.surfboard.add(base);
          });
        },
        () => {
          this._loadPropGLB("assets/boat_3d.glb?v=9", 3.85, "height", (base) => {
            if (!this.boatVisualGroup) return;
            this._clearGroupChildren(this.boatVisualGroup);
            this.boatVisualGroup.add(base);
            if (this.captainCat && this.captainCat.group) {
              this.captainCat.group.position.set(0, 0.56, -0.45);
            }
          });
        }
      ];

      const decoSpecs = [
        ["bld-tent", "assets/deco_tent.glb?v=8", 2.05, 0],
        ["bld-fountain", "assets/deco_fountain.glb?v=8", 2.15, 0],
        ["bld-picnic", "assets/deco_picnic.glb?v=8", 0.92, 0],
        ["bld-lantern", "assets/deco_lantern.glb?v=8", 2.1, 0],
        ["bld-telescope", "assets/deco_telescope.glb?v=8", 2.55, 0.2],
        ["bld-carousel", "assets/deco_carousel.glb?v=8", 2.8, 0],
        ["bld-ferris", "assets/deco_ferris.glb?v=8", 3.2, -1.15]
      ];
      decoSpecs.forEach(([id, url, targetH, rotY]) => {
        tasks.push((done) => {
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            if (done) done();
          };
          this._loadPropGLB(url, targetH, "height", (base) => {
            const g = this.decorationMeshes && this.decorationMeshes.get(id);
            if (g) {
              const target = (g.userData && g.userData.spinTarget) || g;
              this._clearGroupChildren(target);
              if (rotY) base.rotation.y = rotY;
              target.add(base);
            }
            finish();
          });
          setTimeout(finish, 3000);
        });
      });

      const actModelMeta = new Map();
      if (this.activityStations) {
        this.activityStations.forEach((st) => {
          if (st && st.act && st.act.model && !actModelMeta.has(st.act.model)) {
            actModelMeta.set(st.act.model, {
              model: st.act.model,
              url: `assets/${st.act.model}.glb?v=10`,
              targetH: st.act.targetH || 1.85
            });
          }
        });
      }
      actModelMeta.forEach((meta) => {
        tasks.push((done) => {
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            if (done) done();
          };
          this._loadPropGLB(meta.url, meta.targetH, "height", (base) => {
            if (this.activityStations) {
              this.activityStations.forEach((st) => {
                if (!st || !st.act || st.act.model !== meta.model || !st.modelSlot) return;
                this._clearGroupChildren(st.modelSlot);
                const clone = base.clone();
                clone.rotation.y = st.act.baseRotY || 0;
                clone.traverse((n) => {
                  if (n.isMesh) {
                    n.userData = Object.assign({}, n.userData, {
                      isActivity: true,
                      activityId: st.act.id
                    });
                    this.clickTargets.push(n);
                  }
                });
                st.modelSlot.add(clone);
              });
            }
            finish();
          });
          setTimeout(finish, 3500);
        });
      });

      // 換裝 4 件輕量 3D 共用道具（寶箱、漂流瓶、熱氣球、校園長椅），全場 clone 共用幾何與貼圖
      const propLoaders = [
        ["assets/prop_chest.glb?v=16", 0.62, "height", (base) => {
          if (!this.islandChests || !this.islandChests.length) return;
          this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isChestProp));
          this.islandChests.forEach(({ chest, island }) => {
            this._clearGroupChildren(chest);
            const clone = base.clone();
            clone.rotation.y = -0.35;
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
                if (island && island.nodes && island.nodes[0]) {
                  c.userData = { islandId: island.id, nodeId: island.nodes[0].id, isEncounter: true, isChestProp: true };
                  this.clickTargets.push(c);
                }
              }
            });
            chest.add(clone);
          });
        }],
        ["assets/prop_bottle.glb?v=16", 1.05, "height", (base) => {
          if (!this.intelMeshes) return;
          this.intelMeshes.forEach((entry) => {
            if (!entry.isOcean || !entry.vis) return;
            this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isIntel && t.userData.intelId === entry.item.id));
            const ring = entry.ringMesh;
            this._clearGroupChildren(entry.vis);
            if (ring) {
              entry.vis.add(ring);
              ring.userData = { isIntel: true, intelId: entry.item.id };
              this.clickTargets.push(ring);
            }
            const clone = base.clone();
            clone.position.y = -0.34;
            clone.rotation.z = 0.24;
            entry.glbMats = [];
            clone.traverse((c) => {
              if (c.isMesh) {
                if (c.material) {
                  c.material = c.material.clone();
                  entry.glbMats.push(c.material);
                }
                c.userData = { isIntel: true, intelId: entry.item.id };
                this.clickTargets.push(c);
              }
            });
            entry.vis.add(clone);
          });
          this.syncCollectedIntel(Array.from(this.collectedIntelSet));
        }],
        ["assets/prop_balloon.glb?v=16", 3.9, "height", (base) => {
          if (!this.balloonRefs) return;
          this.balloonRefs.forEach(({ group, tint }) => {
            this._clearGroupChildren(group);
            const clone = base.clone();
            clone.position.y = -0.35;
            if (tint && tint !== "#ffffff") {
              clone.traverse((c) => {
                if (c.isMesh && c.material) {
                  c.material = c.material.clone();
                  c.material.color.set(tint);
                }
              });
            }
            group.add(clone);
          });
        }],
        ["assets/prop_bench.glb?v=16", 0.88, "height", (base) => {
          if (!this.campusBenchGroups) return;
          this.campusBenchGroups.forEach((bench) => {
            this._clearGroupChildren(bench);
            const clone = base.clone();
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
              }
            });
            bench.add(clone);
          });
        }],
        ["assets/prop_lamp.glb?v=16", 2.65, "height", (base) => {
          if (!this.hubLampGroups) return;
          const lampGlowColor = this.atmosphereMode === "day" ? "#bae6fd" : this.atmosphereMode === "sunset" ? "#fde047" : "#fef08a";
          this.hubLampGroups.forEach(({ group, rotY }) => {
            this._clearGroupChildren(group);
            const clone = base.clone();
            clone.rotation.y = rotY || 0;
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
              }
            });
            const bulbMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: lampGlowColor }));
            this.nightGlowMaterials.push(bulbMat);
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), bulbMat);
            bulb.position.set(0, 2.22, 0);
            group.add(clone, bulb);
          });
          if (!this.hubNightLight && this.hubGroup) {
            const pLight = new THREE.PointLight("#ffd28a", this.atmosphereMode === "night" ? 0.55 : this.atmosphereMode === "sunset" ? 0.35 : 0, 18);
            pLight.position.set(0, 4.8, 0.5);
            this.hubGroup.add(pLight);
            this.hubNightLight = pLight;
          }
        }],
        ["assets/prop_mailbox.glb?v=16", 1.05, "height", (base) => {
          if (!this.encounterMailboxes) return;
          this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isMailboxProp));
          this.encounterMailboxes.forEach(({ mailbox, islandId, nodeId, rotY }) => {
            this._clearGroupChildren(mailbox);
            const clone = base.clone();
            clone.rotation.y = rotY || 0;
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
                c.userData = { islandId, nodeId, isEncounter: true, isMailboxProp: true };
                this.clickTargets.push(c);
              }
            });
            mailbox.add(clone);
          });
        }],
        ["assets/prop_crystal.glb?v=16", 1.02, "height", (base) => {
          if (!this.intelMeshes) return;
          this.intelMeshes.forEach((entry) => {
            if (entry.isOcean || !entry.vis) return;
            this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isIntel && t.userData.intelId === entry.item.id));
            const ring = entry.ringMesh;
            this._clearGroupChildren(entry.vis);
            if (ring) {
              entry.vis.add(ring);
              ring.userData = { isIntel: true, intelId: entry.item.id };
              this.clickTargets.push(ring);
            }
            const clone = base.clone();
            clone.position.y = -0.48;
            const tintCol = new THREE.Color(entry.accentHex || "#f59e0b");
            entry.glbMats = [];
            clone.traverse((c) => {
              if (c.isMesh) {
                if (c.material) {
                  c.material = c.material.clone();
                  c.material.color.lerp(tintCol, 0.35);
                  c.material.emissive = tintCol.clone();
                  c.material.emissiveMap = null;
                  c.material.emissiveIntensity = 0.34;
                  entry.glbMats.push(c.material);
                }
                c.userData = { isIntel: true, intelId: entry.item.id };
                this.clickTargets.push(c);
              }
            });
            entry.vis.add(clone);
          });
          this.syncCollectedIntel(Array.from(this.collectedIntelSet));
        }],
        ["assets/prop_buoy.glb?v=16", 1.48, "height", (base) => {
          if (!this.seaBuoyGroups) return;
          this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isBuoy));
          const glowCol = this.atmosphereMode === "day" ? "#bae6fd" : this.atmosphereMode === "sunset" ? "#fde047" : "#fef08a";
          this.seaBuoyGroups.forEach((buoy, idx) => {
            this._clearGroupChildren(buoy);
            const clone = base.clone();
            clone.position.y = -0.24;
            clone.traverse((c) => {
              if (c.isMesh) {
                c.userData = Object.assign({}, c.userData, { isBuoy: true, buoyIdx: idx });
                this.clickTargets.push(c);
              }
            });
            const bGlowMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: glowCol }));
            this.nightGlowMaterials.push(bGlowMat);
            const bGlow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), bGlowMat);
            bGlow.position.set(0, 1.16, 0);
            bGlow.userData = { isBuoy: true, buoyIdx: idx };
            this.clickTargets.push(bGlow);
            const ringMat = this._disableOutline(
              new THREE.MeshBasicMaterial({
                color: this.buoyVisited.has(idx) ? "#34d399" : "#ffd32a",
                transparent: true,
                opacity: 0.72,
                side: THREE.DoubleSide
              })
            );
            const pRing = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.16, 20), ringMat);
            pRing.rotation.x = -Math.PI / 2;
            pRing.position.y = 0.08;
            buoy.userData.patrolRingMat = ringMat;
            buoy.add(clone, bGlow, pRing);
          });
        }],
        ["assets/prop_lighthouse.glb?v=20", 5.2, "height", (base) => {
          if (!this.islandLighthouseSlots || !this.islandLighthouseSlots.length) return;
          this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isLighthouseProp));
          this.islandLighthouseSlots.forEach(({ slot, island }) => {
            this._clearGroupChildren(slot);
            const clone = base.clone();
            clone.rotation.y = -0.35;
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
                c.userData = { islandId: island.id, isLighthouseProp: true };
                this.clickTargets.push(c);
              }
            });
            slot.add(clone);
          });
        }],
        ["assets/prop_tree_round.glb?v=20", 2.65, "height", (base) => {
          if (!this.islandTreeSlots || !this.islandTreeSlots.length) return;
          this.islandTreeSlots.forEach((entry, idx) => {
            if (entry.isPine) return;
            this._clearGroupChildren(entry.slot);
            const clone = base.clone();
            clone.rotation.y = idx * 1.15;
            const tintCol = new THREE.Color(entry.tint || "#95d59c");
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
                if (c.material) {
                  c.material = c.material.clone();
                  c.material.color.lerp(tintCol, 0.28);
                  if (c.material.emissiveMap) {
                    c.material.emissiveIntensity = this._getAtmoEmissiveIntensity();
                    this.stylizedMaterials.push(c.material);
                  }
                }
              }
            });
            entry.slot.add(clone);
          });
        }],
        ["assets/prop_tree_pine.glb?v=20", 2.85, "height", (base) => {
          if (!this.islandTreeSlots || !this.islandTreeSlots.length) return;
          this.islandTreeSlots.forEach((entry, idx) => {
            if (!entry.isPine) return;
            this._clearGroupChildren(entry.slot);
            const clone = base.clone();
            clone.rotation.y = idx * 0.95;
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
              }
            });
            entry.slot.add(clone);
          });
        }],
        ["assets/prop_node_desk.glb?v=20", 1.05, "height", (base) => {
          if (!this.nodeDeskSlots || !this.nodeDeskSlots.length) return;
          this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isDeskProp));
          this.nodeDeskSlots.forEach(({ slot, islandId, nodeId }) => {
            this._clearGroupChildren(slot);
            const clone = base.clone();
            clone.position.set(-0.14, 0.16, 0.04);
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
                c.userData = { islandId, nodeId, isDeskProp: true };
                this.clickTargets.push(c);
              }
            });
            slot.add(clone);
          });
        }],
        ["assets/prop_cottage.glb?v=20", 2.45, "height", (base) => {
          if (!this.islandCottageSlots || !this.islandCottageSlots.length) return;
          this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isCottageProp));
          this.islandCottageSlots.forEach(({ slot, island, winMat }) => {
            this._clearGroupChildren(slot);
            const clone = base.clone();
            clone.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
                c.userData = { islandId: island.id, isCottageProp: true };
                this.clickTargets.push(c);
              }
            });
            slot.add(clone);
            if (winMat) {
              const cBox = this._measureModelBox(clone);
              const frontZ = Math.max(0.65, cBox.max.z * 0.82);
              [-0.45, 0.45].forEach((lx) => {
                const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), winMat);
                sconce.position.set(lx, 1.05, frontZ);
                slot.add(sconce);
              });
            }
          });
        }]
      ];
      propLoaders.forEach(([url, targetSize, sizeMode, onApply]) => {
        tasks.push((done) => {
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            if (done) done();
          };
          this._loadPropGLB(url, targetSize, sizeMode, (base) => {
            onApply(base);
            finish();
          });
          setTimeout(finish, 3000);
        });
      });

      // 先並行載入海空活體與帆船，再 2 個併發緩載裝飾（避免同時佔用行動端頻寬）
      let qi = 0;
      const runQueue = () => {
        if (qi >= tasks.length) return;
        const fn = tasks[qi++];
        if (fn.length > 0) fn(runQueue);
        else { fn(); setTimeout(runQueue, 180); }
      };
      runQueue();
      runQueue();
    }

    _cloneSkinnedScene(source) {
      const THREE = window.THREE;
      const clone = source.clone(true);
      const srcNodes = [];
      const dstNodes = [];
      source.traverse((n) => srcNodes.push(n));
      clone.traverse((n) => dstNodes.push(n));
      const nodeMap = new Map();
      for (let i = 0; i < srcNodes.length; i++) nodeMap.set(srcNodes[i], dstNodes[i]);
      for (let i = 0; i < dstNodes.length; i++) {
        const dst = dstNodes[i];
        if (dst.isSkinnedMesh && dst.skeleton) {
          const newBones = dst.skeleton.bones.map((b) => nodeMap.get(b) || b);
          const newInverses = dst.skeleton.boneInverses.map((m) => m.clone());
          const newSkel = new THREE.Skeleton(newBones, newInverses);
          dst.bind(newSkel, dst.bindMatrix ? dst.bindMatrix.clone() : new THREE.Matrix4());
          dst.frustumCulled = false;
        }
      }
      return clone;
    }

    _setCatRigAnim(rig, wantKey) {
      if (!rig || !rig.actions) return;
      const acts = rig.actions;
      const target = acts[wantKey] ? wantKey : acts.idle ? "idle" : Object.keys(acts)[0];
      if (!target || target === rig.currentAnim) return;
      const prev = acts[rig.currentAnim];
      const next = acts[target];
      if (!next) return;
      next.reset();
      next.enabled = true;
      next.setEffectiveWeight(1);
      next.play();
      if (prev && prev !== next) {
        prev.enabled = true;
        prev.crossFadeTo(next, 0.22, false);
      }
      rig.currentAnim = target;
    }

    _normalizeCatBase(base, targetHeight = 2.05) {
      let box = this._measureModelBox(base);
      const normScale = targetHeight / Math.max(box.max.y - box.min.y, 0.001);
      base.scale.setScalar(normScale);
      box = this._measureModelBox(base);
      const center = box.getCenter(new THREE.Vector3());
      base.position.set(base.position.x - center.x, base.position.y - box.min.y, base.position.z - center.z);
      this._prepareGltfMeshes(base, false);
      return base;
    }

    _mountHubCat(base, animations = null) {
      if (!this.hubGroup) return;
      if (!this.hubCatWrap) {
        const hubY = this._getHubPlazaY();
        this.hubCatWrap = new THREE.Group();
        this.hubCatWrap.position.set(-5.4, hubY, 5.2);
        this.hubCatWrap.rotation.y = 0.42;
        this.hubGroup.add(this.hubCatWrap);
        this._addCircleCollider(-5.4, 5.2, 0.72, hubY + 2.8);
      }
      this._clearGroupChildren(this.hubCatWrap);
      this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isHubCat));
      const hubCatMesh = this._cloneSkinnedScene(base);
      hubCatMesh.traverse((n) => {
        if (n.isMesh) {
          n.userData = Object.assign({}, n.userData, { isHub: true, isHubCat: true });
          this.clickTargets.push(n);
        }
      });
      this.hubCatWrap.add(hubCatMesh);
      this.hubCatRig = animations && animations.length ? this._bindPantherMixer(hubCatMesh, animations) : null;
      this.hubCatCheerTimer = 0;
    }

    _mountIslandCat(islandId, base, scaleFactor = 0.76, animations = null) {
      const catObj = this.islandCats && this.islandCats.get(islandId);
      if (!catObj) return;
      this.clickTargets = this.clickTargets.filter(
        (t) => !(t.userData && t.userData.islandId === islandId && t.userData.isCat)
      );
      const islClone = this._cloneSkinnedScene(base);
      islClone.scale.multiplyScalar(scaleFactor);
      islClone.traverse((n) => {
        if (n.isMesh) {
          n.userData = Object.assign({}, n.userData, { islandId, isCat: true });
          this.clickTargets.push(n);
        }
      });
      this._clearGroupChildren(catObj.group);
      catObj.group.add(islClone);
      catObj.group.position.y = catObj.basePos.y;
      catObj.group.rotation.z = 0;
      catObj.rig = animations && animations.length ? this._bindPantherMixer(islClone, animations) : null;
    }

    _mountGoldStatue(base) {
      const statueGroup = this.decorationMeshes && this.decorationMeshes.get("bld-statue");
      if (!statueGroup) return;
      this._clearGroupChildren(statueGroup);
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.8, 0.56, 16),
        this._makeToonMat({ color: "#ede6d6" })
      );
      ped.position.y = 0.28;
      const goldCat = base.clone();
      goldCat.scale.multiplyScalar(0.84);
      goldCat.position.y = 0.55;
      goldCat.traverse((n) => {
        if (n.isMesh && n.material) {
          const gm = n.material.clone();
          gm.map = null;
          gm.emissiveMap = null;
          gm.color = new THREE.Color("#ffd32a");
          gm.emissive = new THREE.Color("#d97706");
          gm.emissiveIntensity = 0.24;
          n.material = gm;
        }
      });
      statueGroup.add(ped, goldCat);
    }

    _loadCatVariant(loader, url, targetHeight, onReady) {
      loader.load(
        url,
        (gltf) => {
          const base = gltf.scene || (gltf.scenes && gltf.scenes[0]);
          if (base && onReady) onReady(this._normalizeCatBase(base, targetHeight), gltf.animations || []);
        },
        undefined,
        () => {}
      );
    }

    _mountCaptainCat(base) {
      if (!this.captainCat || !this.captainCat.group) return;
      this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isCaptain));
      const captainClone = this._cloneSkinnedScene(base);
      captainClone.scale.multiplyScalar(0.78);
      captainClone.traverse((n) => {
        if (n.isMesh) {
          n.userData = Object.assign({}, n.userData, { isCaptain: true });
          this.clickTargets.push(n);
        }
      });
      this._clearGroupChildren(this.captainCat.group);
      this.captainCat.group.add(captainClone);
      this.captainCat.isMofuPirate = true;
    }

    _mountWalkerCat(base) {
      if (!this.walkerCat || !this.walkerCat.group) return;
      this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isWalkerCat));
      const walkerClone = this._cloneSkinnedScene(base);
      walkerClone.scale.multiplyScalar(0.81);
      walkerClone.traverse((n) => {
        if (n.isMesh) {
          n.userData = Object.assign({}, n.userData, { isWalkerCat: true });
          this.clickTargets.push(n);
        }
      });
      this._clearGroupChildren(this.walkerCat.group);
      this.walkerCat.group.add(walkerClone);
      this.walkerCat.isMofuWalker = true;
    }

    _mountSalmonCat(base) {
      const THREE = window.THREE;
      if (!this.scene) return;
      this.clickTargets = this.clickTargets.filter((t) => !(t.userData && t.userData.isSalmon));
      if (!this.salmonCatGroup) {
        this.salmonCatGroup = new THREE.Group();
        this.scene.add(this.salmonCatGroup);
      }
      this._clearGroupChildren(this.salmonCatGroup);
      const salmonWrap = new THREE.Group();
      const salmonMesh = this._cloneSkinnedScene(base);
      salmonMesh.scale.multiplyScalar(0.86);
      salmonMesh.position.y -= 0.52;
      salmonMesh.traverse((n) => {
        if (n.isMesh) {
          n.userData = Object.assign({}, n.userData, { isSalmon: true });
          this.clickTargets.push(n);
        }
      });
      // 讓櫻鮭貓福微微仰漂在水面上，露出快樂表情與粉紅肉球
      salmonWrap.add(salmonMesh);
      salmonWrap.rotation.x = -Math.PI * 0.4;
      this.salmonCatGroup.add(salmonWrap);
      this.salmonRollTimer = 0;
    }

    _loadCatMascots(url, tries = 0) {
      const THREE = window.THREE;
      if (!THREE || !THREE.GLTFLoader) {
        if (tries < 50) setTimeout(() => this._loadCatMascots(url, tries + 1), 200);
        return;
      }
      const loader = new THREE.GLTFLoader();
      this._loadCatVariant(loader, url, 1.38, (base) => {
        // 1. 中央廣場迎賓守護貓（先以預設模型兜底，待布偶《史珂》載入後升級）
        this._mountHubCat(base);

        // 2. 島嶼巡邏學士貓同步升級為真 3D 公仔
        if (this.walkerCat && this.walkerCat.group) {
          const walkerClone = base.clone();
          walkerClone.scale.multiplyScalar(0.83);
          this._clearGroupChildren(this.walkerCat.group);
          this.walkerCat.group.add(walkerClone);
        }

        // 3. 海上帆船船長貓（先以預設兜底，待海盜船長貓載入後升級）
        if (this.captainCat && this.captainCat.group) {
          const captainClone = base.clone();
          captainClone.scale.multiplyScalar(0.78);
          this._clearGroupChildren(this.captainCat.group);
          this.captainCat.group.add(captainClone);
        }

        // 4. 先掛上預設虎斑貓兜底（地理島阿岳維持橘貓，其餘各島接著升級專屬貓福珊迪角色）
        if (this.islandCats) {
          this.islandCats.forEach((_, islandId) => this._mountIslandCat(islandId, base, 0.93));
        }

        // 5. 商店解鎖「自強不息黃金貓雕像」共用 cat_3d.glb 鍍金材質
        this._mountGoldStatue(base);

        // 6. 載入 7 隻《答對率》貓福珊迪 Q 彈水彩風格 H3.0/H3.5 + 1024 繪本統一比例模型
        const breedConfigs = [
          { url: "assets/cat_ragdoll_3d.glb?v=14", height: 1.42, hub: true, islands: ["history"], scale: 0.93 },
          { url: "assets/cat_white_3d.glb?v=14", height: 1.42, islands: ["chinese"], scale: 0.93 },
          { url: "assets/cat_calico_3d.glb?v=14", height: 1.42, islands: ["civics"], scale: 0.93 },
          { url: "assets/cat_tuxedo_3d.glb?v=14", height: 1.42, islands: ["english", "listening"], scale: 0.93 },
          { url: "assets/cat_geo_3d.glb?v=15", height: 1.42, islands: ["geography"], walker: true, scale: 0.93 },
          { url: "assets/cat_pirate_3d.glb?v=14", height: 1.44, captain: true },
          { url: "assets/cat_salmon_3d.glb?v=15", height: 1.42, salmon: true }
        ];
        breedConfigs.forEach((cfg) => {
          this._loadCatVariant(loader, cfg.url, cfg.height, (variantBase, animations) => {
            if (cfg.hub) this._mountHubCat(variantBase, animations);
            if (cfg.captain) this._mountCaptainCat(variantBase);
            if (cfg.salmon) this._mountSalmonCat(variantBase);
            if (cfg.walker) this._mountWalkerCat(variantBase);
            if (cfg.islands) {
              cfg.islands.forEach((islId) => this._mountIslandCat(islId, variantBase, cfg.scale, animations));
            }
          });
        });
      });
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
          const targetH = 1.85;
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
      this.campusBenchGroups.push(bench);
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

    /* ==================== 原神／星鐵級地貌數學、無縫 Painterly Shader 與 3D 搖曳草海 ==================== */
    _smoothStep(edge0, edge1, x) {
      const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(edge1 - edge0, 0.0001)));
      return t * t * (3 - 2 * t);
    }

    _getHubPlazaY() {
      return 4.4;
    }

    _getIslandProfile(island) {
      const id = island && island.id ? island.id : "";
      const MAP = {
        chinese: {
          style: "guilin_karst",
          styleCode: 1.0,
          platY: 4.8,
          sanctY: 6.6,
          spawnZ: 15.6,
          gateZ: 11.8,
          outerScale: 1.32,
          aveMaxZ: 20.0,
          cliffLight: "#6f867e",
          cliffDark: "#384a45",
          stoneLight: "#efe9dc",
          stoneDark: "#c0b7a5"
        },
        english: {
          style: "japan_shrine",
          styleCode: 2.0,
          platY: 4.5,
          sanctY: 6.4,
          spawnZ: 17.6,
          gateZ: 10.2,
          outerScale: 1.34,
          aveMaxZ: 22.8,
          cliffLight: "#7c858e",
          cliffDark: "#454c54",
          stoneLight: "#eee6d8",
          stoneDark: "#bdb5a6"
        },
        listening: {
          style: "barrier_reef",
          styleCode: 3.0,
          platY: 4.2,
          sanctY: 5.6,
          spawnZ: 15.4,
          gateZ: 11.4,
          outerScale: 1.54,
          aveMaxZ: 19.6,
          cliffLight: "#ded0b6",
          cliffDark: "#96856c",
          stoneLight: "#f7f1e6",
          stoneDark: "#d2c7b3"
        },
        geography: {
          style: "taiwan_mountain",
          styleCode: 4.0,
          platY: 5.4,
          sanctY: 7.4,
          spawnZ: 15.8,
          gateZ: 11.8,
          outerScale: 1.32,
          aveMaxZ: 20.0,
          cliffLight: "#7c848f",
          cliffDark: "#3b4048",
          stoneLight: "#e8e0d2",
          stoneDark: "#b8ab96"
        },
        civics: {
          style: "harbor_citadel",
          styleCode: 5.0,
          platY: 5.0,
          sanctY: 6.6,
          spawnZ: 18.8,
          gateZ: 10.6,
          outerScale: 1.38,
          aveMaxZ: 22.2,
          cliffLight: "#d6c8b2",
          cliffDark: "#8f7d68",
          stoneLight: "#f2eadc",
          stoneDark: "#cabca6"
        },
        history: {
          style: "aegean_acropolis",
          styleCode: 6.0,
          platY: 5.8,
          sanctY: 7.6,
          spawnZ: 17.2,
          gateZ: 11.8,
          outerScale: 1.34,
          aveMaxZ: 23.0,
          cliffLight: "#f3ece0",
          cliffDark: "#b2a796",
          stoneLight: "#f6f0e4",
          stoneDark: "#d4c8b4"
        }
      };
      return MAP[id] || MAP.chinese;
    }

    _getIslandBridgeMeta(island) {
      const prof = this._getIslandProfile(island);
      const len = Math.hypot(island.position.x, island.position.z) || 1;
      const dxAxis = island.position.x / len;
      const dzAxis = island.position.z / len;
      const startDist = 14.4;
      const endDist = len - ((island && island.radius) || 26.5) * 0.72;
      const startY = this._getHubPlazaY() - 0.15;
      const endY = island && island.id === "english" ? 2.85 : Math.max(3.6, prof.platY - 0.25);
      return { len, dxAxis, dzAxis, startDist, endDist, startY, endY };
    }

    _findSafeIslandSpot(island, rawX, rawZ, heightFn, minOffset = -0.55) {
      const prof = this._getIslandProfile(island);
      const minH = prof.platY + minOffset;
      let sx = rawX;
      let sz = rawZ;
      let sy = heightFn ? heightFn(sx, sz) : prof.platY;
      if (sy >= minH) {
        return { x: sx, y: sy, z: sz };
      }
      const aimZ = 2.0;
      for (let step = 1; step <= 8; step++) {
        const frac = step / 8;
        const tx = rawX * (1 - frac * 0.72);
        const tz = rawZ + (aimZ - rawZ) * (frac * 0.72);
        const ty = heightFn ? heightFn(tx, tz) : prof.platY;
        if (ty >= minH) {
          return { x: tx, y: ty, z: tz };
        }
      }
      return { x: rawX * 0.45, y: prof.platY, z: 2.0 + rawZ * 0.35 };
    }

    /* 統一空間避讓工具：自動確保高程平坦、避開聖殿/大道/樓梯/跨海橋頭，且不與任何已登記道具互疊穿模 */
    _findClearIslandSpot(island, rawX, rawZ, propR, heightFn, occupied = [], minOffset = -0.45) {
      const prof = this._getIslandProfile(island);
      const r = (island && island.radius) || 26.5;
      const minH = prof.platY + minOffset;
      const bm = this._getIslandBridgeMeta(island);
      const inDirX = -bm.dxAxis;
      const inDirZ = -bm.dzAxis;

      const isClear = (tx, tz, maxSlope = 0.50, pad = 0.35, minHOverride = null) => {
        const effMinH = minHOverride !== null ? minHOverride : minH;
        const ty = heightFn ? heightFn(tx, tz) : prof.platY;
        if (ty < effMinH) return null;
        if (heightFn) {
          const sl = Math.abs(heightFn(tx + 0.55, tz) - heightFn(tx - 0.55, tz))
            + Math.abs(heightFn(tx, tz + 0.55) - heightFn(tx, tz - 0.55));
          if (sl > maxSlope) return null;
        }
        if (Math.hypot(tx / 10.6, (tz + 7.8) / 8.8) < 1.02) return null;
        if (Math.abs(tx) < 4.2 && tz > -3.5 && tz < prof.aveMaxZ + 1.5) return null;
        if (island.id === "civics" && tz > 9.4 && Math.abs(tx) < 10.6) return null;
        if (island.id === "english" && tz > 9.6 && Math.abs(tx) < 5.0) return null;
        if (island.id === "listening" && tz > 10.0 && Math.abs(tx) < 5.0) return null;
        if (island.id === "history" && tz > 10.2 && Math.abs(tx) < 5.5) return null;
        if (island.id === "geography" && tz < -13.5) return null;
        const alongIn = tx * inDirX + tz * inDirZ;
        const perpIn = Math.abs(-tx * inDirZ + tz * inDirX);
        if (alongIn > r * 0.36 && perpIn < 3.8) return null;
        for (let i = 0; i < occupied.length; i++) {
          const o = occupied[i];
          if (Math.hypot(tx - o.x, tz - o.z) < o.r + propR + pad) return null;
        }
        return { x: tx, y: ty, z: tz };
      };

      const direct = isClear(rawX, rawZ, 0.48, 0.35);
      if (direct) {
        occupied.push({ x: direct.x, z: direct.z, r: propR });
        return direct;
      }

      for (let step = 1; step <= 64; step++) {
        const rad = 1.2 + Math.sqrt(step) * 1.6;
        const ang = step * 2.39996;
        const tx = rawX + Math.cos(ang) * rad;
        const tz = rawZ + Math.sin(ang) * rad;
        if (Math.hypot(tx, tz) > r * 0.88) continue;
        const hit = isClear(tx, tz, 0.54, 0.28);
        if (hit) {
          occupied.push({ x: hit.x, z: hit.z, r: propR });
          return hit;
        }
      }

      const radii = [7.5, 9.5, 11.5, 13.5, 15.5, 17.5, 19.5];
      let best = null;
      let bestDist = Infinity;
      for (let ri = 0; ri < radii.length; ri++) {
        const rr = radii[ri];
        for (let step = 0; step < 24; step++) {
          const ang = (step / 24) * Math.PI * 2;
          const tx = Math.cos(ang) * rr;
          const tz = Math.sin(ang) * rr;
          const hit = isClear(tx, tz, 0.65, 0.20);
          if (hit) {
            const d = Math.hypot(tx - rawX, tz - rawZ);
            if (d < bestDist) {
              bestDist = d;
              best = hit;
            }
          }
        }
      }
      if (best) {
        occupied.push({ x: best.x, z: best.z, r: propR });
        return best;
      }

      const emerMinH = Math.max(1.2, prof.platY - 1.5);
      for (let ri = 0; ri < radii.length; ri++) {
        const rr = radii[ri];
        for (let step = 0; step < 24; step++) {
          const ang = (step / 24) * Math.PI * 2;
          const tx = Math.cos(ang) * rr;
          const tz = Math.sin(ang) * rr;
          const hit = isClear(tx, tz, 0.90, 0.05, emerMinH);
          if (hit) {
            const d = Math.hypot(tx - rawX, tz - rawZ);
            if (d < bestDist) {
              bestDist = d;
              best = hit;
            }
          }
        }
      }
      if (best) {
        occupied.push({ x: best.x, z: best.z, r: propR });
        return best;
      }

      return Object.assign(this._findSafeIslandSpot(island, rawX, rawZ, heightFn, minOffset), { noSpace: true });
    }

    _evalHubHeight(dx, dz) {
      const hubY = this._getHubPlazaY();
      const d = Math.hypot(dx, dz);
      const ang = Math.atan2(dz, dx);
      const starMod = 1.0 + 0.052 * Math.cos(ang * 8.0);
      const dn = d / starMod;

      let h = -0.68;
      if (dn <= 12.6) {
        h = hubY;
      } else if (dn <= 14.6) {
        h = hubY - this._smoothStep(12.6, 14.6, dn) * 0.28;
      } else if (dn <= 16.2) {
        h = (hubY - 0.28) - this._smoothStep(14.6, 16.2, dn) * 3.45;
      } else if (dn <= 18.4) {
        h = 0.67 - this._smoothStep(16.2, 18.4, dn) * 1.35;
      }

      // 東側臨海釣魚棧橋緩降石坡 (dx=11.4..15.8 順暢銜接 4.4m -> 0.62m，徹底消除陡梯斷層)
      if (dx >= 11.2 && dx <= 16.4 && Math.abs(dz + 0.4) <= 2.2) {
        const rampT = Math.max(0, Math.min(1, (dx - 11.4) / 4.4));
        const rampH = hubY - rampT * (hubY - 0.62);
        const sideW = 1.0 - this._smoothStep(1.3, 2.2, Math.abs(dz + 0.4));
        const startW = this._smoothStep(11.2, 11.8, dx);
        h = h + (rampH - h) * sideW * startW;
      }

      // 東側臨海棧橋釣魚台石岬 (配合 act-hub-fishing {x: 16.4, z: -0.4})
      const fishDist = Math.hypot(dx - 16.0, dz + 0.4);
      if (fishDist < 3.0) {
        const blend = 1.0 - this._smoothStep(1.5, 3.0, fishDist);
        h = h + (0.62 - h) * blend;
      }
      return h;
    }

    _getIslandAlcoveSlots() {
      return [
        { x: -7.8, z: 9.2, face: 0.78 },
        { x: 8.2, z: 10.6, face: -0.78 },
        { x: -11.6, z: 2.2, face: 1.36 },
        { x: 12.6, z: -1.6, face: -1.52 },
        { x: -12.2, z: -7.2, face: 2.05 },
        { x: 11.8, z: 11.6, face: -0.65 }
      ];
    }

    _resolveIslandAlcoves(island, heightFn, occupied = null) {
      const raw = this._getIslandAlcoveSlots();
      const prof = this._getIslandProfile(island);
      const count = Math.min(island && island.nodes ? island.nodes.length : 4, raw.length);
      const out = [];
      for (let i = 0; i < count; i++) {
        const slot = raw[i];
        const safe = occupied
          ? this._findClearIslandSpot(island, slot.x, slot.z, 2.35, heightFn, occupied, -0.45)
          : this._findSafeIslandSpot(island, slot.x, slot.z, heightFn, -0.45);
        out.push({ x: safe.x, y: Math.max(prof.platY - 0.4, safe.y), z: safe.z, face: slot.face });
      }
      return out;
    }

    _evalIslandHeight(island, dx, dz, seed) {
      const prof = this._getIslandProfile(island);
      const r = (island && island.radius) || 26.5;
      const platY = prof.platY;
      const sanctY = prof.sanctY;
      const ang = Math.atan2(dz, dx);
      const dist = Math.hypot(dx, dz);

      // 各島專屬海岸線形態、山脈稜線與斷崖落差（外圍水域統一深潛至 -1.15m 確保海面與島體明確分離）
      let baseH = -1.15;
      const aveClear = this._smoothStep(3.2, 5.6, Math.abs(dx));
      const sanctClear = this._smoothStep(0.95, 1.35, Math.hypot(dx / 10.2, (dz + 7.8) / 8.4));

      if (prof.style === "taiwan_mountain") {
        // 台灣高山縱谷・清水斷崖：狹長傾斜紡錘山脊＋極陡東岸斷崖＋後方 16m 玉山主峰群山
        const rotX = dx * 0.965 - dz * 0.26;
        const rotZ = dx * 0.26 + dz * 0.965;
        const coastMod = 1.0 + 0.08 * Math.sin(ang * 3 + seed) + 0.045 * Math.cos(ang * 5 - 0.7);
        const u = Math.hypot(rotX / (r * 0.78), rotZ / (r * 1.18)) / coastMod;
        if (u <= 0.78) {
          baseH = platY;
          const edgeFade = 1.0 - this._smoothStep(0.55, 0.78, u);
          baseH += 0.22 * Math.sin(dx * 0.20 + seed) * Math.cos(dz * 0.19) * aveClear * edgeFade * sanctClear;
        } else if (u <= 0.88) {
          baseH = platY - this._smoothStep(0.78, 0.88, u) * (platY + 1.15);
        }
        // 中央大道南端保留寬敞站立起點
        if (Math.abs(dx) <= 3.6 && dz >= 5.0 && dz <= 17.6) {
          const wB = 1.0 - this._smoothStep(2.6, 3.6, Math.abs(dx));
          baseH = Math.max(baseH, -1.15 + (platY + 1.15) * wB);
        }
        // 高聳中央山脈主峰（閃開東北跨海橋頭）
        const bridgeAvoid = this._smoothStep(5.5, 11.0, Math.hypot(dx - 16.4, dz + 9.8));
        const mtnMask = (1.0 - this._smoothStep(0.66, 0.82, u)) * this._smoothStep(0.96, 1.36, Math.hypot(dx / 10.6, (dz + 7.6) / 8.8)) * bridgeAvoid;
        if (mtnMask > 0.01) {
          const pk1 = 9.0 * Math.exp(-((dx + 9.6) * (dx + 9.6) + (dz + 18.8) * (dz + 18.8)) / 56.0);
          const pk2 = 11.4 * Math.exp(-((dx - 0.2) * (dx - 0.2) + (dz + 22.0) * (dz + 22.0)) / 74.0);
          const pk3 = 8.4 * Math.exp(-((dx - 10.2) * (dx - 10.2) + (dz + 18.2) * (dz + 18.2)) / 52.0);
          const pk4 = 4.6 * Math.exp(-((dx + 14.2) * (dx + 14.2) + (dz + 7.4) * (dz + 7.4)) / 36.0);
          const crag = 0.85 * Math.sin(dx * 0.56) * Math.cos(dz * 0.54) * this._smoothStep(2.0, 7.0, pk1 + pk2 + pk3);
          baseH = Math.max(baseH, platY + (pk1 + pk2 + pk3 + pk4 + Math.max(0, crag)) * mtnMask);
        }
      } else if (prof.style === "barrier_reef") {
        // 澳洲大堡礁・彎月珊瑚主島＋兩側直落蒂芬妮藍內灣＋4座獨立衛星珊瑚小礁＋西南棧橋砂堤
        const coastMod = 1.0 + 0.06 * Math.sin(ang * 3 + seed) + 0.04 * Math.cos(ang * 4 - 0.5);
        const u = Math.hypot(dx / (r * 0.82), (dz + 3.0) / (r * 0.76)) / coastMod;
        if (u <= 0.72) {
          baseH = platY;
        } else if (u <= 0.83) {
          baseH = platY - this._smoothStep(0.72, 0.83, u) * (platY + 1.15);
        }
        // 左右雙灣雕刻形成新月形珊瑚礁，中軸保留開闊珊瑚長堤通道直視兩側瀉湖海面
        const bayE = Math.hypot(dx - 13.2, dz - 11.6);
        if (bayE < 8.2) {
          const be = 1.0 - this._smoothStep(4.2, 8.2, bayE);
          baseH = baseH + (-1.15 - baseH) * be;
        }
        const bayW = Math.hypot(dx + 12.6, dz - 14.4);
        if (bayW < 6.6) {
          const bw = 1.0 - this._smoothStep(3.4, 6.6, bayW);
          baseH = baseH + (-1.15 - baseH) * bw;
        }
        if (Math.abs(dx) <= 3.8 && dz >= 4.0 && dz <= 17.0) {
          const pierW = 1.0 - this._smoothStep(2.8, 3.8, Math.abs(dx));
          const endW = 1.0 - this._smoothStep(15.6, 17.2, dz);
          baseH = Math.max(baseH, -1.15 + (platY + 1.15) * pierW * endW);
        }
        // 4 座外海完全分離的衛星珊瑚小島
        const islets = [
          [-22.2, 15.2, 5.4, 2.8],
          [22.6, 12.6, 5.0, 2.6],
          [-23.8, -11.6, 5.6, 3.2],
          [23.0, -13.0, 5.2, 2.9]
        ];
        islets.forEach(([ix, iz, ir, ih]) => {
          const idst = Math.hypot(dx - ix, dz - iz);
          if (idst < ir + 1.4) {
            const ihVal = idst <= ir * 0.62
              ? ih
              : idst <= ir * 0.96
              ? ih - this._smoothStep(ir * 0.62, ir * 0.96, idst) * (ih - 0.15)
              : 0.15 - this._smoothStep(ir * 0.96, ir + 1.4, idst) * 1.3;
            baseH = Math.max(baseH, ihVal);
          }
        });
        // 西南木棧橋連結主島 (-13.2, 8.2) -> 衛星珊瑚島 (-21.8, 14.8)
        const bDirX = -0.793;
        const bDirZ = 0.609;
        const relX = dx + 12.8;
        const relZ = dz - 8.0;
        const alongB = relX * bDirX + relZ * bDirZ;
        const perpB = Math.abs(-relX * bDirZ + relZ * bDirX);
        if (alongB >= -1.2 && alongB <= 11.4 && perpB <= 2.1) {
          const bt = Math.max(0, Math.min(1, alongB / 4.2));
          const bwH = 4.2 - bt * (4.2 - 0.72);
          const pBlend = 1.0 - this._smoothStep(1.3, 2.1, perpB);
          baseH = Math.max(baseH, -1.15 + (bwH + 1.15) * pBlend);
        }
      } else if (prof.style === "japan_shrine") {
        // 日本瀨戶內／江之島多層山岬：狹窄海崖山台(4.5m -> 2.8m -> 0.9m沙灣) ＋ 千本鳥居階梯 ＋ 後山嵐稜
        const coastMod = 1.0 + 0.055 * Math.sin(ang * 3 + seed) + 0.03 * Math.cos(ang * 5);
        const u = Math.hypot(dx / (r * 0.84), (dz + 2.0) / (r * 1.04)) / coastMod;
        if (u <= 0.77) {
          baseH = platY;
        } else if (u <= 0.87) {
          baseH = platY - this._smoothStep(0.77, 0.87, u) * (platY + 1.15);
        }
        // 後山蒼翠神社山嶺 (dz < -14.2)
        const mtnMask = (1.0 - this._smoothStep(0.66, 0.83, u)) * this._smoothStep(1.0, 1.4, Math.hypot(dx / 10.6, (dz + 7.6) / 8.8));
        if (mtnMask > 0.01) {
          const hillBack = 5.8 * Math.exp(-((dx * dx) * 0.65 + (dz + 20.8) * (dz + 20.8)) / 62.0);
          baseH = Math.max(baseH, platY + hillBack * mtnMask);
        }
        // 前低後高階梯山城：下層 2.8m 石造港台 + 南端海灣沙灘 (dz 20.5..27.4 -> -1.15)
        const inFrontCorridor = 1.0 - this._smoothStep(9.0, 11.4, Math.abs(dx));
        if (dz > 10.6 && inFrontCorridor > 0.01) {
          let frontTarget = platY;
          if (dz <= 16.0) {
            const stepT = Math.max(0, Math.min(1, (dz - 10.6) / 5.4));
            frontTarget = platY - stepT * (platY - 2.8);
          } else if (dz <= 20.5) {
            frontTarget = 2.8;
          } else if (dz <= 27.4) {
            const beachT = Math.max(0, Math.min(1, (dz - 20.5) / 4.2));
            const dropSurf = this._smoothStep(24.0, 27.4, dz);
            frontTarget = 2.8 - beachT * 1.9 - dropSurf * 2.05;
          } else {
            frontTarget = -1.15;
          }
          baseH = baseH + (frontTarget - baseH) * inFrontCorridor;
        }
      } else if (prof.style === "guilin_karst") {
        // 桂林山水峰林・新月半島：深切東側月牙碧灣 (-1.15m) ＋ 4.8m 垂直碧岩斷崖 ＋ 後方峰林基座
        const coastMod = 1.0 + 0.07 * Math.sin(ang * 3 + seed) + 0.04 * Math.cos(ang * 5);
        const u = Math.hypot((dx + 1.4) / (r * 0.88), dz / (r * 1.02)) / coastMod;
        if (u <= 0.79) {
          baseH = platY;
        } else if (u <= 0.88) {
          baseH = platY - this._smoothStep(0.79, 0.88, u) * (platY + 1.15);
        }
        // 中軸南端確保完整著陸大道
        if (Math.abs(dx) <= 3.8 && dz >= 5.0 && dz <= 17.6) {
          const wB = 1.0 - this._smoothStep(2.8, 3.8, Math.abs(dx));
          baseH = Math.max(baseH, -1.15 + (platY + 1.15) * wB);
        }
        // 深切東側月牙碧水海灣 (16.6, 1.6, r=8.6)
        const coveD = Math.hypot(dx - 16.6, dz - 1.6);
        if (coveD < 8.6) {
          const cb = 1.0 - this._smoothStep(4.4, 8.6, coveD);
          baseH = baseH + (-1.15 - baseH) * cb;
        }
        const ridgeM = (1.0 - this._smoothStep(0.68, 0.84, u)) * this._smoothStep(1.0, 1.38, Math.hypot(dx / 10.6, (dz + 7.6) / 8.8));
        if (ridgeM > 0.01) {
          const karstBase = 4.5 * Math.exp(-((dx + 8.6) * (dx + 8.6) + (dz + 19.6) * (dz + 19.6)) / 54.0)
            + 4.1 * Math.exp(-((dx - 8.2) * (dx - 8.2) + (dz + 19.8) * (dz + 19.8)) / 50.0);
          baseH = Math.max(baseH, platY + karstBase * ridgeM);
        }
      } else if (prof.style === "aegean_acropolis") {
        // 愛琴海衛城・T字型狹長白堊海岬半島：5.8m 高衛城主崖直落海面 ＋ 寬敞南岬攀升長坡
        const rotX = dx * 0.99 - dz * 0.14;
        const rotZ = dx * 0.14 + dz * 0.99;
        const coastMod = 1.0 + 0.06 * Math.sin(ang * 3 + seed) + 0.03 * Math.cos(ang * 4);
        const u = Math.hypot(rotX / (r * 0.82), (rotZ + 3.2) / (r * 0.74)) / coastMod;
        if (u <= 0.79) {
          baseH = platY;
        } else if (u <= 0.88) {
          baseH = platY - this._smoothStep(0.79, 0.88, u) * (platY + 1.15);
        }
        // 南側陡崖突岬半島 (dz 10.2..25.6，與主平台無縫相接)
        if (dz >= 10.2 && dz <= 26.2) {
          const capeHalfW = Math.max(3.2, 5.8 - (dz - 10.2) * 0.16);
          const cxAbs = Math.abs(dx);
          if (cxAbs <= capeHalfW + 2.0 && dz <= 25.6) {
            const spineT = Math.max(0, Math.min(1, (dz - 12.2) / 11.2));
            const spineH = platY - spineT * (platY - 1.5);
            const wallDrop = cxAbs <= capeHalfW
              ? spineH
              : spineH - this._smoothStep(capeHalfW, capeHalfW + 1.6, cxAbs) * (spineH + 1.15);
            const endDrop = dz > 23.6 ? (1.0 - this._smoothStep(23.6, 25.6, dz)) * (wallDrop + 1.15) - 1.15 : wallDrop;
            baseH = Math.max(baseH, endDrop);
          }
        }
        // 歷史海灣垂釣小岩碼頭 (act-his-fishing {x: 9.2, z: 22.0})
        const fishPier = Math.hypot(dx - 9.2, dz - 22.0);
        if (fishPier < 3.4) {
          const fb = 1.0 - this._smoothStep(1.5, 3.4, fishPier);
          baseH = Math.max(baseH, -1.15 + 1.8 * fb);
        }
      } else {
        // 公民社會島・幾何方正雙層海港城邦：削角方形 5.0m 要塞 ＋ 雙側開放港池 (-1.15m) ＋ 雙翼 L 形石築防波堤
        const ux = Math.abs(dx) / (r * 0.66);
        const uz = Math.abs(dz + 2.6) / (r * 0.58);
        const uBox = Math.max(ux, uz) * 0.84 + Math.hypot(ux, uz) * 0.16;
        if (uBox <= 0.86) {
          baseH = platY;
        } else if (uBox <= 0.94) {
          baseH = platY - this._smoothStep(0.86, 0.94, uBox) * (platY + 1.15);
        }
        // 南側雙層海港與開放水港池 (dz 9.0..27.6，與上層 5.0m 要塞無縫銜接)
        if (dz >= 9.0 && dz <= 27.6) {
          if (Math.abs(dx) <= 7.4 && dz <= 22.6) {
            const sideEdge = 1.0 - this._smoothStep(6.0, 7.4, Math.abs(dx));
            let harbH = 1.3;
            if (dz <= 18.0) {
              const rampSide = 1.0 - this._smoothStep(2.6, 3.3, Math.abs(dx));
              const rampH = platY - Math.max(0, Math.min(1, (dz - 10.4) / 6.8)) * (platY - 1.3);
              const shearWall = dz <= 12.6 ? platY - this._smoothStep(11.6, 12.6, dz) * (platY - 1.3) : 1.3;
              harbH = Math.max(shearWall, rampH * rampSide + shearWall * (1 - rampSide));
            } else if (dz >= 21.2) {
              harbH = 1.3 - this._smoothStep(21.2, 22.6, dz) * 2.45;
            }
            baseH = Math.max(baseH, -1.15 + (harbH + 1.15) * sideEdge);
          }
          // 雙翼 L 型外海防波堤石臂
          [-1, 1].forEach((side) => {
            const onOuterArm = dz >= 11.6 && dz <= 26.2 && Math.abs(dx - side * 13.6) < 2.0;
            const onHookTip = dz >= 24.0 && dz <= 26.6 && Math.abs(dx) >= 5.8 && Math.abs(dx) <= 14.2 && Math.sign(dx) === side;
            if (onOuterArm || onHookTip) {
              const armD = onOuterArm ? Math.abs(dx - side * 13.6) / 2.0 : Math.abs(dz - 25.3) / 1.3;
              const armH = 1.45 - this._smoothStep(0.55, 1.0, armD) * 2.6;
              baseH = Math.max(baseH, armH);
            }
          });
        }
      }

      // 聖殿高台與中央迎賓大石階（中心 z=-7.8，樓梯 z=5.4 -> 1.6）
      const sd = Math.hypot(dx / 10.2, (dz + 7.8) / 8.4);
      const onCore = dist <= r * 0.86 && dz <= 11.2 ? 1 : 0;
      const terraceBlend = (1.0 - this._smoothStep(0.84, 1.22, sd)) * onCore;
      const terraceH = terraceBlend > 0.001 ? platY + terraceBlend * (sanctY - platY) : -10;

      const st = Math.max(0, Math.min(1, (5.4 - dz) / 3.8));
      const stairSide = 1.0 - this._smoothStep(2.25, 2.95, Math.abs(dx));
      const stairMask = stairSide * onCore * (dz >= 1.2 && dz <= 5.7 ? 1 : 0);
      const stairH = stairMask > 0.001 ? platY + st * (sanctY - platY) * stairMask : -10;

      let finalH = Math.max(baseH, terraceH, stairH);

      // 跨海長橋登島接頭平順銜接區
      const bm = this._getIslandBridgeMeta(island);
      const inDirX = -bm.dxAxis;
      const inDirZ = -bm.dzAxis;
      const alongIn = dx * inDirX + dz * inDirZ;
      const perpIn = Math.abs(-dx * inDirZ + dz * inDirX);
      if (alongIn >= r * 0.46 && alongIn <= r * 0.88 && perpIn <= 3.4) {
        const lenBlend = Math.sin(((alongIn - r * 0.46) / Math.max(r * 0.42, 0.1)) * Math.PI);
        const wBlend = 1.0 - this._smoothStep(1.6, 3.4, perpIn);
        const lipBlend = Math.min(1.0, lenBlend * wBlend * 1.45);
        finalH = finalH + (bm.endY - finalH) * lipBlend;
      }

      return finalH;
    }

    _createSculptedTerrainMesh(outerRadius, heightFn, mat, radialSegs = 68, ringSegs = 34) {
      const THREE = window.THREE;
      const positions = [];
      const uvs = [];
      const indices = [];

      positions.push(0, heightFn(0, 0), 0);
      uvs.push(0.5, 0.5);

      for (let ri = 1; ri <= ringSegs; ri++) {
        const radius = (ri / ringSegs) * outerRadius;
        for (let ai = 0; ai <= radialSegs; ai++) {
          const theta = (ai / radialSegs) * Math.PI * 2;
          const x = Math.cos(theta) * radius;
          const z = Math.sin(theta) * radius;
          positions.push(x, heightFn(x, z), z);
          uvs.push(x / (outerRadius * 2) + 0.5, z / (outerRadius * 2) + 0.5);
        }
      }

      const stride = radialSegs + 1;
      for (let ai = 0; ai < radialSegs; ai++) {
        indices.push(0, 1 + ai + 1, 1 + ai);
      }
      for (let ri = 1; ri < ringSegs; ri++) {
        const rowA = 1 + (ri - 1) * stride;
        const rowB = 1 + ri * stride;
        for (let ai = 0; ai < radialSegs; ai++) {
          const a = rowA + ai;
          const b = rowA + ai + 1;
          const c = rowB + ai;
          const d = rowB + ai + 1;
          indices.push(a, b, d);
          indices.push(a, d, c);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    _createTerrainShaderMat(theme, options = {}) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const isHub = Boolean(options.isHub);
      const biomeMode = options.biomeMode || 0.0;
      const islandStyle = options.islandStyle || 0.0;
      const aveMaxZ = options.aveMaxZ || 20.0;
      const alcoves = (options.alcoves || []).slice(0, 6);
      while (alcoves.length < 6) alcoves.push(new THREE.Vector3(999, 999, 0));

      const grassLight = new THREE.Color(theme.grassColor || "#7ec87e").lerp(new THREE.Color("#b4e688"), 0.24);
      const grassDark = new THREE.Color(theme.hillColor || "#509c5a").lerp(new THREE.Color("#3b7d58"), 0.22);
      const sandCol = new THREE.Color(theme.sandColor || "#f3e1bd");

      const uniforms = {
        uTime: { value: 0 },
        uTexGrass: { value: env.grass },
        uTexPlaza: { value: env.plaza },
        uTexCliff: { value: env.cliff },
        uTexSand: { value: env.sand },
        uGrassLight: { value: grassLight },
        uGrassDark: { value: grassDark },
        uSandColor: { value: sandCol },
        uStoneLight: { value: new THREE.Color(options.stoneLight || "#f0e5d3") },
        uStoneDark: { value: new THREE.Color(options.stoneDark || "#cbbda7") },
        uCliffLight: { value: new THREE.Color(options.cliffLight || "#cbb193") },
        uCliffDark: { value: new THREE.Color(options.cliffDark || "#967a63") },
        uAccentColor: { value: new THREE.Color(options.accentColor || "#d97706") },
        uSunDir: { value: new THREE.Vector3(0.42, 0.78, 0.44).normalize() },
        uSunTint: { value: new THREE.Color("#ffffff") },
        uFogColor: { value: new THREE.Color("#b8e2f8") },
        uFogDensity: { value: 0.0011 },
        uNightMix: { value: 0.0 },
        uIsHub: { value: isHub ? 1.0 : 0.0 },
        uBiomeMode: { value: biomeMode },
        uIslandStyle: { value: islandStyle },
        uAveMaxZ: { value: aveMaxZ },
        uAlcoves: { value: alcoves }
      };

      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: [
          "varying vec3 vLocalPos;",
          "varying vec3 vLocalNormal;",
          "varying vec3 vWorldPos;",
          "varying vec3 vWorldNormal;",
          "void main() {",
          "  vLocalPos = position;",
          "  vLocalNormal = normalize(normal);",
          "  vec4 wp = modelMatrix * vec4(position, 1.0);",
          "  vWorldPos = wp.xyz;",
          "  vWorldNormal = normalize(mat3(modelMatrix) * normal);",
          "  gl_Position = projectionMatrix * viewMatrix * wp;",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform float uTime;",
          "uniform sampler2D uTexGrass;",
          "uniform sampler2D uTexPlaza;",
          "uniform sampler2D uTexCliff;",
          "uniform sampler2D uTexSand;",
          "uniform vec3 uGrassLight;",
          "uniform vec3 uGrassDark;",
          "uniform vec3 uSandColor;",
          "uniform vec3 uStoneLight;",
          "uniform vec3 uStoneDark;",
          "uniform vec3 uCliffLight;",
          "uniform vec3 uCliffDark;",
          "uniform vec3 uAccentColor;",
          "uniform vec3 uSunDir;",
          "uniform vec3 uSunTint;",
          "uniform vec3 uFogColor;",
          "uniform float uFogDensity;",
          "uniform float uNightMix;",
          "uniform float uIsHub;",
          "uniform float uBiomeMode;",
          "uniform float uIslandStyle;",
          "uniform float uAveMaxZ;",
          "uniform vec3 uAlcoves[6];",
          "varying vec3 vLocalPos;",
          "varying vec3 vLocalNormal;",
          "varying vec3 vWorldPos;",
          "varying vec3 vWorldNormal;",
          "float hash21(vec2 p) {",
          "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);",
          "}",
          "float vnoise(vec2 p) {",
          "  vec2 i = floor(p);",
          "  vec2 f = fract(p);",
          "  f = f * f * (3.0 - 2.0 * f);",
          "  float a = hash21(i);",
          "  float b = hash21(i + vec2(1.0, 0.0));",
          "  float c = hash21(i + vec2(0.0, 1.0));",
          "  float d = hash21(i + vec2(1.0, 1.0));",
          "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
          "}",
          "float fbm(vec2 p) {",
          "  float v = 0.0;",
          "  float a = 0.5;",
          "  for (int i = 0; i < 3; i++) {",
          "    v += a * vnoise(p);",
          "    p = p * 2.07 + vec2(11.3, 19.7);",
          "    a *= 0.5;",
          "  }",
          "  return v;",
          "}",
          "void main() {",
          "  vec2 p = vLocalPos.xz;",
          "  float h = vLocalPos.y;",
          "  vec3 nrm = normalize(vLocalNormal);",
          "  float macro = fbm(p * 0.14);",
          "  float detail = fbm(p * 0.55);",
          "  float ndl = dot(normalize(vWorldNormal), normalize(uSunDir)) * 0.5 + 0.5;",
          "  float cel = mix(0.36, 1.0, smoothstep(0.36, 0.64, ndl));",
          "  float cloud = smoothstep(0.54, 0.80, fbm(vWorldPos.xz * 0.032 + vec2(uTime * 0.24, -uTime * 0.13)));",
          "  vec3 gRawA = texture2D(uTexGrass, p * 0.22).rgb;",
          "  vec3 gRawB = texture2D(uTexGrass, p * 0.085 + vec2(0.37, 0.19)).rgb;",
          "  float gLum = dot(gRawA * 0.68 + gRawB * 0.32, vec3(0.30, 0.59, 0.11));",
          "  float gDetail = clamp((gLum - 0.80) * 4.2 + 0.5, 0.0, 1.0);",
          "  vec3 richDark = uGrassDark * vec3(0.76, 0.86, 0.76);",
          "  vec3 richLight = uGrassLight * vec3(1.14, 1.16, 0.96);",
          "  float sunPatch = smoothstep(0.42, 0.78, fbm(p * 0.24 + vec2(3.1, 1.7)));",
          "  vec3 grassCol = mix(richDark, richLight, clamp(macro * 0.40 + gDetail * 0.45 + sunPatch * 0.15, 0.0, 1.0));",
          "  float petalDot = smoothstep(0.75, 0.90, vnoise(p * 1.15)) * smoothstep(0.60, 0.82, gDetail);",
          "  vec3 petalTint = vec3(0.98, 0.92, 0.55);",
          "  if (uIslandStyle > 1.5 && uIslandStyle < 2.5) {",
          "    petalTint = vec3(0.99, 0.72, 0.84);",
          "  } else if (uIslandStyle > 0.5 && uIslandStyle < 1.5) {",
          "    petalTint = vec3(0.95, 0.84, 0.42);",
          "  } else if (uIslandStyle > 2.5 && uIslandStyle < 3.5) {",
          "    petalTint = vec3(0.98, 0.62, 0.76);",
          "  } else if (uIslandStyle > 3.5 && uIslandStyle < 4.5) {",
          "    petalTint = vec3(0.76, 0.90, 0.99);",
          "  } else if (uIslandStyle > 4.5 && uIslandStyle < 5.5) {",
          "    petalTint = vec3(0.99, 0.97, 0.86);",
          "  }",
          "  grassCol = mix(grassCol, petalTint, petalDot * 0.46);",
          "  grassCol *= mix(0.82, 1.10, cel);",
          "  grassCol = mix(grassCol, grassCol * vec3(0.80, 0.88, 0.98), cloud * 0.28 * (1.0 - uNightMix));",
          "  float stoneMask = 0.0;",
          "  float trimMask = 0.0;",
          "  if (uIsHub > 0.5) {",
          "    float hd = length(p);",
          "    float plazaM = 1.0 - smoothstep(12.0, 12.8, hd);",
          "    float aveW = 2.45 + (vnoise(p * 0.8) - 0.5) * 0.28;",
          "    float southM = (1.0 - smoothstep(aveW - 0.35, aveW + 0.25, abs(p.x))) * smoothstep(8.5, 9.5, p.y) * (1.0 - smoothstep(15.2, 16.4, p.y));",
          "    stoneMask = max(plazaM, southM);",
          "    trimMask = smoothstep(11.35, 11.9, hd) * (1.0 - smoothstep(12.0, 12.6, hd));",
          "  } else {",
          "    float sd = length(vec2(p.x / 9.2, (p.y + 7.8) / 7.5));",
          "    float sanctM = 1.0 - smoothstep(0.90, 1.04, sd);",
          "    trimMask = smoothstep(0.84, 0.90, sd) * (1.0 - smoothstep(0.92, 0.98, sd));",
          "    float aveEdge = 2.65 + (vnoise(p * 0.8) - 0.5) * 0.36;",
          "    float aveM = (1.0 - smoothstep(aveEdge - 0.35, aveEdge + 0.25, abs(p.x))) * smoothstep(-1.0, 0.4, p.y) * (1.0 - smoothstep(uAveMaxZ - 2.6, uAveMaxZ, p.y));",
          "    stoneMask = max(sanctM, aveM);",
          "    if (uIslandStyle > 4.5 && uIslandStyle < 5.5) {",
          "      float portM = smoothstep(13.8, 15.0, p.y) * (1.0 - smoothstep(20.6, 21.8, p.y)) * (1.0 - smoothstep(6.6, 7.6, abs(p.x)));",
          "      stoneMask = max(stoneMask, portM);",
          "    }",
          "    for (int i = 0; i < 6; i++) {",
          "      if (uAlcoves[i].z > 0.1) {",
          "        float ad = length(p - uAlcoves[i].xy) - uAlcoves[i].z;",
          "        float am = 1.0 - smoothstep(-0.32, 0.18, ad);",
          "        stoneMask = max(stoneMask, am);",
          "      }",
          "    }",
          "  }",
          "  vec3 pRawA = texture2D(uTexPlaza, p * 0.23).rgb;",
          "  vec3 pRawB = texture2D(uTexPlaza, p * 0.11 + vec2(0.18, 0.61)).rgb;",
          "  float pLum = dot(pRawA * 0.78 + pRawB * 0.22, vec3(0.30, 0.59, 0.11));",
          "  float stoneTone = clamp((pLum - 0.50) * 1.45 + 0.5, 0.0, 1.0);",
          "  vec3 stoneCol = mix(uStoneDark * 0.84, uStoneLight * 1.08, stoneTone);",
          "  stoneCol = mix(stoneCol, mix(stoneCol, uAccentColor, 0.30), trimMask * 0.85);",
          "  stoneCol *= mix(0.86, 1.04, cel);",
          "  float shoulder = smoothstep(0.03, 0.42, stoneMask) * (1.0 - smoothstep(0.56, 0.96, stoneMask));",
          "  vec3 soilCol = mix(uGrassDark * 0.72, uStoneDark * 0.82, detail) * mix(0.86, 1.02, cel);",
          "  vec3 col = mix(grassCol, stoneCol, stoneMask * 0.96);",
          "  col = mix(col, soilCol, shoulder * 0.48);",
          "  vec3 tw = pow(abs(nrm), vec3(4.0));",
          "  tw /= (tw.x + tw.y + tw.z + 0.0001);",
          "  vec3 cXY = texture2D(uTexCliff, vec2(p.x, h) * 0.18).rgb;",
          "  vec3 cZY = texture2D(uTexCliff, vec2(p.y, h) * 0.18).rgb;",
          "  vec3 cXZ = texture2D(uTexCliff, p * 0.15).rgb;",
          "  vec3 cliffSample = cXY * tw.z + cZY * tw.x + cXZ * tw.y;",
          "  float rVal = dot(cliffSample, vec3(0.30, 0.58, 0.12));",
          "  if (uBiomeMode > 0.5) {",
          "    float lavaMask = (1.0 - smoothstep(-8.8, -3.6, p.x)) * (1.0 - stoneMask) * smoothstep(2.2, 5.2, h);",
          "    float rockFade = clamp((rVal - 0.30) * 1.5, 0.0, 1.0);",
          "    vec3 basalt = mix(vec3(0.20, 0.16, 0.16), vec3(0.38, 0.30, 0.28), rockFade);",
          "    float crack = 1.0 - smoothstep(0.28, 0.44, rVal);",
          "    basalt = mix(basalt, vec3(1.0, 0.43, 0.14), crack * 0.78 * (1.0 - smoothstep(-10.5, -4.5, p.x)));",
          "    col = mix(col, basalt, lavaMask * 0.90);",
          "    float iceMask = smoothstep(4.8, 10.2, p.x) * (1.0 - stoneMask) * smoothstep(4.2, 6.4, h);",
          "    vec3 snowCol = mix(vec3(0.68, 0.88, 0.97), vec3(0.95, 0.99, 1.0), cel * 0.65 + rockFade * 0.35);",
          "    col = mix(col, snowCol, iceMask * 0.88);",
          "    float alpineSnow = smoothstep(8.6, 11.6, h) * smoothstep(-3.0, 2.5, p.x);",
          "    col = mix(col, snowCol, alpineSnow * 0.92);",
          "  }",
          "  float cliffSlope = smoothstep(0.14, 0.40, 1.0 - nrm.y) * (1.0 - stoneMask * 0.68);",
          "  float rockNorm = clamp((rVal - 0.26) * 1.48, 0.0, 1.0);",
          "  vec3 cliffCol = mix(uCliffDark * 0.84, uCliffLight * 1.14, rockNorm) * mix(0.84, 1.05, cel);",
          "  float wetRock = 1.0 - smoothstep(0.0, 1.65, h);",
          "  cliffCol = mix(cliffCol, cliffCol * vec3(0.56, 0.62, 0.68), wetRock * 0.72);",
          "  col = mix(col, cliffCol, cliffSlope * 0.94);",
          "  float sandMask = (1.0 - smoothstep(0.55, 1.35, h)) * (1.0 - cliffSlope * 0.85) * (1.0 - stoneMask * 0.88);",
          "  vec3 sandTex = texture2D(uTexSand, p * 0.22).rgb;",
          "  float sLum = dot(sandTex, vec3(0.30, 0.59, 0.11));",
          "  vec3 sandTinted = uSandColor * mix(0.82, 1.12, clamp((sLum - 0.68) * 2.4 + 0.5, 0.0, 1.0));",
          "  vec3 wetSand = sandTinted * 0.74;",
          "  vec3 sandFinal = mix(wetSand, sandTinted, smoothstep(0.05, 0.65, h)) * mix(0.88, 1.05, cel);",
          "  if (uIslandStyle > 2.5 && uIslandStyle < 3.5) {",
          "    float shoalGlow = (1.0 - smoothstep(-0.35, 0.25, h));",
          "    sandFinal = mix(sandFinal, vec3(0.35, 0.92, 0.88), shoalGlow * 0.72);",
          "  }",
          "  col = mix(col, sandFinal, sandMask);",
          "  float surfLine = (1.0 - smoothstep(-0.22, 0.22, h)) * smoothstep(-0.45, -0.15, h);",
          "  col = mix(col, vec3(0.95, 0.99, 1.0), surfLine * 0.45);",
          "  col *= uSunTint;",
          "  col = mix(col, col * vec3(0.42, 0.52, 0.72), uNightMix * 0.72);",
          "  float distCam = length(cameraPosition - vWorldPos);",
          "  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * distCam * distCam);",
          "  col = mix(col, uFogColor, clamp(fogFactor, 0.0, 1.0));",
          "  gl_FragColor = vec4(col, 1.0);",
          "}"
        ].join("\n")
      });
      this._disableOutline(mat, null);
      this.terrainUniformList.push(uniforms);
      return mat;
    }

    _buildInstancedMeadowGrass(group, island, seed, isHub, count, heightFn, theme, alcoveList = [], occupiedList = []) {
      const THREE = window.THREE;
      if (!THREE.InstancedMesh) return;

      // 三片交叉微彎 3D 草葉幾何（各方向都蓬鬆飽滿）
      const positions = [];
      const uvs = [];
      const indices = [];
      let vOff = 0;
      for (let b = 0; b < 3; b++) {
        const ang = (b / 3) * Math.PI * 2 + 0.35;
        const cs = Math.cos(ang);
        const sn = Math.sin(ang);
        const w0 = 0.115;
        const w1 = 0.072;
        const h1 = 0.27;
        const h2 = 0.54;
        const lean = 0.12;
        const rx = cs * 0.04;
        const rz = sn * 0.04;
        const addPt = (lx, ly, lz, u, v) => {
          positions.push(lx * -sn + lz * cs + rx, ly, lx * cs + lz * sn + rz);
          uvs.push(u, v);
        };
        addPt(-w0, 0, 0, 0, 0);
        addPt(w0, 0, 0, 1, 0);
        addPt(-w1, h1, lean * 0.35, 0, 0.5);
        addPt(w1, h1, lean * 0.35, 1, 0.5);
        addPt(0, h2, lean, 0.5, 1.0);
        indices.push(vOff, vOff + 1, vOff + 2, vOff + 1, vOff + 3, vOff + 2, vOff + 2, vOff + 3, vOff + 4);
        vOff += 5;
      }
      const bladeGeo = new THREE.BufferGeometry();
      bladeGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      bladeGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      bladeGeo.setIndex(indices);
      bladeGeo.computeVertexNormals();

      const baseCol = new THREE.Color(theme.hillColor || "#4e9658").lerp(new THREE.Color("#2e6f40"), 0.22);
      const tipCol = new THREE.Color(theme.grassColor || "#7ed472").lerp(new THREE.Color("#d9f26b"), 0.36);
      const uniforms = {
        uTime: { value: 0 },
        uBaseColor: { value: baseCol },
        uTipColor: { value: tipCol },
        uFlowerColor: { value: new THREE.Color((theme.foliageColors && theme.foliageColors[0]) || "#ffd32a") },
        uFogColor: { value: new THREE.Color("#b8e2f8") },
        uFogDensity: { value: 0.0011 },
        uNightMix: { value: 0.0 }
      };

      const grassMat = new THREE.ShaderMaterial({
        uniforms,
        side: THREE.DoubleSide,
        vertexShader: [
          "uniform float uTime;",
          "varying vec2 vUv;",
          "varying float vRand;",
          "varying vec3 vWorldPos;",
          "void main() {",
          "  vUv = uv;",
          "  vec4 origin = vec4(0.0, 0.0, 0.0, 1.0);",
          "  vec4 lp = vec4(position, 1.0);",
          "  #ifdef USE_INSTANCING",
          "    origin = instanceMatrix * origin;",
          "    lp = instanceMatrix * lp;",
          "  #endif",
          "  vec4 wOrig = modelMatrix * origin;",
          "  vec4 wp = modelMatrix * lp;",
          "  float h = fract(sin(dot(wOrig.xz, vec2(12.9898, 78.233))) * 43758.5453);",
          "  vRand = h;",
          "  float sway = sin(uTime * 2.1 + wOrig.x * 0.45 + wOrig.z * 0.38 + h * 6.28) * 0.14",
          "             + cos(uTime * 3.3 + wOrig.z * 0.72) * 0.05;",
          "  float bend = uv.y * uv.y;",
          "  wp.x += sway * bend;",
          "  wp.z += sway * 0.6 * bend;",
          "  vWorldPos = wp.xyz;",
          "  gl_Position = projectionMatrix * viewMatrix * wp;",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 uBaseColor;",
          "uniform vec3 uTipColor;",
          "uniform vec3 uFlowerColor;",
          "uniform vec3 uFogColor;",
          "uniform float uFogDensity;",
          "uniform float uNightMix;",
          "varying vec2 vUv;",
          "varying float vRand;",
          "varying vec3 vWorldPos;",
          "void main() {",
          "  vec3 tip = mix(uTipColor, mix(uTipColor, uFlowerColor, 0.65), step(0.88, vRand));",
          "  vec3 col = mix(uBaseColor, tip, smoothstep(0.05, 0.92, vUv.y));",
          "  col *= mix(0.88, 1.12, vRand);",
          "  col = mix(col, col * vec3(0.40, 0.50, 0.72), uNightMix * 0.74);",
          "  float distCam = length(cameraPosition - vWorldPos);",
          "  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * distCam * distCam);",
          "  col = mix(col, uFogColor, clamp(fogFactor, 0.0, 1.0));",
          "  gl_FragColor = vec4(col, 1.0);",
          "}"
        ].join("\n")
      });
      this._disableOutline(grassMat, null);
      this.grassUniformList.push(uniforms);

      const dummy = new THREE.Object3D();
      const placements = [];
      const prof = isHub ? null : this._getIslandProfile(island);
      const rMax = isHub ? 15.6 : ((island && island.radius) || 26.5) * 0.92;
      const minGrassY = isHub ? this._getHubPlazaY() - 0.55 : prof.platY - 0.55;
      let rng = Math.round((seed + 1.37) * 9973) + (isHub ? 777 : 131);
      const nextRand = () => {
        rng = (rng * 1664525 + 1013904223) >>> 0;
        return rng / 4294967296;
      };

      for (let t = 0; t < count * 8 && placements.length < count; t++) {
        const ang = nextRand() * Math.PI * 2;
        const rr = isHub ? 12.6 + nextRand() * 3.0 : 3.0 + Math.sqrt(nextRand()) * (rMax - 3.0);
        const gx = Math.cos(ang) * rr;
        const gz = Math.sin(ang) * rr;
        if (isHub) {
          if (Math.abs(gx) < 2.8 && gz > 6.5) continue;
          if (Math.hypot(gx - 16.0, gz + 0.4) < 3.6) continue;
        } else {
          if (Math.abs(gx) < 3.6 && gz > -4.5 && gz < prof.aveMaxZ + 1.0) continue;
          if (Math.hypot(gx / 10.6, (gz + 7.8) / 8.8) < 1.06) continue;
          let nearSpot = false;
          for (let ai = 0; ai < alcoveList.length; ai++) {
            if (Math.hypot(gx - alcoveList[ai].x, gz - alcoveList[ai].z) < 2.5) {
              nearSpot = true;
              break;
            }
          }
          if (!nearSpot && occupiedList && occupiedList.length) {
            for (let oi = 0; oi < occupiedList.length; oi++) {
              if (Math.hypot(gx - occupiedList[oi].x, gz - occupiedList[oi].z) < occupiedList[oi].r + 0.65) {
                nearSpot = true;
                break;
              }
            }
          }
          if (nearSpot) continue;
          if (island.id === "civics" && gz > 11.0 && Math.abs(gx) < 8.4) continue;
          if (island.id === "history" && gz > 10.0 && Math.abs(gx) < 5.2) continue;
          if (island.id === "english" && gz > 9.5 && Math.abs(gx) < 4.4) continue;
          if (island.id === "geography" && gx > 4.6) continue;
        }
        const gy = heightFn(gx, gz);
        if (gy < minGrassY) continue;
        if (!isHub && island.id === "geography" && gy > 10.6) continue;
        const slope =
          Math.abs(heightFn(gx + 0.45, gz) - heightFn(gx - 0.45, gz)) +
          Math.abs(heightFn(gx, gz + 0.45) - heightFn(gx, gz - 0.45));
        if (slope > 0.42) continue;
        placements.push({ x: gx, y: gy - 0.03, z: gz, s: 0.72 + nextRand() * 0.65, ry: nextRand() * Math.PI * 2 });
      }

      if (placements.length === 0) return;
      const inst = new THREE.InstancedMesh(bladeGeo, grassMat, placements.length);
      inst.frustumCulled = false;
      placements.forEach((p, idx) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(0, p.ry, 0);
        dummy.scale.set(p.s, p.s * (0.88 + (idx % 3) * 0.14), p.s);
        dummy.updateMatrix();
        inst.setMatrixAt(idx, dummy.matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
      group.add(inst);

      // 點綴 3D 立體野花朵（沿合法草坡叢生，完全避開石徑與建築）
      const flowerStride = isHub ? 7 : 6;
      const flowerSamples = placements.filter((_, idx) => idx % flowerStride === 0).slice(0, isHub ? 72 : 160);
      if (flowerSamples.length > 0 && typeof THREE.OctahedronGeometry === "function") {
        const flowerGeo = new THREE.OctahedronGeometry(0.11, 0);
        const flowerMat = this._disableOutline(
          new THREE.MeshBasicMaterial({ color: "#ffffff" }),
          null
        );
        const instFlower = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerSamples.length);
        instFlower.frustumCulled = false;
        const flPalette = [
          (theme.foliageColors && theme.foliageColors[0]) || "#f9a8d4",
          "#ffffff",
          "#fde047",
          (theme.foliageColors && theme.foliageColors[1]) || "#93c5fd"
        ];
        flowerSamples.forEach((fp, fi) => {
          const flS = fp.s * (0.85 + (fi % 3) * 0.2);
          dummy.position.set(fp.x + (fi % 2 ? 0.08 : -0.08), fp.y + 0.36 * fp.s, fp.z);
          dummy.rotation.set(0.2, fp.ry, 0);
          dummy.scale.set(flS, flS * 0.55, flS);
          dummy.updateMatrix();
          instFlower.setMatrixAt(fi, dummy.matrix);
          if (typeof instFlower.setColorAt === "function") {
            instFlower.setColorAt(fi, new THREE.Color(flPalette[fi % flPalette.length]));
          }
        });
        instFlower.instanceMatrix.needsUpdate = true;
        if (instFlower.instanceColor) instFlower.instanceColor.needsUpdate = true;
        group.add(instFlower);
      }
    }

    /* ==================== 中央主島：原神級無縫石磚廣場 ＋ 3D搖曳草海 ＋ 南山自強鐘樓 ==================== */
    _buildCentralHub() {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const hub = new THREE.Group();
      hub.position.set(0, 0, 0);
      const hubY = this._getHubPlazaY();

      const hubTheme = {
        grassColor: "#78c479",
        hillColor: "#50985c",
        sandColor: "#f4e3c0",
        foliageColors: ["#ff8ab4", "#ffd13b", "#a78bfa"]
      };
      const hubTerrainMat = this._createTerrainShaderMat(hubTheme, {
        isHub: true,
        accentColor: "#8f2130",
        cliffLight: "#cbb69e",
        cliffDark: "#7f6b59"
      });
      const hubTerrain = this._createSculptedTerrainMesh(
        19.2,
        (dx, dz) => this._evalHubHeight(dx, dz),
        hubTerrainMat,
        84,
        42
      );
      hubTerrain.userData = { isHub: true };
      hub.add(hubTerrain);
      this.clickTargets.push(hubTerrain);

      // 環形廣場石欄緣邊（手繪石磚材質，與擴大 12.6m 星形要塞廣場齊平）
      const curbMat = this._makeToonMat({ color: "#f6efe4", map: env.plaza }, true);
      const curbRing = new THREE.Mesh(new THREE.TorusGeometry(12.55, 0.18, 8, 64), curbMat);
      curbRing.rotation.x = Math.PI / 2;
      curbRing.position.y = hubY;
      curbRing.scale.set(1, 1, 0.72);
      hub.add(curbRing);

      // 3D 隨風搖曳草原與點綴野花（鋪設於要塞外緣草坡）
      this._buildInstancedMeadowGrass(
        hub,
        null,
        0.8,
        true,
        520,
        (dx, dz) => this._evalHubHeight(dx, dz),
        hubTheme
      );

      // 真 3D 南山紅磚白柱鐘塔校園大廳（未載入 hub_3d.glb 前之備援模型）
      const hallGroup = new THREE.Group();
      hallGroup.position.set(0, hubY, -7.6);
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
      this._addBoxCollider(0, -7.6, 4.4, 2.55, 0, hubY + 10.5, null, "landmark_hub");

      // 中央羅盤許願水池
      const fountain = new THREE.Group();
      fountain.position.set(0, hubY, 1.2);
      const fRim = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.08, 0.24, 24), curbMat);
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
      this._addCircleCollider(0, 1.2, 1.05, hubY + 2.2);

      // Hub 自強不息總進度公佈欄 + 校園長椅
      const hubBoard = this._buildCampusBulletinBoard("hub", "🏫 南山自強複習榜", "#8f2130");
      hubBoard.position.set(6.8, hubY, 4.6);
      hubBoard.rotation.y = -0.38;
      hubBoard.traverse((c) => {
        if (c.isMesh) {
          c.userData = { isHub: true };
          this.clickTargets.push(c);
        }
      });
      hub.add(hubBoard);
      this._addBoxCollider(6.8, 4.6, 0.92, 0.32, -0.38, hubY + 2.8);

      [-7.8, 7.8].forEach((bx) => {
        const b = this._buildCampusBench();
        b.position.set(bx, hubY, 1.4);
        b.rotation.y = bx < 0 ? 0.55 : -0.55;
        hub.add(b);
        this._addCircleCollider(bx, 1.4, 0.58, hubY + 2.0);
      });

      // Hub 街燈對稱配置於大道兩側
      const hubLampMat = new THREE.MeshBasicMaterial({ color: "#fef08a" });
      this.nightGlowMaterials.push(hubLampMat);
      [-7.2, 7.2].forEach((lx) => {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(lx, hubY - 0.02, 5.8);
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.09, 1.65, 8),
          new THREE.MeshStandardMaterial({ color: "#475569" })
        );
        post.position.set(0, 0.74, 0);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), hubLampMat);
        bulb.position.set(0, 1.62, 0);
        lampGroup.add(post, bulb);
        hub.add(lampGroup);
        this.hubLampGroups.push({ group: lampGroup, rotY: lx < 0 ? 0.25 : Math.PI - 0.25 });
        this._addCircleCollider(lx, 5.8, 0.28, hubY + 2.5);
      });

      // 4.4m 星形要塞海堤護牆與直入深海石砌墩堡（手繪石磚 + 手繪岩壁材質；閃開 6 條跨海橋與東側碼頭出口）
      const wallStoneMat = this._makeToonMat({ color: "#efe4d4", map: env.plaza }, true);
      const darkBastionMat = this._makeToonMat({ color: "#cfc1b2", map: env.cliffTile }, true);
      const bridgeAngles = (this.islandsData || []).map((isl) => Math.atan2(isl.position.z, isl.position.x));
      const parapetCount = 32;
      for (let i = 0; i < parapetCount; i++) {
        const a = (i / parapetCount) * Math.PI * 2;
        const nearBridge = bridgeAngles.some((ba) => Math.abs(Math.atan2(Math.sin(a - ba), Math.cos(a - ba))) < 0.22);
        const nearEastPier = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.14;
        if (nearBridge || nearEastPier) continue;
        const starR = 14.0 * (1.0 + 0.052 * Math.cos(a * 8.0));
        const px = Math.cos(a) * starR;
        const pz = Math.sin(a) * starR;
        const py = this._evalHubHeight(px, pz);

        const post = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.96, 0.62), wallStoneMat);
        post.position.set(px, py + 0.38, pz);
        post.rotation.y = -a;
        post.castShadow = true;
        hub.add(post);

        if (i % 3 === 0) {
          const buttress = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.96, py + 1.2, 8), darkBastionMat);
          buttress.position.set(Math.cos(a) * (starR + 0.72), (py - 1.2) * 0.5, Math.sin(a) * (starR + 0.72));
          hub.add(buttress);
        }
      }

      // 東側海面親水釣魚棧橋 (x ~ 16.0, z ~ -0.4, 貼海 0.6m)
      const seaPierMat = this._makeToonMat({ color: "#ebd0ae", map: env.wood }, true);
      const seaPier = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 2.4), seaPierMat);
      seaPier.position.set(16.0, 0.54, -0.4);
      seaPier.receiveShadow = true;
      hub.add(seaPier);

      this.scene.add(hub);
      this.hubGroup = hub;
    }

    _buildRadiatingBridges() {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const woodCreamMat = this._makeToonMat({
        color: "#ead4b5",
        map: env.wood
      });
      const woodWarmMat = this._makeToonMat({
        color: "#dfb280",
        map: env.wood
      });
      const trimBeamMat = this._makeToonMat({
        color: "#c27d48",
        map: env.wood
      });
      const stonePierMat = this._makeToonMat({
        color: "#ddd0b8",
        map: env.cliffTile
      });
      const foamMat = this._disableOutline(
        new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.62 })
      );

      this.islandsData.forEach((island) => {
        const meta = this._getIslandBridgeMeta(island);
        const dir = new THREE.Vector3(meta.dxAxis, 0, meta.dzAxis);
        const perpAxis = new THREE.Vector3(-dir.z, 0, dir.x);
        const startDist = meta.startDist;
        const endDist = meta.endDist;
        const startY = meta.startY;
        const endY = meta.endY;
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
          const archY = startY + (endY - startY) * t + Math.sin(t * Math.PI) * 1.45;
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

          // 高架跨海石墩柱（從 4.2~5.6m 橋面深插海面以下）與貼海浪花圈
          if (i === 5 || i === 12 || i === 19) {
            [-0.85, 0.85].forEach((side) => {
              const px = cx + perpAxis.x * side;
              const pz = cz + perpAxis.z * side;
              const pierH = archY + 1.2;
              const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, pierH, 8), stonePierMat);
              pier.position.set(px, (archY - 1.2) * 0.5, pz);
              const foam = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.54, 12), foamMat);
              foam.rotation.x = -Math.PI / 2;
              foam.position.set(px, -0.14, pz);
              bridgeGroup.add(pier, foam);
              this._addCircleCollider(px, pz, 0.42, archY - 0.1);
            });
          }
        }

        // 橋頭＆島口迎賓彩門拱門（避開主島開場相機，並閃開英文島正北向視線通道）
        [0.14, 0.92].forEach((gateT) => {
          if (island.id === "english" && gateT > 0.5) return;
          const gDist = startDist + (endDist - startDist) * gateT;
          const gY = startY + (endY - startY) * gateT + Math.sin(gateT * Math.PI) * 1.45;
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
        const surf = this._getSurfaceInfoAt(parentPos.x, parentPos.z, false);
        const dy = surf && !surf.onWater ? surf.groundY : parentPos.y;
        const g = new THREE.Group();
        g.position.set(parentPos.x, dy, parentPos.z);
        buildFn(g);
        g.visible = false;
        this.scene.add(g);
        this.decorationMeshes.set(id, g);
        if (radiusCol > 0) {
          this._addCircleCollider(parentPos.x, parentPos.z, radiusCol, dy + 2.6, g);
        }
      };

      const makeIslandDeco = (id, islandId, rawX, rawZ, propR, radiusCol, buildFn) => {
        const islIdx = this.islandsData.findIndex((i) => i.id === islandId);
        const isl = islIdx >= 0 ? this.islandsData[islIdx] : null;
        if (!isl) return;
        const occ = (this.islandOccupied && this.islandOccupied.get(isl.id)) || [];
        const seed = islIdx * 1.7 + 0.4;
        const heightFn = (dx, dz) => this._evalIslandHeight(isl, dx, dz, seed);
        const spot = this._findClearIslandSpot(isl, rawX, rawZ, propR, heightFn, occ, -0.45);
        makeDeco(id, { x: isl.position.x + spot.x, y: spot.y, z: isl.position.z + spot.z }, radiusCol, buildFn);
      };

      // 1. 海島露營帳篷 (Hub 左側草坡)
      makeDeco("bld-tent", { x: -11.4, y: 4.4, z: 2.2 }, 0.95, (g) => {
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
      makeDeco("bld-fountain", { x: 11.4, y: 4.4, z: 2.2 }, 0.98, (g) => {
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
      makeIslandDeco("bld-picnic", "chinese", 12.2, 3.6, 1.45, 0, (g) => {
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
      makeIslandDeco("bld-lantern", "english", 12.2, 3.6, 1.0, 0.5, (g) => {
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
      makeIslandDeco("bld-telescope", "geography", 12.2, 3.6, 1.3, 0.8, (g) => {
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
      makeIslandDeco("bld-carousel", "listening", 12.2, 3.6, 1.45, 0.95, (g) => {
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
        g.userData.spinTarget = spinner;
        g.add(spinner);
        this.ambientUpdaters.push((t) => {
          if (g.visible) spinner.rotation.y = t * 0.85;
        });
      });

      // 7. 海景摩天輪 (Civics Island)
      makeIslandDeco("bld-ferris", "civics", 12.4, 3.6, 1.45, 0.92, (g) => {
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
      makeIslandDeco("bld-statue", "history", 12.2, 3.6, 1.25, 0.78, (g) => {
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

    _buildIntelCollectibles(intelItems) {
      const THREE = window.THREE;
      if (!Array.isArray(intelItems) || intelItems.length === 0) return;

      intelItems.forEach((item, idx) => {
        let wx = 0;
        let wz = 0;
        let baseY = 0.42;
        let accentHex = "#38bdf8";

        if (item.locationType === "ocean" && item.worldPos) {
          wx = item.worldPos.x;
          wz = item.worldPos.z;
          baseY = 0.42;
        } else {
          const isl = this.islandsData.find((i) => i.id === item.islandId);
          if (!isl || !item.localPos) return;
          const islIdx = Math.max(0, this.islandsData.indexOf(isl));
          const occ = (this.islandOccupied && this.islandOccupied.get(isl.id)) || [];
          const safe = this._findClearIslandSpot(
            isl,
            item.localPos.x,
            item.localPos.z,
            1.15,
            (lx, lz) => this._evalIslandHeight(isl, lx, lz, islIdx * 1.7 + 0.4),
            occ
          );
          wx = isl.position.x + safe.x;
          wz = isl.position.z + safe.z;
          const surf = this._getSurfaceInfoAt(wx, wz, false);
          baseY = (surf.onWater ? 0.42 : surf.groundY) + 0.95;
          accentHex = (isl.colors && isl.colors.primary) || "#f59e0b";
        }

        const root = new THREE.Group();
        root.position.set(wx, baseY, wz);
        const vis = new THREE.Group();

        let coreMat = null;
        let ringMat = null;
        let ringMesh = null;

        if (item.locationType === "ocean") {
          // 海域知識漂流瓶（清透藍瓶＋發光黃金卷軸＋水面光環）
          coreMat = new THREE.MeshStandardMaterial({
            color: "#7dd3fc",
            emissive: "#0284c7",
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.86,
            roughness: 0.18
          });
          const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.78, 12), coreMat);
          bottle.rotation.z = 0.28;
          const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.22, 10), coreMat);
          neck.position.set(-0.12, 0.44, 0);
          neck.rotation.z = 0.28;
          const cork = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.09, 0.16, 8),
            new THREE.MeshStandardMaterial({ color: "#d97706", roughness: 0.75 })
          );
          cork.position.set(-0.16, 0.56, 0);
          cork.rotation.z = 0.28;
          const scroll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.11, 0.46, 8),
            new THREE.MeshBasicMaterial({ color: "#fde047" })
          );
          scroll.rotation.z = 0.28;
          ringMat = new THREE.MeshBasicMaterial({
            color: "#bae6fd",
            transparent: true,
            opacity: 0.72,
            side: THREE.DoubleSide
          });
          ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.68, 18), ringMat);
          ringMesh.rotation.x = -Math.PI / 2;
          ringMesh.position.y = -0.22;
          vis.add(bottle, neck, cork, scroll, ringMesh);
        } else {
          // 島嶼學科知識情報結晶（學科代表色菱晶＋金色光環）
          coreMat = new THREE.MeshStandardMaterial({
            color: accentHex,
            emissive: accentHex,
            emissiveIntensity: 0.42,
            roughness: 0.22,
            metalness: 0.18
          });
          const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), coreMat);
          crystal.scale.set(0.85, 1.25, 0.85);
          ringMat = new THREE.MeshBasicMaterial({
            color: "#fde047",
            transparent: true,
            opacity: 0.85
          });
          ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.045, 6, 18), ringMat);
          ringMesh.rotation.x = Math.PI * 0.36;
          vis.add(crystal, ringMesh);
        }

        vis.traverse((c) => {
          if (c.isMesh) {
            c.userData = { isIntel: true, intelId: item.id };
            this.clickTargets.push(c);
          }
        });

        root.add(vis);
        this.scene.add(root);
        this.intelMeshes.set(item.id, {
          item,
          root,
          vis,
          coreMat,
          ringMat,
          ringMesh,
          baseY,
          wx,
          wz,
          accentHex,
          phase: idx * 0.65,
          isOcean: item.locationType === "ocean"
        });

        this.interactableSpots.push({
          type: "intel",
          intelId: item.id,
          islandId: item.islandId,
          label: `📜 收集情報：${item.title}`,
          x: wx,
          z: wz
        });
      });

      this.ambientUpdaters.push((t) => {
        this.intelMeshes.forEach((entry) => {
          const collected = this.collectedIntelSet.has(entry.item.id);
          const bobAmp = entry.isOcean ? 0.14 : 0.18;
          entry.root.position.y = entry.baseY + Math.sin(t * 2.4 + entry.phase) * bobAmp;
          entry.vis.rotation.y = t * (collected ? 0.45 : 1.35) + entry.phase;
          if (entry.ringMesh && !entry.isOcean) {
            entry.ringMesh.rotation.z = t * 1.1 + entry.phase;
          }
        });
      });
    }

    syncCollectedIntel(collectedIds) {
      this.collectedIntelSet = new Set(collectedIds || []);
      this.intelMeshes.forEach((entry, id) => {
        const done = this.collectedIntelSet.has(id);
        entry.vis.scale.setScalar(done ? 0.42 : 1.0);
        if (entry.coreMat) {
          entry.coreMat.emissiveIntensity = done ? 0.08 : entry.isOcean ? 0.35 : 0.42;
          if (entry.isOcean) entry.coreMat.opacity = done ? 0.35 : 0.86;
        }
        if (entry.glbMats && entry.glbMats.length) {
          entry.glbMats.forEach((m) => {
            m.emissiveIntensity = done ? 0.04 : (entry.isOcean ? 0.1 : 0.34);
            m.transparent = done;
            m.opacity = done ? 0.45 : 1.0;
            m.needsUpdate = true;
          });
        }
        if (entry.ringMesh) entry.ringMesh.visible = !done;
      });
    }

    _buildLifeActivities(items) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      if (!this.activityStations) this.activityStations = new Map();
      this.activityStations.clear();
      if (!Array.isArray(items) || items.length === 0) return;

      const paletteMap = {
        study: "#f59e0b",
        cafe: "#10b981",
        fishing: "#0ea5e9",
        lounge: "#f43f5e",
        workout: "#8b5cf6"
      };

      items.forEach((item, idx) => {
        let wx = 0;
        let wz = 0;
        if (item.worldPos) {
          wx = item.worldPos.x;
          wz = item.worldPos.z;
        } else if (item.localPos) {
          const isl = this.islandsData.find((i) => i.id === item.islandId);
          if (!isl) return;
          if (item.type !== "fishing") {
            const islIdx = Math.max(0, this.islandsData.indexOf(isl));
            const occ = (this.islandOccupied && this.islandOccupied.get(isl.id)) || [];
            const heightFn = (lx, lz) => this._evalIslandHeight(isl, lx, lz, islIdx * 1.7 + 0.4);
            const clear = this._findClearIslandSpot(isl, item.localPos.x, item.localPos.z, 2.0, heightFn, occ, -0.45);
            wx = isl.position.x + clear.x;
            wz = isl.position.z + clear.z;
          } else {
            wx = isl.position.x + item.localPos.x;
            wz = isl.position.z + item.localPos.z;
          }
        } else {
          return;
        }

        const surf = this._getSurfaceInfoAt(wx, wz, false);
        const groundY = surf.onWater ? 0.86 : surf.groundY;
        const rotY = item.rotY || 0;
        const fwdX = Math.sin(rotY);
        const fwdZ = Math.cos(rotY);

        const root = new THREE.Group();
        root.position.set(wx, groundY, wz);
        root.rotation.y = rotY;

        const accent = paletteMap[item.type] || "#38bdf8";
        const haloMat = new THREE.MeshBasicMaterial({
          color: accent,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const haloMesh = new THREE.Mesh(new THREE.RingGeometry(1.02, 1.32, 24), haloMat);
        haloMesh.rotation.x = -Math.PI / 2;
        haloMesh.position.y = 0.05;
        root.add(haloMesh);

        const markerMat = new THREE.MeshBasicMaterial({ color: accent });
        const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), markerMat);
        marker.position.y = (item.targetH || 1.75) + 0.52;
        root.add(marker);

        const modelSlot = new THREE.Group();
        // 載入 3D GLB 前先顯示簡約彩色備援道具，確保點擊與辨識立即可用
        const woodMat = new THREE.MeshStandardMaterial({ color: "#ebd0ae", map: env.wood, roughness: 0.65 });
        const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.45 });
        if (item.type === "fishing") {
          const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 1.5), woodMat);
          deck.position.y = 0.07;
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.72, 10), woodMat);
          post.position.set(-0.42, 0.42, -0.35);
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.56, 10), accentMat);
          barrel.position.set(0.35, 0.34, -0.32);
          modelSlot.add(deck, post, barrel);
        } else if (item.type === "lounge") {
          const chair = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 1.35), accentMat);
          chair.position.y = 0.22;
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.7, 8), woodMat);
          pole.position.set(-0.25, 0.9, -0.35);
          const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.42, 10), accentMat);
          umbrella.position.set(-0.25, 1.78, -0.35);
          modelSlot.add(chair, pole, umbrella);
        } else if (item.type === "cafe") {
          const counter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.88, 0.78), woodMat);
          counter.position.y = 0.44;
          const roof = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.22, 0.96), accentMat);
          roof.position.y = 1.75;
          modelSlot.add(counter, roof);
        } else if (item.type === "workout") {
          const pad = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.35), woodMat);
          pad.position.y = 0.05;
          const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.75, 8), woodMat);
          pL.position.set(-0.52, 0.9, -0.2);
          const pR = pL.clone();
          pR.position.x = 0.52;
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.12, 8), accentMat);
          bar.rotation.z = Math.PI / 2;
          bar.position.set(0, 1.68, -0.2);
          modelSlot.add(pad, pL, pR, bar);
        } else {
          const desk = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.72, 0.74), woodMat);
          desk.position.y = 0.36;
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.09, 0.34), accentMat);
          book.position.set(0, 0.76, 0.05);
          modelSlot.add(desk, book);
        }
        root.add(modelSlot);

        root.traverse((c) => {
          if (c.isMesh) {
            c.userData = { isActivity: true, activityId: item.id };
            this.clickTargets.push(c);
          }
        });

        this.scene.add(root);

        let standX = wx + fwdX * 1.32;
        let standZ = wz + fwdZ * 1.32;
        let standFaceAngle = rotY + Math.PI;
        if (item.type === "fishing") {
          standX = wx - fwdX * 0.45;
          standZ = wz - fwdZ * 0.45;
          standFaceAngle = rotY;
        } else if (item.type === "lounge") {
          standX = wx + fwdX * 0.48;
          standZ = wz + fwdZ * 0.48;
          standFaceAngle = rotY;
        }

        if (item.type === "lounge") {
          this._addCircleCollider(wx - fwdX * 0.55, wz - fwdZ * 0.55, 0.42, groundY + 2.5);
        } else if (item.type !== "fishing") {
          this._addCircleCollider(wx, wz, 0.72, groundY + 2.6);
        }

        this.activityStations.set(item.id, {
          act: item,
          root,
          modelSlot,
          haloMat,
          haloMesh,
          marker,
          markerBaseY: (item.targetH || 1.75) + 0.52,
          phase: idx * 0.75,
          wx,
          wz,
          groundY,
          standX,
          standZ,
          standFaceAngle
        });

        this.interactableSpots.push({
          type: "activity",
          kind: item.type,
          activityId: item.id,
          islandId: item.islandId,
          label: item.name,
          x: wx,
          z: wz
        });
      });

      this.ambientUpdaters.push((t) => {
        if (!this.activityStations) return;
        this.activityStations.forEach((st) => {
          const isCur = this.activeActivity && this.activeActivity.id === st.act.id;
          if (st.marker) {
            st.marker.position.y = st.markerBaseY + Math.sin(t * 2.5 + st.phase) * 0.1;
            st.marker.rotation.y = t * (isCur ? 2.8 : 1.1) + st.phase;
          }
          if (st.haloMat) {
            st.haloMat.opacity = isCur ? 0.85 : 0.34 + Math.sin(t * 2.2 + st.phase) * 0.12;
          }
          if (st.haloMesh) {
            const s = isCur ? 1.1 + Math.sin(t * 4) * 0.06 : 1.0;
            st.haloMesh.scale.setScalar(s);
          }
        });
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

    /* ==================== 3F 原神／星鐵級島嶼雕塑地貌、聖殿中軸與園區造景 ==================== */
    _buildIsland(island, islandIdx) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const group = new THREE.Group();
      group.position.set(island.position.x, 0, island.position.z);
      const r = island.radius;
      const seed = islandIdx * 1.7 + 0.4;
      const prof = this._getIslandProfile(island);
      const theme = this._getIslandTheme(island);
      const heightFn = (dx, dz) => this._evalIslandHeight(island, dx, dz, seed);

      if (!this.islandOccupied) this.islandOccupied = new Map();
      const occ = [];
      this.islandOccupied.set(island.id, occ);

      // 預先保留中軸牌坊、郵筒、瀑布與公民城牆區域，讓後續學習亭與道具精準閃避
      occ.push({ x: -3.55, z: prof.gateZ, r: 0.95 }, { x: 3.55, z: prof.gateZ, r: 0.95 });
      (island.nodes || []).forEach((_, idx) => {
        const side = idx % 2 === 0 ? -1 : 1;
        occ.push({ x: side * 3.55, z: 8.4 - Math.floor(idx / 2) * 3.4, r: 0.72 });
      });
      occ.push({ x: 9.6, z: -5.2, r: 1.8 });
      if (island.id === "civics") {
        occ.push({ x: -7.2, z: 11.8, r: 2.0 }, { x: 7.2, z: 11.8, r: 2.0 });
      }

      const resolvedAlcoves = this._resolveIslandAlcoves(island, heightFn, occ);
      const alcovesVecs = resolvedAlcoves.map((s) => new THREE.Vector3(s.x, s.z, 1.72));

      // 自然雕塑地形網格 + 一島一世界 Painterly 地貌 Shader
      const terrainMat = this._createTerrainShaderMat(theme, {
        isHub: false,
        biomeMode: island.id === "geography" ? 1.0 : 0.0,
        islandStyle: prof.styleCode,
        aveMaxZ: prof.aveMaxZ,
        accentColor: island.colors.primary,
        cliffLight: prof.cliffLight,
        cliffDark: prof.cliffDark,
        stoneLight: prof.stoneLight,
        stoneDark: prof.stoneDark,
        alcoves: alcovesVecs
      });
      const terrainMesh = this._createSculptedTerrainMesh(r * prof.outerScale, heightFn, terrainMat, 104, 60);
      terrainMesh.userData = { islandId: island.id };
      group.add(terrainMesh);
      this.clickTargets.push(terrainMesh);

      // 聖殿高台雕花石欄緣邊（南向樓梯口留白開口式馬蹄鐵護欄 ＋ 雙側端柱）
      const curbMat = this._makeToonMat({ color: prof.stoneLight || "#efe4d2", map: env.plaza }, true);
      const curbGeo = new THREE.TorusGeometry(9.0, 0.18, 8, 52, Math.PI * 2 - 0.68);
      curbGeo.rotateZ(Math.PI / 2 + 0.34);
      const sanctCurb = new THREE.Mesh(curbGeo, curbMat);
      sanctCurb.rotation.x = Math.PI / 2;
      sanctCurb.position.set(0, prof.sanctY, -7.8);
      sanctCurb.scale.set(1.04, 0.84, 0.65);
      group.add(sanctCurb);
      [-3.12, 3.12].forEach((bx) => {
        const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.68, 10), curbMat);
        bollard.position.set(bx, prof.sanctY + 0.32, -0.66);
        bollard.castShadow = true;
        group.add(bollard);
      });

      // 主建築聖殿碰撞箱（載入自訂 GLB 後會以精準包圍盒取代）
      this._addBoxCollider(island.position.x, island.position.z - 7.8, 5.2, 3.4, 0, prof.sanctY + 11.0, null, "landmark_" + island.id);

      // 延後至全島建築與生活站點定位完成後再種草，徹底避免草葉穿模
      if (!this.islandGrassConfigs) this.islandGrassConfigs = [];
      this.islandGrassConfigs.push({ group, island, seed, heightFn, theme, alcovesVecs });

      // 一島一世界專屬地形造景（山嶺岩峰／珊瑚礁與木棧道／海中鳥居＆千本鳥居／桂林奇峰與九曲橋／海蝕拱門／雙層港城海牆）
      this._buildIslandBespokeGeo(group, island, heightFn, prof, occ);

      // 主題專屬南側中軸迎賓牌坊 / 拱門
      this._buildIslandWelcomeGate(group, island, theme, heightFn, prof, occ);

      // 東側崖壁飛瀑流水（位置已於前置清單登錄）
      this._buildWaterfall(group, 9.6, -5.2, prof.sanctY + 0.08, prof.platY - 0.04);

      // 中軸寬闊迎賓大石階（上層台地 -> 主聖殿高台）
      this._buildHillStairs(group, island, prof);

      // 南側迎賓廣場左右兩翼：自強進度榜 ＆ 校園長椅（自動避讓＋對齊平台高度）
      const wingZ = island.id === "english" ? 16.4 : island.id === "civics" ? 11.4 : 13.8;
      const wingMinOff = island.id === "english" ? -2.0 : -0.55;
      const bSpot = this._findClearIslandSpot(island, -6.2, wingZ, 1.35, heightFn, occ, wingMinOff);
      const islBoard = this._buildCampusBulletinBoard(island.id, `🏫 ${island.name} · 進度榜`, island.colors.primary);
      islBoard.position.set(bSpot.x, bSpot.y, bSpot.z);
      islBoard.rotation.y = 0.42;
      islBoard.traverse((c) => {
        if (c.isMesh) {
          c.userData = { islandId: island.id };
          this.clickTargets.push(c);
        }
      });
      group.add(islBoard);
      this._addBoxCollider(island.position.x + bSpot.x, island.position.z + bSpot.z, 0.92, 0.34, 0.42, bSpot.y + 2.8);

      const benchSpot = this._findClearIslandSpot(island, 6.2, wingZ, 1.25, heightFn, occ, wingMinOff);
      const bench = this._buildCampusBench();
      bench.position.set(benchSpot.x, benchSpot.y, benchSpot.z);
      bench.rotation.y = -0.42;
      group.add(bench);
      this._addCircleCollider(island.position.x + benchSpot.x, island.position.z + benchSpot.z, 0.58, benchSpot.y + 2.2);

      // Cozy 西側林蔭主題小屋
      this._buildSubjectCottage(group, island, heightFn, occ);

      // 東側庭園知識寶箱
      this._buildTreasureChest(group, island, heightFn, occ);

      // 外圍錯落主題森林與青苔岩群
      this._buildClusteredForest(group, island, r, seed, heightFn, occ);

      // 中軸聖殿主建築備援 3D 地標 ＆ 光影氛圍特效
      const lmRef = this._buildLandmark(group, island, prof);
      this._buildIslandSpecialFX(group, island, lmRef);

      // 進度成長階段造景
      this._buildIslandGrowthProps(group, island, r, seed, heightFn, prof, occ);

      // 東北海岬燈塔
      this._buildLighthouse(group, island, heightFn, occ);

      // 迎賓大道旁迎接學生的高精守護貓
      if (island.guardianCat) {
        const catObj = this._createSvgCatStandee(island.guardianCat, 1.24, {
          islandId: island.id,
          isCat: true
        });
        const catSpot = this._findClearIslandSpot(island, 5.8, 8.2, 1.15, heightFn, occ, -0.45);
        const catPos = new THREE.Vector3(catSpot.x, catSpot.y, catSpot.z);
        catObj.group.position.copy(catPos);
        group.add(catObj.group);
        this.islandCats.set(island.id, {
          group: catObj.group,
          basePos: catPos,
          jumpTime: 0,
          phase: Math.random() * Math.PI * 2
        });
        this._addCircleCollider(island.position.x + catSpot.x, island.position.z + catSpot.z, 0.62, catSpot.y + 2.8);
      }

      // 庭院學習錨點群 ＆ 大道信箱遇點
      this._buildWalkingPath(group, island, r, seed, heightFn, resolvedAlcoves, occ);

      this.scene.add(group);
      this.islandGroups.set(island.id, group);
    }

    _buildAllIslandMeadowGrass() {
      (this.islandGrassConfigs || []).forEach((cfg) => {
        const occ = (this.islandOccupied && this.islandOccupied.get(cfg.island.id)) || [];
        this._buildInstancedMeadowGrass(
          cfg.group,
          cfg.island,
          cfg.seed,
          false,
          1250,
          cfg.heightFn,
          cfg.theme,
          cfg.alcovesVecs,
          occ
        );
      });
    }

    _createSculptedRockGeo(radius, height, radialSegs = 12, heightSegs = 8, seed = 0) {
      const THREE = window.THREE;
      const geo = new THREE.CylinderGeometry(radius * 0.16, radius, height, radialSegs, heightSegs);
      const pos = geo && geo.attributes && geo.attributes.position;
      if (pos && typeof pos.getX === "function") {
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          const yn = Math.max(0, Math.min(1, (y + height * 0.5) / Math.max(height, 0.01)));
          const ang = Math.atan2(z, x);
          const radHoriz = Math.hypot(x, z);
          if (radHoriz > 0.001) {
            const ridge = 1.0 + 0.20 * Math.sin(ang * 3.0 + seed) + 0.12 * Math.cos(ang * 5.0 - seed * 1.7 + yn * 2.2);
            const strata = 1.0 + 0.11 * Math.cos(yn * 9.5 + seed * 1.4) + 0.07 * Math.sin(yn * 16.0 + ang * 2.0);
            const scaleR = ridge * strata * (1.0 - 0.18 * yn * yn);
            const driftX = Math.sin(seed * 1.3) * radius * 0.14 * yn * yn;
            const driftZ = Math.cos(seed * 2.1) * radius * 0.14 * yn * yn;
            pos.setXYZ(i, x * scaleR + driftX, y, z * scaleR + driftZ);
          }
        }
        geo.computeVertexNormals();
      }
      return geo;
    }

    _buildIslandBespokeGeo(group, island, heightFn, prof, occ = []) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const stoneLightMat = this._makeToonMat({ color: "#f5ede0", map: env.plaza }, true);
      const stoneDarkMat = this._makeToonMat({ color: "#b6a99a", map: env.cliffTile }, true);
      const woodDeckMat = this._makeToonMat({ color: "#ecd2ae", map: env.wood }, true);
      const foamMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.72 }));

      if (prof.style === "taiwan_mountain") {
        // 台灣高山縱谷・清水斷崖：多層雕塑岩石火山尖峰 ＋ 中央主峰巖脊 ＋ 東側冰柱雪峰 ＋ 懸崖直墜海浪大瀑布
        const darkCragMat = this._makeToonMat({ color: "#8d817a", map: env.cliffTile }, true);
        const iceMat = this._makeToonMat({ color: "#bae6fd", emissive: "#0284c7", emissiveIntensity: 0.14 }, true);
        const lavaMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#ff784f" }));
        this.nightGlowMaterials.push(lavaMat);

        [
          { x: -11.4, z: -18.8, r: 3.4, h: 6.2, type: "lava" },
          { x: -6.8, z: -20.2, r: 2.8, h: 5.4, type: "lava" },
          { x: 0.2, z: -22.0, r: 3.8, h: 6.8, type: "rock" },
          { x: 9.2, z: -18.6, r: 3.2, h: 6.0, type: "ice" },
          { x: 12.8, z: -16.4, r: 2.6, h: 5.0, type: "ice" }
        ].forEach((pk, idx) => {
          const gy = heightFn(pk.x, pk.z);
          const crag = new THREE.Mesh(
            this._createSculptedRockGeo(pk.r, pk.h, 12, 8, idx * 2.3 + 0.7),
            pk.type === "ice" ? iceMat : darkCragMat
          );
          crag.position.set(pk.x, gy + pk.h * 0.35 - 0.6, pk.z);
          crag.rotation.y = idx * 0.7;
          crag.castShadow = true;
          group.add(crag);
          if (pk.type === "lava") {
            const vein = new THREE.Mesh(new THREE.BoxGeometry(0.32, pk.h * 0.55, pk.r * 0.9), lavaMat);
            vein.position.set(pk.x, gy + pk.h * 0.25, pk.z + pk.r * 0.28);
            vein.rotation.x = 0.28;
            group.add(vein);
          }
        });
        // 東側清水斷崖飛瀑直墜入海
        this._buildWaterfall(group, 14.8, 2.8, prof.platY + 0.15, -0.25);
        if (Array.isArray(occ)) occ.push({ x: 14.8, z: 2.8, r: 1.8 });
      } else if (prof.style === "barrier_reef") {
        // 大堡礁珊瑚環礁：開放海域與雙側內灣彩色珊瑚礁群 ＋ 衛星珊瑚小島棕櫚 ＋ 西南過海木棧橋
        const coralCols = ["#ff6b81", "#ff9f43", "#48dbfb", "#a29bfe", "#ffd32a"];
        for (let i = 0; i < 44; i++) {
          const a = (i / 44) * Math.PI * 2 + 0.18;
          const rad = 15.2 + (i % 5) * 3.1;
          const cx = Math.cos(a) * rad;
          const cz = Math.sin(a) * rad;
          const cy = heightFn(cx, cz);
          if (cy > 0.18) continue;
          const coral = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.48 + (i % 3) * 0.2, 0),
            this._makeToonMat({ color: coralCols[i % coralCols.length] }, true)
          );
          coral.position.set(cx, -0.22 + (i % 3) * 0.12, cz);
          coral.scale.set(1.2, 0.9 + (i % 3) * 0.35, 1.1);
          group.add(coral);
        }
        // 外海 4 座獨立衛星珊瑚小島熱帶棕櫚
        const palmMat = this._makeToonMat({ color: "#34d399" }, true);
        const trunkMat = this._makeToonMat({ color: "#c89b6e", map: env.wood }, true);
        [
          [-22.2, 15.2],
          [22.6, 12.6],
          [-23.8, -11.6],
          [23.0, -13.0]
        ].forEach(([ix, iz], idx) => {
          const iy = heightFn(ix, iz);
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.65, 7), trunkMat);
          trunk.position.set(ix, iy + 0.8, iz);
          trunk.rotation.z = idx % 2 === 0 ? 0.14 : -0.14;
          const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 1), palmMat);
          crown.position.set(ix + (idx % 2 === 0 ? -0.14 : 0.14), iy + 1.72, iz);
          crown.scale.set(1.25, 0.55, 1.25);
          group.add(trunk, crown);
        });
        // 西南木棧橋連結主島 (-12.8, 8.0) -> 衛星珊瑚島 (-21.8, 14.8)
        const bSteps = 12;
        for (let bi = 0; bi <= bSteps; bi++) {
          const bt = bi / bSteps;
          const bx = -12.8 + (-21.8 + 12.8) * bt;
          const bz = 8.0 + (14.8 - 8.0) * bt;
          const by = heightFn(bx, bz);
          const plank = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 0.95), woodDeckMat);
          plank.position.set(bx, by + 0.04, bz);
          plank.lookAt(-22.2, by + 0.04, 15.2);
          group.add(plank);
        }
      } else if (prof.style === "japan_shrine") {
        // 日本瀨戶內／京都階梯海岬：海中大鳥居 ＋ 微翹紅漆千本鳥居參道 ＋ 石階踏面 ＋ 石燈籠
        const toriiRedMat = this._makeToonMat({ color: "#e03c32", map: env.wood }, true);
        const darkCapMat = this._makeToonMat({ color: "#231f20" }, true);
        const lanternGlow = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#fde68a" }));
        this.nightGlowMaterials.push(lanternGlow);

        const makeTorii = (tx, ty, tz, scale = 1.0, inWater = false) => {
          const tg = new THREE.Group();
          const h = 3.8 * scale;
          const span = 1.9 * scale;
          [-span, span].forEach((px) => {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.21 * scale, h, 10), toriiRedMat);
            p.position.set(px, h * 0.5, 0);
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * scale, 0.28 * scale, 0.42 * scale, 10), stoneDarkMat);
            base.position.set(px, 0.2 * scale, 0);
            tg.add(p, base);
            if (inWater) {
              const fm = new THREE.Mesh(new THREE.RingGeometry(0.32 * scale, 0.68 * scale, 14), foamMat);
              fm.rotation.x = -Math.PI / 2;
              fm.position.set(px, 0.24, 0);
              tg.add(fm);
            }
          });
          const kasagiMid = new THREE.Mesh(new THREE.BoxGeometry(span * 2.2, 0.22 * scale, 0.44 * scale), darkCapMat);
          kasagiMid.position.y = h + 0.12 * scale;
          [-1, 1].forEach((side) => {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(span * 0.65, 0.20 * scale, 0.42 * scale), darkCapMat);
            wing.position.set(side * span * 1.32, h + 0.20 * scale, 0);
            wing.rotation.z = side * 0.14;
            tg.add(wing);
          });
          const shimagi = new THREE.Mesh(new THREE.BoxGeometry(span * 2.5, 0.20 * scale, 0.34 * scale), toriiRedMat);
          shimagi.position.y = h - 0.08 * scale;
          const nuki = new THREE.Mesh(new THREE.BoxGeometry(span * 2.35, 0.18 * scale, 0.24 * scale), toriiRedMat);
          nuki.position.y = h - 0.72 * scale;
          const strut = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.56 * scale, 0.22 * scale), toriiRedMat);
          strut.position.y = h - 0.40 * scale;
          tg.add(kasagiMid, shimagi, nuki, strut);
          tg.position.set(tx, ty, tz);
          group.add(tg);
        };

        // 東南海中大鳥居（立於海灣浪花之上）
        makeTorii(11.4, -0.42, 24.4, 1.72, true);
        // 中軸千本鳥居階梯參道（5 座連立沿坡攀升，與門柱區保留充裕間距）
        [16.2, 15.3, 14.4, 13.5, 12.6].forEach((tz) => {
          makeTorii(0, heightFn(0, tz), tz, 0.94, false);
        });
        // 僅於上下兩段攀升斜坡鋪設分階踏面
        for (let s = 0; s < 10; s++) {
          const tz = 15.8 - s * 0.52;
          const stMesh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.10, 0.34), stoneLightMat);
          stMesh.position.set(0, heightFn(0, tz) - 0.01, tz);
          group.add(stMesh);
        }
        for (let s = 0; s < 8; s++) {
          const tz = 24.4 - s * 0.50;
          const stMesh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.10, 0.34), stoneLightMat);
          stMesh.position.set(0, heightFn(0, tz) - 0.01, tz);
          group.add(stMesh);
        }
        // 和風石燈籠
        [-4.2, 4.2].forEach((lx) => {
          const ly = heightFn(lx, 18.2);
          const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.0, 8), stoneDarkMat);
          ped.position.set(lx, ly + 0.5, 18.2);
          const lbox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.42), lanternGlow);
          lbox.position.set(lx, ly + 1.15, 18.2);
          const lcap = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.32, 4), stoneDarkMat);
          lcap.rotation.y = Math.PI / 4;
          lcap.position.set(lx, ly + 1.46, 18.2);
          group.add(ped, lbox, lcap);
          if (Array.isArray(occ)) occ.push({ x: lx, z: 18.2, r: 0.95 });
        });
      } else if (prof.style === "guilin_karst") {
        // 桂林山水峰林・新月半島：5 座雕塑層岩奇峰群 ＋ 東側彎月灣九曲紅橋
        const karstMat = this._makeToonMat({ color: "#8ba69f", map: env.cliffTile }, true);
        const karstShadeMat = this._makeToonMat({ color: "#68827c", map: env.cliffTile }, true);
        const mossBaseMat = this._makeToonMat({ color: "#6ba37c", map: env.grass }, true);
        [
          [-17.4, -12.4, 3.2, 12.2],
          [-10.2, -18.8, 3.8, 15.6],
          [0.4, -20.8, 4.2, 17.8],
          [10.4, -18.0, 3.4, 14.4],
          [-18.6, -2.6, 2.8, 10.6]
        ].forEach(([kx, kz, kr, kh], idx) => {
          const ky = heightFn(kx, kz);
          const spire = new THREE.Mesh(this._createSculptedRockGeo(kr, kh, 12, 8, idx * 2.3 + 0.4), karstMat);
          spire.position.set(kx, ky + kh * 0.42 - 0.6, kz);
          spire.rotation.y = idx * 0.7;
          spire.castShadow = true;
          const shoulder = new THREE.Mesh(
            this._createSculptedRockGeo(kr * 0.72, kh * 0.68, 10, 6, idx * 3.1 + 1.2),
            karstShadeMat
          );
          shoulder.position.set(kx + (idx % 2 === 0 ? kr * 0.48 : -kr * 0.48), ky + kh * 0.28 - 0.5, kz + 0.4);
          shoulder.rotation.y = idx * 1.1;
          const skirt = new THREE.Mesh(this._createSculptedRockGeo(kr * 1.15, kh * 0.26, 10, 4, idx * 1.7 + 2.0), mossBaseMat);
          skirt.position.set(kx, ky + kh * 0.08 - 0.4, kz);
          group.add(spire, shoulder, skirt);
        });
        // 東側靜水彎月灣九曲紅橋（木紋＋朱紅塗裝）
        const redWoodMat = this._makeToonMat({ color: "#d6453a", map: env.wood }, true);
        [
          [13.0, -2.0, 0.35],
          [15.4, 0.2, -0.45],
          [16.8, 2.5, 0.42],
          [14.8, 4.7, -0.35]
        ].forEach(([bx, bz, ry]) => {
          const seg = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 2.75), redWoodMat);
          seg.position.set(bx, 0.42, bz);
          seg.rotation.y = ry;
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.0, 6), stoneDarkMat);
          post.position.set(bx, 0.0, bz);
          group.add(seg, post);
        });
      } else if (prof.style === "aegean_acropolis") {
        // 愛琴海衛城白堊斷崖：東岸近岸白堊海蝕拱門 ＋ 崖邊大理石殘柱群 ＋ 連續斜坡白大理石南岬護欄 ＋ 漁夫岩棧
        const chalkMat = this._makeToonMat({ color: "#f6f0e4", map: env.plaza }, true);
        const railGlow = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#fef08a" }));
        this.nightGlowMaterials.push(railGlow);
        const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.48, 5.4, 8), chalkMat);
        legL.position.set(15.8, 1.8, 4.2);
        const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.42, 5.4, 8), chalkMat);
        legR.position.set(19.8, 1.8, 8.6);
        const archSpan = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.95, 8, 20, Math.PI), chalkMat);
        archSpan.position.set(17.8, 4.4, 6.4);
        archSpan.rotation.y = -0.785;
        group.add(legL, legR, archSpan);

        // 斷崖上大理石殘柱群（自動避讓學習亭與大道道具）
        [
          [-10.4, 10.4, 3.8],
          [10.4, 10.4, 3.4],
          [-14.2, 1.6, 4.2]
        ].forEach(([rx, rz, rh]) => {
          const rSpot = this._findClearIslandSpot(island, rx, rz, 1.0, heightFn, occ, -0.5);
          if (rSpot.noSpace) return;
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, rh, 12), chalkMat);
          col.position.set(rSpot.x, rSpot.y + rh * 0.5, rSpot.z);
          col.castShadow = true;
          group.add(col);
        });
        // 南岬拾級而上薄階踏面＋連續斜坡白大理石矮牆護欄與首尾燈柱
        for (let s = 0; s < 14; s++) {
          const tz = 22.6 - s * 0.74;
          const stepM = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.10, 0.36), chalkMat);
          stepM.position.set(0, heightFn(0, tz) - 0.01, tz);
          group.add(stepM);
        }
        const hCapeStart = heightFn(2.32, 22.6);
        const hCapeEnd = heightFn(2.32, 12.6);
        const capeRailLen = Math.hypot(22.6 - 12.6, hCapeEnd - hCapeStart) + 0.45;
        const capeRotX = Math.atan2(hCapeEnd - hCapeStart, 22.6 - 12.6);
        [-2.32, 2.32].forEach((cx) => {
          const railWall = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.48, capeRailLen), chalkMat);
          railWall.position.set(cx, (hCapeStart + hCapeEnd) * 0.5 + 0.22, 17.6);
          railWall.rotation.x = capeRotX;
          railWall.castShadow = true;
          group.add(railWall);

          [22.8, 12.4].forEach((pz) => {
            const py = heightFn(cx, pz);
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.86, 0.42), chalkMat);
            post.position.set(cx, py + 0.42, pz);
            const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), railGlow);
            orb.position.set(cx, py + 0.94, pz);
            group.add(post, orb);
          });
        });
        // 東南漁夫岩棧平台 (9.2, 22.0)
        const dockMesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.22, 2.8), woodDeckMat);
        dockMesh.position.set(9.2, 0.58, 22.0);
        group.add(dockMesh);
      } else {
        // 公民社會島・雙層海港城邦半島：城垛與旗幟拱廊城牆 ＋ 雙側石造梯緣攀爬階梯 ＋ 防波堤與港市木貨箱
        const citadelWallMat = this._makeToonMat({ color: "#ede4d4", map: env.plaza }, true);
        const bannerClothMat = this._makeToonMat({ color: "#1d4ed8" }, true);
        const bannerTrimMat = this._makeToonMat({ color: "#fbbf24" }, true);
        [-7.2, 7.2].forEach((wx) => {
          const wall = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.9, 1.45), citadelWallMat);
          wall.position.set(wx, 3.05, 11.8);
          wall.castShadow = true;
          group.add(wall);
          const coping = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.28, 1.68), stoneLightMat);
          coping.position.set(wx, 5.15, 11.8);
          group.add(coping);
          // 頂端 5 座石砌城垛
          for (let mi = 0; mi < 5; mi++) {
            const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.44, 0.58), citadelWallMat);
            merlon.position.set(wx - 2.3 + mi * 1.15, 5.51, 11.8);
            merlon.castShadow = true;
            group.add(merlon);
          }
          // 城牆南面臨港藍金垂掛旗幟
          [-1.6, 1.6].forEach((bx) => {
            const banner = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.65, 0.08), bannerClothMat);
            banner.position.set(wx + bx, 3.65, 12.56);
            const rod = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.11, 0.14), bannerTrimMat);
            rod.position.set(wx + bx, 4.50, 12.56);
            const hem = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.14, 0.10), bannerTrimMat);
            hem.position.set(wx + bx, 2.86, 12.56);
            group.add(banner, rod, hem);
          });
          this._addBoxCollider(island.position.x + wx, island.position.z + 11.8, 3.05, 0.8, 0, 5.2);
        });
        // 雙層港埠攀升石階踏面 (dx=0, dz = 17.2 -> 10.5) ＋ 連續斜坡石砌梯緣
        for (let s = 0; s < 14; s++) {
          const tz = 17.2 - s * 0.48;
          const stMesh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.32), stoneLightMat);
          stMesh.position.set(0, heightFn(0, tz) - 0.01, tz);
          group.add(stMesh);
        }
        const strRotX = Math.atan2(5.0 - 1.3, 6.6);
        [-2.55, 2.55].forEach((sx) => {
          const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 7.6), citadelWallMat);
          stringer.position.set(sx, 3.25, 13.9);
          stringer.rotation.x = strRotX;
          stringer.castShadow = true;
          group.add(stringer);
        });
        // 雙翼 L 型防波堤石墩燈柱與下層海港木質貨箱（閃開中央 spawnZ=18.8 通道）
        [-6.4, 6.4].forEach((bx) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 2.2, 10), citadelWallMat);
          post.position.set(bx, 2.45, 25.3);
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), this._disableOutline(new THREE.MeshBasicMaterial({ color: "#fef08a" })));
          lamp.position.set(bx, 3.75, 25.3);
          group.add(post, lamp);
        });
        const ironMat = this._makeToonMat({ color: "#475569" }, true);
        [
          { x: 4.8, y: 1.66, z: 18.6, w: 0.88, h: 0.72 },
          { x: -4.8, y: 1.62, z: 18.4, w: 0.72, h: 0.62 }
        ].forEach((cSpec) => {
          const crate = new THREE.Mesh(new THREE.BoxGeometry(cSpec.w, cSpec.h, cSpec.w), woodDeckMat);
          crate.position.set(cSpec.x, cSpec.y, cSpec.z);
          crate.castShadow = true;
          const trim = new THREE.Mesh(new THREE.BoxGeometry(cSpec.w + 0.05, 0.1, cSpec.w + 0.05), ironMat);
          trim.position.set(cSpec.x, cSpec.y + cSpec.h * 0.25, cSpec.z);
          group.add(crate, trim);
          if (Array.isArray(occ)) occ.push({ x: cSpec.x, z: cSpec.z, r: 0.9 });
        });
      }
    }

    _createPlaqueTex(text, bgHex = "#7f1d1d", borderHex = "#f59e0b", textHex = "#fef3c7") {
      const THREE = window.THREE;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 192;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = bgHex;
        ctx.fillRect(0, 0, 512, 192);
        ctx.strokeStyle = borderHex;
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, 492, 172);
        ctx.lineWidth = 4;
        ctx.strokeRect(24, 24, 464, 144);
        ctx.fillStyle = borderHex;
        [
          [32, 32],
          [480, 32],
          [32, 160],
          [480, 160]
        ].forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = textHex;
        ctx.font = 'bold 74px "PingFang TC", "Noto Serif TC", "Heiti TC", "Microsoft JhengHei", serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text || "", 256, 98);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.encoding = THREE.sRGBEncoding;
      return tex;
    }

    _buildIslandWelcomeGate(group, island, theme, heightFn, prof, occ = []) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const gateZ = (prof && prof.gateZ) || 11.4;
      const gateY = heightFn ? heightFn(0, gateZ) : this._evalIslandHeight(island, 0, gateZ, 0);
      const gate = new THREE.Group();
      gate.position.set(0, gateY, gateZ);

      const primaryMat = this._makeToonMat({ color: island.colors.primary || "#d9534f" });
      const stoneMat = this._makeToonMat({ color: "#f4ece0", map: env.plaza });
      const pearlMat = this._makeToonMat({ color: "#f2f6fc", map: env.plaza });
      const darkWoodMat = this._makeToonMat({
        color: island.id === "chinese" ? "#5c3329" : "#785a44",
        map: env.wood
      });
      const goldMat = this._makeToonMat({ color: "#ffd32a", emissive: "#d97706", emissiveIntensity: 0.22 });
      const glowMat = this._disableOutline(new THREE.MeshBasicMaterial({
        color: island.id === "listening" ? "#38bdf8" : "#fef08a"
      }));
      this.nightGlowMaterials.push(glowMat);

      const spanX = 3.55;
      const colH = 4.55;
      [-spanX, spanX].forEach((px) => {
        const baseMat = island.id === "listening" ? pearlMat : stoneMat;
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.45, 0.84), baseMat);
        plinth.position.set(px, 0.22, 0);
        const pillarMat = island.id === "chinese" ? primaryMat : island.id === "listening" ? pearlMat : stoneMat;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.27, colH, 12), pillarMat);
        pillar.position.set(px, 0.45 + colH * 0.5, 0);
        pillar.castShadow = true;
        gate.add(plinth, pillar);

        // 門柱暖光宮燈／壁燈
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.1), goldMat);
        arm.position.set(px + (px < 0 ? 0.28 : -0.28), 3.3, 0);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), glowMat);
        lamp.position.set(px + (px < 0 ? 0.42 : -0.42), 3.15, 0);
        gate.add(arm, lamp);

        this._addCircleCollider(island.position.x + px, island.position.z + gateZ, 0.44, gateY + 6.0);
      });

      const plaqueCfgMap = {
        chinese: { text: "國文閣", bg: "#7f1d1d", border: "#f59e0b", txt: "#fef3c7" },
        english: { text: "英文神社", bg: "#991b1b", border: "#fbbf24", txt: "#fffbeb" },
        listening: { text: "星海聽音閣", bg: "#1e3a8a", border: "#38bdf8", txt: "#e0f2fe" },
        geography: { text: "山海地理館", bg: "#78350f", border: "#f59e0b", txt: "#fef3c7" },
        civics: { text: "公民雅典殿", bg: "#0f766e", border: "#fbbf24", txt: "#f0fdfa" },
        history: { text: "歷史時光殿", bg: "#475569", border: "#fbbf24", txt: "#fefce8" }
      };
      const addPlaque = (py, pw = 2.05, ph = 0.72) => {
        const cfg = plaqueCfgMap[island.id] || plaqueCfgMap.chinese;
        const pTex = this._createPlaqueTex(cfg.text, cfg.bg, cfg.border, cfg.txt);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.14, ph + 0.12, 0.24), goldMat);
        frame.position.set(0, py, 0);
        const faceMat = this._makeToonMat({ color: "#ffffff", map: pTex });
        const faceF = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), faceMat);
        faceF.position.set(0, py, 0.13);
        const faceB = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), faceMat);
        faceB.rotation.y = Math.PI;
        faceB.position.set(0, py, -0.13);
        gate.add(frame, faceF, faceB);
      };

      if (island.id === "chinese") {
        // 中式重簷廡殿牌坊 ＋ 金頂脊飾 ＋ 書法題字牌匾
        const nuki = new THREE.Mesh(new THREE.BoxGeometry(spanX * 2 + 0.85, 0.22, 0.26), primaryMat);
        nuki.position.y = colH + 0.14;
        const ridge = new THREE.Mesh(new THREE.BoxGeometry(spanX * 2 + 1.85, 0.22, 0.56), darkWoodMat);
        ridge.position.y = colH + 0.62;
        [-1, 1].forEach((side) => {
          const wingEave = new THREE.Mesh(new THREE.BoxGeometry(spanX + 0.8, 0.18, 0.72), darkWoodMat);
          wingEave.position.set(side * (spanX * 0.52), colH + 0.74, 0);
          wingEave.rotation.z = side * 0.12;
          const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), goldMat);
          finial.position.set(side * (spanX + 0.92), colH + 0.96, 0);
          gate.add(wingEave, finial);
        });
        gate.add(nuki, ridge);
        addPlaque(colH + 0.14, 2.05, 0.72);
      } else if (island.id === "english") {
        // 和風輕石門楣 ＋ 金色注連繩裝飾 ＋ 題字神社牌匾（位於千本鳥居後方，視覺井然有序）
        const stoneBeam = new THREE.Mesh(new THREE.BoxGeometry(spanX * 2 + 0.9, 0.30, 0.42), stoneMat);
        stoneBeam.position.y = colH + 0.20;
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, spanX * 2 + 0.3, 10), goldMat);
        rope.rotation.z = Math.PI / 2;
        rope.position.y = colH + 0.54;
        const paperMat = this._makeToonMat({ color: "#ffffff" });
        [-1.8, -0.9, 0.9, 1.8].forEach((sx) => {
          const shide = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 0.04), paperMat);
          shide.position.set(sx, colH + 0.36, 0.18);
          shide.rotation.z = sx < 0 ? 0.15 : -0.15;
          gate.add(shide);
        });
        gate.add(stoneBeam, rope);
        addPlaque(colH + 0.22, 2.15, 0.72);
      } else if (island.id === "listening") {
        // 珍珠白大理石柱 ＋ 雙層發光藍金星海音波拱門 ＋ 「星海聽音閣」牌匾
        const beam = new THREE.Mesh(new THREE.BoxGeometry(spanX * 2 + 0.75, 0.28, 0.38), pearlMat);
        beam.position.y = colH + 0.24;
        const neonArcOuter = new THREE.Mesh(new THREE.TorusGeometry(spanX * 0.88, 0.09, 8, 32, Math.PI), glowMat);
        neonArcOuter.position.y = colH + 0.32;
        const goldArcInner = new THREE.Mesh(new THREE.TorusGeometry(spanX * 0.58, 0.06, 8, 24, Math.PI), goldMat);
        goldArcInner.position.y = colH + 0.32;
        const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), goldMat);
        crest.position.y = colH + spanX * 0.88 + 0.46;
        gate.add(beam, neonArcOuter, goldArcInner, crest);
        addPlaque(colH + 0.24, 2.25, 0.72);
      } else if (island.id === "geography") {
        // 探險石木混構門楣 ＋ 削角石簷 ＋ 旋轉金色羅盤 ＋ 「山海地理館」牌匾
        const beam = new THREE.Mesh(new THREE.BoxGeometry(spanX * 2 + 1.0, 0.34, 0.44), darkWoodMat);
        beam.position.y = colH + 0.26;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(spanX * 2 + 1.35, 0.18, 0.58), stoneMat);
        cap.position.y = colH + 0.54;
        const compass = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), goldMat);
        compass.position.y = colH + 1.08;
        this.ambientUpdaters.push((t) => { compass.rotation.y = t * 1.1; });
        gate.add(beam, cap, compass);
        addPlaque(colH + 0.26, 2.25, 0.72);
      } else {
        // 歷史／公民古典大理石凱旋三角山牆拱門 ＋ 「公民雅典殿」／「歷史時光殿」牌匾
        const beam = new THREE.Mesh(new THREE.BoxGeometry(spanX * 2 + 0.9, 0.32, 0.46), stoneMat);
        beam.position.y = colH + 0.26;
        [-1, 1].forEach((side) => {
          const wing = new THREE.Mesh(new THREE.BoxGeometry(spanX + 0.7, 0.24, 0.54), stoneMat);
          wing.position.set(side * (spanX * 0.48), colH + 0.82, 0);
          wing.rotation.z = -side * 0.26;
          gate.add(wing);
        });
        const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), goldMat);
        emblem.position.y = colH + 1.48;
        gate.add(beam, emblem);
        addPlaque(colH + 0.26, 2.25, 0.72);
      }

      group.add(gate);
    }

    _buildHillStairs(group, island, prof) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const stairGroup = new THREE.Group();
      const p = prof || this._getIslandProfile(island);
      const stepCount = 14;
      const startZ = 5.4;
      const endZ = 1.6;
      const startY = p.platY;
      const endY = p.sanctY;
      const stepMat = this._makeToonMat({ color: "#f5ede0", map: env.plaza });
      const railStoneMat = this._makeToonMat({ color: "#eae0cf", map: env.plaza });
      const trimMat = this._makeToonMat({ color: island.colors.primary || "#8f2130" });
      const lanternGlow = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#fef08a" }));
      this.nightGlowMaterials.push(lanternGlow);

      for (let i = 0; i < stepCount; i++) {
        const t = (i + 0.5) / stepCount;
        const stepH = 0.16;
        const step = new THREE.Mesh(new THREE.BoxGeometry(4.6, stepH, 0.42), stepMat);
        step.position.set(0, startY + t * (endY - startY) - stepH * 0.35, startZ + t * (endZ - startZ));
        step.receiveShadow = true;
        stairGroup.add(step);
      }

      const railLen = Math.hypot(startZ - endZ, endY - startY) + 0.25;
      [-2.42, 2.42].forEach((rx) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, railLen), railStoneMat);
        rail.position.set(rx, (startY + endY) * 0.5 + 0.24, (startZ + endZ) * 0.5);
        rail.rotation.x = Math.atan2(endY - startY, startZ - endZ);
        stairGroup.add(rail);

        [startZ + 0.15, endZ - 0.1].forEach((pz, pIdx) => {
          const baseY = pIdx === 0 ? startY : endY;
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.92, 0.38), railStoneMat);
          post.position.set(rx, baseY + 0.46, pz);
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), lanternGlow);
          cap.position.set(rx, baseY + 1.02, pz);
          const band = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.42), trimMat);
          band.position.set(rx, baseY + 0.78, pz);
          stairGroup.add(post, band, cap);
        });
      });
      group.add(stairGroup);
    }

    _buildWaterfall(group, x, z, topY = 5.8, botY = 4.5) {
      const THREE = window.THREE;
      const wfGroup = new THREE.Group();
      wfGroup.position.set(x, botY, z);
      const dropH = Math.max(0.8, topY - botY);

      const streamMat = this._disableOutline(
        new THREE.MeshBasicMaterial({
          color: "#7dd3fc",
          transparent: true,
          opacity: 0.76
        })
      );
      const stream = new THREE.Mesh(new THREE.BoxGeometry(1.15, dropH + 0.25, 0.28), streamMat);
      stream.position.y = dropH * 0.5;
      stream.rotation.y = -0.35;
      stream.rotation.x = 0.22;
      wfGroup.add(stream);

      const splashPool = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.22, 0.14, 16),
        this._disableOutline(new THREE.MeshBasicMaterial({ color: "#bae6fd", transparent: true, opacity: 0.72 }))
      );
      splashPool.position.set(0.15, 0.04, 0.32);
      wfGroup.add(splashPool);

      const foams = [];
      for (let i = 0; i < 6; i++) {
        const f = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 8),
          this._disableOutline(new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.82 }))
        );
        wfGroup.add(f);
        foams.push(f);
      }

      this.ambientUpdaters.push((t) => {
        foams.forEach((f, i) => {
          const c = (t * 1.6 + i / 6) % 1;
          f.position.set(((i % 3) - 1) * 0.28 + 0.15, Math.sin(c * Math.PI) * 0.38, 0.22 + c * 0.45);
          f.scale.setScalar(1.05 - c * 0.6);
        });
      });

      group.add(wfGroup);
    }

    _buildSubjectCottage(group, island, heightFn, occ = []) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const theme = this._getIslandTheme(island);
      const spot = this._findClearIslandSpot(island, -14.8, 6.8, 2.45, heightFn, occ);
      const hx = spot.x;
      const hz = spot.z;
      const hy = spot.y;
      const house = new THREE.Group();
      house.position.set(hx, hy, hz);
      house.rotation.y = 0.62;

      const patio = new THREE.Mesh(
        new THREE.CylinderGeometry(1.9, 2.05, 0.14, 16),
        this._makeToonMat({ color: "#f4ece0", map: env.plaza }, true)
      );
      patio.position.y = 0.04;
      house.add(patio);

      const visualSlot = new THREE.Group();
      visualSlot.position.y = 0.08;
      const fallbackGroup = new THREE.Group();
      fallbackGroup.scale.setScalar(1.24);

      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.95, 1.05),
        this._makeToonMat({ color: theme.cottageWall })
      );
      wall.position.y = 0.48;
      wall.castShadow = true;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.08, 0.72, 4),
        this._makeToonMat({ color: theme.cottageRoof })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 1.28;
      roof.castShadow = true;

      // Glass window that glows warmly at dusk & night!
      const winColor = island.id === "listening" ? "#7dd3fc" : "#bae6fd";
      const winMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: winColor }));
      this.nightGlowMaterials.push(winMat);
      const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.08), winMat);
      win1.position.set(-0.28, 0.52, 0.54);
      const win2 = win1.clone();
      win2.position.set(0.28, 0.52, 0.54);

      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.46, 0.08),
        this._makeToonMat({ color: island.id === "civics" ? "#4a9d8f" : "#9c6644" })
      );
      door.position.set(0, 0.24, 0.54);

      fallbackGroup.add(wall, roof, win1, win2, door);

      if (island.id === "chinese") {
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), this._makeToonMat({ color: "#ffd32a" }));
        finial.position.y = 1.72;
        fallbackGroup.add(finial);
      } else if (island.id === "english") {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), this._makeToonMat({ color: "#f7d060" }));
        bush.position.set(0.8, 0.24, 0.4);
        fallbackGroup.add(bush);
      } else if (island.id === "listening") {
        const neonRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 8, 20), winMat);
        neonRing.rotation.x = Math.PI / 2;
        neonRing.position.y = 0.98;
        fallbackGroup.add(neonRing);
      } else if (island.id === "civics") {
        [-0.48, 0.48].forEach((cx) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.95, 10), this._makeToonMat({ color: "#ffffff" }));
          col.position.set(cx, 0.48, 0.62);
          fallbackGroup.add(col);
        });
      } else if (island.id === "history") {
        const scrollSign = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.65, 8), this._makeToonMat({ color: "#f8c291" }));
        scrollSign.rotation.z = Math.PI / 2;
        scrollSign.position.set(0, 0.85, 0.56);
        fallbackGroup.add(scrollSign);
      }

      visualSlot.add(fallbackGroup);
      house.add(visualSlot);
      house.traverse((c) => {
        if (c.isMesh) {
          c.userData = { islandId: island.id };
          this.clickTargets.push(c);
        }
      });
      group.add(house);
      this.islandCottageSlots.push({ house, slot: visualSlot, island, winMat });
      this._addBoxCollider(island.position.x + hx, island.position.z + hz, 1.05, 0.95, 0.62, hy + 3.6);
    }

    _buildTreasureChest(group, island, heightFn, occ = []) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const cSpot = this._findClearIslandSpot(island, 15.2, 2.4, 1.45, heightFn, occ);
      const cx = cSpot.x;
      const cz = cSpot.z;
      const cy = cSpot.y;
      const chestWrap = new THREE.Group();
      chestWrap.position.set(cx, cy, cz);

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.92, 0.18, 12),
        this._makeToonMat({ color: "#f4ece0", map: env.plaza }, true)
      );
      pedestal.position.y = 0.08;
      chestWrap.add(pedestal);

      const chest = new THREE.Group();
      chest.position.y = 0.16;
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.48, 0.52),
        this._makeToonMat({ color: "#d68c59", map: env.wood })
      );
      box.position.y = 0.24;
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.74, 0.14, 0.56),
        this._makeToonMat({ color: "#ffd32a", emissive: "#d97706", emissiveIntensity: 0.2 })
      );
      trim.position.y = 0.42;
      chest.add(box, trim);
      chest.traverse((c) => {
        if (c.isMesh && island.nodes[0]) {
          c.userData = { islandId: island.id, nodeId: island.nodes[0].id, isEncounter: true, isChestProp: true };
          this.clickTargets.push(c);
        }
      });
      chestWrap.add(chest);
      group.add(chestWrap);
      this.islandChests.push({ chest, island });
      this._addBoxCollider(island.position.x + cx, island.position.z + cz, 0.52, 0.44, 0, cy + 2.4);
    }

    _buildClusteredForest(group, island, r, seed, heightFn, occ = []) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const prof = this._getIslandProfile(island);
      const theme = this._getIslandTheme(island);
      const trunkMat = this._makeToonMat(
        theme.treeStyle === "crystal"
          ? { color: "#64748b" }
          : { color: "#b5855e", map: env.wood }
      );
      const rockMat = this._makeToonMat({ color: island.id === "geography" ? "#8a7a75" : "#cfc4b4", map: env.cliffTile });
      const palette = theme.foliageColors || [island.colors.ground];

      // 沿擴大島嶼外圍草坡錯落配置林木，透過 occupied 登錄與斜率檢查完全閃避建物與學習站
      const spots = [
        [-16.4, 0.8],
        [-15.8, -6.2],
        [-12.6, -14.6],
        [-5.8, -17.6],
        [5.8, -17.6],
        [12.2, -14.4],
        [-13.2, 12.0],
        [16.2, 7.6],
        [-16.6, -11.4],
        [15.8, -6.4]
      ];
      spots.forEach(([rawTx, rawTz], idx) => {
        const safeTree = this._findClearIslandSpot(island, rawTx, rawTz, 1.55, heightFn, occ, -0.5);
        if (safeTree.noSpace) return;
        const tx = safeTree.x;
        const tz = safeTree.z;
        const treeSlope = heightFn
          ? Math.abs(heightFn(tx + 0.5, tz) - heightFn(tx - 0.5, tz)) + Math.abs(heightFn(tx, tz + 0.5) - heightFn(tx, tz - 0.5))
          : 0;
        if (Math.hypot(tx / 10.6, (tz + 7.8) / 8.8) < 1.05 || safeTree.y < prof.platY - 0.5 || treeSlope > 0.72) {
          if (Array.isArray(occ) && occ.length) occ.pop();
          return;
        }
        const tree = new THREE.Group();
        const visualSlot = new THREE.Group();
        const scale = 0.92 + ((idx + Math.floor(seed)) % 3) * 0.22;
        const leafColor = palette[idx % palette.length];
        const leafMat = this._makeToonMat({ color: leafColor });

        if (theme.treeStyle === "ice_lava" && idx < 3) {
          const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.75, 0),
            rockMat
          );
          rock.position.y = 0.42;
          rock.rotation.set(idx, idx * 0.6, 0);
          const magmaVein = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 8, 8),
            this._disableOutline(new THREE.MeshBasicMaterial({ color: "#ff784f" }))
          );
          magmaVein.position.y = 0.65;
          visualSlot.add(rock, magmaVein);
        } else if (theme.treeStyle === "cypress") {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.55, 8), trunkMat);
          trunk.position.y = 0.28;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.65, 12), leafMat);
          cone.position.y = 1.18;
          cone.castShadow = true;
          visualSlot.add(trunk, cone);
          this.islandTreeSlots.push({ slot: visualSlot, isPine: false, tint: leafColor });
        } else if (theme.treeStyle === "ice_lava") {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 0.65, 8), trunkMat);
          trunk.position.y = 0.32;
          const tier1 = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.85, 10), this._makeToonMat({ color: "#4d9189" }));
          tier1.position.y = 0.92;
          const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.72, 10), this._makeToonMat({ color: "#e6f6f8" }));
          tier2.position.y = 1.38;
          visualSlot.add(trunk, tier1, tier2);
          this.islandTreeSlots.push({ slot: visualSlot, isPine: true, tint: leafColor });
        } else if (theme.treeStyle === "crystal") {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.65, 8), trunkMat);
          trunk.position.y = 0.32;
          const prism = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.62, 0),
            this._makeToonMat({ color: leafColor, emissive: leafColor, emissiveIntensity: 0.16 })
          );
          prism.position.y = 1.22;
          prism.scale.set(0.95, 1.32, 0.95);
          visualSlot.add(trunk, prism);
          this.islandTreeSlots.push({ slot: visualSlot, isPine: false, tint: leafColor });
        } else {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.82, 10), trunkMat);
          trunk.position.y = 0.4;
          const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 1), leafMat);
          crown.position.y = 1.26;
          crown.scale.set(1.12, 0.92, 1.12);
          crown.rotation.y = idx * 0.9;
          crown.castShadow = true;
          visualSlot.add(trunk, crown);
          if (theme.treeStyle === "cherry" || theme.treeStyle === "ginkgo") {
            const sub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), leafMat);
            sub.position.set(0.38, 1.05, 0.22);
            visualSlot.add(sub);
          }
          this.islandTreeSlots.push({ slot: visualSlot, isPine: false, tint: leafColor });
        }

        // 樹下伴生自然山石，消除「樹幹直接插在地板」的突兀感
        const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), rockMat);
        boulder.scale.set(1.2, 0.72, 1.0);
        boulder.position.set(0.42, 0.16, 0.28);
        boulder.rotation.set(0.2, idx, 0.1);
        tree.add(visualSlot, boulder);
        tree.scale.setScalar(scale);
        const ty = heightFn ? heightFn(tx, tz) - 0.04 : prof.platY - 0.04;
        tree.position.set(tx, ty, tz);
        group.add(tree);
        this._addCircleCollider(island.position.x + tx, island.position.z + tz, 0.48 * scale, ty + 3.2);
      });
    }

    _buildWalkingPath(group, island, r, seed, heightFn, resolvedAlcoves, occ = []) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const prof = this._getIslandProfile(island);
      const alcoves = resolvedAlcoves || this._resolveIslandAlcoves(island, heightFn, occ);
      const waypoints = [];

      island.nodes.forEach((node, idx) => {
        const slot = alcoves[idx % alcoves.length];
        const nx = slot.x;
        const nz = slot.z;
        const ny = heightFn ? heightFn(nx, nz) : prof.platY;
        const nodeAngle = Math.atan2(nz, nx);
        this._buildNodeBeacon(group, island, node, nx, ny, nz, slot.face);
        this._addCircleCollider(island.position.x + nx, island.position.z + nz, 0.64, ny + 3.0);
        waypoints.push({ x: nx, z: nz, angle: nodeAngle, face: slot.face, nodeId: node.id, kind: "node" });
        this.interactableSpots.push({
          type: "node",
          kind: "node",
          islandId: island.id,
          nodeId: node.id,
          label: `🏫 自強學習站：${node.title}`,
          x: island.position.x + nx,
          z: island.position.z + nz
        });

        // 遇點郵筒整齊配置於擴大中軸大道兩側，穿插陶盆小花增添大道律動（位置已於前置清單登錄）
        const side = idx % 2 === 0 ? -1 : 1;
        const ex = side * 3.55;
        const ez = 8.4 - Math.floor(idx / 2) * 3.4;
        const ey = heightFn ? heightFn(ex, ez) : prof.platY;
        if (idx % 2 === 0) {
          const potX = ex + side * 0.62;
          const potZ = ez + 0.32;
          const potY = heightFn ? heightFn(potX, potZ) : ey;
          const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.13, 0.24, 8),
            this._makeToonMat({ color: "#c26d48", map: env.cliffTile }, true)
          );
          pot.position.set(potX, potY + 0.12, potZ);
          const bush = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.22, 0),
            this._makeToonMat({ color: "#5fa862" })
          );
          bush.position.set(potX, potY + 0.30, potZ);
          const bloomCol = (island.colors && island.colors.primary) || "#f472b6";
          const bloom = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 7, 7),
            this._makeToonMat({ color: bloomCol })
          );
          bloom.position.set(potX + 0.04, potY + 0.44, potZ);
          group.add(pot, bush, bloom);
        }
        const mailbox = new THREE.Group();
        mailbox.position.set(ex, ey, ez);
        const mPad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.48, 0.1, 10),
          this._makeToonMat({ color: "#f4ece0", map: env.plaza }, true)
        );
        mPad.position.y = 0.04;
        const mPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.62, 8),
          this._makeToonMat({ color: "#475569" })
        );
        mPost.position.y = 0.35;
        const mBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.28, 0.26),
          this._makeToonMat({ color: "#fbbf24", emissive: "#d97706", emissiveIntensity: 0.3 })
        );
        mBox.position.y = 0.72;
        const mTop = new THREE.Mesh(
          new THREE.ConeGeometry(0.24, 0.16, 4),
          this._makeToonMat({ color: "#b91c1c" })
        );
        mTop.rotation.y = Math.PI / 4;
        mTop.position.y = 0.92;
        mailbox.add(mPad, mPost, mBox, mTop);
        mailbox.traverse((c) => {
          if (c.isMesh) {
            c.userData = { islandId: island.id, nodeId: node.id, isEncounter: true, isMailboxProp: true };
            this.clickTargets.push(c);
          }
        });
        group.add(mailbox);
        const encFace = side < 0 ? Math.PI * 0.42 : -Math.PI * 0.42;
        this.encounterMailboxes.push({
          mailbox,
          islandId: island.id,
          nodeId: node.id,
          rotY: encFace
        });

        waypoints.push({ x: ex, z: ez, angle: Math.atan2(ez, ex), face: encFace, nodeId: node.id, kind: "encounter" });
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

      this.islandPaths.set(island.id, { radius: r * 0.45, waypoints });
    }

    _buildLandmark(group, island, prof) {
      const THREE = window.THREE;
      const p = prof || this._getIslandProfile(island);
      const lmGroup = new THREE.Group();
      lmGroup.position.set(0, p.sanctY - 0.02, -7.8); // 置中於北側聖殿高台（未載入 GLB 時之備援地標）
      lmGroup.scale.setScalar(1.65);

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

    _buildIslandGrowthProps(group, island, r, seed, heightFn, prof, occ = []) {
      const THREE = window.THREE;
      const p = prof || this._getIslandProfile(island);
      const growthRoot = new THREE.Group();
      const theme = this._getIslandTheme(island);

      // Stage 1 (>=33%): 低矮貼地花叢與飛舞粉彩蝴蝶
      const stage1 = new THREE.Group();
      stage1.visible = false;
      const stemMat = this._makeToonMat({ color: "#65a35e" });
      const bloomCols = theme.foliageColors || ["#f9b4c4", "#ffd32a", "#a7f3d0"];
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + seed * 0.45;
        const rad = r * (0.44 + (i % 3) * 0.1);
        const fx = Math.cos(ang) * rad;
        const fz = Math.sin(ang) * rad;
        if (Math.abs(fx) < 3.6 && fz > -5.5) continue;
        if (Math.hypot(fx / 10.6, (fz + 7.8) / 8.8) < 1.02) continue;
        let blocked = false;
        for (let oi = 0; oi < occ.length; oi++) {
          if (Math.hypot(fx - occ[oi].x, fz - occ[oi].z) < occ[oi].r + 0.85) { blocked = true; break; }
        }
        if (blocked) continue;
        const fy = heightFn ? heightFn(fx, fz) : p.platY;
        if (fy < p.platY - 0.5) continue;
        const fl = new THREE.Group();
        const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.06, 7), stemMat);
        leaf.position.y = 0.03;
        const petalMat = this._makeToonMat({ color: bloomCols[i % bloomCols.length] });
        for (let pt = 0; pt < 3; pt++) {
          const pa = (pt / 3) * Math.PI * 2;
          const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), petalMat);
          blossom.position.set(Math.cos(pa) * 0.12, 0.12, Math.sin(pa) * 0.12);
          fl.add(blossom);
        }
        fl.add(leaf);
        fl.position.set(fx, fy, fz);
        stage1.add(fl);
      }
      const butterflies = [];
      for (let b = 0; b < 3; b++) {
        const bf = new THREE.Group();
        const wingMat = this._makeToonMat({ color: b % 2 === 0 ? "#fde047" : "#f9a8d4", side: THREE.DoubleSide });
        const wL = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.2), wingMat);
        wL.position.x = -0.12;
        const wR = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.2), wingMat);
        wR.position.x = 0.12;
        bf.add(wL, wR);
        stage1.add(bf);
        butterflies.push({ bf, wL, wR, ph: b * 2.1 + seed });
      }
      this.ambientUpdaters.push((t) => {
        if (!stage1.visible) return;
        butterflies.forEach((entry, idx) => {
          const a = t * 0.85 + entry.ph;
          entry.bf.position.set(Math.cos(a) * (4.0 + idx * 1.5), p.platY + 1.25 + Math.sin(t * 2.6 + entry.ph) * 0.35, Math.sin(a) * (4.0 + idx * 1.5));
          entry.bf.rotation.y = -a;
          const flap = Math.sin(t * 14 + entry.ph) * 0.75;
          entry.wL.rotation.y = flap;
          entry.wR.rotation.y = -flap;
        });
      });

      // Stage 2 (>=66%): 沿園區與參道點亮的暖光庭園燈柱
      const stage2 = new THREE.Group();
      stage2.visible = false;
      const postMat = this._makeToonMat({ color: "#8d6346" });
      [
        [-3.3, 9.2], [3.3, 9.2],
        [-3.3, 4.4], [3.3, 4.4],
        [-8.8, 5.4], [9.2, 5.4]
      ].forEach(([rawLx, rawLz], idx) => {
        let lx = rawLx;
        let lz = rawLz;
        let ly = heightFn ? heightFn(lx, lz) : p.platY;
        if (idx >= 4) {
          const spot = this._findClearIslandSpot(island, rawLx, rawLz, 0.75, heightFn, occ, -0.45);
          lx = spot.x;
          lz = spot.z;
          ly = spot.y;
        }
        const lantern = new THREE.Group();
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.25, 8), postMat);
        post.position.y = 0.62;
        const glowMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#fef08a" }));
        this.nightGlowMaterials.push(glowMat);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), glowMat);
        orb.position.y = 1.32;
        lantern.add(post, orb);
        lantern.position.set(lx, ly, lz);
        stage2.add(lantern);
      });

      // Stage 3 (100% conquered): 中軸大石階頂端慶典彩旗拱門
      const stage3 = new THREE.Group();
      stage3.visible = false;
      const archPillarMat = this._makeToonMat({ color: island.colors.primary || "#e07a5f" });
      [-2.55, 2.55].forEach((ax) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 3.2, 10), archPillarMat);
        col.position.set(ax, p.sanctY + 1.6, 1.6);
        stage3.add(col);
      });
      const beam = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.24, 0.24), this._makeToonMat({ color: "#ffd32a" }));
      beam.position.set(0, p.sanctY + 3.27, 1.6);
      stage3.add(beam);
      for (let pn = 0; pn < 7; pn++) {
        const pen = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.38, 4),
          this._makeToonMat({ color: pn % 2 === 0 ? "#ff8ab4" : "#38bdf8" })
        );
        pen.rotation.x = Math.PI;
        pen.position.set(-1.65 + pn * 0.55, p.sanctY + 3.0, 1.6);
        stage3.add(pen);
      }

      growthRoot.add(stage1, stage2, stage3);
      group.add(growthRoot);
      this.islandGrowthGroups.set(island.id, { stage1, stage2, stage3 });
    }

    _buildLighthouse(group, island, heightFn, occ = []) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const lSpot = this._findClearIslandSpot(island, 15.2, -9.2, 1.85, heightFn, occ);
      const lx = lSpot.x;
      const lz = lSpot.z;
      const ly = lSpot.y;
      const lhGroup = new THREE.Group();
      lhGroup.position.set(lx, ly, lz);

      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(1.18, 1.38, 0.16, 14),
        this._makeToonMat({ color: "#f4ece0", map: env.plaza }, true)
      );
      plinth.position.y = 0.06;
      lhGroup.add(plinth);

      const visualSlot = new THREE.Group();
      visualSlot.position.y = 0.1;
      const fallbackModel = new THREE.Group();
      fallbackModel.scale.setScalar(1.62);

      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.52, 2.3, 16),
        this._makeToonMat({ color: "#f8f9fa" })
      );
      body.position.y = 1.15;
      body.castShadow = true;

      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39, 0.45, 0.65, 16),
        this._makeToonMat({ color: island.colors.primary })
      );
      stripe.position.y = 1.2;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 0.5, 16),
        this._makeToonMat({ color: island.colors.primary })
      );
      roof.position.y = 3.0;

      fallbackModel.add(body, stripe, roof);
      visualSlot.add(fallbackModel);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 14, 14),
        this._disableOutline(new THREE.MeshBasicMaterial({ color: "#7f8c8d" }))
      );
      bulb.position.y = 4.38;

      const beamGeo = new THREE.CylinderGeometry(0.24, 2.2, 11.5, 16, 1, true);
      const beamMat = this._disableOutline(
        new THREE.MeshBasicMaterial({
          color: "#ffeaa7",
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 9.9;

      lhGroup.add(visualSlot, bulb, beam);
      lhGroup.traverse((child) => {
        if (child.isMesh && child !== beam) {
          child.userData = { islandId: island.id };
          this.clickTargets.push(child);
        }
      });

      group.add(lhGroup);
      this.lighthouseMeshes.set(island.id, { beam, bulb });
      this.islandLighthouseSlots.push({ lhGroup, slot: visualSlot, island });
      this._addCircleCollider(island.position.x + lx, island.position.z + lz, 0.88, ly + 5.8);
    }

    _buildNodeBeacon(group, island, node, x, y, z, faceRotY = 0) {
      const THREE = window.THREE;
      const env = this._getEnvTextures();
      const islandId = island.id;
      const accentHex = (island.colors && island.colors.primary) || "#f59e0b";
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, y, z);
      nodeGroup.rotation.y = faceRotY || 0;

      // 原神／星鐵風：雙層圓石庭院台基 ＋ 符文金邊環（手繪石磚 + 手繪岩壁材質）
      const stoneMat = this._makeToonMat({ color: "#f5ede0", map: env.plaza }, true);
      const wallStoneMat = this._makeToonMat({ color: "#e2d5c1", map: env.cliffTile }, true);
      const trimMat = this._makeToonMat({ color: accentHex }, true);

      const terrace = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.56, 0.14, 24), stoneMat);
      terrace.position.y = 0.07;
      terrace.receiveShadow = true;
      terrace.userData = { islandId, nodeId: node.id };
      nodeGroup.add(terrace);
      this.clickTargets.push(terrace);

      const runeRing = new THREE.Mesh(
        new THREE.RingGeometry(1.16, 1.26, 28),
        this._disableOutline(new THREE.MeshBasicMaterial({
          color: accentHex,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide
        }))
      );
      runeRing.rotation.x = -Math.PI / 2;
      runeRing.position.y = 0.145;
      nodeGroup.add(runeRing);

      // 半圍合石砌矮牆弧牆（背後與左右，正向留給學生走進書桌）
      const halfWall = new THREE.Mesh(
        new THREE.TorusGeometry(1.36, 0.17, 7, 18, Math.PI),
        wallStoneMat
      );
      halfWall.rotation.x = -Math.PI / 2;
      halfWall.position.y = 0.24;
      nodeGroup.add(halfWall);

      const wallCap = new THREE.Mesh(
        new THREE.TorusGeometry(1.36, 0.19, 6, 18, Math.PI),
        trimMat
      );
      wallCap.rotation.x = -Math.PI / 2;
      wallCap.position.y = 0.42;
      wallCap.scale.set(1, 1, 0.45);
      nodeGroup.add(wallCap);

      // 兩側低矮庭園灌木與左後方石燈籠
      const shrubMat = this._makeToonMat({ color: "#68b36b" }, true);
      [-1.18, 1.18].forEach((sx) => {
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), shrubMat);
        bush.scale.set(1.15, 0.78, 1.0);
        bush.position.set(sx, 0.22, -0.32);
        nodeGroup.add(bush);
      });

      const lanternGlowMat = this._disableOutline(new THREE.MeshBasicMaterial({ color: "#fef08a" }));
      this.nightGlowMaterials.push(lanternGlowMat);
      const lPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.56, 8), wallStoneMat);
      lPillar.position.set(-0.92, 0.4, -0.58);
      const lOrb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), lanternGlowMat);
      lOrb.position.set(-0.92, 0.76, -0.58);
      const lCap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.14, 4), trimMat);
      lCap.rotation.y = Math.PI / 4;
      lCap.position.set(-0.92, 0.92, -0.58);
      nodeGroup.add(lPillar, lOrb, lCap);

      // 書案視覺插槽（無縫載入 prop_node_desk.glb）
      const deskSlot = new THREE.Group();
      deskSlot.position.set(-0.12, 0, 0.16);
      const deskWood = this._makeToonMat({ color: "#c98548" });
      const legMat = this._makeToonMat({ color: "#5c6b7e" });
      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.56), deskWood);
      deskTop.position.set(-0.08, 0.58, 0);
      deskTop.castShadow = true;
      deskTop.userData = { islandId, nodeId: node.id };
      deskSlot.add(deskTop);
      this.clickTargets.push(deskTop);

      [[-0.44, -0.22], [0.28, -0.22], [-0.44, 0.22], [0.28, 0.22]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6), legMat);
        leg.position.set(lx, 0.36, lz);
        deskSlot.add(leg);
      });

      const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.22), this._makeToonMat({ color: "#e07a5f" }));
      book1.position.set(-0.24, 0.66, 0.02);
      book1.rotation.y = 0.18;
      const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.2), this._makeToonMat({ color: "#6c8cd5" }));
      book2.position.set(-0.22, 0.72, 0.02);
      deskSlot.add(book1, book2);
      nodeGroup.add(deskSlot);
      this.nodeDeskSlots.push({ slot: deskSlot, islandId, nodeId: node.id });

      // 右後方：星鐵／原神「界域傳送錨點方尖碑」＋ 懸浮發光旋轉菱晶 (.crystal) ＋ 環形星軌
      const obeliskX = 0.78;
      const obeliskZ = -0.52;
      const obeliskBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.24, 6), wallStoneMat);
      obeliskBase.position.set(obeliskX, 0.24, obeliskZ);
      const obeliskShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 1.12, 6), stoneMat);
      obeliskShaft.position.set(obeliskX, 0.9, obeliskZ);
      obeliskShaft.castShadow = true;
      obeliskShaft.userData = { islandId, nodeId: node.id };
      this.clickTargets.push(obeliskShaft);

      const crystalMat = this._makeToonMat({
        color: "#7f8fa6",
        emissive: "#000000"
      });
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), crystalMat);
      crystal.scale.set(0.86, 1.42, 0.86);
      crystal.position.set(obeliskX, 1.85, obeliskZ);
      crystal.castShadow = true;
      crystal.userData = { islandId, nodeId: node.id };
      this.clickTargets.push(crystal);

      const orbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.03, 8, 22),
        this._disableOutline(new THREE.MeshBasicMaterial({ color: "#fde047", transparent: true, opacity: 0.75 }))
      );
      orbitRing.position.set(obeliskX, 1.85, obeliskZ);
      orbitRing.rotation.x = Math.PI * 0.34;
      nodeGroup.add(obeliskBase, obeliskShaft, crystal, orbitRing);

      const phase = Math.random() * Math.PI * 2;
      this.ambientUpdaters.push((t) => {
        orbitRing.rotation.z = t * 1.4 + phase;
        orbitRing.position.y = 1.85 + Math.sin(t * 2.4 + phase) * 0.13;
      });

      // 錨點側翼精巧學院錦旗（保留 .flag / .topperMat 進度升級聯動）
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.045, 1.75, 8),
        this._makeToonMat({ color: "#f8fafc" })
      );
      pole.position.set(1.06, 0.96, -0.32);
      nodeGroup.add(pole);

      const topperMat = this._makeToonMat({ color: "#95a5a6" });
      const topperGroup = new THREE.Group();
      topperGroup.position.set(1.06, 1.9, -0.32);
      const tHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), topperMat);
      topperGroup.add(tHead);
      nodeGroup.add(topperGroup);

      const flagMat = this._makeToonMat({ color: "#7f8fa6", side: THREE.DoubleSide });
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.04), flagMat);
      flag.position.set(1.36, 0.72, -0.32);
      flag.userData = { islandId, nodeId: node.id };
      nodeGroup.add(flag);
      this.clickTargets.push(flag);

      group.add(nodeGroup);
      this.nodeMeshes.set(node.id, {
        crystal,
        flag,
        topperMat,
        baseY: 1.85,
        phase,
        angle: Math.atan2(z, x)
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

      const boatVisualGroup = new THREE.Group();
      boatVisualGroup.add(hull, bow, mast, sail, lantern);
      this.boatVisualGroup = boatVisualGroup;

      boat.add(boatVisualGroup, captain.group);
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

      // Dynamic surfboard shown automatically when Panther crosses ocean waters (hot-swapped with surfboard_3d.glb)
      const surfboard = new THREE.Group();
      const boardGeo = new THREE.CylinderGeometry(0.46, 0.36, 2.2, 16);
      boardGeo.rotateX(Math.PI / 2);
      boardGeo.scale(1.0, 0.14, 1.0);
      const boardMat = new THREE.MeshStandardMaterial({ color: "#fdf6e3", roughness: 0.28, metalness: 0.06 });
      const boardMesh = new THREE.Mesh(boardGeo, boardMat);
      boardMesh.position.y = 0.06;
      boardMesh.castShadow = true;
      const stripeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.04, 2.0),
        new THREE.MeshStandardMaterial({ color: "#8f2130", roughness: 0.35 })
      );
      stripeMesh.position.y = 0.1;
      const finMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.24, 0.32),
        new THREE.MeshStandardMaterial({ color: "#38bdf8", roughness: 0.3 })
      );
      finMesh.position.set(0, -0.08, -0.78);
      surfboard.add(boardMesh, stripeMesh, finMesh);
      surfboard.scale.setScalar(0.65);
      surfboard.visible = false;
      group.add(surfboard);

      // 1. Primary True 360° Volumetric 3D Chibi Nanshan Panther Mesh
      const pantherParts = this._build3DPantherMesh(ps.sex);
      const meshHolder = pantherParts.root;
      meshHolder.scale.setScalar(0.52);
      meshHolder.traverse((c) => {
        if (c.isMesh) this.clickTargets.push(c);
      });
      meshHolder.visible = this.pantherRenderMode === "mesh";
      group.add(meshHolder);

      // 2. Optional Higgsfield 8-direction Sprite Billboard mode
      const spriteHolder = new THREE.Group();
      const initTex = this._getPantherTexture(ps.sex, "front", 0);
      const spriteGeo = new THREE.PlaneGeometry(1.75, 2.45);
      spriteGeo.translate(0, 1.22, 0);
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
      const emoteSprite = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), emoteMat);
      emoteSprite.position.set(0, this.pantherRenderMode === "sprite" ? 2.85 : 2.1, 0.05);
      emoteSprite.visible = false;
      group.add(emoteSprite);

      this.scene.add(group);

      // Ground contact shadow independent of Y jump altitude
      const shadowMat = this._disableOutline(
        new THREE.MeshBasicMaterial({
          color: "#091322",
          transparent: true,
          opacity: 0.42,
          depthWrite: false
        })
      );
      const shadowMesh = new THREE.Mesh(new THREE.CircleGeometry(0.6, 22), shadowMat);
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

      // Attached lightweight 3D props for Panther life activities (aligned via root.rotation.y = faceAngle)
      const activityPropsRoot = new THREE.Group();
      group.add(activityPropsRoot);

      // 1) Study prop: Open notebook + golden bookmark held in front
      const propStudy = new THREE.Group();
      propStudy.visible = false;
      const coverMat = new THREE.MeshStandardMaterial({ color: "#2563eb", roughness: 0.55 });
      const pageMat = new THREE.MeshStandardMaterial({ color: "#fffdf5", roughness: 0.7 });
      const bookL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.36), coverMat);
      bookL.position.set(-0.14, 0, 0);
      bookL.rotation.z = 0.22;
      const bookR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.36), coverMat);
      bookR.position.set(0.14, 0, 0);
      bookR.rotation.z = -0.22;
      const pagesL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.32), pageMat);
      pagesL.position.set(-0.13, 0.025, 0);
      pagesL.rotation.z = 0.22;
      const pagesR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.32), pageMat);
      pagesR.position.set(0.13, 0.025, 0);
      pagesR.rotation.z = -0.22;
      propStudy.position.set(0, 0.78, 0.48);
      propStudy.rotation.x = 0.42;
      propStudy.add(bookL, bookR, pagesL, pagesR);
      activityPropsRoot.add(propStudy);

      // 2) Cafe prop: Iced coffee cup + lid + straw in right paw
      const propCafe = new THREE.Group();
      propCafe.visible = false;
      const cupBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.075, 0.24, 10),
        new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.35 })
      );
      const cupCream = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.105, 0.06, 10),
        new THREE.MeshStandardMaterial({ color: "#fff8eb", roughness: 0.5 })
      );
      cupCream.position.y = 0.12;
      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6),
        new THREE.MeshBasicMaterial({ color: "#34d399" })
      );
      straw.position.set(0.02, 0.2, 0.02);
      straw.rotation.z = -0.2;
      propCafe.position.set(0.36, 0.72, 0.36);
      propCafe.add(cupBody, cupCream, straw);
      activityPropsRoot.add(propCafe);

      // 3) Fishing prop: Bamboo rod + line + bobber + water ripple ring
      const propFishing = new THREE.Group();
      propFishing.visible = false;
      const rodGroup = new THREE.Group();
      rodGroup.position.set(0.22, 0.74, 0.26);
      const rodMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.042, 1.95, 8),
        new THREE.MeshStandardMaterial({ color: "#d99b52", roughness: 0.55 })
      );
      rodMesh.rotation.x = Math.PI * 0.28;
      rodMesh.position.set(0, 0.62, 0.74);
      rodGroup.add(rodMesh);
      const lineMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 1.0, 6),
        new THREE.MeshBasicMaterial({ color: "#f8fafc", transparent: true, opacity: 0.85 })
      );
      const bobberGroup = new THREE.Group();
      bobberGroup.position.set(0, 0.2, 2.35);
      const bobTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: "#ef4444" })
      );
      const bobBot = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: "#ffffff" })
      );
      const rippleMat = new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const rippleMesh = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.32, 18), rippleMat);
      rippleMesh.rotation.x = -Math.PI / 2;
      rippleMesh.position.y = -0.02;
      bobberGroup.add(bobTop, bobBot, rippleMesh);
      propFishing.add(rodGroup, lineMesh, bobberGroup);
      activityPropsRoot.add(propFishing);

      // 4) Lounge prop: Cool shades + coconut drink
      const propLounge = new THREE.Group();
      propLounge.visible = false;
      const lensMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.18 });
      const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.04), lensMat);
      lensL.position.set(-0.11, 1.24, 0.34);
      const lensR = lensL.clone();
      lensR.position.x = 0.11;
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.04), lensMat);
      bridge.position.set(0, 1.26, 0.34);
      const coco = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 10),
        new THREE.MeshStandardMaterial({ color: "#92400e", roughness: 0.75 })
      );
      coco.position.set(0.38, 0.72, 0.32);
      const cocoStraw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6),
        new THREE.MeshBasicMaterial({ color: "#fb7185" })
      );
      cocoStraw.position.set(0.4, 0.84, 0.32);
      cocoStraw.rotation.z = -0.25;
      propLounge.add(lensL, lensR, bridge, coco, cocoStraw);
      activityPropsRoot.add(propLounge);

      // 5) Workout prop: Twin pastel kettlebells in hands
      const propWorkout = new THREE.Group();
      propWorkout.visible = false;
      const kbMatL = new THREE.MeshStandardMaterial({ color: "#fb7185", roughness: 0.4 });
      const kbMatR = new THREE.MeshStandardMaterial({ color: "#818cf8", roughness: 0.4 });
      const kbL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), kbMatL);
      kbL.position.set(-0.42, 0.58, 0.24);
      const kbR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), kbMatR);
      kbR.position.set(0.42, 0.58, 0.24);
      propWorkout.add(kbL, kbR);
      activityPropsRoot.add(propWorkout);

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
        shadowMat,
        activityProps: {
          root: activityPropsRoot,
          study: propStudy,
          cafe: propCafe,
          fishing: propFishing,
          rodGroup,
          lineMesh,
          bobberGroup,
          rippleMesh,
          rippleMat,
          lounge: propLounge,
          workout: propWorkout
        }
      };
    }

    _getBridgeCoord(x, z, island) {
      const meta = this._getIslandBridgeMeta(island);
      const proj = x * meta.dxAxis + z * meta.dzAxis;
      const signedPerp = -x * meta.dzAxis + z * meta.dxAxis;
      const t = Math.max(0, Math.min(1, (proj - meta.startDist) / Math.max(meta.endDist - meta.startDist, 0.01)));
      const bridgeY = meta.startY + (meta.endY - meta.startY) * t + Math.sin(t * Math.PI) * 1.45;
      return {
        proj,
        signedPerp,
        startDist: meta.startDist,
        endDist: meta.endDist,
        dxAxis: meta.dxAxis,
        dzAxis: meta.dzAxis,
        bridgeY
      };
    }

    _getSurfaceInfoAt(x, z, allowBridge = true) {
      const waveY = 0.22 + Math.sin(x * 0.14 + this.clockTime * 1.4) * 0.14;
      let maxGround = -Infinity;
      let onLand = false;
      let onIsland = null;
      let surfaceType = "water";
      let bridgeId = null;

      // 1. 中央自強廣場（與地形雕塑完全同一組數學公式）
      const hubH = this._evalHubHeight(x, z);
      if (hubH >= 0.25) {
        maxGround = hubH;
        onLand = true;
        surfaceType = "hub";
      }

      // 2. 跨海木橋 ＆ 六大學科島（與 _buildIsland 同 seed）
      for (let idx = 0; idx < this.islandsData.length; idx++) {
        const island = this.islandsData[idx];
        if (allowBridge) {
          const bc = this._getBridgeCoord(x, z, island);
          if (bc.proj >= bc.startDist && bc.proj <= bc.endDist && Math.abs(bc.signedPerp) <= 1.28) {
            if (bc.bridgeY >= maxGround) {
              maxGround = bc.bridgeY;
              surfaceType = "bridge";
              bridgeId = island.id;
            }
            onLand = true;
          }
        }

        const dx = x - island.position.x;
        const dz = z - island.position.z;
        const seed = idx * 1.7 + 0.4;
        let islH = -Infinity;

        const evalH = this._evalIslandHeight(island, dx, dz, seed);
        if (evalH >= 0.25) {
          islH = Math.max(islH, evalH);
        }

        if (islH > maxGround) {
          maxGround = islH;
          surfaceType = "island";
          bridgeId = null;
        }
        if (islH > -Infinity) {
          onLand = true;
          onIsland = island;
        }
      }

      if (onLand) {
        return { groundY: maxGround, onWater: false, island: onIsland, surfaceType, bridgeId };
      }
      return { groundY: waveY, onWater: true, island: null, surfaceType: "water", bridgeId: null };
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
      const tx = Math.max(-82, Math.min(82, wx));
      const tz = Math.max(-82, Math.min(82, wz));
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
      if (this.activeActivity) {
        this.stopPantherActivity(true);
        if (this.callbacks.onStopActivity) this.callbacks.onStopActivity();
      }
      const ps = this.pantherState;
      if (ps.onGround) {
        ps.jumpedFromWater = Boolean(ps.onWater);
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
      if (this.activeActivity) {
        this.stopPantherActivity(true);
        if (this.callbacks.onStopActivity) this.callbacks.onStopActivity();
      }
      const ps = this.pantherState;
      const hubY = this._getHubPlazaY();
      ps.x = 0;
      ps.z = 7.6;
      ps.groundY = hubY;
      ps.y = hubY;
      ps.vy = 0;
      ps.onGround = true;
      ps.onWater = false;
      ps.onBridgeId = null;
      ps.jumpedFromWater = false;
      ps.doubleJumped = false;
      ps.autoTarget = null;
      ps.boostTimer = 0;
      ps.faceX = 0;
      ps.faceZ = -1;
      ps.faceAngle = Math.PI;
      ps.dir = "back";
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
      if (target.type === "activity" && this.callbacks.onTriggerActivity) {
        this.callbacks.onTriggerActivity(target.activityId);
        return true;
      }
      if (target.type === "intel" && this.callbacks.onCollectIntel) {
        this.callbacks.onCollectIntel(target.intelId);
        return true;
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

    startPantherActivity(activityId, fallbackMeta = null) {
      const THREE = window.THREE;
      const st = this.activityStations ? this.activityStations.get(activityId) : null;
      const act = (st && st.act) || fallbackMeta;
      if (!act) return;

      this.stopPantherActivity(true);
      this.activeActivity = {
        id: act.id,
        type: act.type || "study",
        startedAt: this.clockTime
      };
      this.fishingBiteActive = false;

      const ps = this.pantherState;
      ps.autoTarget = null;
      ps.boostTimer = 0;
      ps.action.type = null;
      ps.action.timer = 0;

      if (st) {
        const standSurf = this._getSurfaceInfoAt(st.standX, st.standZ, false);
        ps.x = st.standX;
        ps.z = st.standZ;
        ps.groundY = standSurf.onWater ? st.groundY : standSurf.groundY;
        ps.y = ps.groundY;
        ps.vy = 0;
        ps.onGround = true;
        ps.onWater = false;
        ps.onBridgeId = null;
        ps.faceAngle = st.standFaceAngle;
        ps.faceX = Math.sin(st.standFaceAngle);
        ps.faceZ = Math.cos(st.standFaceAngle);
      }

      if (this.panther) {
        this.panther.group.position.set(ps.x, ps.y, ps.z);
        this.panther.surfboard.visible = false;
        this.panther.shadowMesh.position.set(ps.x, ps.y + 0.05, ps.z);
        const ap = this.panther.activityProps;
        if (ap) {
          ap.root.rotation.y = ps.faceAngle;
          ["study", "cafe", "fishing", "lounge", "workout"].forEach((k) => {
            if (ap[k]) ap[k].visible = k === this.activeActivity.type;
          });
        }
      }

      this._setPantherEmote(act.emote || `${act.emoji || "🐾"} ${act.name}`, 3.8);
      this._spawnPantherFX(16, ["#ffd32a", "#38bdf8", "#34d399", "#ff8ab4"], 0.4);

      if (this.isWebGL && THREE && this.camera && this.controls) {
        const ang = ps.faceAngle + (this.activeActivity.type === "fishing" ? 2.45 : 0.65);
        const dist = this.activeActivity.type === "fishing" ? 7.4 : 6.4;
        this.cameraMode = "follow";
        this.cameraTargetPos = new THREE.Vector3(
          ps.x + Math.sin(ang) * dist,
          ps.y + (this.activeActivity.type === "fishing" ? 3.8 : 3.4),
          ps.z + Math.cos(ang) * dist
        );
        this.controlsTargetPos = new THREE.Vector3(
          ps.x + ps.faceX * (this.activeActivity.type === "fishing" ? 0.85 : 0.25),
          ps.y + 0.85,
          ps.z + ps.faceZ * (this.activeActivity.type === "fishing" ? 0.85 : 0.25)
        );
        this.isTweening = true;
      }
      this._checkPantherProximity();
    }

    setFishingBite(isBiting) {
      this.fishingBiteActive = Boolean(isBiting);
      if (!this.isWebGL || !this.panther || !window.THREE) return;
      if (this.fishingBiteActive) {
        const ps = this.pantherState;
        const THREE = window.THREE;
        const bx = ps.x + Math.sin(ps.faceAngle) * 2.35;
        const bz = ps.z + Math.cos(ps.faceAngle) * 2.35;
        const bSurf = this._getSurfaceInfoAt(bx, bz, false);
        for (let i = 0; i < 16; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? "#ffffff" : "#7dd3fc",
            transparent: true,
            opacity: 1
          });
          const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), mat);
          m.position.set(bx, bSurf.groundY + 0.1, bz);
          this.scene.add(m);
          const a = Math.random() * Math.PI * 2;
          const sp = 1.1 + Math.random() * 2.2;
          this.burstParticles.push({
            mesh: m,
            mat,
            vx: Math.cos(a) * sp,
            vy: 2.0 + Math.random() * 2.6,
            vz: Math.sin(a) * sp,
            life: 0.55 + Math.random() * 0.35
          });
        }
        this._setPantherEmote("❗ 魚上鉤了！快按 Space / 收竿！", 3.2);
      }
    }

    stopPantherActivity(silent = false) {
      const had = Boolean(this.activeActivity);
      this.activeActivity = null;
      this.fishingBiteActive = false;
      if (this.panther && this.panther.activityProps) {
        const ap = this.panther.activityProps;
        ["study", "cafe", "fishing", "lounge", "workout"].forEach((k) => {
          if (ap[k]) ap[k].visible = false;
        });
      }
      if (this.panther && this.panther.pantherParts) {
        this.panther.pantherParts.bodyPivot.rotation.x = 0;
      }
      if (had && !silent) {
        this._setPantherEmote("🐾 已起身繼續冒險！", 1.5);
      }
    }

    setFocusMode(enabled) {
      const THREE = window.THREE;
      const next = Boolean(enabled);
      if (next === this.focusModeActive) return;
      this.focusModeActive = next;
      const ps = this.pantherState;
      const ap = this.panther && this.panther.activityProps;

      if (next) {
        if (this.isWebGL && THREE && this.camera && this.controls) {
          this._focusSavedPose = {
            cam: this.camera.position.clone(),
            tgt: this.controls.target.clone()
          };
          const a = ps.faceAngle + 0.52;
          this.cameraMode = "follow";
          this.cameraTargetPos = new THREE.Vector3(
            ps.x + Math.sin(a) * 4.9,
            ps.y + 2.55,
            ps.z + Math.cos(a) * 4.9
          );
          this.controlsTargetPos = new THREE.Vector3(ps.x, ps.y + 0.92, ps.z);
          this.isTweening = true;
        }
        if (ap && ap.study) {
          ["cafe", "fishing", "lounge", "workout"].forEach((k) => {
            if (ap[k]) ap[k].visible = false;
          });
          ap.study.visible = true;
        }
        this._setPantherEmote("🍅 深度專注模式啟動中…", 2.4);
      } else {
        if (ap && (!this.activeActivity || this.activeActivity.type !== "study")) {
          if (ap.study) ap.study.visible = false;
        }
        if (ap && this.activeActivity && ap[this.activeActivity.type]) {
          ap[this.activeActivity.type].visible = true;
        }
        if (this.panther && this.panther.pantherParts) {
          this.panther.pantherParts.bodyPivot.rotation.x = 0;
        }
        if (this._focusSavedPose && this.isWebGL) {
          this.cameraTargetPos = this._focusSavedPose.cam;
          this.controlsTargetPos = this._focusSavedPose.tgt;
          this.isTweening = true;
        } else {
          this.focusPanther();
        }
        this._focusSavedPose = null;
      }
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
        if (spot.type === "intel" && d < 2.15 && !this.collectedIntelSet.has(spot.intelId)) {
          this.collectedIntelSet.add(spot.intelId);
          this._spawnPantherFX(18, ["#38bdf8", "#ffd32a", "#fde047"], 0.45);
          if (this.callbacks.onCollectIntel) this.callbacks.onCollectIntel(spot.intelId);
        }
        if (d < bestDist) {
          bestDist = d;
          nextSpot = spot;
        }
      }
      if (ps.onWater) {
        this._checkOceanBuoys(ps.x, ps.z);
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

      const prevKey = this.nearInteractable
        ? `${this.nearInteractable.type}:${this.nearInteractable.islandId || ""}:${this.nearInteractable.nodeId || ""}:${this.nearInteractable.kind || ""}:${this.nearInteractable.activityId || ""}`
        : "";
      const nextKey = nextSpot
        ? `${nextSpot.type}:${nextSpot.islandId || ""}:${nextSpot.nodeId || ""}:${nextSpot.kind || ""}:${nextSpot.activityId || ""}`
        : "";
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

    _spawnWorldFX(wx, wy, wz, count, palette) {
      if (!this.isWebGL || !this.scene) return;
      const THREE = window.THREE;
      for (let i = 0; i < count; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: palette[i % palette.length],
          transparent: true,
          opacity: 1
        });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.11 + Math.random() * 0.08, 7, 7), mat);
        mesh.position.set(wx, wy, wz);
        this.scene.add(mesh);
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.4 + Math.random() * 3.2;
        this.burstParticles.push({
          mesh,
          mat,
          vx: Math.cos(ang) * spd,
          vy: 2.2 + Math.random() * 3.5,
          vz: Math.sin(ang) * spd,
          life: 0.78 + Math.random() * 0.42
        });
      }
    }

    _checkOceanBuoys(px, pz) {
      if (!this.seaBuoyGroups || !this.seaBuoyGroups.length) return;
      const total = this.seaBuoyGroups.length;
      for (let i = 0; i < total; i++) {
        const buoy = this.seaBuoyGroups[i];
        const bx = (buoy.userData && buoy.userData.x) || buoy.position.x;
        const bz = (buoy.userData && buoy.userData.z) || buoy.position.z;
        if (Math.hypot(px - bx, pz - bz) < 3.1 && !this.buoyVisited.has(i)) {
          this.buoyVisited.add(i);
          if (buoy.userData && buoy.userData.patrolRingMat) {
            buoy.userData.patrolRingMat.color.set("#34d399");
          }
          this._spawnWorldFX(bx, 0.85, bz, 16, ["#34d399", "#ffd32a", "#38bdf8"]);
          const completed = this.buoyVisited.size >= total;
          if (this.callbacks.onBuoyPatrolProgress) {
            this.callbacks.onBuoyPatrolProgress(this.buoyVisited.size, total, completed);
          }
          if (completed) {
            this.buoyRoundCount += 1;
            setTimeout(() => {
              this.buoyVisited.clear();
              if (this.seaBuoyGroups) {
                this.seaBuoyGroups.forEach((b) => {
                  if (b.userData && b.userData.patrolRingMat) {
                    b.userData.patrolRingMat.color.set("#ffd32a");
                  }
                });
              }
            }, 1800);
          }
        }
      }
    }

    showCatSpeech(targetKey, text, durationSec = 4.6) {
      if (!text) return;
      this.catSpeech = {
        key: targetKey || "hub",
        text,
        expiresAt: performance.now() + durationSec * 1000
      };
    }

    _getSpeechWorldAnchor(targetKey, outVec) {
      if (targetKey === "hub") {
        if (this.hubCatWrap) {
          outVec.set(this.hubCatWrap.position.x, this.hubCatWrap.position.y + 2.55, this.hubCatWrap.position.z);
          return true;
        }
        outVec.set(-3.8, 4.3, 4.4);
        return true;
      }
      if (targetKey === "captain" && this.boat) {
        outVec.set(this.boat.position.x, this.boat.position.y + 2.85, this.boat.position.z);
        return true;
      }
      if (targetKey === "salmon" && this.salmonCatGroup) {
        outVec.set(this.salmonCatGroup.position.x, this.salmonCatGroup.position.y + 1.9, this.salmonCatGroup.position.z);
        return true;
      }
      if (targetKey === "walker" && this.walkerCat && this.walkerCat.group && this.walkerCat.group.visible) {
        outVec.set(this.walkerCat.group.position.x, this.walkerCat.group.position.y + 2.1, this.walkerCat.group.position.z);
        return true;
      }
      if (targetKey === "panther" && this.pantherState) {
        outVec.set(this.pantherState.x, this.pantherState.y + 2.9, this.pantherState.z);
        return true;
      }
      const cat = this.islandCats && this.islandCats.get(targetKey);
      if (cat && cat.group) {
        outVec.set(cat.group.position.x, cat.group.position.y + 2.55, cat.group.position.z);
        return true;
      }
      return false;
    }

    focusIntelItem(intelId) {
      const entry = this.intelMeshes && this.intelMeshes.get(intelId);
      if (!entry) return;
      const THREE = window.THREE;
      if (this.isWebGL && THREE) {
        if (!this.intelGuideBeam) {
          const beamGroup = new THREE.Group();
          const outerRingMat = this._disableOutline(
            new THREE.MeshBasicMaterial({
              color: "#fef08a",
              transparent: true,
              opacity: 0.42,
              depthWrite: false,
              side: THREE.DoubleSide
            })
          );
          const outerRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.55, 28), outerRingMat);
          outerRing.rotation.x = -Math.PI / 2;
          outerRing.position.y = 0.06;

          const innerRingMat = this._disableOutline(
            new THREE.MeshBasicMaterial({
              color: "#ffd32a",
              transparent: true,
              opacity: 0.85,
              depthWrite: false,
              side: THREE.DoubleSide
            })
          );
          const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.65, 0.95, 28), innerRingMat);
          innerRing.rotation.x = -Math.PI / 2;
          innerRing.position.y = 0.09;

          const pointerMat = this._makeToonMat({
            color: "#ffd32a",
            emissive: "#f59e0b",
            emissiveIntensity: 0.42
          });
          const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.95, 6), pointerMat);
          pointer.rotation.x = Math.PI;
          pointer.position.y = 2.4;

          const starCount = 6;
          const spPos = new Float32Array(starCount * 3);
          for (let i = 0; i < starCount; i++) {
            const ang = (i / starCount) * Math.PI * 2;
            spPos[i * 3] = Math.cos(ang) * 0.72;
            spPos[i * 3 + 1] = 0.35 + (i % 3) * 0.65;
            spPos[i * 3 + 2] = Math.sin(ang) * 0.72;
          }
          const spGeo = new THREE.BufferGeometry();
          spGeo.setAttribute("position", new THREE.BufferAttribute(spPos, 3));
          const spMat = this._disableOutline(
            new THREE.PointsMaterial({
              color: "#fff8c6",
              map: this._getSoftGlowTex(),
              size: 0.45,
              transparent: true,
              opacity: 0.9,
              blending: THREE.AdditiveBlending,
              alphaTest: 0.01,
              depthWrite: false
            })
          );
          const sparks = new THREE.Points(spGeo, spMat);

          beamGroup.add(outerRing, innerRing, pointer, sparks);
          beamGroup.userData = { outerRing, innerRing, pointer, spGeo, starCount };
          this.scene.add(beamGroup);
          this.intelGuideBeam = beamGroup;
        }
        this.intelGuideBeam.position.set(entry.wx, entry.isOcean ? 0.12 : entry.baseY - 0.85, entry.wz);
        this.intelGuideBeam.visible = true;
        this.intelGuideUntil = (this.clockTime || 0) + 10;
      }

      if (!entry.isOcean && entry.item && entry.item.islandId) {
        this.flyToIsland(entry.item.islandId);
        this.cameraMode = "overview";
        if (this.isWebGL && THREE) {
          this.controlsTargetPos = new THREE.Vector3(entry.wx, entry.baseY + 0.35, entry.wz);
          this.cameraTargetPos = new THREE.Vector3(entry.wx + 3.6, entry.baseY + 9.8, entry.wz + 13.0);
          this.isTweening = true;
        }
      } else {
        this.cameraMode = "overview";
        this._orbitHoldUntil = 0;
        this.selectedIslandId = null;
        if (this.walkerCat) this.walkerCat.group.visible = false;
        this.refreshAllStates();
        if (this.isWebGL && THREE) {
          this.controlsTargetPos = new THREE.Vector3(entry.wx, 0.65, entry.wz);
          this.cameraTargetPos = new THREE.Vector3(entry.wx + 2.5, 12.2, entry.wz + 15.8);
          this.isTweening = true;
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
      const nx = Math.max(-95, Math.min(95, this.boatCurrent.x + Math.sin(this.boatAngle) * forwardStep));
      const nz = Math.max(-95, Math.min(95, this.boatCurrent.z + Math.cos(this.boatAngle) * forwardStep));
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

    _getWaypointStandPos(island, pathInfo, wp) {
      let wx = island.position.x + (typeof wp.x === "number" ? wp.x : Math.cos(wp.angle) * pathInfo.radius);
      let wz = island.position.z + (typeof wp.z === "number" ? wp.z : Math.sin(wp.angle) * pathInfo.radius);
      if (wp.kind === "node" && typeof wp.face === "number") {
        wx += Math.sin(wp.face) * 1.65;
        wz += Math.cos(wp.face) * 1.65;
      } else if (wp.kind === "encounter" && typeof wp.x === "number") {
        wx += -Math.sign(wp.x || 1) * 0.95;
      }
      return { x: wx, z: wz };
    }

    placeWalkerOnIsland(islandId) {
      if (!this.isWebGL || !this.walkerCat) return;
      const island = this.islandsData.find((i) => i.id === islandId);
      const pathInfo = this.islandPaths.get(islandId);
      if (!island || !pathInfo || pathInfo.waypoints.length === 0) return;

      const wp0 = pathInfo.waypoints[0];
      const stand0 = this._getWaypointStandPos(island, pathInfo, wp0);
      const wx = stand0.x;
      const wz = stand0.z;
      const prof = this._getIslandProfile(island);
      const surf = this._getSurfaceInfoAt(wx, wz, false);
      const wy = (surf.onWater ? prof.platY : surf.groundY) + 0.04;
      this.walkerState = {
        islandId,
        waypointIdx: 0,
        curX: wx,
        curZ: wz,
        targetX: wx,
        targetZ: wz,
        currentAngle: wp0.angle,
        targetAngle: wp0.angle,
        isMoving: false,
        pendingCallback: null
      };
      this.walkerCat.group.position.set(wx, wy, wz);
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
      const stand = this._getWaypointStandPos(island, pathInfo, wp);
      const wx = stand.x;
      const wz = stand.z;
      this.walkerState.waypointIdx = nextIdx;
      this.walkerState.targetX = wx;
      this.walkerState.targetZ = wz;
      this.walkerState.isMoving = true;
      this.walkerState.pendingCallback = null;

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
        catObj.jumpTime = catObj.rig ? 2.6 : 1.4;
        if (catObj.rig) {
          catObj.celebrateToggle = !catObj.celebrateToggle;
          this._setCatRigAnim(catObj.rig, catObj.celebrateToggle ? "dance" : "cheer");
        }
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

    playIslandVictoryOrbit(islandId) {
      this.triggerCatCelebration(islandId);
      if (!this.isWebGL) return;
      const island = this.islandsData.find((i) => i.id === islandId);
      if (!island) return;
      this.isTweening = false;
      this.victoryOrbit = {
        islandId,
        cx: island.position.x,
        cz: island.position.z,
        elapsed: 0,
        duration: 3.6,
        startAng: Math.atan2(this.camera.position.x - island.position.x, this.camera.position.z - island.position.z),
        radius: 22,
        height: 15,
        lastBurst: -1
      };
    }

    setAtmosphereMode(mode) {
      this.atmosphereMode = mode;
      if (!this.isWebGL) return;

      const presets = {
        day: {
          bg: "#7ec9f5",
          fog: "#b8e2f8",
          hemiSky: "#e8f5ff",
          hemiGround: "#5c8ca8",
          hemiInt: 0.5,
          sunColor: "#fff4d9",
          sunInt: 0.48,
          rimInt: 0.16,
          shallow: "#5fd0e8",
          deep: "#2d8fca",
          lagoon: "#45ece0",
          foam: "#ffffff",
          starOpacity: 0.08,
          rainbow: true,
          winColor: "#bae6fd",
          skyTop: "#2374e0",
          skyMid: "#6fc2f7",
          skyHorizon: "#dcf2ff",
          skySun: "#fff7da",
          skySunDir: [0.32, 0.34, -0.88],
          cloudCol: "#ffffff",
          cloudShade: "#cfe7fc",
          mNear: "#7cb5df",
          mFar: "#9ec9ec",
          sunTint: "#ffffff",
          nightMix: 0.0
        },
        sunset: {
          bg: "#4a2759",
          fog: "#9e526b",
          hemiSky: "#ffaf87",
          hemiGround: "#3b234d",
          hemiInt: 0.42,
          sunColor: "#ff9e64",
          sunInt: 0.52,
          rimInt: 0.16,
          shallow: "#e59682",
          deep: "#4d568a",
          lagoon: "#df9d7e",
          foam: "#ffe8d2",
          starOpacity: 0.45,
          rainbow: false,
          winColor: "#fde047",
          skyTop: "#2d255b",
          skyMid: "#8e4571",
          skyHorizon: "#ff9d76",
          skySun: "#ffc285",
          skySunDir: [0.42, 0.14, -0.89],
          cloudCol: "#ffd4b8",
          cloudShade: "#7c4c72",
          mNear: "#683b68",
          mFar: "#8d4e6f",
          sunTint: "#ffd2b4",
          nightMix: 0.25
        },
        night: {
          bg: "#050d1e",
          fog: "#0b1e3d",
          hemiSky: "#335c8a",
          hemiGround: "#081326",
          hemiInt: 0.26,
          sunColor: "#8fa8ff",
          sunInt: 0.26,
          rimInt: 0.1,
          shallow: "#1d4b75",
          deep: "#091c38",
          lagoon: "#164e63",
          foam: "#7ecbff",
          starOpacity: 0.96,
          rainbow: false,
          winColor: "#fef08a",
          skyTop: "#040a1a",
          skyMid: "#0b1f42",
          skyHorizon: "#163661",
          skySun: "#cfe4ff",
          skySunDir: [0.32, 0.42, -0.85],
          cloudCol: "#2c4c7a",
          cloudShade: "#122442",
          mNear: "#0e2545",
          mFar: "#163158",
          sunTint: "#a8c7ff",
          nightMix: 0.85
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
      if (this.rimLight) {
        this.rimLight.intensity = p.rimInt;
      }
      if (this.skyUniforms) {
        this.skyUniforms.uTopColor.value.set(p.skyTop);
        this.skyUniforms.uMidColor.value.set(p.skyMid);
        this.skyUniforms.uHorizonColor.value.set(p.skyHorizon);
        this.skyUniforms.uFogColor.value.set(p.fog);
        this.skyUniforms.uSunColor.value.set(p.skySun);
        this.skyUniforms.uSunDir.value.set(p.skySunDir[0], p.skySunDir[1], p.skySunDir[2]).normalize();
        this.skyUniforms.uCloudColor.value.set(p.cloudCol);
        this.skyUniforms.uCloudShade.value.set(p.cloudShade);
        this.skyUniforms.uMountainNear.value.set(p.mNear);
        this.skyUniforms.uMountainFar.value.set(p.mFar);
        this.skyUniforms.uNightMix.value = mode === "night" ? 1.0 : mode === "sunset" ? 0.35 : 0.0;
      }
      this.terrainUniformList.forEach((u) => {
        u.uFogColor.value.set(p.fog);
        u.uSunTint.value.set(p.sunTint);
        u.uNightMix.value = p.nightMix;
      });
      this.grassUniformList.forEach((u) => {
        u.uFogColor.value.set(p.fog);
        u.uNightMix.value = p.nightMix;
      });
      if (this.oceanUniforms) {
        this.oceanUniforms.uShallowColor.value.set(p.shallow);
        this.oceanUniforms.uDeepColor.value.set(p.deep);
        if (this.oceanUniforms.uLagoonColor) this.oceanUniforms.uLagoonColor.value.set(p.lagoon);
        this.oceanUniforms.uFoamColor.value.set(p.foam);
        this.oceanUniforms.uFogColor.value.set(p.fog);
      }
      const glbEmissive = this._getAtmoEmissiveIntensity(mode);
      const archEmissive = this._getArchEmissiveIntensity(mode);
      this.stylizedMaterials.forEach((m) => {
        if (m && m.emissiveMap) {
          m.emissiveIntensity = m.userData && m.userData.isArchMat ? archEmissive : glbEmissive;
        }
      });
      if (this.starField) {
        this.starField.material.opacity = p.starOpacity;
      }
      if (this.rainbowMesh) {
        this.rainbowMesh.visible = p.rainbow;
      }
      if (this.cloudMat) {
        this.cloudMat.color.set(p.cloudCol || "#ffffff");
        this.cloudMat.emissive.set(p.cloudShade || "#edf6ff");
        this.cloudMat.emissiveIntensity = mode === "night" ? 0.25 : mode === "sunset" ? 0.55 : 0.72;
      }
      this.nightGlowMaterials.forEach((m) => m.color.set(p.winColor));
      if (this.hubNightLight) {
        this.hubNightLight.intensity = mode === "night" ? 0.55 : mode === "sunset" ? 0.35 : 0;
      }
      if (this.fireflyPoints && this.fireflyMat) {
        this.fireflyPoints.visible = mode !== "day";
        this.fireflyMat.opacity = mode === "night" ? 0.92 : mode === "sunset" ? 0.42 : 0;
      }
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
      const speechEl = document.createElement("div");
      speechEl.className = "cat-speech-bubble";
      this.labelsContainer.appendChild(speechEl);
      this.catSpeechEl = speechEl;

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

        const growth = this.islandGrowthGroups && this.islandGrowthGroups.get(island.id);
        if (growth) {
          growth.stage1.visible = avgPct >= 33;
          growth.stage2.visible = avgPct >= 66;
          growth.stage3.visible = allConquered;
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
        camPos: new THREE.Vector3(0, 114 * distScale, 166 * distScale),
        targetPos: new THREE.Vector3(0, 4.0, -2.5)
      };
    }

    _getFollowPose(x, y, z, width, height) {
      const THREE = window.THREE;
      const aspect = (width || 1200) / Math.max(height || 800, 1);
      const camLift = aspect < 0.85 ? 2.52 : 2.38;
      const camBack = aspect < 0.85 ? 7.2 : 6.2;
      return {
        camPos: new THREE.Vector3(x, y + camLift, z + camBack),
        targetPos: new THREE.Vector3(x, y + 2.02, z)
      };
    }

    flyToOverview() {
      this.cameraMode = "overview";
      this._orbitHoldUntil = 0;
      this.selectedIslandId = null;
      this.boatMode = "auto";
      this.boatTarget = { x: 22.0, z: 22.0 };
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
      if (this.activeActivity) {
        this.stopPantherActivity(true);
        if (this.callbacks.onStopActivity) this.callbacks.onStopActivity();
      }
      this.cameraMode = "follow";
      this._orbitHoldUntil = 0;
      this.selectedIslandId = islandId;
      this.boatMode = "auto";
      this.boatTarget = {
        x: island.position.x * 0.72,
        z: island.position.z * 0.72 + 6.5
      };
      this.placeWalkerOnIsland(islandId);

      // 降落南側迎賓大道起點，正面透過主題牌坊／階梯與大道仰望主聖殿
      const prof = this._getIslandProfile(island);
      const ps = this.pantherState;
      ps.x = island.position.x;
      ps.z = island.position.z + prof.spawnZ;
      const surf = this._getSurfaceInfoAt(ps.x, ps.z, false);
      ps.groundY = surf.groundY;
      ps.y = surf.groundY;
      ps.vy = 0;
      ps.onGround = true;
      ps.onWater = surf.onWater;
      ps.onBridgeId = null;
      ps.jumpedFromWater = false;
      ps.doubleJumped = false;
      ps.autoTarget = null;
      ps.boostTimer = 0;
      ps.faceX = 0;
      ps.faceZ = -1;
      ps.faceAngle = Math.PI;
      ps.dir = "back";
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
      const { width, height } = this._getViewportSize();
      const aspect = width / Math.max(height, 1);
      const backDist = aspect < 0.85 ? 7.4 : 6.2;
      this.cameraTargetPos = new THREE.Vector3(ps.x + 0.55, ps.y + 2.42, ps.z + backDist);
      this.controlsTargetPos = new THREE.Vector3(ps.x, ps.y + 2.08, ps.z - 1.8);
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
        if (hit && hit.isActivity && hit.activityId) {
          const st = this.activityStations && this.activityStations.get(hit.activityId);
          const dist = st ? Math.hypot(this.pantherState.x - st.wx, this.pantherState.z - st.wz) : 0;
          if (!st || dist <= 2.95) {
            if (this.callbacks.onTriggerActivity) this.callbacks.onTriggerActivity(hit.activityId);
          } else {
            this.walkPantherTo(st.standX, st.standZ, () => {
              if (this.callbacks.onTriggerActivity) this.callbacks.onTriggerActivity(hit.activityId);
            });
          }
          return;
        }
        if (hit && hit.isIntel && this.callbacks.onCollectIntel) {
          this.callbacks.onCollectIntel(hit.intelId);
          return;
        }
        if (hit && hit.isSalmon) {
          this.salmonRollTimer = 1.8;
          if (this.callbacks.onPetSalmon) this.callbacks.onPetSalmon();
          return;
        }
        if (hit && hit.isCaptain) {
          if (this.callbacks.onPetCaptain) this.callbacks.onPetCaptain();
          return;
        }
        if (hit && hit.isWalkerCat) {
          if (this.callbacks.onPetWalker) this.callbacks.onPetWalker(this.walkerCat ? this.walkerCat.islandId : null);
          return;
        }
        if (hit && hit.isBuoy && typeof hit.buoyIdx === "number") {
          const b = this.seaBuoyGroups && this.seaBuoyGroups[hit.buoyIdx];
          if (b && b.userData) {
            this.walkPantherTo(b.userData.x, b.userData.z);
          }
          return;
        }
        if (hit && hit.isHub && this.callbacks.onSelectHub) {
          if (this.hubCatRig) {
            this.hubCatCheerTimer = 2.6;
            this._setCatRigAnim(this.hubCatRig, "cheer");
          }
          this.callbacks.onSelectHub(Boolean(hit.isHubCat));
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
      const onOpenSeaOrBridge = Boolean(this.pantherState && (this.pantherState.onBridgeId || this.pantherState.onWater));
      const hideAllNeighborLabels = this.cameraMode === "follow" && !onOpenSeaOrBridge;
      this.islandsData.forEach((island) => {
        const el = this.labelEls.get(island.id);
        if (!el) return;
        if (hideAllNeighborLabels || (this.cameraMode === "follow" && (this.selectedIslandId === island.id || this.nearIslandId === island.id))) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          return;
        }
        const prof = this._getIslandProfile(island);
        tempVec.set(island.position.x, prof.sanctY + 11.5, island.position.z);
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

      if (this.catSpeechEl) {
        const sp = this.catSpeech;
        if (sp && performance.now() < sp.expiresAt && this._getSpeechWorldAnchor(sp.key, tempVec)) {
          tempVec.project(this.camera);
          if (tempVec.z <= 1) {
            let sx = (tempVec.x * 0.5 + 0.5) * width;
            let sy = (-tempVec.y * 0.5 + 0.5) * height;
            sx = Math.min(Math.max(sx, 126), Math.max(width - 126, 126));
            sy = Math.min(Math.max(sy, 96), Math.max(height - 130, 96));
            if (this.catSpeechEl.textContent !== sp.text) {
              this.catSpeechEl.textContent = sp.text;
            }
            this.catSpeechEl.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`;
            this.catSpeechEl.classList.add("is-visible");
          } else {
            this.catSpeechEl.classList.remove("is-visible");
          }
        } else {
          this.catSpeechEl.classList.remove("is-visible");
        }
      }
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
        if (this.oceanUniforms) {
          this.oceanUniforms.uTime.value = this.clockTime;
        }
        if (this.skyUniforms) {
          this.skyUniforms.uTime.value = this.clockTime;
        }
        for (let ti = 0; ti < this.terrainUniformList.length; ti++) {
          this.terrainUniformList[ti].uTime.value = this.clockTime;
        }
        for (let gi = 0; gi < this.grassUniformList.length; gi++) {
          this.grassUniformList[gi].uTime.value = this.clockTime;
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

        if (this.hubCatRig && this.hubCatRig.mixer) {
          if (this.hubCatCheerTimer > 0) {
            this.hubCatCheerTimer = Math.max(0, this.hubCatCheerTimer - dt);
            if (this.hubCatCheerTimer <= 0) this._setCatRigAnim(this.hubCatRig, "idle");
          }
          this.hubCatRig.mixer.update(dt);
        }

        if (this.hubCatWrap && !this.hubCatRig) {
          // 中央廣場布偶史珂好奇張望＋微搖呼吸動態
          this.hubCatWrap.rotation.y = 0.42 + Math.sin(this.clockTime * 1.15) * 0.22;
          this.hubCatWrap.rotation.z = Math.sin(this.clockTime * 2.1) * 0.04;
          this.hubCatWrap.position.y = this._getHubPlazaY() + Math.max(0, Math.sin(this.clockTime * 2.4)) * 0.04;
        }

        if (this.captainCat && this.captainCat.group && this.captainCat.isMofuPirate) {
          this.captainCat.group.rotation.y = Math.sin(this.clockTime * 0.9) * 0.35;
          this.captainCat.group.rotation.z = Math.sin(this.clockTime * 2.2) * 0.05;
        }

        if (this.salmonCatGroup) {
          const st = this.clockTime * 0.55;
          const sx = -17.5 + Math.cos(st) * 3.6;
          const sz = 18.5 + Math.sin(st * 1.3) * 2.4;
          const dx = -Math.sin(st) * 3.6;
          const dz = Math.cos(st * 1.3) * 2.4 * 1.3;
          let rollY = Math.sin(this.clockTime * 1.7) * 0.14;
          let waveY = 0.16 + Math.sin(this.clockTime * 2.8) * 0.11;
          if (this.salmonRollTimer > 0) {
            this.salmonRollTimer = Math.max(0, this.salmonRollTimer - dt);
            const p = 1 - this.salmonRollTimer / 1.8;
            waveY += Math.sin(p * Math.PI) * 1.15;
            rollY += p * Math.PI * 2;
          }
          this.salmonCatGroup.position.set(sx, waveY, sz);
          this.salmonCatGroup.rotation.y = Math.atan2(dx, dz);
          this.salmonCatGroup.rotation.z = rollY;
        }

        const catMotionMap = {
          chinese: (t, ph) => ({ y: Math.sin(t * 1.8 + ph) * 0.03, rx: Math.sin(t * 2.2 + ph) * 0.06, rz: Math.sin(t * 1.1 + ph) * 0.03, ry: Math.sin(t * 0.8 + ph) * 0.1 }),
          history: (t, ph) => ({ y: Math.abs(Math.sin(t * 2.3 + ph)) * 0.04, rx: 0, rz: Math.sin(t * 1.9 + ph) * 0.05, ry: Math.sin(t * 1.2 + ph) * 0.25 }),
          english: (t, ph) => ({ y: 0.08 + Math.sin(t * 3.6 + ph) * 0.09, rx: Math.sin(t * 2.4 + ph) * 0.04, rz: Math.sin(t * 3.2 + ph) * 0.07, ry: Math.sin(t * 1.6 + ph) * 0.18 }),
          listening: (t, ph) => ({ y: 0.08 + Math.sin(t * 4.2 + ph) * 0.1, rx: Math.cos(t * 3.0 + ph) * 0.05, rz: Math.sin(t * 4.0 + ph) * 0.08, ry: Math.sin(t * 2.0 + ph) * 0.2 }),
          civics: (t, ph) => ({ y: Math.pow(Math.abs(Math.sin(t * 2.1 + ph)), 6) * 0.09, rx: Math.pow(Math.abs(Math.sin(t * 2.1 + ph)), 6) * 0.14, rz: Math.sin(t * 1.4 + ph) * 0.03, ry: 0 })
        };

        this.islandCats.forEach((cat, islandId) => {
          cat.group.lookAt(this.camera.position.x, cat.group.position.y, this.camera.position.z);
          if (cat.rig && cat.rig.mixer) {
            cat.group.position.y = cat.basePos.y;
            cat.group.rotation.z = 0;
            if (cat.jumpTime > 0) {
              cat.jumpTime = Math.max(0, cat.jumpTime - dt);
              if (cat.jumpTime <= 0) this._setCatRigAnim(cat.rig, "idle");
            }
            cat.rig.mixer.update(dt);
          } else if (cat.jumpTime > 0) {
            cat.jumpTime = Math.max(0, cat.jumpTime - dt);
            const p = 1 - cat.jumpTime / 1.4;
            const hop = Math.abs(Math.sin(p * Math.PI * 3)) * 1.75;
            cat.group.position.y = cat.basePos.y + hop;
            cat.group.rotation.z = Math.sin(p * Math.PI * 6) * 0.18;
          } else {
            const fn = catMotionMap[islandId];
            if (fn) {
              const m = fn(this.clockTime, cat.phase);
              cat.group.position.y = cat.basePos.y + m.y;
              cat.group.rotation.x += m.rx;
              cat.group.rotation.z = m.rz;
              cat.group.rotation.y += m.ry;
            } else {
              cat.group.position.y = cat.basePos.y + Math.sin(this.clockTime * 2.6 + cat.phase) * 0.06;
              cat.group.rotation.z = Math.sin(this.clockTime * 1.8 + cat.phase) * 0.04;
            }
          }
        });

        // Walker Cat roaming (依真實庭院座標平滑漫步並貼地)
        if (this.walkerCat && this.walkerCat.group.visible && this.walkerState.islandId) {
          const isl = this.islandsData.find((i) => i.id === this.walkerState.islandId);
          const pInfo = this.islandPaths.get(this.walkerState.islandId);
          if (isl && pInfo) {
            if (typeof this.walkerState.curX !== "number") {
              this.walkerState.curX = this.walkerCat.group.position.x;
              this.walkerState.curZ = this.walkerCat.group.position.z;
              this.walkerState.targetX = this.walkerState.curX;
              this.walkerState.targetZ = this.walkerState.curZ;
            }
            if (this.walkerState.isMoving) {
              const dxW = this.walkerState.targetX - this.walkerState.curX;
              const dzW = this.walkerState.targetZ - this.walkerState.curZ;
              const distW = Math.hypot(dxW, dzW);
              const stepMax = dt * 6.5;
              if (distW <= stepMax + 0.08) {
                this.walkerState.curX = this.walkerState.targetX;
                this.walkerState.curZ = this.walkerState.targetZ;
                this.walkerState.isMoving = false;
                const cb = this.walkerState.pendingCallback;
                this.walkerState.pendingCallback = null;
                if (cb) cb();
              } else {
                this.walkerState.curX += (dxW / distW) * stepMax;
                this.walkerState.curZ += (dzW / distW) * stepMax;
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
                  const pSurf = this._getSurfaceInfoAt(this.walkerState.curX, this.walkerState.curZ, false);
                  pawMark.position.set(this.walkerState.curX, (pSurf.onWater ? this._getIslandProfile(isl).platY : pSurf.groundY) + 0.06, this.walkerState.curZ);
                  this.scene.add(pawMark);
                  this.pawPrints.push({ mesh: pawMark, mat: pMat, life: 1.3 });
                }
              }
            }
            const wSurf = this._getSurfaceInfoAt(this.walkerState.curX, this.walkerState.curZ, false);
            const hopOffset = this.walkerState.isMoving ? Math.abs(Math.sin(this.clockTime * 14)) * 0.26 : 0;
            this.walkerCat.group.position.set(
              this.walkerState.curX,
              (wSurf.onWater ? this._getIslandProfile(isl).platY : wSurf.groundY) + 0.04 + hopOffset,
              this.walkerState.curZ
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
            this.boatCurrent.x = Math.max(-85, Math.min(85, this.boatCurrent.x + Math.sin(this.boatAngle) * speed));
            this.boatCurrent.z = Math.max(-85, Math.min(85, this.boatCurrent.z + Math.cos(this.boatAngle) * speed));
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
            this._checkOceanBuoys(this.boatCurrent.x, this.boatCurrent.z);
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

        if (this.intelGuideBeam && this.intelGuideBeam.visible) {
          if (this.clockTime > (this.intelGuideUntil || 0)) {
            this.intelGuideBeam.visible = false;
          } else {
            const ud = this.intelGuideBeam.userData || {};
            const pulse = 1 + Math.sin(this.clockTime * 4.5) * 0.14;
            if (ud.outerRing) ud.outerRing.scale.setScalar(pulse);
            if (ud.innerRing) ud.innerRing.scale.setScalar(1 + Math.cos(this.clockTime * 4.5) * 0.1);
            if (ud.pointer) {
              ud.pointer.position.y = 2.35 + Math.sin(this.clockTime * 4.2) * 0.28;
              ud.pointer.rotation.y += dt * 2.1;
            }
            if (ud.spGeo) {
              const arr = ud.spGeo.attributes.position.array;
              for (let s = 0; s < (ud.starCount || 6); s++) {
                const cyc = (this.clockTime * 0.85 + s * 0.18) % 1;
                const ang = (s / (ud.starCount || 6)) * Math.PI * 2 + this.clockTime * 0.9;
                arr[s * 3] = Math.cos(ang) * (0.55 + cyc * 0.35);
                arr[s * 3 + 1] = 0.2 + cyc * 2.1;
                arr[s * 3 + 2] = Math.sin(ang) * (0.55 + cyc * 0.35);
              }
              ud.spGeo.attributes.position.needsUpdate = true;
            }
          }
        }

        if (this.victoryOrbit && this.controls) {
          const vo = this.victoryOrbit;
          vo.elapsed += dt;
          const prog = Math.min(1, vo.elapsed / vo.duration);
          const ang = vo.startAng + prog * Math.PI * 2;
          this.controls.target.lerp(new THREE.Vector3(vo.cx, 2.5, vo.cz), 0.16);
          this.camera.position.lerp(
            new THREE.Vector3(vo.cx + Math.sin(ang) * vo.radius, vo.height + Math.sin(prog * Math.PI) * 3.0, vo.cz + Math.cos(ang) * vo.radius),
            0.16
          );
          if (vo.elapsed - vo.lastBurst >= 0.85) {
            vo.lastBurst = vo.elapsed;
            this._spawnWorldFX(
              vo.cx + Math.cos(ang * 2) * 3.2,
              4.2,
              vo.cz + Math.sin(ang * 2) * 3.2,
              22,
              ["#ffd32a", "#ff8ab4", "#38bdf8", "#34d399"]
            );
          }
          if (prog >= 1) {
            this.victoryOrbit = null;
          }
        }

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
          if (this.cameraMode === "follow") {
            const camSurf = this._getSurfaceInfoAt(this.camera.position.x, this.camera.position.z, false);
            const midSurf = this._getSurfaceInfoAt(
              (this.controls.target.x + this.camera.position.x) * 0.5,
              (this.controls.target.z + this.camera.position.z) * 0.5,
              false
            );
            const minCamY = Math.max(
              camSurf.onWater ? 0.9 : camSurf.groundY + 1.15,
              midSurf.onWater ? 0.9 : midSurf.groundY + 0.75
            );
            if (this.camera.position.y < minCamY) {
              this.camera.position.y = minCamY;
            }
          }
        }
        this._renderScene();
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
      const surfInfoBefore = this._getSurfaceInfoAt(ps.x, ps.z, Boolean(ps.onBridgeId));
      const baseSpeed = surfInfoBefore.onWater ? 15.2 : 12.0;
      const speed = baseSpeed * (sprinting ? 1.65 : 1.0);

      let moved = false;
      let worldMoveX = 0;
      let worldMoveZ = 0;
      let moveStrength = 0;

      if (len > 0.05) {
        if (this.activeActivity) {
          this.stopPantherActivity(true);
          if (this.callbacks.onStopActivity) this.callbacks.onStopActivity();
        }
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
        const rawX = Math.max(-135, Math.min(135, prevX + worldMoveX * speed * moveStrength * dt));
        const rawZ = Math.max(-135, Math.min(135, prevZ + worldMoveZ * speed * moveStrength * dt));
        const colRes = this._resolveCollisions(rawX, rawZ, ps.y, 0.28);
        let nextX = Math.max(-135, Math.min(135, colRes.x));
        let nextZ = Math.max(-135, Math.min(135, colRes.z));

        // 橋樑實體護欄＆海橋隔離物理：在橋上受左右護欄限制不落海；在海上不能從側面/跳躍上橋
        const fromBridge = (bc, proj, perp) => ({
          x: bc.dxAxis * proj - bc.dzAxis * perp,
          z: bc.dzAxis * proj + bc.dxAxis * perp
        });
        if (ps.onBridgeId) {
          const bridgeIsl = this.islandsData.find((i) => i.id === ps.onBridgeId);
          if (bridgeIsl) {
            const bNext = this._getBridgeCoord(nextX, nextZ, bridgeIsl);
            if (bNext.proj >= bNext.startDist - 0.25 && bNext.proj <= bNext.endDist + 0.25) {
              const clampedPerp = Math.max(-0.92, Math.min(0.92, bNext.signedPerp));
              const pt = fromBridge(bNext, bNext.proj, clampedPerp);
              nextX = pt.x;
              nextZ = pt.z;
            } else {
              ps.onBridgeId = null;
            }
          } else {
            ps.onBridgeId = null;
          }
        }
        if (!ps.onBridgeId) {
          for (const isl of this.islandsData) {
            const bPrev = this._getBridgeCoord(prevX, prevZ, isl);
            const bNext = this._getBridgeCoord(nextX, nextZ, isl);
            if (bNext.proj >= bNext.startDist && bNext.proj <= bNext.endDist && Math.abs(bNext.signedPerp) <= 1.55) {
              const underBridgeClearance = ps.y + 1.85 < bNext.bridgeY - 0.35;
              const fromLand = !surfInfoBefore.onWater && !ps.jumpedFromWater;
              const viaEndGate = (bPrev.proj <= bNext.startDist + 1.2 || bPrev.proj >= bNext.endDist - 1.2) && Math.abs(bNext.signedPerp) <= 1.15;
              if (fromLand && viaEndGate && !underBridgeClearance) {
                ps.onBridgeId = isl.id;
                const clampedPerp = Math.max(-0.92, Math.min(0.92, bNext.signedPerp));
                const pt = fromBridge(bNext, bNext.proj, clampedPerp);
                nextX = pt.x;
                nextZ = pt.z;
              } else if (!underBridgeClearance) {
                const side = bPrev.signedPerp === 0 ? (bNext.signedPerp >= 0 ? 1 : -1) : Math.sign(bPrev.signedPerp);
                const pt = fromBridge(bNext, bNext.proj, side * 1.64);
                nextX = pt.x;
                nextZ = pt.z;
              }
              break;
            }
          }
        }

        if (ps.onGround) {
          const cliffCheck = this._getSurfaceInfoAt(nextX, nextZ, Boolean(ps.onBridgeId));
          if (cliffCheck.groundY - surfInfoBefore.groundY > 0.72) {
            const tryX = this._resolveCollisions(rawX, prevZ, ps.y, 0.28);
            const tryZ = this._resolveCollisions(prevX, rawZ, ps.y, 0.28);
            if (this._getSurfaceInfoAt(tryX.x, prevZ, Boolean(ps.onBridgeId)).groundY - surfInfoBefore.groundY <= 0.72) {
              nextX = tryX.x;
              nextZ = prevZ;
            } else if (this._getSurfaceInfoAt(prevX, tryZ.z, Boolean(ps.onBridgeId)).groundY - surfInfoBefore.groundY <= 0.72) {
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

      const surf = this._getSurfaceInfoAt(ps.x, ps.z, Boolean(ps.onBridgeId));
      ps.onWater = surf.onWater;
      const gRate = surf.groundY > ps.groundY ? 28 : 16;
      ps.groundY += (surf.groundY - ps.groundY) * Math.min(1, dt * gRate);

      if (!ps.onGround) {
        const prevY = ps.y;
        ps.vy -= 28 * dt;
        ps.y += ps.vy * dt;
        if (!ps.onBridgeId && ps.vy > 0) {
          for (let i = 0; i < this.islandsData.length; i++) {
            const b = this._getBridgeCoord(ps.x, ps.z, this.islandsData[i]);
            if (b.proj >= b.startDist && b.proj <= b.endDist && Math.abs(b.signedPerp) <= 1.45) {
              if (prevY + 1.85 <= b.bridgeY && ps.y + 1.85 > b.bridgeY - 0.25) {
                ps.y = Math.min(ps.y, b.bridgeY - 2.1);
                ps.vy = Math.min(0, ps.vy);
                break;
              }
            }
          }
        }
        if (ps.y <= surf.groundY) {
          ps.y = surf.groundY;
          ps.vy = 0;
          ps.onGround = true;
          ps.jumpedFromWater = false;
          ps.doubleJumped = false;
          this._spawnPantherFX(10, surf.onWater ? ["#ffffff", "#7dd3fc"] : ["#fde68a", "#ffffff"], 0.15);
        }
      } else {
        ps.jumpedFromWater = false;
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

      const actMode = (this.activeActivity && this.activeActivity.type) || (this.focusModeActive ? "study" : null);

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
        parts.leftLeg.rotation.x = actMode === "lounge" && !moved ? -0.45 : swing;
        parts.rightLeg.rotation.x = actMode === "lounge" && !moved ? -0.45 : -swing;
        parts.tailGroup.rotation.y = Math.sin(this.clockTime * (moved ? 12 : 4.5)) * 0.28;

        if (ps.action.type === "cheer") {
          parts.leftArm.rotation.x = -Math.PI * 0.78 + Math.sin(this.clockTime * 18) * 0.22;
          parts.rightArm.rotation.x = -Math.PI * 0.78 - Math.sin(this.clockTime * 18) * 0.22;
          parts.bodyPivot.rotation.z = Math.sin(this.clockTime * 12) * 0.08;
          parts.bodyPivot.rotation.x = 0;
          parts.headGroup.rotation.x = 0;
        } else if (ps.action.type === "dance") {
          parts.leftArm.rotation.x = Math.sin(this.clockTime * 14) * 0.9;
          parts.rightArm.rotation.x = -Math.sin(this.clockTime * 14) * 0.9;
          parts.bodyPivot.rotation.z = Math.sin(this.clockTime * 10) * 0.14;
          parts.bodyPivot.rotation.x = 0;
          parts.headGroup.rotation.x = 0;
        } else if (actMode && !moved) {
          parts.bodyPivot.rotation.z = 0;
          if (actMode === "study") {
            parts.bodyPivot.rotation.x = 0.09;
            parts.leftArm.rotation.x = -0.68;
            parts.rightArm.rotation.x = -0.68;
            parts.headGroup.rotation.x = 0.22 + Math.sin(this.clockTime * 1.8) * 0.05;
          } else if (actMode === "cafe") {
            parts.bodyPivot.rotation.x = 0;
            parts.leftArm.rotation.x = -0.18;
            parts.rightArm.rotation.x = -0.92 + Math.sin(this.clockTime * 2.2) * 0.28;
            parts.headGroup.rotation.x = Math.sin(this.clockTime * 2.2) * 0.06;
          } else if (actMode === "fishing") {
            parts.bodyPivot.rotation.x = 0.04;
            parts.leftArm.rotation.x = -0.46;
            parts.rightArm.rotation.x = this.fishingBiteActive
              ? -0.95 + Math.sin(this.clockTime * 16) * 0.18
              : -0.78 + Math.sin(this.clockTime * 2.1) * 0.05;
            parts.headGroup.rotation.x = 0.1;
          } else if (actMode === "lounge") {
            parts.bodyPivot.rotation.x = -0.22;
            parts.leftArm.rotation.x = -0.32;
            parts.rightArm.rotation.x = -0.82 + Math.sin(this.clockTime * 1.6) * 0.12;
            parts.headGroup.rotation.x = -0.14 + Math.sin(this.clockTime * 1.4) * 0.05;
          } else if (actMode === "workout") {
            const rep = Math.abs(Math.sin(this.clockTime * 4.8));
            parts.bodyPivot.rotation.x = 0;
            parts.leftArm.rotation.x = -0.52 - rep * 1.12;
            parts.rightArm.rotation.x = -0.52 - rep * 1.12;
            parts.headGroup.rotation.x = -0.05;
          }
        } else {
          parts.bodyPivot.rotation.x = 0;
          parts.leftArm.rotation.x = !ps.onGround ? -0.55 : -swing * 0.82;
          parts.rightArm.rotation.x = !ps.onGround ? -0.55 : swing * 0.82;
          parts.bodyPivot.rotation.z = moved ? Math.sin(ps.walkPhase * 1.45) * 0.045 : 0;
          parts.headGroup.rotation.x = ps.onGround ? Math.sin(this.clockTime * 2.5) * 0.04 : -0.12;
        }
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
      this.panther.surfboard.position.y = ps.onWater ? -0.1 : 0;
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
            const wRing = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.36, 16), wMat);
            wRing.rotation.x = -Math.PI / 2;
            wRing.position.set(ps.x - ps.faceX * 0.52, surf.groundY + 0.05, ps.z - ps.faceZ * 0.52);
            this.scene.add(wRing);
            this.wakeRings.push({ mesh: wRing, mat: wMat, life: 0.85 });
          } else if (sprinting) {
            this._spawnPantherFX(2, ["#7dd3fc", "#fef08a", "#ffffff"], 0.18);
          }
        }
      }

      const workoutBob = actMode === "workout" && !moved ? Math.abs(Math.sin(this.clockTime * 4.8)) * 0.16 : 0;
      const bob =
        ps.action.type === "dance"
          ? Math.abs(Math.sin(this.clockTime * 11)) * 0.32
          : workoutBob > 0
            ? workoutBob
            : ps.onWater && ps.onGround
              ? Math.sin(this.clockTime * 3.5) * 0.06
              : 0;
      const surfLift = ps.onWater ? 0.14 : 0;
      this.panther.group.position.set(ps.x, ps.y + bob + surfLift, ps.z);

      if (this.panther.activityProps) {
        const ap = this.panther.activityProps;
        ap.root.rotation.y = ps.faceAngle;
        if (ap.cafe && ap.cafe.visible) {
          ap.cafe.position.y = 0.72 + Math.max(0, Math.sin(this.clockTime * 2.2)) * 0.24;
        }
        if (ap.workout && ap.workout.visible) {
          ap.workout.position.y = Math.abs(Math.sin(this.clockTime * 4.8)) * 0.28;
        }
        if (ap.fishing && ap.fishing.visible) {
          const rodTilt = this.fishingBiteActive
            ? Math.sin(this.clockTime * 18) * 0.09 - 0.1
            : Math.sin(this.clockTime * 2.1) * 0.03;
          ap.rodGroup.rotation.x = rodTilt;
          const bx = ps.x + Math.sin(ps.faceAngle) * 2.35;
          const bz = ps.z + Math.cos(ps.faceAngle) * 2.35;
          const bSurf = this._getSurfaceInfoAt(bx, bz, false);
          const bobRipple = this.fishingBiteActive
            ? Math.sin(this.clockTime * 24) * 0.13 - 0.09
            : Math.sin(this.clockTime * 3.0) * 0.035;
          const bobRelY = bSurf.groundY - ps.y - bob + 0.06 + bobRipple;
          ap.bobberGroup.position.set(0, bobRelY, 2.35);
          if (ap.rippleMesh && ap.rippleMat) {
            const rs = this.fishingBiteActive
              ? 1.15 + ((this.clockTime * 3.5) % 1) * 1.4
              : 0.9 + Math.sin(this.clockTime * 2.8) * 0.15;
            ap.rippleMesh.scale.setScalar(rs);
            ap.rippleMat.opacity = this.fishingBiteActive ? 0.9 : 0.45;
          }
          const tipX = 0.22;
          const tipY = 0.74 + 1.24 * Math.cos(rodTilt) - 1.49 * Math.sin(rodTilt);
          const tipZ = 0.26 + 1.24 * Math.sin(rodTilt) + 1.49 * Math.cos(rodTilt);
          const tipV = new THREE.Vector3(tipX, tipY, tipZ);
          const bobV = new THREE.Vector3(0, bobRelY + 0.06, 2.35);
          const dirV = bobV.clone().sub(tipV);
          const lineLen = Math.max(0.05, dirV.length());
          ap.lineMesh.position.copy(tipV).addScaledVector(dirV, 0.5);
          ap.lineMesh.scale.set(1, lineLen, 1);
          ap.lineMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirV.normalize());
        }
      }
      if (mode === "sprite") {
        this.panther.spriteHolder.lookAt(this.camera.position.x, this.panther.group.position.y, this.camera.position.z);
      }
      if (this.panther.emoteSprite && this.panther.emoteSprite.visible) {
        this.panther.emoteSprite.position.y = mode === "sprite" ? 2.85 : mode === "glb" ? 2.45 : 2.1;
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

      if (moved && this.isTweening) this.isTweening = false;
      if ((moved || this.cameraMode === "follow") && this.controls && !this.isTweening) {
        const oldT = this.controls.target.clone();
        const desiredT = new THREE.Vector3(ps.x, ps.y + 2.02, ps.z);
        this.controls.target.lerp(desiredT, moved ? 0.30 : 0.14);
        const deltaT = this.controls.target.clone().sub(oldT);
        this.camera.position.add(deltaT);

        if (this.focusModeActive && !this._isUserOrbiting()) {
          const tgt = this.controls.target;
          const cam = this.camera.position;
          const dx = cam.x - tgt.x;
          const dz = cam.z - tgt.z;
          const r = Math.hypot(dx, dz) || 4.8;
          const ang = Math.atan2(dx, dz) + dt * 0.08;
          cam.set(tgt.x + Math.sin(ang) * r, cam.y, tgt.z + Math.cos(ang) * r);
        } else if (this.chaseCam && moved && !this._isUserOrbiting()) {
          // 跑酷追逐視角：往前／斜向跑動時鏡頭繞到背後；按住 S 往鏡頭反方向倒退時鎖定鏡頭方位避免原地繞圈
          const tgt = this.controls.target;
          const cam = this.camera.position;
          const vp = this._getViewportSize();
          const targetDist = vp.width < vp.height * 0.85 ? this.chaseDist * 1.15 : this.chaseDist;
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
          r += (targetDist - r) * Math.min(1, dt * 2.2);
          const h = cam.y - tgt.y;
          const hNew = h + (this.chaseHeight - h) * Math.min(1, dt * 3.4);
          cam.set(tgt.x + Math.sin(ang) * r, tgt.y + hNew, tgt.z + Math.cos(ang) * r);
        } else if (moved && !this.chaseCam) {
          const distToCam = this.camera.position.distanceTo(desiredT);
          if (distToCam > 24) {
            const horizDirX = this.camera.position.x - desiredT.x;
            const horizDirZ = this.camera.position.z - desiredT.z;
            const hLen = Math.hypot(horizDirX, horizDirZ) || 1;
            const goalPos = new THREE.Vector3(
              desiredT.x + (horizDirX / hLen) * 14.5,
              ps.y + 8.5,
              desiredT.z + (horizDirZ / hLen) * 14.5
            );
            this.camera.position.lerp(goalPos, 0.09);
          }
        }

        const camSurf = this._getSurfaceInfoAt(this.camera.position.x, this.camera.position.z, false);
        const minCamY = camSurf.onWater ? 0.9 : camSurf.groundY + 1.15;
        if (this.camera.position.y < minCamY) {
          this.camera.position.y = minCamY;
        }
      }
    }

    onResize() {
      const { width, height } = this._getViewportSize();
      if (this.isWebGL && this.camera && this.renderer) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        if (this.outlineEffect) {
          this.outlineEffect.setSize(width, height);
        }
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
        this.balloonRefs = [];
        this.campusBenchGroups = [];
        this.islandChests = [];
        this.hubLampGroups = [];
        this.encounterMailboxes = [];
        this.seaBuoyGroups = [];
        this.terrainUniformList = [];
        this.grassUniformList = [];
        this.sanctuaryLights = [];
        if (this.intelMeshes) this.intelMeshes.clear();
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
