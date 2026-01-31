import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import Link from "next/link";
import { getAllSubmissions } from "@/lib/data/submissions";

export default async function AdminSubmissionsPage() {
  const submissions = await getAllSubmissions();

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Submissions</h1>
        <p className="text-sm text-zinc-400">Review user submissions</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-white">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-zinc-400">No pending submissions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pending.map((submission) => (
              <Link
                key={submission.id}
                href={`/admin/submissions/${submission.id}`}
              >
                <Card className="transition-colors hover:border-zinc-700">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {submission.campaigns?.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        by{" "}
                        {submission.profiles?.full_name ||
                          submission.profiles?.email}{" "}
                        • {formatRelativeTime(submission.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-white">
          Reviewed ({reviewed.length})
        </h2>
        {reviewed.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-zinc-400">No reviewed submissions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reviewed.map((submission) => (
              <Link
                key={submission.id}
                href={`/admin/submissions/${submission.id}`}
              >
                <Card className="transition-colors hover:border-zinc-700">
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {submission.campaigns?.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        by{" "}
                        {submission.profiles?.full_name ||
                          submission.profiles?.email}{" "}
                        • {formatRelativeTime(submission.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={submission.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
