import React from "react";
import { Loader2 } from "lucide-react"; // nice spinner icon

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        
      </div>
    </div>
  );
}