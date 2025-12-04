import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "reports.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    // create folder + file
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, "[]", "utf8");
  }
}

export async function readReports() {
  await ensureDataFile();
  const txt = await fs.readFile(DATA_PATH, "utf8");
  try {
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeReports(arr) {
  await ensureDataFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(arr, null, 2), "utf8");
}

export function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export async function addReports(records) {
  const current = await readReports();
  const mapped = records.map((r) => ({
    id: r.id || makeId(),
    name: r.name || "",
    title: r.title || "",
    classification: r.classification || "",
    organisasi: r.organisasi || r.organisasi || "",
    description: r.description || "",
    status: r.status || "",
    created: r.created || new Date().toISOString(),
    updated: r.updated || new Date().toISOString(),
  }));
  const merged = [...current, ...mapped];
  await writeReports(merged);
  return mapped;
}

export async function updateReportById(id, payload) {
  const current = await readReports();
  let found = false;
  const updated = current.map((r) => {
    if (String(r.id) === String(id)) {
      found = true;
      return { ...r, ...payload, id: r.id, updated: new Date().toISOString() };
    }
    return r;
  });
  if (!found) throw new Error("Not found");
  await writeReports(updated);
  return updated.find((r) => String(r.id) === String(id));
}

export async function deleteReportById(id) {
  const current = await readReports();
  const filtered = current.filter((r) => String(r.id) !== String(id));
  await writeReports(filtered);
  return;
}
