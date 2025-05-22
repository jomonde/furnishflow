import { Button, Input, Label, Textarea } from "@/components/ui"
import { Icons } from "@/components/icons"
import Link from "next/link"

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add New Client</h1>
          <p className="text-muted-foreground">
            Enter the client's information to add them to your system
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/clients">
            <Icons.chevronLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <form className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" placeholder="123 Main St" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apartment">Apartment, suite, etc.</Label>
                <Input id="apartment" placeholder="Apt 4B" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" placeholder="NY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input id="zip" placeholder="10001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this client..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/clients">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Icons.save className="mr-2 h-4 w-4" />
              Save Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
