import { Header } from "@/components/dashboard/header";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { IdentityCard } from "@/components/dashboard/identity-card";
import { SystemStatus } from "@/components/dashboard/system-status";
import { CronJobs } from "@/components/dashboard/cron-jobs";
import { Sessions } from "@/components/dashboard/sessions";
import { ConnectedServices } from "@/components/dashboard/connected-services";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Footer } from "@/components/dashboard/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <StatsBar />

        {/* Top: Recent Sessions/Topics/Tasks */}
        <Sessions />

        {/* Second Row: Identity + System Status + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <IdentityCard />
          <SystemStatus />
          <ActivityFeed />
        </div>

        {/* Middle: Cron Jobs */}
        <CronJobs />

        {/* Bottom: Connected Services */}
        <ConnectedServices />
      </main>
      <Footer />
    </div>
  );
}
