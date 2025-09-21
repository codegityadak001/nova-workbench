import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon, 
  Folder, 
  Database,
  Bell,
  Palette,
  Shield,
  Download
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <Layout 
      title="Settings" 
      subtitle="Configure Nova preferences and system options"
    >
      <div className="p-6 max-w-4xl">
        <div className="grid gap-6">
          {/* General Settings */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <span>General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input id="app-name" defaultValue="Nova" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-port">Default Port Range</Label>
                  <Input id="default-port" defaultValue="3000-3100" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-start projects</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically start projects when Nova launches
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-save logs</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically save application logs to disk
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Check for updates</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically check for Nova updates
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Settings */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="h-5 w-5 text-primary" />
                <span>Development</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="node-version">Default Node.js Version</Label>
                  <Input id="node-version" defaultValue="v20.9.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-manager">Package Manager</Label>
                  <Input id="package-manager" defaultValue="npm" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projects-dir">Projects Directory</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="projects-dir" 
                    defaultValue="/Users/developer/nova-projects" 
                    className="flex-1"
                  />
                  <Button variant="outline">Browse</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Hot reload</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable automatic reloading on file changes
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">TypeScript support</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable TypeScript compilation and type checking
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Integration */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <span>Database Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">MongoDB integration</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable MongoDB connection and management
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">PostgreSQL integration</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable PostgreSQL connection and management
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Redis integration</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable Redis connection and caching support
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Error notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Show desktop notifications for application errors
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Build notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Notify when builds complete or fail
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">System notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Show notifications for system events
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Settings
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Import Settings
                </Button>
                <Button variant="outline">
                  Reset to Defaults
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}