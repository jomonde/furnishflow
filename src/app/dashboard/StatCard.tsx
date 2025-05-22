import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

// Define a type for valid icon names
type IconName = keyof typeof Icons;

// List of available icons from the Icons object
const availableIcons = Object.keys(Icons) as IconName[];

// Fallback icon in case the provided icon is not found
const FallbackIcon = Icons.analytics;

type StatCardProps = {
  title: string;
  value: string;
  icon: IconName;
  change: string;
};

// Function to safely get an icon component
const getIcon = (iconName: IconName) => {
  return Icons[iconName] || FallbackIcon;
};

export function StatCard({ title, value, icon, change }: StatCardProps) {
  const Icon = getIcon(icon);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          <Icon className="h-4 w-4" />
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
}
