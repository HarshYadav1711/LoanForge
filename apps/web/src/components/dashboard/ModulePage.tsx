import type { DashboardModule } from "@loanforge/shared";

type ModulePageProps = {
  module: DashboardModule;
  title: string;
};

export function ModulePage({ module, title }: ModulePageProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">{title} module</h2>
      <p className="mt-2 text-sm text-slate-600">
        Operations workflows for the <span className="font-medium">{module}</span> team
        will mount here.
      </p>
    </section>
  );
}
