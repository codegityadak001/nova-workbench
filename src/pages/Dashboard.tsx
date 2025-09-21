import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  Server, 
  Package, 
  Activity,
  Plus,
  Play,
  Eye,
  Trash2
} from "lucide-react";

// Mock data for demonstration
const recentProjects = [
  { name: "E-commerce API", status: "running", port: 3001, lastActive: "2 min ago" },
  { name: "Chat Application", status: "stopped", port: 3002, lastActive: "1 hour ago" },
  { name: "Analytics Dashboard", status: "running", port: 3003, lastActive: "Just now" },
];

const quickStats = [
  {
    title: "Active Projects",
    value: 5,
    subtitle: "Total projects created",
    icon: <FolderOpen className="h-5 w-5 text-primary" />,
    trend: { value: 12, isPositive: true }
  },
  {
    title: "Running Servers",
    value: 2,
    subtitle: "Currently active",
    icon: <Server className="h-5 w-5 text-success" />,
    trend: { value: 8, isPositive: true }
  },
  {
    title: "Installed Packages",
    value: 147,
    subtitle: "Across all projects",
    icon: <Package className="h-5 w-5 text-warning" />,
    trend: { value: 5, isPositive: true }
  },
  {
    title: "System Health",
    value: "98%",
    subtitle: "Uptime this month",
    icon: <Activity className="h-5 w-5 text-primary" />,
    trend: { value: 2, isPositive: true }
  }
];

export default function Dashboard() {
  return (
    <Layout 
      title="Dashboard" 
      subtitle="Overview of your Node.js development environment"
    >
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Projects</span>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${
                        project.status === 'running' ? 'bg-success' : 'bg-muted-foreground'
                      }`}></div>
                      <div>
                        <p className="font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Port {project.port} • {project.lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Node.js Version</span>
                  <span className="text-sm text-success font-mono">v20.9.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">NPM Version</span>
                  <span className="text-sm text-success font-mono">v10.1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-warning font-mono">2.4 GB / 16 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Disk Space</span>
                  <span className="text-sm text-success font-mono">45 GB / 512 GB</span>
                </div>
                
                {/* Progress bars for visual appeal */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-muted-foreground">Memory Usage</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">Disk Usage</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{width: '9%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}