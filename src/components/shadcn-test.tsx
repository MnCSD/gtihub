import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ShadcnTest() {
  return (
    <div className="p-8">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>shadcn/ui Test</CardTitle>
          <CardDescription>
            Testing that shadcn/ui components are working properly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Button>Test Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}