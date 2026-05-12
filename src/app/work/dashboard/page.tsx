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
    <div className="w-full pt-[68px] md:pt-[88px]">
      <DashboardShell>
        <div className="flex w-full min-w-0 flex-col gap-4 bg-[#050505] p-4 sm:p-5 md:gap-6 md:p-7 lg:gap-7 lg:p-8">
          <KpiStrip />

          <div className="grid w-full min-w-0 gap-4 md:gap-6 lg:grid-cols-3 lg:gap-7">
            <div className="min-w-0 lg:col-span-2">
              <DeploysChart />
            </div>
            <div className="min-w-0">
              <StatusDonut />
            </div>
          </div>

          <Heatmap />

          <div className="grid w-full min-w-0 gap-4 md:gap-6 xl:grid-cols-[2fr_1fr] xl:gap-7">
            <div className="min-w-0">
              <ProjectsTable />
            </div>
            <div className="min-w-0">
              <EventFeed />
            </div>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}
