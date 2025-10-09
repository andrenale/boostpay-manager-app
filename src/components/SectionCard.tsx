import { ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import React from "react";

export interface SectionCardProps {
  number: number;
  title: string;
  subtitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  completed?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  number,
  title,
  subtitle,
  open,
  onOpenChange,
  children,
  completed = false,
}) => {
  return (
    <Card className="border border-boost-border bg-boost-bg-primary">
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-boost-bg-secondary transition-colors">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  completed ? "bg-status-success text-white" : "bg-boost-accent text-white"
                }`}
              >
                {number}
              </div>
              <div className="text-left">
                <h3 className="text-boost-text-primary font-medium">{title}</h3>
                <p className="text-boost-text-secondary text-sm">{subtitle}</p>
              </div>
            </div>
            {open ? (
              <ChevronDown className="h-5 w-5 text-boost-text-secondary" />
            ) : (
              <ChevronRight className="h-5 w-5 text-boost-text-secondary" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-boost-border">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
