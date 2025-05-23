"use client";

import { useState, useMemo } from 'react';
import { useSales } from '@/features/entities/hooks';
import type { SaleEntity } from '@/features/entities/hooks/use-sales';
import type { SaleStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type StatusFilter = 'all' | SaleStatus;

export default function SalesPage() {
  const { data: sales, loading, error } = useSales();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    const salesArray = Array.isArray(sales) ? sales : [sales];
    if (statusFilter === 'all') return salesArray;
    return salesArray.filter(sale => sale.status === statusFilter);
  }, [sales, statusFilter]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'closed_won':
        return 'success';
      case 'closed_lost':
        return 'destructive';
      case 'lead':
      case 'needs_quote':
        return 'secondary';
      case 'quote_sent':
      case 'follow_up':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <Icons.alertCircle className="h-5 w-5 text-red-400" />
          <h3 className="text-sm font-medium text-red-800 ml-2">Error loading sales</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage your sales opportunities
          </p>
        </div>
        <Button asChild>
          <Link href="/sales/new">
            <Icons.plus className="mr-2 h-4 w-4" /> New Sale
          </Link>
        </Button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'lead', 'needs_quote', 'quote_sent', 'follow_up', 'measurement', 'design', 'presentation', 'negotiation', 'closed_won', 'closed_lost'].map((status) => (
          <Button
            key={status}
            variant={status === statusFilter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status as StatusFilter)}
            className="whitespace-nowrap"
          >
            {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <Link key={sale.id} href={`/sales/${sale.id}`} className="block">
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {sale.client?.name || 'No client'}
                      {sale.client?.email && (
                        <span className="text-xs text-gray-500">• {sale.client.email}</span>
                      )}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(sale.status)}>
                      {sale.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      ${sale.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {sale.expected_close_date ? format(new Date(sale.expected_close_date), 'MMM d, yyyy') : 'No close date'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Icons.folderX className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No sales found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new sale.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/sales/new">
                  <Icons.plus className="mr-2 h-4 w-4" /> New Sale
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
