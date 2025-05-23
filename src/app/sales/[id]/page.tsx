"use client";

import { useParams, useRouter } from 'next/navigation';
import { useSales } from '@/features/entities/hooks';
import { Button } from '@/components/ui/button';
import type { SaleStatus, SaleItem } from '@/types';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: sales, loading, update, remove } = useSales();
  
  const sale = Array.isArray(sales) 
    ? sales.find(s => s.id === id)
    : sales?.id === id ? sales : null;
  
  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icons.alertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Sale not found</h2>
        <p className="text-muted-foreground mb-4">The requested sale could not be found.</p>
        <Button asChild>
          <Link href="/sales">
            <Icons.arrowLeft className="mr-2 h-4 w-4" /> Back to Sales
          </Link>
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: SaleStatus) => {
    try {
      await update(sale.id, { status: newStatus });
      toast.success(`Sale status updated to ${newStatus.replace('_', ' ')}.`);
    } catch (error) {
      toast.error('Failed to update sale status.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      try {
        await remove(sale.id);
        toast.success('The sale has been deleted successfully.');
        router.push('/sales');
      } catch (error) {
        toast.error('Failed to delete sale.');
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'closed_won':
        return 'success';
      case 'closed_lost':
        return 'destructive';
      case 'lead':
      case 'needs_quote':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sale Details</h1>
          <p className="text-muted-foreground">
            {sale.client?.name || 'Unnamed Client'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/sales">
              <Icons.arrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/sales/${sale.id}/edit`}>
              <Icons.edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getStatusBadgeVariant(sale.status)}>
                  {sale.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Current status of this sale
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${sale.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total amount of this sale
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expected Close Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {sale.expected_close_date 
                    ? format(new Date(sale.expected_close_date), 'MMM d, yyyy') 
                    : 'Not set'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {sale.client?.email || 'No email provided'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Additional information about this sale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <div className="text-sm font-medium">{sale.client?.name || 'Unnamed Client'}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {sale.created_at && format(new Date(sale.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Probability</p>
                  <p className="font-medium">{sale.probability || 0}%</p>
                </div>
              </div>
              {sale.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-line">{sale.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sale Items</CardTitle>
                  <CardDescription>
                    Products and services included in this sale
                  </CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/sales/${sale.id}/items/new`}>
                    <Icons.plus className="mr-2 h-4 w-4" /> Add Item
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sale.items && sale.items.length > 0 ? (
                <div className="space-y-4">
                  {sale.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-muted-foreground">
                            ${item.unitPrice.toFixed(2)} × {item.quantity} = ${(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/sales/${sale.id}/items/${item.id}`}>
                              <Icons.edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icons.package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-medium">No items</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding items to this sale.
                  </p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href={`/sales/${sale.id}/items/new`}>
                        <Icons.plus className="mr-2 h-4 w-4" /> Add Item
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>
                Recent activity for this sale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icons.fileText className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Sale created</h4>
                      <p className="text-xs text-muted-foreground">
                        {sale.created_at && format(new Date(sale.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      This sale was created
                    </p>
                  </div>
                </div>
                {sale.expected_close_date && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icons.calendar className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Expected close date</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sale.expected_close_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Expected close date for this sale
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <Icons.trash className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
}
