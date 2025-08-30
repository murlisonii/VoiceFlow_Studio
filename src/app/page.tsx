import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceAgentUI } from "@/components/voice-agent-ui";
import { ApiDocs } from "@/components/api-docs";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-primary/10 rounded-full">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-waveform"
              >
                <path d="M2 13.1a1 1 0 0 0-1 1v.8a1 1 0 0 0 1 1" />
                <path d="M6 7.1a1 1 0 0 0-1 1v6.8a1 1 0 0 0 1 1" />
                <path d="M10 3.1a1 1 0 0 0-1 1v14.8a1 1 0 0 0 1 1" />
                <path d="M14 9.1a1 1 0 0 0-1 1v2.8a1 1.05 1.05 0 0 0 1 1" />
                <path d="M18 11.1a1 1_0_0_0-1 1v.8a1 1_0_0_0_1 1" />
                <path d="M22 13.1a1 1_0_0_0-1 1v.8a1 1_0_0_0_1 1" />
              </svg>
           </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            VoiceFlow Studio
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A plug & play framework to build, test, and deploy conversational voice agents.
          Integrate your own logic, and let us handle the rest.
        </p>
      </div>

      <Tabs defaultValue="agent" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="agent">Voice Agent Demo</TabsTrigger>
          <TabsTrigger value="docs">API & SDK</TabsTrigger>
        </TabsList>
        <TabsContent value="agent">
          <VoiceAgentUI />
        </TabsContent>
        <TabsContent value="docs">
          <ApiDocs />
        </TabsContent>
      </Tabs>
    </main>
  );
}
