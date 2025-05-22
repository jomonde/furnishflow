import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { Client } from "@/types"

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  // This would normally fetch client data based on the ID
  // Mock data for the client with all required fields
  // Define the client data with all required fields
  const client: Client = {
    id: params.id,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    status: "active",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "US",
      deliveryNotes: "Please ring the bell twice"
    },
    stylePreferences: ["Mid-century modern", "Scandinavian"],
    roomTypes: ["Living room", "Dining room"],
    budget: 6000,
    notes: "Interested in mid-century modern furniture. Budget: $5,000 - $7,000",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Add legacy fields for backward compatibility
    last_contact: new Date().toISOString(),
    style_preferences: ["Mid-century modern", "Scandinavian"]
  } as Client;

  if (!client) {
    return <div>Loading...</div>
  }

  // Helper function to format the client's full name
  const getFullName = () => {
    return `${client.first_name} ${client.last_name}`.trim();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getFullName()}</h1>
          <p className="text-muted-foreground">
            Client ID: {client.id}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/clients">
              <Icons.chevronLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Link>
          </Button>
          <Button variant="outline">
            <Icons.edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm">{client.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <p className="text-sm">{client.phone}</p>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <p className="text-sm">{client.address?.country || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                  {client.status ? `${client.status.charAt(0).toUpperCase()}${client.status.slice(1)}` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Address</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Address</Label>
                <p>{client.address?.street || 'N/A'}</p>
                <p>{client.address?.city}, {client.address?.state} {client.address?.zip}</p>
                <p>{client.address?.country || 'N/A'}</p>
                {client.address?.deliveryNotes && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Delivery Notes:</strong> {client.address.deliveryNotes}
                  </p>
                )}
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <p className="text-sm">{client.address?.state || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label>ZIP/Postal Code</Label>
                  <p className="text-sm">{client.address?.zip || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <p className="text-sm">
                  {client.address?.country ? getCountryName(client.address.country) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Notes</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {client.notes || 'No notes available.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Icons.mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icons.phone className="mr-2 h-4 w-4" />
                Log Call
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icons.calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Icons.fileText className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Icons.mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email sent</p>
                  <p className="text-xs text-muted-foreground">
                    May 15, 2023 at 2:30 PM
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Icons.phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone call</p>
                  <p className="text-xs text-muted-foreground">
                    May 10, 2023 at 10:15 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Gets the full country name from a country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Full country name or the original code if not found
 */
function getCountryName(countryCode: string): string {
  if (!countryCode) return 'N/A'
  
  const countryNames: Record<string, string> = {
    US: 'United States',
    CA: 'Canada',
    UK: 'United Kingdom',
    GB: 'United Kingdom',
    AU: 'Australia',
    NZ: 'New Zealand',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
    JP: 'Japan',
    CN: 'China',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico'
  }
  
  return countryNames[countryCode.toUpperCase()] || countryCode
}
