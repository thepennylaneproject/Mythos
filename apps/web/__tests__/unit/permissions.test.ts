import { describe, it, expect } from 'vitest';
import { hasPermission, Role } from '@/lib/permissions';

describe('Permission Logic', () => {
  it('should allow owner to delete org', () => {
    expect(hasPermission('owner', 'DELETE_ORG')).toBe(true);
  });

  it('should not allow editor to delete org', () => {
    expect(hasPermission('editor', 'DELETE_ORG')).toBe(false);
  });

  it('should allow editor to create posts', () => {
    expect(hasPermission('editor', 'CREATE_POST')).toBe(true);
  });

  it('should allow viewer to view posts but not edit', () => {
    expect(hasPermission('viewer', 'VIEW_POSTS')).toBe(true);
    expect(hasPermission('viewer', 'EDIT_POST')).toBe(false);
  });

  it('should allow admin to manage members', () => {
    expect(hasPermission('admin', 'MANAGE_MEMBERS')).toBe(true);
  });
});
