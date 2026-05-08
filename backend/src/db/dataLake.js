import fs from "fs";
import path from "path";

const dataPath = path.resolve(process.env.DATA_PATH || path.join(process.cwd(), "data"));
const cache = new Map();

const ensureCollection = (fileName) => {
  const filePath = path.join(dataPath, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf8");
  }
  return filePath;
};

export const initializeDataLake = (collections) => {
  collections.forEach((fileName) => {
    const data = readCollection(fileName);
    cache.set(fileName, data);
  });
};

export function readCollection(fileName) {
  if (cache.has(fileName)) {
    return cache.get(fileName);
  }
  const filePath = ensureCollection(fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = raw ? JSON.parse(raw) : [];
  cache.set(fileName, parsed);
  return parsed;
}

export function writeCollection(fileName, data) {
  const filePath = ensureCollection(fileName);
  cache.set(fileName, data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  return data;
}

export function findById(fileName, id) {
  return readCollection(fileName).find((item) => item.id === id) || null;
}

export function findWhere(fileName, conditionFn) {
  return readCollection(fileName).filter(conditionFn);
}

export function insertOne(fileName, object) {
  const collection = readCollection(fileName);
  collection.push(object);
  writeCollection(fileName, collection);
  return object;
}

export function updateOne(fileName, id, updates) {
  const collection = readCollection(fileName);
  const idx = collection.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  collection[idx] = { ...collection[idx], ...updates };
  writeCollection(fileName, collection);
  return collection[idx];
}

export function deleteOne(fileName, id) {
  const collection = readCollection(fileName);
  const idx = collection.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  collection.splice(idx, 1);
  writeCollection(fileName, collection);
  return true;
}
