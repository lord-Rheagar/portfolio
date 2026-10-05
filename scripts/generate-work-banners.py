"""Create factual, illustrative SVG covers for works without source artwork.

These are diagrams of the documented concepts, not screenshots or measured
results. Published media is used directly for the other four work pages.
"""

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "works"


def text(x, y, value, size=22, color="#f4f1ea", weight=400, family="Arial, sans-serif", spacing=0):
    return (
        f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" '
        f'font-family="{family}" font-weight="{weight}" letter-spacing="{spacing}">'
        f'{escape(value)}</text>'
    )


def box(x, y, w, h, stroke="#ffffff", fill="#17212a", radius=18, opacity=0.8):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
        f'fill="{fill}" fill-opacity="{opacity}" stroke="{stroke}" stroke-opacity=".38"/>'
    )


def wire(path, color="#d9ddd9", width=3, opacity=0.65, dash=""):
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    return (
        f'<path d="{path}" fill="none" stroke="{color}" stroke-width="{width}" '
        f'stroke-opacity="{opacity}" stroke-linecap="round" stroke-linejoin="round"{dash_attr}/>'
    )


def dot(x, y, radius, fill):
    return f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{fill}"/>'


def frame(slug, category, title_lines, subtitle, accent, art, label):
    title_markup = "".join(
        text(78, 224 + i * 70, line, 62, "#f4f1ea", 500, "Georgia, serif")
        for i, line in enumerate(title_lines)
    )
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 560" role="img" aria-label="{escape(slug.replace("-", " "))} illustration">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0e1720"/><stop offset=".58" stop-color="#14232c"/><stop offset="1" stop-color="#10191f"/>
  </linearGradient>
  <radialGradient id="halo"><stop stop-color="{accent}" stop-opacity=".22"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
    <path d="M34 0H0V34" fill="none" stroke="#f4f1ea" stroke-opacity=".045"/>
  </pattern>
</defs>
<rect width="1440" height="560" fill="url(#bg)"/>
<rect width="1440" height="560" fill="url(#grid)"/>
<circle cx="1090" cy="270" r="430" fill="url(#halo)"/>
<path d="M666 54V505" stroke="#f4f1ea" stroke-opacity=".12"/>
{text(78, 78, "BODHI  /  WORKS", 17, accent, 700, spacing=3)}
{text(78, 139, category.upper(), 18, "#bbc5c6", 600, spacing=2)}
{title_markup}
{text(80, 384, subtitle, 22, "#b7c2c1")}
<path d="M78 465H590" stroke="{accent}" stroke-opacity=".55"/>
{text(78, 501, label.upper(), 14, "#aab8b7", 600, spacing=2)}
{art}
</svg>'''
    target = ROOT / slug / "cover.svg"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(svg, encoding="utf-8")


teal = "#8bd1c3"
amber = "#e8bc86"
violet = "#bbaeea"

competitive = (
    box(742, 172, 180, 196, teal) + box(960, 172, 180, 196, teal) + box(1178, 172, 180, 196, teal)
    + wire("M923 269H957 M1141 269H1175", teal, 3)
    + dot(923, 269, 5, teal) + dot(1141, 269, 5, teal)
    + text(766, 213, "01 / SOURCES", 16, teal, 700, spacing=1)
    + text(766, 267, "Market", 26, weight=600) + text(766, 299, "signals", 26, weight=600)
    + text(984, 213, "02 / SYNTHESIS", 16, teal, 700, spacing=1)
    + wire("M990 267H1108 M990 287H1086 M990 307H1122", "#dce7e4", 5, .75)
    + text(1202, 213, "03 / OUTPUT", 16, teal, 700, spacing=1)
    + box(1203, 249, 126, 83, teal, "#263d42", 9, .7)
    + wire("M1219 312V291L1244 275L1269 299L1296 265L1313 281", teal, 4)
    + text(778, 412, "RESEARCH", 14, "#aab8b7", 600, spacing=1)
    + text(998, 412, "REPORT", 14, "#aab8b7", 600, spacing=1)
    + text(1215, 412, "DASHBOARD", 14, "#aab8b7", 600, spacing=1)
)
frame(
    "competitive-intelligence-automation", "AI automation", ["Competitive", "intelligence"],
    "Signals into a structured view.", teal, competitive, "Illustrated workflow"
)

sop = (
    box(746, 148, 210, 250, teal) + box(1094, 176, 252, 202, teal)
    + text(776, 195, "SOP LIBRARY", 17, teal, 700, spacing=1)
    + wire("M778 230H920 M778 259H901 M778 288H913 M778 317H868", "#dce7e4", 6, .65)
    + wire("M956 271H1030 M1044 271H1092", teal, 3)
    + dot(1037, 271, 37, "#203d42")
    + text(1018, 283, "?", 34, teal, 700)
    + text(1121, 221, "ANSWER", 18, teal, 700, spacing=1)
    + wire("M1121 253H1317 M1121 281H1288 M1121 309H1266", "#dce7e4", 6, .65)
    + text(1121, 347, "WITH SOURCE", 14, "#aab8b7", 600, spacing=1)
)
frame(
    "sop-assistant-bot", "AI automation", ["SOP Assistant", "bot"],
    "From team knowledge to an answer.", teal, sop, "Illustrated workflow"
)

linear = (
    box(738, 164, 225, 219, teal) + box(1098, 164, 252, 219, teal)
    + text(763, 207, "SUPPORT MESSAGE", 16, teal, 700, spacing=1)
    + box(761, 234, 165, 91, "#bad4d1", "#284047", 14, .8)
    + wire("M782 263H901 M782 287H871", "#edf1ed", 5, .7)
    + wire("M964 273H1093", teal, 3)
    + dot(1029, 273, 28, "#2b524f")
    + text(1017, 282, "→", 25, teal, 700)
    + text(1123, 207, "LINEAR TICKET", 16, teal, 700, spacing=1)
    + dot(1129, 253, 7, amber)
    + wire("M1150 253H1316 M1123 291H1315 M1123 318H1272", "#edf1ed", 5, .72)
    + text(1123, 356, "TRIAGED / READY", 14, "#aab8b7", 600, spacing=1)
)
frame(
    "linear-ticket-workflow", "AI automation", ["Linear ticket", "workflow"],
    "Support signals into actionable tickets.", teal, linear, "Illustrated workflow"
)

cal = (
    box(800, 145, 491, 260, amber)
    + text(831, 190, "SCHEDULING JOURNEY", 17, amber, 700, spacing=1)
    + wire("M844 312H1252", amber, 3)
    + dot(864, 312, 18, amber) + dot(1048, 312, 18, amber) + dot(1234, 312, 18, amber)
    + text(825, 269, "FREE", 19, "#f4f1ea", 700, spacing=1)
    + text(988, 269, "TEAM SIGNAL", 19, "#f4f1ea", 700, spacing=1)
    + text(1188, 269, "PAID", 19, "#f4f1ea", 700, spacing=1)
    + wire("M1048 330V363 M1234 330V363", amber, 2, .75)
    + text(967, 384, "TRIGGER + ONBOARD", 14, "#b9c0bd", 600, spacing=1)
)
frame(
    "cal-com-free-to-paid", "GTM case study", ["Free users", "to teams"],
    "A proposed conversion journey for Cal.com.", amber, cal, "Conceptual journey / not results"
)

wispr = (
    box(762, 137, 577, 268, amber)
    + text(794, 184, "VOICE  →  CREATOR  →  DISTRIBUTION", 17, amber, 700, spacing=1)
    + wire("M798 282H836L851 244L868 328L886 220L905 339L923 259L942 305L956 282H1004", amber, 5, .92)
    + dot(1051, 282, 24, amber) + dot(1161, 238, 18, "#d7d1bb") + dot(1165, 332, 18, "#d7d1bb")
    + dot(1263, 282, 18, "#d7d1bb")
    + wire("M1075 276L1142 243 M1073 289L1144 326 M1183 241L1244 275 M1184 327L1244 288", amber, 2, .7)
    + text(802, 366, "INDIA CREATOR SYSTEM", 15, "#b9c0bd", 600, spacing=1)
)
frame(
    "wispr-flow-gtm-thesis", "GTM case study", ["Wispr Flow", "India GTM"],
    "A creator-led launch thesis.", amber, wispr, "Illustrated strategy"
)

research = (
    box(752, 144, 579, 263, violet)
    + text(784, 187, "SAME TASK / DIFFERENT CHECKPOINTS", 16, violet, 700, spacing=1)
    + text(788, 246, "LOW PROGRESS", 17, "#d6d1e7", 600, spacing=1)
    + text(788, 332, "HIGH PROGRESS", 17, "#d6d1e7", 600, spacing=1)
    + wire("M959 240H1165 M959 326H1165", violet, 3, .9)
    + dot(995, 240, 9, violet) + dot(1117, 326, 9, violet)
    + wire("M1165 240L1223 283 M1165 326L1223 283", violet, 3, .9)
    + dot(1248, 283, 27, "#3b3454")
    + text(1239, 293, "?", 28, violet, 700)
    + text(1071, 383, "COMPARE BEHAVIOR", 14, "#b9b5cb", 600, spacing=1)
)
frame(
    "partial-progress-task-gaming", "Writing / research", ["Partial progress", "& task gaming"],
    "A checkpoint-based feasibility study.", violet, research, "Research design / not findings"
)

green = "#83d6ad"
job_market = (
    box(741, 126, 607, 309, green)
    + text(769, 165, "OCCUPATION MAP / AI EXPOSURE", 16, green, 700, spacing=1)
    + '<rect x="769" y="193" width="279" height="193" rx="7" fill="#2aab79"/>'
    + '<rect x="1055" y="193" width="128" height="93" rx="7" fill="#6bd0a2"/>'
    + '<rect x="1190" y="193" width="129" height="93" rx="7" fill="#e2bd62"/>'
    + '<rect x="1055" y="293" width="119" height="93" rx="7" fill="#4bc593"/>'
    + '<rect x="1181" y="293" width="70" height="93" rx="7" fill="#e6a348"/>'
    + '<rect x="1258" y="293" width="61" height="93" rx="7" fill="#dc6c4f"/>'
    + text(788, 226, "AGRICULTURE", 15, "#09281e", 700, spacing=1)
    + text(1071, 225, "SERVICES", 12, "#123329", 700)
    + text(1202, 225, "TRADES", 12, "#4a3211", 700)
    + text(1070, 326, "RETAIL", 12, "#123329", 700)
    + text(1192, 326, "IT", 12, "#4a3211", 700)
    + text(1268, 326, "FIN", 12, "#4a1917", 700)
    + text(770, 415, "SIZE = WORKERS     COLOR = SELECTED LAYER", 13, "#b9c9c2", 600, spacing=1)
)
frame(
    "indian-job-ai-exposure", "Side project", ["AI exposure of", "Indian jobs"],
    "An interactive occupation-level view.", green, job_market,
    "Illustrative treemap / live app contains data"
)
