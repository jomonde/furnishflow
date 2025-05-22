'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icons } from '@/components/icons';
import { Client, ClientStatus } from '@/types';

// Import hooks
import { useClients } from "@/features/clients/hooks/use-clients";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useSales } from "@/features/sales/hooks/use-sales";
import { format } from 'date-fns';

// Types
interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string;
  due_date?: string;
}

interface Sale {
  id: string;
  amount?: number;
  created_at: string;
  client_name?: string;
}

// Helper function to get full name
const getFullName = (client: Client | null) => {
  if (!client) return 'Unnamed Client';
  return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client';
};

// Define activity types and icons
type ActivityType = 'task' | 'sale' | 'client' | 'note' | 'sketch';

// Define a mapping from activity types to icon names
const activityIcons: Record<ActivityType, keyof typeof Icons> = {
  task: 'fileText',
  sale: 'invoices',
  client: 'users',
  note: 'fileText',
  sketch: 'fileText'
};

// Define activity interface
interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon: keyof typeof Icons;
  link: string;
  client?: string;
  time?: string;
}

// Define stats card props
interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Icons;
  change: string;
}

const StatCard = ({ title, value, icon, change }: StatCardProps) => {
  const Icon = Icons[icon];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {change}
        </p>
      </CardContent>
    </Card>
  );
};

// Main dashboard component
export default function DashboardPage() {
  // Fetch data from the database
  const { clients = [], loading: clientsLoading } = useClients();
  const { tasks: allTasks = [], loading: tasksLoading } = useTasks();
  const { sales = [], getSalesTotal, loading: salesLoading } = useSales();
  
  // State for tasks with proper type
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // State for stats and activities
  const [stats, setStats] = useState<StatCardProps[]>([
    { title: "Open Tasks", value: "-", icon: "fileText", change: "Loading..." },
    { title: "Total Clients", value: "-", icon: "users", change: "Loading..." },
    { title: "Total Sales", value: "-", icon: "invoices", change: "Loading..." },
    { title: "Recent Activity", value: "-", icon: "activity", change: "Loading..." },
  ]);
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [recentActivitiesState, setRecentActivitiesState] = useState<Activity[]>([]);

  // Update tasks when loaded
  useEffect(() => {
    if (!tasksLoading && allTasks && allTasks.length > 0) {
      setTasks(allTasks);
    } else if (!tasksLoading) {
      setTasks([]);
    }
  }, [tasksLoading, allTasks]);

  // Calculate stats and activities
  useEffect(() => {
    const calculateStats = async () => {
      if (clientsLoading || tasksLoading || salesLoading) return;
      
      try {
        // Calculate open tasks
        const openTasks = (allTasks || []).filter((task: Task | null) => 
          task?.status !== 'completed' && task?.status !== 'cancelled'
        ).length;
        
        // Calculate active clients
        const activeClients = (clients || []).filter((client: Client | null) => 
          client?.status === 'active'
        ).length;
        
        // Get total sales
        const monthlySales = await getSalesTotal('month');
        
        // Generate recent activities
        const activities: Activity[] = [
          // Recent clients
          ...(clients || []).slice(0, 3).map(client => ({
            id: client?.id || '',
            type: 'client' as const,
            title: `New Client: ${getFullName(client)}`,
            description: client?.email || 'No email',
            timestamp: client?.created_at || new Date().toISOString(),
            icon: activityIcons.client,
            link: `/clients/${client?.id}`,
            client: getFullName(client)
          })),
          // Recent tasks
          ...(allTasks || [])
            .sort((a: any, b: any) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())
            .slice(0, 2)
            .map((task: any) => ({
              id: task?.id || '',
              type: 'task' as const,
              title: `Task: ${task?.title || 'Untitled'}`,
              description: task?.status ? `Status: ${String(task.status).replace('_', ' ')}` : 'No status',
              timestamp: task?.due_date || task?.created_at || new Date().toISOString(),
              icon: activityIcons.task,
              link: `/tasks/${task?.id}`,
              time: task?.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'
            })),
          // Recent sales
          ...(sales || [])
            .sort((a: any, b: any) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())
            .slice(0, 2)
            .map((sale: any) => ({
              id: sale?.id || '',
              type: 'sale' as const,
              title: `Sale: $${sale?.amount?.toLocaleString() || '0'}`,
              description: sale && 'client_name' in sale && sale.client_name ? 
                `Client: ${sale.client_name}` : 'No client',
              timestamp: sale?.created_at || new Date().toISOString(),
              icon: activityIcons.sale,
              link: `/sales/${sale?.id}`,
              time: sale?.created_at ? format(new Date(sale.created_at), 'MMM d, yyyy') : ''
            }))
        ];
        
        // Sort all activities by timestamp (newest first)
        const sortedActivities = activities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setStats([
          { 
            title: "Open Tasks", 
            value: openTasks.toString(), 
            icon: "fileText", 
            change: openTasks === 0 ? "All caught up!" : `${openTasks} to complete` 
          },
          { 
            title: "Active Clients", 
            value: activeClients.toString(), 
            icon: "users", 
            change: `${activeClients} of ${clients?.length || 0} active` 
          },
          { 
            title: "Monthly Sales", 
            value: `$${monthlySales.toLocaleString()}`, 
            icon: "invoices", 
            change: `Total revenue this month` 
          },
          { 
            title: "Recent Activity", 
            value: sortedActivities.length.toString(), 
            icon: "activity", 
            change: sortedActivities.length > 0 ? "Latest updates" : "No recent activity"
          },
        ]);
        
        setRecentActivities(sortedActivities);
        setRecentActivitiesState(sortedActivities);
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };
    
    calculateStats();
  }, [clients, allTasks, sales, clientsLoading, tasksLoading, salesLoading, getSalesTotal]);

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Link 
              href="/clients/new" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <Icons.plus className="mr-2 h-4 w-4" />
              Add New
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 p-8 pt-6">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivitiesState.length > 0 ? (
                recentActivitiesState.map((activity) => {
                  const Icon = Icons[activity.icon];
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time || format(new Date(activity.timestamp), 'MMM d, yyyy')}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/clients/new" className="block">
              <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icons.users className="h-4 w-4 text-primary" />
                  </div>
                  <span>Add New Client</span>
                </div>
                <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/tasks/new" className="block">
              <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icons.plus className="h-4 w-4 text-primary" />
                  </div>
                  <span>Create New Task</span>
                </div>
                <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/sales/new" className="block">
              <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icons.invoices className="h-4 w-4 text-primary" />
                  </div>
                  <span>Record New Sale</span>
                </div>
                <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
