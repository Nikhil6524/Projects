'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Activity, Cloud, Server, Database } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface MetricData {
  Timestamps: string[]
  Values: number[]
  Label: string
}

interface ServiceHealth {
  status: string
  lastUpdated: string
  metrics: {
    availability: number
    latency: number
    errors: number
  }
}

interface Insight {
  performance_summary: {
    avg_cpu: number
    max_cpu: number
    total_network: number
  }
  anomalies: string[]
  recommendations: string[]
}

export default function CloudWatchPage() {
  const [metrics, setMetrics] = useState<{
    ec2_metrics: MetricData[]
    s3_metrics: MetricData[]
    cloudfront_metrics: MetricData[]
  } | null>(null)
  const [alarms, setAlarms] = useState<any[]>([])
  const [serviceHealth, setServiceHealth] = useState<Record<string, ServiceHealth>>({})
  const [insights, setInsights] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [metricsRes, alarmsRes, healthRes, insightsRes] = await Promise.all([
          fetch('http://localhost:5000/cloudwatch/get_metrics'),
          fetch('http://localhost:5000/cloudwatch/get_alarms'),
          fetch('http://localhost:5000/cloudwatch/get_service_health'),
          fetch('http://localhost:5000/cloudwatch/get_insights')
        ])

        const [metricsData, alarmsData, healthData, insightsData] = await Promise.all([
          metricsRes.json(),
          alarmsRes.json(),
          healthRes.json(),
          insightsRes.json()
        ])

        setMetrics(metricsData)
        setAlarms(alarmsData.alarms)
        setServiceHealth(healthData.health_metrics)
        setInsights(insightsData)
      } catch (error) {
        console.error('Failed to fetch CloudWatch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
    </div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/aws" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to AWS Services
        </Link>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Activity className="mr-2 h-4 w-4" />
          Refresh Metrics
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">CloudWatch Dashboard</h1>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {Object.entries(serviceHealth).map(([service, health]) => (
          <div key={service} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{service} Health</h3>
              <span className={`px-2 py-1 rounded-full text-sm ${
                health.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {health.status}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Availability</span>
                <span className="font-medium">{health.metrics.availability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Latency</span>
                <span className="font-medium">{health.metrics.latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-medium">{health.metrics.errors}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* EC2 CPU Utilization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">EC2 CPU Utilization</h3>
          <div className="h-[300px]">
            {metrics?.ec2_metrics && (
              <ResponsiveContainer>
                <LineChart data={metrics.ec2_metrics[0].Values.map((value, index) => ({
                  time: new Date(metrics.ec2_metrics[0].Timestamps[index]).toLocaleTimeString(),
                  value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* S3 Storage Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">S3 Storage Usage</h3>
          <div className="h-[300px]">
            {metrics?.s3_metrics && (
              <ResponsiveContainer>
                <AreaChart data={metrics.s3_metrics[0].Values.map((value, index) => ({
                  time: new Date(metrics.s3_metrics[0].Timestamps[index]).toLocaleTimeString(),
                  value: value / (1024 * 1024 * 1024) // Convert to GB
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis unit="GB" />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      {insights && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Performance Summary</h4>
              <div className="text-sm space-y-1">
                <p>Average CPU: {insights.performance_summary.avg_cpu.toFixed(2)}%</p>
                <p>Max CPU: {insights.performance_summary.max_cpu.toFixed(2)}%</p>
                <p>Total Network: {(insights.performance_summary.total_network / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Anomalies Detected</h4>
              <ul className="text-sm space-y-1">
                {insights.anomalies.map((anomaly, index) => (
                  <li key={index} className="text-red-600">• {anomaly}</li>
                ))}
                {insights.anomalies.length === 0 && (
                  <li className="text-green-600">No anomalies detected</li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Recommendations</h4>
              <ul className="text-sm space-y-1">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-blue-600">• {recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Active Alarms */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
          Active Alarms
        </h3>
        <div className="space-y-4">
          {alarms.filter(alarm => alarm.StateValue === 'ALARM').map((alarm) => (
            <div key={alarm.AlarmName} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800">{alarm.AlarmName}</h4>
              <p className="text-sm text-red-600 mt-1">
                {alarm.AlarmDescription || 'No description provided'}
              </p>
            </div>
          ))}
          {alarms.filter(alarm => alarm.StateValue === 'ALARM').length === 0 && (
            <p className="text-center text-gray-500">No active alarms</p>
          )}
        </div>
      </div>
    </div>
  )
}