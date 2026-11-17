// usage: node index.js attendance.xlsx template.xlsx output.xlsx [--students attendance|template]
const ExcelJS = require("exceljs");
const cfg = require("./config");

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const colLetter = (n) => { let s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const colNumber = (s) => s.split("").reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0);
const clone = (x) => JSON.parse(JSON.stringify(x));

function toDate(v) {
  if (v instanceof Date) return v;
  if (typeof v === "number" && v > 40000) return new Date(Math.round((v - 25569) * 86400000));
  return null;
}
const ordinal = (d) => {
  const n = d.getUTCDate();
  const s = n >= 11 && n <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th";
  return `${n}${s} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// ---------- 1. read the daily attendance sheet ----------
async function readAttendance(path) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path);
  const ws = wb.worksheets[0];
  let dateRow = 0;
  for (let r = 1; r <= 15; r++) if (String(ws.getCell(r, 3).value || "").includes("Date")) { dateRow = r; break; }
  if (!dateRow) throw new Error('Could not find the "Name | Date" row in the attendance file');
  const dateCols = [];
  for (let c = 4; toDate(ws.getCell(dateRow, c).value); c++) dateCols.push({ col: c, date: toDate(ws.getCell(dateRow, c).value) });
  const students = [];
  for (let r = dateRow + 1; r <= ws.rowCount; r++) {
    const gr = String(ws.getCell(r, 2).value || "").trim();
    const name = String(ws.getCell(r, 3).value || "").trim();
    if (gr.toUpperCase().startsWith("SE") && name) {
      const marks = dateCols.map(({ col }) => String(ws.getCell(r, col).value || "").trim().toUpperCase());
      students.push({ gr, name, marks });
    }
  }
  return { dateCols, students };
}

// ---------- 2. make room for the "Intro PHP Lab" column (insert a column after P) ----------
function insertLabColumn(ws) {
  const INSERT_AT = 17;                        // old column Q: everything from here moves one to the right
  const lastCol = 21, lastRow = Math.max(ws.rowCount, 29);
  const merges = [...ws.model.merges];
  merges.forEach((m) => ws.unMergeCells(m));

  for (let r = 1; r <= lastRow; r++) {
    for (let c = lastCol; c >= INSERT_AT; c--) {
      const from = ws.getCell(r, c), to = ws.getCell(r, c + 1);
      to.value = from.value; to.style = clone(from.style);
    }
    const lab = ws.getCell(r, INSERT_AT);
    lab.value = null; lab.style = clone(ws.getCell(r, INSERT_AT - 1).style);   // look like the PHP column
  }
  for (let c = lastCol; c >= INSERT_AT; c--) ws.getColumn(c + 1).width = ws.getColumn(c).width;
  ws.getColumn(INSERT_AT).width = ws.getColumn(INSERT_AT - 1).width;

  merges.forEach((m) => {
    if (m === "N6:O6" || m === "N7:O8") return;           // the old combined HTML5 block is split below
    let [a, b] = m.split(":");
    const shift = (ref) => { const [, L, R] = ref.match(/([A-Z]+)(\d+)/); const n = colNumber(L); return `${colLetter(n >= INSERT_AT ? n + 1 : n)}${R}`; };
    ws.mergeCells(`${shift(a)}:${shift(b)}`);
  });
}

// ---------- 3. fill the template ----------
async function main() {
  const args = process.argv.slice(2);
  let mode = "template";
  const mi = args.indexOf("--students");
  if (mi >= 0) { mode = args[mi + 1]; args.splice(mi, 2); }
  const [attPath, tplPath, outPath] = args;
  if (!attPath || !tplPath || !outPath) {
    console.log("usage: node index.js attendance.xlsx template.xlsx output.xlsx [--students attendance|template]");
    process.exit(1);
  }

  const { dateCols, students } = await readAttendance(attPath);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(tplPath);
  const ws = wb.getWorksheet(cfg.SUMMARY_SHEET);
  const FIRST = cfg.FIRST_STUDENT_ROW, TOTAL = cfg.TOTAL_ROW;

  // layout: split HTML5 into Theory / Lab columns, add Intro PHP Lab column
  insertLabColumn(ws);
  const teacherP = ws.getCell("P7").value;
  ws.getCell("N6").value = "HTML5 & CSS3 (Theory)";
  ws.getCell("O6").value = "HTML5 & CSS3 Lab";
  ws.getCell("P6").value = "Intro. PHP (Theory)";
  ws.getCell("Q6").value = "Intro. PHP Lab";
  ws.getCell("O7").value = ws.getCell("N7").value;
  ws.getCell("Q7").value = teacherP;
  for (let r = 6; r <= 28; r++) ws.getCell(r, 15).style = clone(ws.getCell(r, 14).style);   // O looks like N
  ws.mergeCells("N7:N8"); ws.mergeCells("O7:O8"); ws.mergeCells("Q7:Q8");
  for (const c of ["N", "O", "P", "Q"]) {            // let the longer headings wrap instead of being cut off
    const cell = ws.getCell(`${c}6`);
    cell.alignment = { ...(cell.alignment || {}), wrapText: true, vertical: "middle", horizontal: "center" };
  }
  ws.getRow(6).height = 32;
  const TOT_COL = 21, PCT_COL = 22;                   // U = Total No. of Classes, V = Total Percent %

  // student rows
  let lastRow = FIRST;
  for (let r = FIRST; r <= ws.rowCount; r++) if (ws.getCell(r, 2).value) lastRow = r;
  if (mode === "attendance") {
    for (let r = FIRST; r <= lastRow; r++) [1, 2, 3].forEach((c) => (ws.getCell(r, c).value = null));
    students.forEach((s, i) => {
      const r = FIRST + i;
      if (r > lastRow) for (let c = 1; c <= PCT_COL; c++) ws.getCell(r, c).style = clone(ws.getCell(lastRow, c).style);
      ws.getCell(r, 1).value = i + 1; ws.getCell(r, 2).value = s.gr; ws.getCell(r, 3).value = s.name;
    });
    ws.getCell("A5").value = `From ${ordinal(dateCols[0].date)}`;
    ws.getCell("U5").value = `Till ${ordinal(dateCols[dateCols.length - 1].date)}`;
  }
  const rows = [];
  for (let r = FIRST; r <= Math.max(ws.rowCount, FIRST + students.length); r++) if (ws.getCell(r, 2).value) rows.push(r);
  const byGr = new Map(students.map((s) => [s.gr, s]));
  const matched = rows.filter((r) => byGr.has(String(ws.getCell(r, 2).value).trim())).length;
  console.log(`${matched} of ${rows.length} students in the summary sheet found in the attendance file`);
  if (matched === 0) console.log("WARNING: no GR numbers match - try --students attendance, or check you have the right attendance file.");

  // classes held and classes attended, per subject (each period counts as one class)
  const held = {};                                    // subject -> total classes
  const attended = {};                                // subject -> { gr -> count }
  dateCols.forEach(({ date }, idx) => {
    (cfg.TIMETABLE[DAYS[date.getUTCDay()]] || []).forEach(({ subject, periods }) => {
      held[subject] = (held[subject] || 0) + periods;
      const map = (attended[subject] ||= {});
      students.forEach((s) => { if (cfg.COUNT_AS_ATTENDED.includes(s.marks[idx])) map[s.gr] = (map[s.gr] || 0) + periods; });
    });
  });

  // write the counts
  const filledCols = [];
  for (const [subject, col] of Object.entries(cfg.SUBJECT_COLUMN)) {
    ws.getCell(`${col}${TOTAL}`).value = held[subject] || 0;
    filledCols.push(col);
    rows.forEach((r) => { ws.getCell(`${col}${r}`).value = (attended[subject] || {})[String(ws.getCell(r, 2).value).trim()] || 0; });
    console.log(`  ${col}: ${subject} - ${held[subject] || 0} classes`);
  }
  const sumRange = (r) => `D${r}:T${r}`;
  const heldTotal = Object.keys(cfg.SUBJECT_COLUMN).reduce((a, s) => a + (held[s] || 0), 0);
  ws.getCell(TOTAL, TOT_COL).value = { formula: `SUM(${sumRange(TOTAL)})`, result: heldTotal };
  rows.forEach((r) => {
    const gr = String(ws.getCell(r, 2).value).trim();
    const total = Object.keys(cfg.SUBJECT_COLUMN).reduce((a, s) => a + ((attended[s] || {})[gr] || 0), 0);
    ws.getCell(r, TOT_COL).value = { formula: `SUM(${sumRange(r)})`, result: total };
    const u = ws.getCell(r, PCT_COL);
    u.value = { formula: `IF($U$${TOTAL}=0,0,U${r}/$U$${TOTAL})`, result: heldTotal ? total / heldTotal : 0 };
    u.numFmt = "0%";
  });

  wb.calcProperties.fullCalcOnLoad = true;
  await wb.xlsx.writeFile(outPath);
  console.log("Saved", outPath);
}
main().catch((e) => { console.error("Error:", e.message); process.exit(1); });
