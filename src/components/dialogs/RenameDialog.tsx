"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    onCommit: (title: string) => void;
}

export default function RenameDialog({ open, onOpenChange, title, onCommit }: RenameDialogProps) {
    const [draft, setDraft] = useState(title);

    // reset the draft to the live title every time the dialog opens
    useEffect(() => {
        if (open) setDraft(title);
    }, [open, title]);

    const commit = () => {
        onCommit(draft.trim() || "Untitled");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename document</DialogTitle>
                </DialogHeader>
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") commit();
                    }}
                    autoFocus
                />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={commit}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
