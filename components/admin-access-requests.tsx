"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Clock3, ShieldX, X } from "lucide-react";
import {
  formatQuota,
  suggestedQuota,
  type AccessRequest,
  type QuotaUnit,
} from "../lib/access-automation";

type AdminAccessRequestsProps = {
  requests: AccessRequest[];
  onApprove: (requestId: string, quota: number, unit: QuotaUnit, expiresAt: string) => void;
  onReject: (requestId: string, reason: string) => void;
};

const quotaUnits: QuotaUnit[] = ["calls", "tokens", "images", "minutes", "GB", "credits"];

function requestDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function AdminAccessRequests({ requests, onApprove, onReject }: AdminAccessRequestsProps) {
  const [reviewing, setReviewing] = useState<AccessRequest | null>(null);
  const [quota, setQuota] = useState(10_000);
  const [unit, setUnit] = useState<QuotaUnit>("calls");
  const [durationDays, setDurationDays] = useState(30);

  useEffect(() => {
    if (!reviewing) return;
    const suggestion = suggestedQuota(reviewing.serviceName, reviewing.kind);
    setQuota(suggestion.quota);
    setUnit(suggestion.unit);
    setDurationDays(30);
  }, [reviewing]);

  const approve = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewing || !Number.isFinite(quota) || quota <= 0 || durationDays <= 0) return;
    const expiresAt = new Date(Date.now() + durationDays * 86_400_000).toISOString();
    onApprove(reviewing.id, quota, unit, expiresAt);
    setReviewing(null);
  };

  const pending = requests.filter((request) => request.status === "Pending");

  return (
    <>
      <section className="admin-panel admin-access-requests-panel">
        <header>
          <div><p>ACCESS REQUESTS</p><h2>Student approvals</h2></div>
          <span className="admin-request-count"><Clock3 /> {pending.length} pending</span>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Student</th><th>Service</th><th>Project</th><th>Requested</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {requests.length === 0 && <tr><td colSpan={6}><div className="admin-empty-requests">No student access requests yet.</div></td></tr>}
              {requests.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.studentName}</strong><small>{request.studentEmail}</small></td>
                  <td><strong>{request.serviceName}</strong><small>{request.kind}</small></td>
                  <td><strong>{request.projectName}</strong><small>{request.intendedUse}</small></td>
                  <td>{requestDate(request.requestedAt)}</td>
                  <td><span className={`admin-table-status${request.status === "Pending" ? " admin-table-status--review" : ""}`}>{request.status}</span></td>
                  <td>
                    {request.status === "Pending" ? <div className="admin-request-actions"><button type="button" onClick={() => setReviewing(request)}>Review</button><button type="button" className="admin-reject-button" onClick={() => onReject(request.id, "The request did not meet the current access requirements.")}>Reject</button></div> : <span className="admin-reviewed-label">Reviewed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {reviewing && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setReviewing(null)}>
          <form className="admin-student-modal admin-access-review-modal" onSubmit={approve} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><p>APPROVE ACCESS</p><h2>{reviewing.serviceName}</h2><span>Assign the quota and expiry before activating access for {reviewing.studentName}.</span></div><button type="button" aria-label="Close" onClick={() => setReviewing(null)}><X /></button></header>
            <div className="admin-review-summary"><strong>{reviewing.projectName}</strong><span>{reviewing.intendedUse}</span></div>
            <div className="admin-editor-grid">
              <label><span>Quota</span><input type="number" min="1" step="1" value={quota} onChange={(event) => setQuota(Number(event.target.value))} required /></label>
              <label><span>Unit</span><select value={unit} onChange={(event) => setUnit(event.target.value as QuotaUnit)}>{quotaUnits.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span>Access duration</span><select value={durationDays} onChange={(event) => setDurationDays(Number(event.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>1 year</option></select></label>
            </div>
            <div className="admin-quota-preview"><CheckCircle2 /><span><strong>{formatQuota(quota || 0, unit)}</strong> available for {durationDays} days</span></div>
            <footer><button type="button" onClick={() => { onReject(reviewing.id, "The request did not meet the current access requirements."); setReviewing(null); }}><ShieldX /> Reject</button><button type="submit"><CheckCircle2 /> Approve and allocate</button></footer>
          </form>
        </div>
      )}
    </>
  );
}
