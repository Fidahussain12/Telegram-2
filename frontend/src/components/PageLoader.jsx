import { LoaderIcon } from "lucide-react";
import React from 'react';

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <LoaderIcon className="size-10 animate-spin text-primary" />
    </div>
  );
};

export default PageLoader;