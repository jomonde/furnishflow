'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from '@/components/icons';
import { Client } from '@/types';
import { useClients, useSales, useTasks } from "@/features/entities/hooks";
import { format } from 'date-fns';

// Types
type ActivityType = 'task' | 'sale' | 'client';

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  created_at: string;
  due_date?: string;
  priority?: string;
}

interface DashboardSale {
  id: string;
  amount?: number;
  value?: number;
  created_at: string;
  client_name?: string;
  client_id?: string;
}

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon: keyof typeof Icons;
  link: string;
  time?: string;
  client?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Icons;
  change: string;
}

// Helper functions
const getFullName = (client: Client | null | undefined): string => {
  if (!client) return 'Unnamed Client';
  return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed Client';
};

const activityIcons: Record<ActivityType, keyof typeof Icons> = {
  task: 'fileText',
  sale: 'invoices',
  client: 'users'
};

const StatCard = ({ title, value, icon, change }: StatCardProps) => {
  const Icon = Icons[icon];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  // Data fetching
  const { data: clients = [], loading: clientsLoading } = useClients();
  const { data: tasks = [], loading: tasksLoading } = useTasks();
  const { data: sales = [], loading: salesLoading } = useSales();

  // Memoized calculations
  const { openTasks, activeClients, totalRevenue, recentActivities } = useMemo(() => {
    // Ensure we have arrays
    const clientsArray = Array.isArray(clients) ? clients : [];
    const tasksArray = Array.isArray(tasks) ? tasks : [];
    const salesArray = Array.isArray(sales) ? sales : [];

    // Calculate metrics
    const openTasks = tasksArray.filter(
      task => task?.status && !['completed', 'cancelled'].includes(task.status)
    ).length;

    const activeClients = clientsArray.filter(
      client => client?.status === 'active'
    ).length;

    const totalRevenue = salesArray.reduce((sum, sale) => {
      const amount = sale?.amount ?? 0;
      return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);

    // Generate recent activities
    const activities: Activity[] = [
      // Recent clients
      ...clientsArray.slice(0, 3).map(client => ({
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
      ...tasksArray
        .slice(0, 5)
        .sort((a, b) => 
          new Date(b?.created_at || 0).getTime() - 
          new Date(a?.created_at || 0).getTime()
        )
        .map(task => ({
          id: task?.id || '',
          type: 'task' as const,
          title: `Task: ${task?.title || 'Untitled'}`,
          description: task?.status 
            ? `Status: ${String(task.status).replace('_', ' ')}` 
            : 'No status',
          timestamp: task?.due_date || task?.created_at || new Date().toISOString(),
          icon: activityIcons.task,
          link: `/tasks/${task?.id}`,
          time: task?.due_date 
            ? format(new Date(task.due_date), 'MMM d, yyyy') 
            : 'No due date'
        })),
      // Recent sales
      ...salesArray
        .slice(0, 2)
        .sort((a, b) => 
          new Date(b?.created_at || 0).getTime() - 
          new Date(a?.created_at || 0).getTime()
        )
        .map(sale => ({
          id: sale?.id || '',
          type: 'sale' as const,
          title: `New Sale: $${(sale?.amount ?? 0).toFixed(2)}`,
          description: sale?.client?.name || 'No client',
          timestamp: sale?.created_at || new Date().toISOString(),
          icon: activityIcons.sale,
          link: `/sales/${sale?.id}`,
          time: sale?.created_at 
            ? format(new Date(sale.created_at), 'MMM d, yyyy') 
            : 'No date'
        }))
    ].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);

    return { openTasks, activeClients, totalRevenue, recentActivities: activities };
  }, [clients, tasks, sales]);

  // Stats for the dashboard
  const stats = useMemo((): StatCardProps[] => [
    { 
      title: "Open Tasks", 
      value: openTasks.toString(), 
      icon: "fileText", 
      change: tasksLoading ? "Loading..." : `${openTasks} to complete` 
    },
    { 
      title: "Active Clients", 
      value: activeClients.toString(), 
      icon: "users", 
      change: clientsLoading ? "Loading..." : `${activeClients} active` 
    },
    { 
      title: "Total Revenue", 
      value: `$${totalRevenue.toLocaleString()}`, 
      icon: "invoices", 
      change: salesLoading ? "Loading..." : "All time" 
    },
    { 
      title: "Recent Activity", 
      value: recentActivities.length.toString(), 
      icon: "activity", 
      change: `${recentActivities.length} activities` 
    }
  ], [openTasks, activeClients, totalRevenue, recentActivities, tasksLoading, clientsLoading, salesLoading]);

  // Loading state
  if (clientsLoading || tasksLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link 
          href="/clients/new" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Icons.plus className="mr-2 h-4 w-4" />
          Add New
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link 
          href="/clients/new" 
          className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Icons.user className="h-8 w-8 mb-2 text-primary" />
          <h3 className="font-medium">Add Client</h3>
          <p className="text-sm text-muted-foreground text-center">Create a new client profile</p>
        </Link>
        
        <Link 
          href="/tasks/new" 
          className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Icons.plus className="h-8 w-8 mb-2 text-primary" />
          <h3 className="font-medium">Add Task</h3>
          <p className="text-sm text-muted-foreground text-center">Create a new task</p>
        </Link>
        
        <Link 
          href="/sales/new" 
          className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Icons.package className="h-8 w-8 mb-2 text-primary" />
          <h3 className="font-medium">New Sale</h3>
          <p className="text-sm text-muted-foreground text-center">Record a new sale</p>
        </Link>
        
        <Link 
          href="/notes/new" 
          className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Icons.fileText className="h-8 w-8 mb-2 text-primary" />
          <h3 className="font-medium">Add Note</h3>
          <p className="text-sm text-muted-foreground text-center">Create a new note</p>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = Icons[activity.icon];
                return (
                  <div 
                    key={`${activity.id}-${activity.timestamp}`} 
                    className="flex items-start gap-4"
                  >
                    <div className="mt-1">
                      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium leading-none">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              {recentActivities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activities
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
