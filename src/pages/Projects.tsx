import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddProjectDialog } from "@/components/projects/AddProjectDialog";
import { 
  Play, 
  Square, 
  Eye, 
  Trash2, 
  Plus,
  FolderOpen,
  Clock,
  Settings
} from "lucide-react";

// Mock projects data
const projects = [
  {
    id: 1,
    name: "E-commerce API",
    description: "RESTful API for online shopping platform",
    status: "running",
    port: 3001,
    framework: "Express.js",
    lastModified: "2 minutes ago",
    packages: 24,
    size: "45.2 MB"
  },
  {
    id: 2,
    name: "Chat Application",
    description: "Real-time messaging app with Socket.io",
    status: "stopped",
    port: 3002,
    framework: "Node.js",
    lastModified: "1 hour ago",
    packages: 18,
    size: "32.8 MB"
  },
  {
    id: 3,
    name: "Analytics Dashboard",
    description: "Data visualization and reporting tool",
    status: "running",
    port: 3003,
    framework: "Fastify",
    lastModified: "Just now",
    packages: 31,
    size: "67.4 MB"
  },
  {
    id: 4,
    name: "Authentication Service",
    description: "JWT-based auth microservice",
    status: "stopped",
    port: 3004,
    framework: "Express.js",
    lastModified: "3 hours ago",
    packages: 12,
    size: "21.7 MB"
  },
  {
    id: 5,
    name: "File Upload API",
    description: "Secure file handling and storage service",
    status: "stopped",
    port: 3005,
    framework: "Koa.js",
    lastModified: "1 day ago",
    packages: 16,
    size: "28.9 MB"
  }
];

function getStatusColor(status: string) {
  return status === 'running' ? 'bg-success' : 'bg-muted-foreground';
}

function getStatusBadgeVariant(status: string) {
  return status === 'running' ? 'default' : 'secondary';
}

export default function Projects() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleProjectAdded = (projectData: any) => {
    // Here you would typically add the project to your state/database
    console.log("New project:", projectData);
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
            <Button variant="outline">
              <FolderOpen className="mr-2 h-4 w-4" />
              Import Project
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {projects.length} projects • {projects.filter(p => p.status === 'running').length} running
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-card border-border shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${getStatusColor(project.status)}`}></div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.description}
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
                    {project.framework}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Packages</p>
                    <p className="font-medium">{project.packages}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="font-medium">{project.size}</p>
                  </div>
                </div>

                {/* Last Modified */}
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Clock className="mr-1 h-3 w-3" />
                  Modified {project.lastModified}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {project.status === 'running' ? (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

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
      </div>

      <AddProjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onProjectAdded={handleProjectAdded}
      />
    </Layout>
  );
}