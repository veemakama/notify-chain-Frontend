"use client";

import { useState, useMemo } from "react";
import { Megaphone, Users } from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import {
  NotificationPreview,
  type PreviewPayload,
} from "@/src/components/dashboard/notification-preview";
import { ChannelIcon } from "@/src/components/dashboard/channel-icon";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useData } from "@/src/store";
import { CHAINS, type ChannelType } from "@/src/lib/mock-data";

const CHANNEL_TYPES: ChannelType[] = ["webhook", "email", "telegram", "discord"];

interface FormErrors {
  title?: string;
  message?: string;
  channels?: string;
  recipients?: string;
}

function validate(
  title: string,
  message: string,
  channels: ChannelType[],
  recipientCount: number
): FormErrors {
  const errs: FormErrors = {};
  if (!title.trim()) errs.title = "Title is required.";
  if (!message.trim()) errs.message = "Message is required.";
  if (channels.length === 0) errs.channels = "Select at least one channel.";
  if (recipientCount === 0) errs.recipients = "No recipients match the current filters.";
  return errs;
}

export default function BulkPage() {
  const watchlist = useData((s) => s.watchlist);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Derive recipient count from watchlist filtered by chain / contract
  const recipientCount = useMemo(() => {
    let items = watchlist.filter((w) => w.active);
    if (chainFilter !== "all") items = items.filter((w) => w.chain === chainFilter);
    if (contractFilter !== "all") items = items.filter((w) => w.id === contractFilter);
    // Use eventsToday as a proxy for subscriber-like engagement count
    return items.reduce((sum, w) => sum + Math.max(1, Math.ceil(w.eventsToday / 100)), 0);
  }, [watchlist, chainFilter, contractFilter]);

  // Available contracts depend on chain filter
  const filteredContracts = useMemo(
    () =>
      chainFilter === "all"
        ? watchlist
        : watchlist.filter((w) => w.chain === chainFilter),
    [watchlist, chainFilter]
  );

  function toggleChannel(type: ChannelType) {
    setSelectedChannels((prev) =>
      prev.includes(type) ? prev.filter((c) => c !== type) : [...prev, type]
    );
    if (errors.channels) setErrors((e) => ({ ...e, channels: undefined }));
  }

  const payload: PreviewPayload = {
    title,
    message,
    channels: selectedChannels,
    recipientCount,
    contractFilter: contractFilter === "all" ? "" : (watchlist.find((w) => w.id === contractFilter)?.name ?? ""),
    chain: chainFilter === "all" ? "" : chainFilter,
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(title, message, selectedChannels, recipientCount);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <>
        <Topbar title="Bulk notifications" description="Campaign sent" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Megaphone className="size-7" />
          </span>
          <div>
            <p className="text-lg font-semibold">Campaign dispatched!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              &ldquo;{title}&rdquo; was sent to {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} via{" "}
              {selectedChannels.join(", ")}.
            </p>
          </div>
          <Button variant="outline" onClick={() => { setSubmitted(false); setTitle(""); setMessage(""); setSelectedChannels([]); setChainFilter("all"); setContractFilter("all"); }}>
            Send another
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Bulk notifications"
        description="Compose and send a campaign to multiple recipients"
      />

      <div className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ── Composer form ─────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Message content */}
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-medium">Message</h2>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground" htmlFor="bulk-title">
                  Title <span aria-hidden="true" className="text-destructive">*</span>
                </label>
                <Input
                  id="bulk-title"
                  placeholder="e.g. Network upgrade scheduled"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((v) => ({ ...v, title: undefined })); }}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-err" : undefined}
                />
                {errors.title && (
                  <p id="title-err" className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground" htmlFor="bulk-message">
                  Message <span aria-hidden="true" className="text-destructive">*</span>
                </label>
                <textarea
                  id="bulk-message"
                  rows={4}
                  placeholder="Describe the event or action in plain language…"
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((v) => ({ ...v, message: undefined })); }}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-err" : undefined}
                  className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 aria-invalid:border-destructive"
                />
                {errors.message && (
                  <p id="message-err" className="text-xs text-destructive">{errors.message}</p>
                )}
              </div>
            </section>

            {/* Recipient selection */}
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Recipients</h2>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  {recipientCount} matched
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="chain-filter">
                    Chain
                  </label>
                  <Select value={chainFilter} onValueChange={(v) => { setChainFilter(v); setContractFilter("all"); }}>
                    <SelectTrigger id="chain-filter" className="w-full">
                      <SelectValue placeholder="All chains" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All chains</SelectItem>
                      {CHAINS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="contract-filter">
                    Contract
                  </label>
                  <Select value={contractFilter} onValueChange={setContractFilter}>
                    <SelectTrigger id="contract-filter" className="w-full">
                      <SelectValue placeholder="All contracts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All contracts</SelectItem>
                      {filteredContracts.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {errors.recipients && (
                <p className="text-xs text-destructive">{errors.recipients}</p>
              )}
            </section>

            {/* Channel selection */}
            <section className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-medium">
                Delivery channels <span aria-hidden="true" className="text-destructive">*</span>
              </h2>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CHANNEL_TYPES.map((type) => {
                  const active = selectedChannels.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleChannel(type)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm capitalize transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <ChannelIcon type={type} className="size-5" />
                      {type}
                    </button>
                  );
                })}
              </div>

              {errors.channels && (
                <p className="text-xs text-destructive">{errors.channels}</p>
              )}
            </section>

            <div className="flex justify-end">
              <Button type="submit" disabled={recipientCount === 0}>
                <Megaphone className="size-4" />
                Send campaign
              </Button>
            </div>
          </form>

          {/* ── Preview panel ──────────────────────────────────── */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <NotificationPreview payload={payload} />
          </div>
        </div>
      </div>
    </>
  );
}
