'use client';

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const additionalProviders = [
  { name: "DigitalOcean", color: "#0080FF" },
  { name: "IBM Cloud", color: "#1261FE" },
  { name: "Oracle Cloud", color: "#C74634" },
  { name: "Alibaba Cloud", color: "#FF6A00" },
  { name: "Rackspace", color: "#000000" },
  { name: "VMware", color: "#607078" },
];

export default function AddMorePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <BackButton />
        <h2 className="text-2xl font-bold text-gray-900">Add More Cloud Providers</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {additionalProviders.map((provider) => (
          <Card key={provider.name} className="shadow-lg hover:shadow-xl transition-shadow" style={{ borderColor: `${provider.color}33` }}>
            <CardHeader>
              <CardTitle style={{ color: provider.color }}>{provider.name}</CardTitle>
              <CardDescription>Explore {provider.name} services</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                style={{ backgroundColor: provider.color }}
                className="hover:opacity-90 w-full"
                onClick={() => alert("Oops! We don't offer that service now, please wait sometime :)")}
              >
                Add {provider.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
