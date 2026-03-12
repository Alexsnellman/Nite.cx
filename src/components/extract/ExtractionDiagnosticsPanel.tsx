import { AlertCircle, CheckCircle2, ExternalLink, FileSearch, Globe, Link2, Clock, Copy, Layers, CalendarDays, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface ExtractionDiagnostics {
  source_url: string;
  links_detected: number;
  pages_crawled: number;
  pagination_pages_crawled?: number;
  date_range_pages_crawled?: number;
  events_extracted: number;
  past_events_skipped?: number;
  duplicates_skipped?: number;
  discovered_sources?: { name: string; url: string; type?: string }[];
  errors: string[];
  event_links?: string[];
  warning?: string;
}

interface Props {
  diagnostics: ExtractionDiagnostics[];
}

export function ExtractionDiagnosticsPanel({ diagnostics }: Props) {
  if (!diagnostics.length) return null;

  const totals = diagnostics.reduce(
    (acc, d) => ({
      links: acc.links + d.links_detected,
      pages: acc.pages + d.pages_crawled,
      paginationPages: acc.paginationPages + (d.pagination_pages_crawled ?? 0),
      dateRangePages: acc.dateRangePages + (d.date_range_pages_crawled ?? 0),
      events: acc.events + d.events_extracted,
      errors: acc.errors + d.errors.length,
      pastSkipped: acc.pastSkipped + (d.past_events_skipped ?? 0),
      dupesSkipped: acc.dupesSkipped + (d.duplicates_skipped ?? 0),
      discoveredSources: acc.discoveredSources + (d.discovered_sources?.length ?? 0),
    }),
    { links: 0, pages: 0, paginationPages: 0, dateRangePages: 0, events: 0, errors: 0, pastSkipped: 0, dupesSkipped: 0, discoveredSources: 0 }
  );

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Globe className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold">{diagnostics.length}</div>
          <div className="text-[10px] text-muted-foreground">Sources</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Link2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold">{totals.links}</div>
          <div className="text-[10px] text-muted-foreground">Links</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <FileSearch className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold">{totals.pages}</div>
          <div className="text-[10px] text-muted-foreground">Pages</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Layers className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <div className="text-lg font-bold">{totals.paginationPages}</div>
          <div className="text-[10px] text-muted-foreground">Pagination</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <CalendarDays className="h-4 w-4 mx-auto mb-1 text-violet-500" />
          <div className="text-lg font-bold">{totals.dateRangePages}</div>
          <div className="text-[10px] text-muted-foreground">Date Range</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-primary" />
          <div className="text-lg font-bold">{totals.events}</div>
          <div className="text-[10px] text-muted-foreground">Events</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
          <div className="text-lg font-bold">{totals.pastSkipped}</div>
          <div className="text-[10px] text-muted-foreground">Past</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Copy className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold">{totals.dupesSkipped}</div>
          <div className="text-[10px] text-muted-foreground">Dupes</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <Compass className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
          <div className="text-lg font-bold">{totals.discoveredSources}</div>
          <div className="text-[10px] text-muted-foreground">New Sources</div>
        </div>
      </div>

      {totals.errors > 0 && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {totals.errors} error(s) across sources
        </div>
      )}

      {/* Per-source detail */}
      <Accordion type="multiple" className="w-full">
        {diagnostics.map((d, i) => {
          const domain = (() => {
            try { return new URL(d.source_url).hostname; } catch { return d.source_url; }
          })();
          const hasErrors = d.errors.length > 0;

          return (
            <AccordionItem key={i} value={`src-${i}`} className="border-border">
              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                <div className="flex items-center gap-2 text-left flex-wrap">
                  {hasErrors ? (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  ) : d.events_extracted > 0 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate max-w-[200px]">{domain}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {d.events_extracted} events
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {d.pages_crawled} pages
                  </Badge>
                  {(d.pagination_pages_crawled ?? 0) > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-500 border-blue-500/30">
                      {d.pagination_pages_crawled} paginated
                    </Badge>
                  )}
                  {(d.past_events_skipped ?? 0) > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-yellow-500 border-yellow-500/30">
                      {d.past_events_skipped} past
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs space-y-2 pb-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                  <span>Links detected:</span><span className="text-foreground">{d.links_detected}</span>
                  <span>Pages crawled:</span><span className="text-foreground">{d.pages_crawled}</span>
                  {(d.pagination_pages_crawled ?? 0) > 0 && (
                    <><span>Pagination pages:</span><span className="text-blue-500">{d.pagination_pages_crawled}</span></>
                  )}
                  {(d.date_range_pages_crawled ?? 0) > 0 && (
                    <><span>Date range pages:</span><span className="text-violet-500">{d.date_range_pages_crawled}</span></>
                  )}
                  <span>Events extracted:</span><span className="text-foreground font-medium">{d.events_extracted}</span>
                  {(d.past_events_skipped ?? 0) > 0 && (
                    <><span>Past events skipped:</span><span className="text-yellow-500">{d.past_events_skipped}</span></>
                  )}
                  {(d.duplicates_skipped ?? 0) > 0 && (
                    <><span>Duplicates skipped:</span><span className="text-muted-foreground">{d.duplicates_skipped}</span></>
                  )}
                </div>

                {d.warning && (
                  <div className="text-yellow-500 text-[11px]">⚠ {d.warning}</div>
                )}

                {d.errors.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-destructive font-medium">Errors:</span>
                    {d.errors.map((err, j) => (
                      <div key={j} className="text-destructive/80 pl-2 break-all">{err}</div>
                    ))}
                  </div>
                )}

                {d.discovered_sources && d.discovered_sources.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-emerald-500 font-medium">Discovered sources:</span>
                    {d.discovered_sources.map((src, j) => (
                      <a
                        key={j}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline pl-2 break-all"
                      >
                        <Compass className="h-3 w-3 shrink-0" />
                        {src.name} {src.type && <Badge variant="outline" className="text-[9px] px-1 py-0">{src.type}</Badge>}
                      </a>
                    ))}
                  </div>
                )}

                {d.event_links && d.event_links.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-medium">Detected event links ({d.event_links.length}):</span>
                    {d.event_links.slice(0, 10).map((link, j) => (
                      <a
                        key={j}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline pl-2 break-all"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {link}
                      </a>
                    ))}
                    {d.event_links.length > 10 && (
                      <div className="text-muted-foreground pl-2">...and {d.event_links.length - 10} more</div>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
