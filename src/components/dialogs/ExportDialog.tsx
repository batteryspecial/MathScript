"use client";
import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { NotebookAPI } from "@/lib/notebook/NotebookAPI";
import { downloadLatex } from "@/lib/latex/export";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: NotebookAPI;
  fileName: string;
}

// grid col widths shared by both tabs, so switch/label/input line up
const GRID = "grid grid-cols-[72px_auto_1fr] items-center gap-x-3 gap-y-3";

function FieldRow({ label, checked, onCheckedChange, children }: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  children: ReactNode;
}) {
	return (
		<>
			<Label className="text-[13px] text-[var(--ms-text)]">{label}</Label>
			<Switch checked={checked} onCheckedChange={onCheckedChange} />
			{children}
		</>
	);
}

export default function ExportDialog({ open, onOpenChange, api, fileName }: ExportDialogProps) {
	const { documentMeta: meta, updateDocumentMeta: update } = api;
	const [calendarOpen, setCalendarOpen] = useState(false);

	const handleDownload = () => {
		downloadLatex(api.exportLatex(), meta.title || fileName);
		onOpenChange(false);
	};

	// best-effort parse so the calendar can highlight the current value;
	// free-form values like "\today" just render with nothing selected
	const parsed = new Date(meta.date);
	const selectedDate = Number.isNaN(parsed.getTime()) ? undefined : parsed;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Export to LaTeX</DialogTitle>
				</DialogHeader>

				<Tabs className='flex flex-col' defaultValue="general">
					<TabsList className='-translate-x-1'>
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="advanced">Advanced</TabsTrigger>
					</TabsList>

					<TabsContent value="general">
						<div className={`${GRID} pt-1`}>
							<FieldRow label="Title" checked={meta.titleOn} onCheckedChange={(v) => update({ titleOn: v })}>
								<Input
								value={meta.title}
								disabled={!meta.titleOn}
								onChange={(e) => update({ title: e.target.value })}
								/>
							</FieldRow>

							<FieldRow label="Author" checked={meta.authorOn} onCheckedChange={(v) => update({ authorOn: v })}>
								<Input
									value={meta.author}
									disabled={!meta.authorOn}
									placeholder="Your name"
									onChange={(e) => update({ author: e.target.value })}
								/>
							</FieldRow>

							<FieldRow label="Date" checked={meta.dateOn} onCheckedChange={(v) => update({ dateOn: v })}>
								<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
								<PopoverTrigger render={
									<Button
										variant="outline"
										disabled={!meta.dateOn}
										className="w-full justify-start font-normal"
									/>
								}>
									{meta.date}
								</PopoverTrigger>
								<PopoverContent className="w-auto border border-[var(--ms-border)] bg-white p-0">
									<Calendar
										mode="single"
										selected={selectedDate}
										onSelect={(d) => {
											if (!d) return;
											update({ date: format(d, "MMMM d, yyyy") });
											setCalendarOpen(false);
										}}
									/>
								</PopoverContent>
								</Popover>
							</FieldRow>

							<FieldRow label="Metadata" checked={meta.metaOn} onCheckedChange={(v) => update({ metaOn: v })}>
								<p className="text-xs text-muted-foreground">PDF title/author + clickable links</p>
							</FieldRow>
						</div>
					</TabsContent>

					<TabsContent value="advanced">
						<div className={`${GRID} pt-1`}>
							<Label className="text-[13px] text-[var(--ms-text)]">Link color</Label>
							<Switch
								checked={meta.colorLinksOn}
								disabled={!meta.metaOn}
								onCheckedChange={(v) => update({ colorLinksOn: v })}
							/>
							<p className="text-xs text-muted-foreground">Colors links/TOC entries blue</p>
						</div>
						{!meta.metaOn && (
							<p className="mt-3 text-xs text-muted-foreground">Turn on Metadata in General to enable this.</p>
						)}
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
					<Button variant="default" className="" onClick={handleDownload}>Download</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
