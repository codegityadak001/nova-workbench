import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddProjectDialog } from "@/components/projects/AddProjectDialog";
import { useProjects } from "@/hooks/useProjects";
import { 
  Play, 
  Square, 
  Eye, 
  Trash2, 
  Plus,
  FolderOpen,
  Clock,
  Settings,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

function getStatusColor(status: string) {
  return status === 'running' ? 'bg-success' : 'bg-muted-foreground';
}

function getStatusBadgeVariant(status: string) {
  return status === 'running' ? 'default' : 'secondary';
}

export default function Projects() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { 
    projects, 
    loading, 
    error, 
    loadProjects, 
    startProject, 
    stopProject, 
    deleteProject 
  } = useProjects();

  const handleProjectAdded = () => {
    loadProjects();
  };

  const handleStartStop = async (projectId: string, currentStatus: string) => {
    setActionLoading(projectId);
    try {
      if (currentStatus === 'running') {
        await stopProject(projectId);
      } else {
        await startProject(projectId);
      }
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this project?')) {
      setActionLoading(projectId);
      try {
        await deleteProject(projectId, false);
      } catch (error) {
        // Error is already handled in the hook
      } finally {
        setActionLoading(null);
      }
    }
  };

  const formatLastModified = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  return (
    <Layout 
      title="Projects" 
      subtitle="Manage your Node.js development projects"
    >
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline" onClick={loadProjects} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {projects.length} projects • {projects.filter(p => p.status === 'running').length} running
          </div>
        </div>

        {/* Loading State */}
        {loading && projects.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadProjects} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Create your first Node.js project to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const isActionLoading = actionLoading === project.id;
              
              return (
                <Card 
                  key={project.id} 
                  className="bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(project.status)}`}></div>
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.type.charAt(0).toUpperCase() + project.type.slice(1)} project
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline">
                        Port {project.port}
                      </Badge>
                      <Badge variant="outline">
                        {project.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Project Path */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground">Path</p>
                      <p className="font-mono text-xs truncate" title={project.path}>
                        {project.path}
                      </p>
                    </div>

                    {/* Last Modified */}
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Clock className="mr-1 h-3 w-3" />
                      Modified {formatLastModified(project.updated_at)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant={project.status === 'running' ? "outline" : "default"} 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartStop(project.id, project.status);
                        }}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : project.status === 'running' ? (
                          <Square className="mr-2 h-4 w-4" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        {project.status === 'running' ? 'Stop' : 'Start'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${project.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.nova) {
                            window.nova.system.showItemInFolder(project.path);
                          }
                        }}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(project.id, e)}
                        disabled={isActionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add New Project Card */}
            <Card 
              className="bg-card/50 border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <CardContent className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">Create New Project</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a new Node.js project
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AddProjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onProjectAdded={handleProjectAdded}
      />
    </Layout>
  );
}