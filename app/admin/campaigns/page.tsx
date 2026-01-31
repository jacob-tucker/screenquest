import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { getAllCampaigns } from "@/lib/data/campaigns";

export default async function AdminCampaignsPage() {
  const campaigns = await getAllCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Campaigns</h1>
          <p className="text-sm text-zinc-400">Manage bounty campaigns</p>
        </div>
        <Link href="/admin/campaigns/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-zinc-400">No campaigns yet</p>
            <Link href="/admin/campaigns/new" className="mt-2 inline-block">
              <Button size="sm">Create your first campaign</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="transition-colors hover:border-zinc-700"
            >
              <CardContent className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-white">
                      {campaign.title}
                    </h3>
                    <Badge variant={campaign.is_active ? "success" : "default"}>
                      {campaign.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {campaign.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-emerald-400" />
                      {campaign.points_reward} points
                    </span>
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {new URL(campaign.target_url).hostname}
                    </span>
                    <span>Created {formatDate(campaign.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
