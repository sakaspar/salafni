import { insertOne } from "../db/dataLake.js";
import { createId, nowIso } from "../utils.js";

export function createNotification({ userId, title, body, type = "GENERAL" }) {
  return insertOne("notifications.json", {
    id: createId(),
    userId,
    title,
    body,
    type,
    read: false,
    createdAt: nowIso(),
  });
}
