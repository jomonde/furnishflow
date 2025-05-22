'use client';

import { useClients } from '@/hooks/use-supabase';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

function ClientItem({ client }: { 
  client: { 
    id: string; 
    first_name: string;
    last_name: string;
    email?: string; 
    status: string 
  } 
}) {
  const fullName = `${client.first_name} ${client.last_name}`;
  
  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{fullName}</h3>
          <p className="text-sm text-gray-600">{client.email}</p>
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          {client.status}
        </span>
      </div>
    </div>
  );
}

export default function TestPage() {
  const { data: clients, isLoading, error, refetch } = useClients();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button 
          onClick={() => refetch()} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Icons.spinner className="h-4 w-4 animate-spin" />
          ) : (
            <Icons.refresh className="h-4 w-4" />
          )}
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading clients...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Icons.xCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading clients
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => refetch()}>
                  <Icons.refresh className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : clients && clients.length > 0 ? (
        <div className="bg-white rounded-lg border">
          {clients.map((client) => (
            <ClientItem key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Icons.users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new client.
          </p>
        </div>
      )}
    </div>
  );
}
