"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteAllSubmissionsForCampaign } from "@/lib/actions/submissions";

interface CampaignActionsProps {
  campaignId: string;
  campaignTitle: string;
}

export function CampaignActions({
  campaignId,
  campaignTitle,
}: CampaignActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteSubmissions = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete ALL submissions for "${campaignTitle}"?\n\nThis will permanently delete all submission records and their video files. This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await deleteAllSubmissionsForCampaign(campaignId);

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(`Deleted ${result.deleted} submission(s)`);
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete submissions");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleDeleteSubmissions}
      disabled={deleting}
      className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
    >
      <Trash2 className="h-3 w-3" />
      {deleting ? "Deleting..." : "Clear Submissions"}
    </Button>
  );
}
