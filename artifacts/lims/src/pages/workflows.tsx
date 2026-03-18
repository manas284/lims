import { useQueryClient } from "@tanstack/react-query";
import { useListWorkflows, getListWorkflowsQueryKey, WorkflowStatus, UpdateWorkflowCurrentStage } from "@workspace/api-client-react";
import { Card, Badge, Button } from "@/components/ui";
import { GitMerge, ArrowRight, PlayCircle, CheckCircle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const STAGES = [
  "received", "logged", "testing", "review", "approved", "completed"
];

export default function Workflows() {
  const { data: workflows, isLoading } = useListWorkflows();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold text-white">Active Workflows</h1>
        <Button><PlayCircle className="w-4 h-4 mr-2" /> New Workflow</Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workflows...</div>
      ) : (
        <div className="grid gap-4">
          {workflows?.map(wf => {
            const currentStageIndex = STAGES.indexOf(wf.currentStage);
            
            return (
              <Card key={wf.id} className="p-6 border border-white/5">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <GitMerge className="w-5 h-5 text-primary" />
                      {wf.workflowName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sample ID: <span className="font-mono text-primary">#{wf.sampleId}</span> • Started {formatDate(wf.createdAt)}
                    </p>
                  </div>
                  <Badge variant={wf.status === 'completed' ? 'success' : wf.status === 'active' ? 'info' : 'default'} className="uppercase">
                    {wf.status}
                  </Badge>
                </div>
                
                {/* Visual Tracker */}
                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
                  <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 ease-in-out glow-primary"
                    style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                  />
                  
                  <div className="relative flex justify-between">
                    {STAGES.map((stage, idx) => {
                      const isPast = idx < currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      
                      return (
                        <div key={stage} className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                            isPast ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(6,182,212,0.5)]" :
                            isCurrent ? "bg-background border-primary text-primary shadow-[0_0_15px_rgba(6,182,212,0.5)]" :
                            "bg-background border-white/10 text-muted-foreground"
                          )}>
                            {isPast ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-mono">{idx + 1}</span>}
                          </div>
                          <span className={cn(
                            "text-xs capitalize font-medium absolute -bottom-6 whitespace-nowrap",
                            isCurrent ? "text-primary text-glow" : 
                            isPast ? "text-white/80" : "text-muted-foreground"
                          )}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-10 flex justify-end">
                  <Button variant="outline" size="sm" disabled={wf.status !== 'active'}>
                    Advance Stage <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
          {workflows?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No active workflows found.</div>
          )}
        </div>
      )}
    </div>
  );
}
