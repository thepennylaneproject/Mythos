/**
 * Role-based permission system for organizations.
 */

export type Role = "owner" | "admin" | "editor" | "viewer";

export const PERMISSIONS = {
  // Organization management
  DELETE_ORG: ["owner"],
  MANAGE_MEMBERS: ["owner", "admin"],
  MANAGE_BILLING: ["owner", "admin"],
  
  // Content management
  CREATE_CAMPAIGN: ["owner", "admin", "editor"],
  EDIT_CAMPAIGN: ["owner", "admin", "editor"],
  DELETE_CAMPAIGN: ["owner", "admin"],
  
  CREATE_POST: ["owner", "admin", "editor"],
  EDIT_POST: ["owner", "admin", "editor"],
  DELETE_POST: ["owner", "admin"],
  PUBLISH_POST: ["owner", "admin"],
  
  // Automations
  CREATE_AUTOMATION: ["owner", "admin"],
  EDIT_AUTOMATION: ["owner", "admin"],
  RUN_AUTOMATION: ["owner", "admin", "editor"],
  
  // View permissions
  VIEW_ANALYTICS: ["owner", "admin", "editor", "viewer"],
  VIEW_POSTS: ["owner", "admin", "editor", "viewer"],
  VIEW_CAMPAIGNS: ["owner", "admin", "editor", "viewer"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

export function getPermissionsForRole(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((p) =>
    PERMISSIONS[p].includes(role)
  );
}

export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    owner: "Owner",
    admin: "Admin",
    editor: "Editor",
    viewer: "Viewer",
  };
  return names[role];
}

export const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Full access, can delete organization" },
  { value: "admin", label: "Admin", description: "Manage members, publish content" },
  { value: "editor", label: "Editor", description: "Create and edit content" },
  { value: "viewer", label: "Viewer", description: "View-only access" },
];
