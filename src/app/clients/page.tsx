"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Client, ClientStatus } from "@/types"
import { ErrorBoundary } from "@/components/error-boundary"
import { Loading } from "@/components/ui/loading"
import { useClients } from "@/features/clients/hooks/use-clients"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function ClientsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const { clients, loading, error, refresh } = useClients()

  const filteredClients = useMemo<Client[]>(() => {
    if (!clients) return [];
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase().trim();
    return clients.filter((client) => {
      // Safely access client properties with null checks
      const firstName = client.first_name ?? '';
      const lastName = client.last_name ?? '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const status = (client.status ?? '').toLowerCase();
      
      return (
        fullName.includes(query) ||
        (client.email?.toLowerCase() || '').includes(query) ||
        (client.phone || '').toLowerCase().includes(query) ||
        status.includes(query)
      );
    });
  }, [searchQuery, clients])

  const getStatusBadge = (status: ClientStatus) => {
    const statusMap: Record<ClientStatus, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      lead: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      project: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMap[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading text="Loading clients..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Icons.alertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading clients</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="text-red-700 hover:bg-red-100"
              >
                <Icons.refresh className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Icons.users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new client.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/clients/new">
              <Icons.plus className="mr-2 h-4 w-4" />
              New Client
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and view their details
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8 w-full lg:w-[400px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refresh}
            disabled={loading}
          >
            <Icons.refresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clients/${client.id}`} className="hover:underline">
                        {`${client.first_name} ${client.last_name}`.trim()}
                      </Link>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(client.status as ClientStatus)}</TableCell>
                    <TableCell>{formatDate(client.last_contact)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/clients/${client.id}`}>
                          <Icons.moreHorizontal className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No matching clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <ErrorBoundary>
      <ClientsContent />
    </ErrorBoundary>
  )
}
