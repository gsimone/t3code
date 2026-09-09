import type { SidebarProjectPickerEntry } from "~/sidebarProjectGrouping";

export interface ProjectPickerEnvironmentHint {
  /** Environment label for the row, or null when the row has no environment to show. */
  readonly environmentLabel: string | null;
  /**
   * Secondary text rendered next to the project name. Falls back to the
   * workspace path when another row would otherwise read identically.
   */
  readonly text: string | null;
}

/**
 * The same project name can exist in several environments, so the environment
 * label is only surfaced when the picker spans two or more environments.
 * Labels are not unique either: two checkouts of one project on the same
 * machine collide on both name and label, so those rows fall back to the
 * workspace path (mirroring ProjectSettingsPanel's checkout labels).
 */
export function resolveProjectPickerEnvironmentHints(
  entries: ReadonlyArray<SidebarProjectPickerEntry>,
): ReadonlyMap<string, ProjectPickerEnvironmentHint> {
  const environmentIds = new Set(entries.map((entry) => entry.targetProject.environmentId));
  const showEnvironmentLabels = environmentIds.size >= 2;
  const hints = new Map<string, ProjectPickerEnvironmentHint>();
  for (const entry of entries) {
    const environmentLabel = showEnvironmentLabels ? entry.targetProject.environmentLabel : null;
    const collides = entries.some(
      (other) =>
        other.group.projectKey !== entry.group.projectKey &&
        other.group.displayName === entry.group.displayName &&
        (showEnvironmentLabels ? other.targetProject.environmentLabel : null) === environmentLabel,
    );
    const text = collides
      ? environmentLabel === null
        ? entry.targetProject.workspaceRoot
        : `${environmentLabel} · ${entry.targetProject.workspaceRoot}`
      : environmentLabel;
    hints.set(entry.group.projectKey, { environmentLabel, text });
  }
  return hints;
}
