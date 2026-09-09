import { describe, expect, it } from "vite-plus/test";

import type { SidebarProjectPickerEntry } from "~/sidebarProjectGrouping";
import { resolveProjectPickerEnvironmentHints } from "./DraftHeroHeadline.logic";

function entry(input: {
  projectKey: string;
  displayName: string;
  environmentId: string;
  environmentLabel: string | null;
  workspaceRoot: string;
}): SidebarProjectPickerEntry {
  return {
    group: { projectKey: input.projectKey, displayName: input.displayName },
    targetProject: {
      environmentId: input.environmentId,
      environmentLabel: input.environmentLabel,
      workspaceRoot: input.workspaceRoot,
    },
    isPreferred: false,
  } as unknown as SidebarProjectPickerEntry;
}

describe("resolveProjectPickerEnvironmentHints", () => {
  it("hides environment labels when every entry lives in one environment", () => {
    const hints = resolveProjectPickerEnvironmentHints([
      entry({
        projectKey: "a",
        displayName: "quasar",
        environmentId: "local",
        environmentLabel: "laptop",
        workspaceRoot: "/a/quasar",
      }),
      entry({
        projectKey: "b",
        displayName: "pulsar",
        environmentId: "local",
        environmentLabel: "laptop",
        workspaceRoot: "/a/pulsar",
      }),
    ]);
    expect(hints.get("a")).toEqual({ environmentLabel: null, text: null });
    expect(hints.get("b")).toEqual({ environmentLabel: null, text: null });
  });

  it("shows the environment label once entries span two environments", () => {
    const hints = resolveProjectPickerEnvironmentHints([
      entry({
        projectKey: "a",
        displayName: "quasar",
        environmentId: "local",
        environmentLabel: "laptop",
        workspaceRoot: "/a/quasar",
      }),
      entry({
        projectKey: "b",
        displayName: "quasar",
        environmentId: "remote",
        environmentLabel: "build-box",
        workspaceRoot: "/srv/quasar",
      }),
    ]);
    expect(hints.get("a")).toEqual({ environmentLabel: "laptop", text: "laptop" });
    expect(hints.get("b")).toEqual({ environmentLabel: "build-box", text: "build-box" });
  });

  it("falls back to the workspace path when name and label both collide", () => {
    const hints = resolveProjectPickerEnvironmentHints([
      entry({
        projectKey: "a",
        displayName: "quasar",
        environmentId: "local",
        environmentLabel: "laptop",
        workspaceRoot: "/a/quasar",
      }),
      entry({
        projectKey: "b",
        displayName: "quasar",
        environmentId: "local",
        environmentLabel: "laptop",
        workspaceRoot: "/b/quasar",
      }),
      entry({
        projectKey: "c",
        displayName: "quasar",
        environmentId: "remote",
        environmentLabel: "build-box",
        workspaceRoot: "/srv/quasar",
      }),
    ]);
    expect(hints.get("a")).toEqual({
      environmentLabel: "laptop",
      text: "laptop · /a/quasar",
    });
    expect(hints.get("b")).toEqual({
      environmentLabel: "laptop",
      text: "laptop · /b/quasar",
    });
    expect(hints.get("c")).toEqual({ environmentLabel: "build-box", text: "build-box" });
  });

  it("uses the bare workspace path for same-name checkouts in a single environment", () => {
    const hints = resolveProjectPickerEnvironmentHints([
      entry({
        projectKey: "a",
        displayName: "quasar",
        environmentId: "local",
        environmentLabel: null,
        workspaceRoot: "/a/quasar",
      }),
      entry({
        projectKey: "b",
        displayName: "quasar",
        environmentId: "local",
        environmentLabel: null,
        workspaceRoot: "/b/quasar",
      }),
    ]);
    expect(hints.get("a")).toEqual({ environmentLabel: null, text: "/a/quasar" });
    expect(hints.get("b")).toEqual({ environmentLabel: null, text: "/b/quasar" });
  });
});
