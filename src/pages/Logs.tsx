import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  Download, 
  Trash2, 
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

// Mock log entries
const logEntries = [
  { time: "14:32:15", level: "info", project: "E-commerce API", message: "Server started on port 3001" },
  { time: "14:32:18", level: "info", project: "E-commerce API", message: "Database connection established" },
  { time: "14:33:02", level: "warn", project: "Chat Application", message: "Deprecated middleware detected in auth.js" },
  { time: "14:33:45", level: "error", project: "Analytics Dashboard", message: "Failed to connect to Redis: Connection timeout" },
  { time: "14:34:12", level: "info", project: "Analytics Dashboard", message: "Retrying Redis connection..." },
  { time: "14:34:15", level: "success", project: "Analytics Dashboard", message: "Redis connection restored" },
  { time: "14:35:23", level: "info", project: "E-commerce API", message: "New user registered: user_12345" },
  { time: "14:35:56", level: "debug", project: "Chat Application", message: "WebSocket connection established for user_67890" },
  { time: "14:36:12", level: "info", project: "E-commerce API", message: "Payment processed: order_98765" },
  { time: "14:36:45", level: "warn", project: "Authentication Service", message: "Rate limit exceeded for IP 192.168.1.100" },
];

function getLevelColor(level: string) {
  switch (level) {
    case 'error': return 'text-destructive';
    case 'warn': return 'text-warning';
    case 'success': return 'text-success';
    case 'debug': return 'text-muted-foreground';
    default: return 'text-foreground';
  }
}

function getLevelBadgeVariant(level: string) {
  switch (level) {
    case 'error': return 'destructive';
    case 'warn': return 'secondary';
    case 'success': return 'default';
    case 'debug': return 'outline';
    default: return 'secondary';
  }
}

export default function Logs() {
  return (
    <Layout 
      title="Logs" 
      subtitle="Monitor application logs and system events"
    >
      <div className="p-6">
        {/* Log Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Live Mode
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Real-time</Badge>
            <Badge variant="secondary">{logEntries.length} entries</Badge>
          </div>
        </div>

        {/* Terminal Window */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Terminal className="h-5 w-5 text-primary" />
                <CardTitle>Application Logs</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {/* Terminal Controls */}
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 bg-destructive rounded-full"></div>
                  <div className="h-3 w-3 bg-warning rounded-full"></div>
                  <div className="h-3 w-3 bg-success rounded-full"></div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Log Terminal */}
            <div className="bg-background border border-border rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              <div className="space-y-1">
                {logEntries.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3 hover:bg-muted/50 px-2 py-1 rounded">
                    <span className="text-muted-foreground shrink-0">{entry.time}</span>
                    <Badge 
                      variant={getLevelBadgeVariant(entry.level)}
                      className="shrink-0 text-xs"
                    >
                      {entry.level.toUpperCase()}
                    </Badge>
                    <span className="text-primary shrink-0 font-medium">
                      [{entry.project}]
                    </span>
                    <span className={getLevelColor(entry.level)}>
                      {entry.message}
                    </span>
                  </div>
                ))}
                
                {/* Cursor */}
                <div className="flex items-center">
                  <span className="text-muted-foreground">14:36:50</span>
                  <span className="ml-3 animate-pulse">▊</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-card border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-destructive rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold text-destructive">1</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-warning rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold text-warning">2</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-success rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold text-success">6</p>
                  <p className="text-xs text-muted-foreground">Info</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-muted-foreground rounded-full"></div>
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">1</p>
                  <p className="text-xs text-muted-foreground">Debug</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}