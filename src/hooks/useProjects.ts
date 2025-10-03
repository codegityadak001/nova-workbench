import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectStatus } from '@/types/nova';
import { toast } from 'sonner';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects from Nova API
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      const result = await window.nova.projects.list();
      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        throw new Error(result.error || 'Failed to load projects');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start a project
  const startProject = useCallback(async (id: string) => {
    try {
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      const result = await window.nova.projects.start(id);
      if (result.success) {
        toast.success('Project started successfully');
        // Update the project status in local state
        setProjects(prev => prev.map(p => 
          p.id === id ? { ...p, status: 'running' as const } : p
        ));
      } else {
        throw new Error(result.error || 'Failed to start project');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start project';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Stop a project
  const stopProject = useCallback(async (id: string) => {
    try {
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      const result = await window.nova.projects.stop(id);
      if (result.success) {
        toast.success('Project stopped successfully');
        // Update the project status in local state
        setProjects(prev => prev.map(p => 
          p.id === id ? { ...p, status: 'stopped' as const } : p
        ));
      } else {
        throw new Error(result.error || 'Failed to stop project');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop project';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Restart a project
  const restartProject = useCallback(async (id: string) => {
    try {
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      const result = await window.nova.projects.restart(id);
      if (result.success) {
        toast.success('Project restarted successfully');
        // Update the project status in local state
        setProjects(prev => prev.map(p => 
          p.id === id ? { ...p, status: 'running' as const } : p
        ));
      } else {
        throw new Error(result.error || 'Failed to restart project');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restart project';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Delete a project
  const deleteProject = useCallback(async (id: string, deleteFiles: boolean = false) => {
    try {
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      const result = await window.nova.projects.delete(id, deleteFiles);
      if (result.success) {
        toast.success('Project deleted successfully');
        // Remove the project from local state
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        throw new Error(result.error || 'Failed to delete project');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Get project status
  const getProjectStatus = useCallback(async (id: string): Promise<ProjectStatus | null> => {
    try {
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      const result = await window.nova.projects.getStatus(id);
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get project status');
      }
    } catch (err) {
      console.error('Failed to get project status:', err);
      return null;
    }
  }, []);

  // Install dependencies
  const installDependencies = useCallback(async (id: string) => {
    try {
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      const result = await window.nova.projects.installDeps(id);
      if (result.success) {
        toast.success('Dependencies installed successfully');
      } else {
        throw new Error(result.error || 'Failed to install dependencies');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to install dependencies';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Set up event listeners for project status changes
  useEffect(() => {
    if (!window.nova) return;

    const handleStatusChange = (data: { id: string; status: string }) => {
      setProjects(prev => prev.map(p => 
        p.id === data.id ? { ...p, status: data.status as Project['status'] } : p
      ));
    };

    const handleLog = (data: { id: string; line: string; stream: string }) => {
      // Handle log events (could be used for live log viewing)
      console.log(`[${data.id}] [${data.stream}] ${data.line}`);
    };

    window.nova.on('nova:projects:status-changed', handleStatusChange);
    window.nova.on('nova:projects:log', handleLog);

    return () => {
      window.nova.off('nova:projects:status-changed', handleStatusChange);
      window.nova.off('nova:projects:log', handleLog);
    };
  }, []);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    loadProjects,
    startProject,
    stopProject,
    restartProject,
    deleteProject,
    getProjectStatus,
    installDependencies
  };
}