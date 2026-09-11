import { useAuth } from './auth-context';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isOperator = role === 'OPERATOR' || role === 'AGENT';
  const isViewer = role === 'VIEWER';

  const can = (action: string): boolean => {
    if (!role) return false;
    if (isSuperAdmin) return true;

    switch (action) {
      // Leads
      case 'lead.view':
        return true; // Super Admin, Manager, Operator, Viewer all see all leads
      case 'lead.create':
      case 'lead.edit':
      case 'lead.assign_owner':
      case 'lead.export':
        return isManager;
      case 'lead.delete':
        return isSuperAdmin;
      case 'lead.import':
        return isManager;
      case 'lead.send_numbers':
        return isManager || isOperator;

      // Users / Invitations
      case 'user.view':
        return isSuperAdmin || isManager;
      case 'user.invite':
      case 'user.edit_role':
      case 'user.deactivate':
        return isSuperAdmin;

      // Imports navigation
      case 'imports.access':
        return isSuperAdmin || isManager;

      // Settings
      case 'settings.manage':
        return isSuperAdmin;

      default:
        return false;
    }
  };

  return {
    role,
    isSuperAdmin,
    isManager,
    isOperator,
    isViewer,
    can,
  };
}
