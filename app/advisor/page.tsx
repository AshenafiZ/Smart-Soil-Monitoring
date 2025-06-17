'use client';

import { UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const AdvisorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-[calc(100vh-64px)]">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
        <UserCheck className="w-6 h-6 mr-2" />
        Agricultural Advisor Hub
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Advisor Hub</CardTitle>
          <CardDescription>
            Empowering farmers with expert guidance on sustainable agriculture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Our agricultural advisory services provide farmers with tailored advice to enhance productivity, sustainability, and profitability. From crop management to financial planning, our advisors are here to support your farming journey.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Crop Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Optimize crop yields with expert recommendations on planting, pest control, and nutrient management.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sustainability Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Implement regenerative agriculture practices to improve soil health and reduce environmental impact.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Business Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Develop robust financial strategies to ensure long-term farm success and legacy planning.
                </p>
              </CardContent>
            </Card>
          </div>
          <Button className="mt-6" variant="default">
            Contact an Advisor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorPage;