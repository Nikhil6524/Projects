import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    time: "00:00",
    cpu: 10,
    memory: 20,
    network: 15,
  },
  {
    time: "04:00",
    cpu: 25,
    memory: 35,
    network: 30,
  },
  {
    time: "08:00",
    cpu: 40,
    memory: 50,
    network: 45,
  },
  {
    time: "12:00",
    cpu: 55,
    memory: 65,
    network: 60,
  },
  {
    time: "16:00",
    cpu: 70,
    memory: 80,
    network: 75,
  },
  {
    time: "20:00",
    cpu: 85,
    memory: 95,
    network: 90,
  },
  {
    time: "23:59",
    cpu: 100,
    memory: 100,
    network: 100,
  },
]

export function PerformanceMetrics() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU Usage"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="memory"
                name="Memory Usage"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="network"
                name="Network Activity"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

