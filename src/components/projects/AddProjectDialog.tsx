import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Folder, Loader2 } from "lucide-react";
import { toast } from "sonner";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  templateKey: z.string().min(1, "Template is required"),
  port: z.number().min(3000, "Port must be >= 3000").max(9999, "Port must be <= 9999"),
  baseDir: z.string().min(1, "Project directory is required"),
  initGit: z.boolean().default(true),
  installDeps: z.boolean().default(true),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded?: () => void;
}

interface Template {
  id: string;
  key: string;
  name: string;
  source: string;
  meta_json: string;
}

export function AddProjectDialog({ open, onOpenChange, onProjectAdded }: AddProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      templateKey: "",
      port: 3000,
      baseDir: "",
      initGit: true,
      installDeps: true,
    },
  });

  // Load templates when dialog opens
  useEffect(() => {
    if (open && window.nova) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      const result = await window.nova.templates.list();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      if (!window.nova) {
        throw new Error('Nova API not available');
      }

      // Determine project type from template
      const template = templates.find(t => t.key === data.templateKey);
      const projectType = template?.key || 'custom';

      const result = await window.nova.projects.create({
        name: data.name,
        type: projectType,
        templateKey: data.templateKey,
        baseDir: data.baseDir,
        port: data.port,
        initGit: data.initGit,
        installDeps: data.installDeps,
        envVars: {}
      });

      if (result.success) {
        toast.success("Project created successfully!");
        onProjectAdded?.();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Failed to create project");
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = async () => {
    try {
      if (!window.nova) return;
      
      const result = await window.nova.system.selectDirectory();
      if (result.success && result.data) {
        form.setValue("baseDir", result.data);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
      toast.error('Failed to select directory');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new Node.js project with your preferred framework and configuration.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="my-awesome-api" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of your project..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="templateKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.key} value={template.key}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="3000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="baseDir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Directory</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="/path/to/projects" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleBrowse}>
                      <Folder className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Choose where to create your project directory
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initGit"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Initialize Git</FormLabel>
                      <FormDescription className="text-xs">
                        Create a git repository
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installDeps"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Install Dependencies</FormLabel>
                      <FormDescription className="text-xs">
                        Run npm install automatically
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}