import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MachineStats: React.FC = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-900 dark:text-white text-lg font-semibold">Machine Stats</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        {/* Content will be provided by other team members */}
      </CardContent>
    </Card>
  );
};

export default MachineStats; 