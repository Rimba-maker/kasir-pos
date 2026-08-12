import { beforeEach, expect, test } from "vitest";
import { capLogs, logAudit, useAuditStore } from "./store";
import type { AuditLog } from "./types";

const entry = (id: string): AuditLog => ({ id, at: "", staffId: null, action: "x", entity: "e", entityId: null });

beforeEach(() => useAuditStore.setState({ logs: [] }));

test("capLogs keeps only the newest N entries", () => {
  const logs = [entry("5"), entry("4"), entry("3"), entry("2"), entry("1")];
  expect(capLogs(logs, 3).map((l) => l.id)).toEqual(["5", "4", "3"]);
});

test("logAudit prepends an entry with an id and timestamp", () => {
  logAudit({ staffId: "s1", action: "opname.post", entity: "opname", entityId: "o1" });
  const [first] = useAuditStore.getState().logs;
  expect(first.action).toBe("opname.post");
  expect(first.id).toBeTruthy();
  expect(first.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});
