import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Square, 
  ArrowLeft,
  Server,
  Package,
  Settings,
  Trash2,
  Plus,
  Download
} from "lucide-react";

// Mock project data - in real app, this would come from API/state
const mockProjects = [
  {
    id: "1",
    name: "E-commerce API",
    description: "RESTful API for online shopping platform",
    status: "running",
    port: 3001,
    framework: "Express.js",
    lastModified: "2 minutes ago",
    packages: 24,
    size: "45.2 MB",
    nodeVersion: "18.17.0",
    createdAt: "2024-01-15",
    dependencies: [
      { name: "express", version: "4.18.2", type: "dependency" },
      { name: "mongoose", version: "7.5.0", type: "dependency" },
      { name: "bcryptjs", version: "2.4.3", type: "dependency" },
      { name: "jsonwebtoken", version: "9.0.2", type: "dependency" },
      { name: "nodemon", version: "3.0.1", type: "devDependency" }
    ],
    envVars: [
      { key: "NODE_ENV", value: "development" },
      { key: "PORT", value: "3001" },
      { key: "DB_URL", value: "mongodb://localhost:27017/ecommerce" }
    ]
  },
  // Add other projects...
];

function getStatusColor(status: string) {
  return status === 'running' ? 'bg-success' : 'bg-muted-foreground';
}

function getStatusBadgeVariant(status: string) {
  return status === 'running' ? 'default' : 'secondary';
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Find project by ID - in real app, this would be a proper data fetch
  const project = mockProjects.find(p => p.id === id);
  
  if (!project) {
    return (
      <Layout title="Project Not Found" subtitle="">
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <Button onClick={() => navigate("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const mockLogs = [
    "[2024-01-20 10:30:15] Server starting on port 3001",
    "[2024-01-20 10:30:16] Database connected successfully",
    "[2024-01-20 10:30:16] ✓ Express server listening on port 3001",
    "[2024-01-20 10:32:45] GET /api/products - 200 OK (45ms)",
    "[2024-01-20 10:33:12] POST /api/auth/login - 200 OK (120ms)",
    "[2024-01-20 10:35:30] GET /api/users - 200 OK (23ms)"
  ];

  return (
    <Layout 
      title={project.name} 
      subtitle={project.description}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(project.status)}`}></div>
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
          </div>
          <div className="flex items-center space-x-2">
            {project.status === 'running' ? (
              <Button variant="outline">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}
            <Button variant="outline">
              <Server className="mr-2 h-4 w-4" />
              Open in Browser
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Project Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="font-medium">{project.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Packages</span>
                    <span className="font-medium">{project.packages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Node Version</span>
                    <span className="font-medium">{project.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="font-medium">{project.createdAt}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Server Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Port</span>
                    <span className="font-medium">{project.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Framework</span>
                    <span className="font-medium">{project.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Modified</span>
                    <span className="font-medium">{project.lastModified}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Install Package
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Config
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dependencies</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Install Package
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {project.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{dep.name}</p>
                          <p className="text-sm text-muted-foreground">v{dep.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={dep.type === 'devDependency' ? 'secondary' : 'outline'}>
                          {dep.type === 'devDependency' ? 'dev' : 'prod'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Console Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-background border rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                  {mockLogs.map((log, index) => (
                    <div key={index} className="text-foreground/80 mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input id="port" value={project.port} />
                </div>
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Input id="framework" value={project.framework} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Environment Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.envVars.map((env, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input value={env.key} placeholder="Key" />
                    <Input value={env.value} placeholder="Value" />
                  </div>
                ))}
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variable
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}