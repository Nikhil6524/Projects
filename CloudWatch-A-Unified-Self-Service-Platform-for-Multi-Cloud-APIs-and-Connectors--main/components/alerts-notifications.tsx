import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const alerts = [
  {
    id: 1,
    severity: "High",
    message: "CPU usage exceeded 90% on AWS connector",
    timestamp: "2023-06-07T10:30:00Z",
  },
  {
    id: 2,
    severity: "Medium",
    message: "Memory usage reached 80% on Azure connector",
    timestamp: "2023-06-07T11:15:00Z",
  },
  {
    id: 3,
    severity: "Low",
    message: "Network latency increased on Google Cloud connector",
    timestamp: "2023-06-07T12:00:00Z",
  },
]

export function AlertsNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
        <CardDescription>Recent alerts from your connectors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  alert.severity === "High"
                    ? "bg-red-100 text-red-700"
                    : alert.severity === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {alert.severity}
              </span>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{alert.message}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

