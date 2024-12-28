import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const logs = [
  {
    id: 1,
    timestamp: "2023-06-07T13:00:00Z",
    connector: "AWS",
    message: "Successfully synced data from S3 bucket",
  },
  {
    id: 2,
    timestamp: "2023-06-07T13:15:00Z",
    connector: "Azure",
    message: "Updated VM configurations",
  },
  {
    id: 3,
    timestamp: "2023-06-07T13:30:00Z",
    connector: "Google Cloud",
    message: "Deployed new Cloud Function",
  },
]

export function Logs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs</CardTitle>
        <CardDescription>Recent activity logs from your connectors</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Connector</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.connector}</TableCell>
                <TableCell>{log.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

