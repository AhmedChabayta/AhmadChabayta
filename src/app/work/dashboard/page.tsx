import type { Metadata } from "next";
import { DashboardShell } from "./_chrome";
import { KpiStrip } from "./_kpis";
import { DeploysChart, StatusDonut } from "./_charts";
import { Heatmap } from "./_heatmap";
import { EventFeed } from "./_feed";
import { ProjectsTable } from "./_table";

export const metadata: Metadata = {
  title: "Project Atlas — Dashboard",
  description:
    "A full operations dashboard built into the portfolio: KPIs, charts, heatmap, event feed, projects table.",
};

export default function DashboardPage() {
  return (
    <div
      // The global Nav is fixed at top — push dashboard chrome below it.
      style={{ "--nav-offset": "68px" } as React.CSSProperties}
      className="pt-[68px] md:pt-[88px]"
    >
      <DashboardShell>
        <div className="flex flex-col gap-6 bg-[#050505] p-5 md:gap-7 md:p-8">
          <KpiStrip />

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-7">
            <div className="lg:col-span-2">
              <DeploysChart />
            </div>
            <div>
              <StatusDonut />
            </div>
          </div>

          <Heatmap />

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:gap-7">
            <ProjectsTable />
            <EventFeed />
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}
