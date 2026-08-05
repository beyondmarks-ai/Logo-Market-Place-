"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Award,
  BellPlus,
  Boxes,
  CheckCircle2,
  Clock3,
  FileBadge,
  Images,
  LoaderCircle,
  Plus,
  Search,
  Send,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { BackgroundAnimation } from "./background-animation";

export type ManagedStudent = {
  id: string;
  admissionId: string;
  name: string;
  email: string;
  program: string;
  resources: string[];
  status: "Awaiting signup" | "Pending confirmation" | "Active";
  avatarAccess?: "Not requested" | "Pending" | "Approved";
  securityPinHash?: string;
};

export type GeneratedAvatar = { id: string; url: string; createdAt: string };

const resources = [
  { name: "OpenAI API credits", type: "API", assigned: "42 students", remaining: "68%", status: "Healthy" },
  { name: "Azure Student Subscription", type: "Cloud", assigned: "31 students", remaining: "54%", status: "Healthy" },
  { name: "Sarvam AI credits", type: "API", assigned: "18 students", remaining: "29%", status: "Low" },
  { name: "Stream Maker Account", type: "Service", assigned: "12 projects", remaining: "82%", status: "Healthy" },
];

type AdminDashboardProps = {
  students: ManagedStudent[];
  onAddStudent: (student: Omit<ManagedStudent, "id" | "program" | "resources" | "status">) => void;
  onConfirmStudent: (studentId: string) => void;
  avatars: GeneratedAvatar[];
  onAddAvatar: (avatar: GeneratedAvatar) => void;
  onApproveAvatar: (studentId: string) => void;
  onSetStudentPin: (studentId: string, pin: string) => Promise<void>;
  onLogout: () => void;
};

function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <header className="admin-page-header">
      <div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>
      {action}
    </header>
  );
}

export function AdminDashboard({ students, onAddStudent, onConfirmStudent, avatars, onAddAvatar, onApproveAvatar, onSetStudentPin, onLogout }: AdminDashboardProps) {
  const [activeItem, setActiveItem] = useState("Admin Dashboard");
  const [studentQuery, setStudentQuery] = useState("");
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentAdmissionId, setStudentAdmissionId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentFormError, setStudentFormError] = useState("");
  const [sentMessage, setSentMessage] = useState(false);
  const [certificateCreated, setCertificateCreated] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarRemaining, setAvatarRemaining] = useState(6);
  const [pinStudent, setPinStudent] = useState<ManagedStudent | null>(null);
  const [adminPin, setAdminPin] = useState("");
  const [adminPinConfirm, setAdminPinConfirm] = useState("");
  const [adminPinError, setAdminPinError] = useState("");
  const [adminPinSaved, setAdminPinSaved] = useState(false);
  const avatarAutomationStarted = useRef(false);

  const randomAvatarPrompts = [
    "A cheerful robotics student in a violet hoodie with subtle neon details",
    "A confident young cloud engineer wearing modern headphones and a blue jacket",
    "A friendly AI researcher with round glasses and a futuristic academy uniform",
    "A creative student developer with colorful hair and a minimal cyberpunk sweatshirt",
    "A focused data scientist with a warm expression and teal technology accessories",
    "An energetic game developer wearing a dark varsity jacket with purple accents",
    "A calm space-technology student with silver headphones and a midnight-blue outfit",
    "A smiling maker and inventor with expressive eyes and an orange utility jacket",
    "A futuristic student architect with a clean white jacket and luminous cyan details",
    "A friendly open-source coder wearing a black hoodie with abstract geometric accents",
  ];

  const generateAvatar = async (automaticPrompt?: string) => {
    setAvatarBusy(true);
    setAvatarError("");
    try {
      const response = await fetch("/api/avatars/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: automaticPrompt || avatarPrompt }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Avatar generation failed.");
      onAddAvatar({ id: crypto.randomUUID(), url: result.image, createdAt: new Date().toISOString() });
      setAvatarRemaining(result.remaining);
      setAvatarPrompt("");
      return true;
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Avatar generation failed.");
      return false;
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveStudentPin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pinStudent || !/^\d{4}$/.test(adminPin) || adminPin !== adminPinConfirm) {
      setAdminPinError("Enter and confirm the same four-digit PIN.");
      return;
    }
    await onSetStudentPin(pinStudent.id, adminPin);
    setAdminPinSaved(true);
    window.setTimeout(() => {
      setPinStudent(null);
      setAdminPin("");
      setAdminPinConfirm("");
      setAdminPinSaved(false);
    }, 900);
  };

  useEffect(() => {
    if (avatarAutomationStarted.current) return;
    avatarAutomationStarted.current = true;
    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `beyondmarks_avatar_generation_${today}`;
    const getCount = () => Number(localStorage.getItem(storageKey) || "0");
    setAvatarRemaining(Math.max(0, 6 - getCount()));

    const generateRandomAvatar = async () => {
      const count = getCount();
      if (count >= 6) return;
      const prompt = randomAvatarPrompts[Math.floor(Math.random() * randomAvatarPrompts.length)];
      if (await generateAvatar(prompt)) localStorage.setItem(storageKey, String(count + 1));
    };

    const firstAvatar = window.setTimeout(() => void generateRandomAvatar(), avatars.length === 0 ? 1800 : 15 * 60_000);
    const interval = window.setInterval(() => void generateRandomAvatar(), 15 * 60_000);
    return () => { window.clearTimeout(firstAvatar); window.clearInterval(interval); };
  // Automation intentionally starts once for the signed-in admin session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitNotification = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSentMessage(true);
  };

  const submitCertificate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCertificateCreated(true);
  };

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.admissionId} ${student.program}`.toLowerCase().includes(studentQuery.toLowerCase()),
  );

  const addStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = studentEmail.trim().toLowerCase();
    const normalizedAdmissionId = studentAdmissionId.trim().toUpperCase();
    if (!/^[a-z0-9._%+-]+@beyondmarks\.ai$/i.test(normalizedEmail)) {
      setStudentFormError("Assign a valid student email ending in @beyondmarks.ai.");
      return;
    }
    if (students.some((student) => student.email.toLowerCase() === normalizedEmail)) {
      setStudentFormError("That academy email is already assigned to another student.");
      return;
    }
    if (students.some((student) => student.admissionId.toUpperCase() === normalizedAdmissionId)) {
      setStudentFormError("That admission ID already exists.");
      return;
    }
    onAddStudent({ name: studentName.trim(), admissionId: normalizedAdmissionId, email: normalizedEmail });
    setStudentName("");
    setStudentAdmissionId("");
    setStudentEmail("");
    setStudentFormError("");
    setShowStudentForm(false);
  };

  return (
    <main className="admin-shell">
      <BackgroundAnimation />
      <AdminSidebar activeItem={activeItem} onSelectItem={setActiveItem} onLogout={onLogout} />

      <div className="admin-workspace">
        <div className="admin-topbar">
          <div className="admin-identity"><UserCog /><span><strong>Administrator</strong><small>Workspace control center</small></span></div>
          <span className="admin-live-status"><i /> Systems operational</span>
        </div>

        {activeItem === "Admin Dashboard" && (
          <section className="admin-page">
            <AdminPageHeader eyebrow="ADMIN OVERVIEW" title="Good morning, Admin" description="Manage students, resources, communication, and certificates." />
            <div className="admin-stat-row">
              <article><span className="admin-stat-icon admin-stat-icon--purple"><Users /></span><div><small>Total students</small><strong>128</strong><p><b>+12</b> this month</p></div></article>
              <article><span className="admin-stat-icon admin-stat-icon--blue"><Boxes /></span><div><small>Active resources</small><strong>24</strong><p><b>91%</b> healthy</p></div></article>
              <article><span className="admin-stat-icon admin-stat-icon--pink"><BellPlus /></span><div><small>Notifications sent</small><strong>342</strong><p><b>96%</b> delivered</p></div></article>
              <article><span className="admin-stat-icon admin-stat-icon--green"><Award /></span><div><small>Certificates issued</small><strong>86</strong><p><b>8</b> this week</p></div></article>
            </div>
            <div className="admin-overview-panels">
              <section className="admin-panel">
                <header><div><p>RECENT ACTIVITY</p><h2>Latest updates</h2></div><Clock3 /></header>
                <div className="admin-activity-list">
                  <article><span><UserCheck /></span><div><strong>Student access approved</strong><p>Aarav received OpenAI and Azure access.</p></div><time>8 min</time></article>
                  <article><span><FileBadge /></span><div><strong>Certificate generated</strong><p>Cloud Foundations certificate issued.</p></div><time>32 min</time></article>
                  <article><span><Boxes /></span><div><strong>Resource quota updated</strong><p>Sarvam AI credits increased for 8 students.</p></div><time>1 hr</time></article>
                </div>
              </section>
              <section className="admin-panel admin-quick-actions">
                <header><div><p>QUICK ACTIONS</p><h2>Common tasks</h2></div></header>
                <button type="button" onClick={() => setActiveItem("Manage Students")}><Users /><span><strong>Manage students</strong><small>Review accounts and access</small></span></button>
                <button type="button" onClick={() => setActiveItem("Send Notifications")}><Send /><span><strong>Send an update</strong><small>Notify students instantly</small></span></button>
                <button type="button" onClick={() => setActiveItem("Provide Certificate")}><Award /><span><strong>Issue certificate</strong><small>Create a new credential</small></span></button>
              </section>
            </div>
          </section>
        )}

        {activeItem === "Manage Students" && (
          <section className="admin-page">
            <AdminPageHeader eyebrow="STUDENT DIRECTORY" title="Manage students" description="Review student accounts, admission IDs, allocated resources, and confirmation status." action={<button className="admin-primary-action" type="button" onClick={() => setShowStudentForm(true)}><Plus /> Add student</button>} />
            <label className="admin-search"><Search /><input value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} placeholder="Search students by name, email, or program" /></label>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Student</th><th>Admission ID</th><th>Program</th><th>Resources</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {filteredStudents.map((student) => <tr key={student.id}><td><strong>{student.name}</strong><small>{student.email}</small></td><td><code className="admission-code">{student.admissionId}</code></td><td>{student.program}</td><td><span className="resource-count">{student.resources.length}</span> allocated</td><td><span className={`admin-table-status${student.status !== "Active" ? " admin-table-status--review" : ""}`}>{student.status}</span></td><td><div className="student-row-actions">{student.status === "Pending confirmation" ? <button className="confirm-student-button" type="button" onClick={() => onConfirmStudent(student.id)}>Confirm</button> : <button type="button" disabled={student.status === "Awaiting signup"}>{student.status === "Awaiting signup" ? "Waiting" : "Manage"}</button>}<button className="student-pin-button" type="button" disabled={!student.securityPinHash} onClick={() => { setPinStudent(student); setAdminPin(""); setAdminPinConfirm(""); setAdminPinError(""); }}>{student.securityPinHash ? "Reset PIN" : "Set during sign-up"}</button></div></td></tr>)}
            </tbody></table></div>

            {showStudentForm && (
              <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setShowStudentForm(false)}>
                <form className="admin-student-modal" onSubmit={addStudent} onMouseDown={(event) => event.stopPropagation()}>
                  <header><div><p>NEW STUDENT</p><h2>Add student admission</h2><span>Create the record students must match during sign-up.</span></div><button type="button" aria-label="Close" onClick={() => setShowStudentForm(false)}><X /></button></header>
                  <label><span>Student name</span><input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Full legal name" required /></label>
                  <label><span>Admission ID</span><input value={studentAdmissionId} onChange={(event) => setStudentAdmissionId(event.target.value.toUpperCase())} placeholder="ADM-2026-001" required /></label>
                  <label><span>Academy email ID</span><input type="email" value={studentEmail} onChange={(event) => { setStudentEmail(event.target.value); setStudentFormError(""); }} placeholder="studentname@beyondmarks.ai" pattern="^[A-Za-z0-9._%+\-]+@beyondmarks\.ai$" title="Use an email ending in @beyondmarks.ai" required /></label>
                  {studentFormError && <div className="admin-student-form-error">{studentFormError}</div>}
                  <footer><button type="button" onClick={() => setShowStudentForm(false)}>Cancel</button><button type="submit"><Plus /> Create admission</button></footer>
                </form>
              </div>
            )}

            {pinStudent && (
              <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setPinStudent(null)}>
                <form className="admin-student-modal admin-pin-modal" onSubmit={saveStudentPin} onMouseDown={(event) => event.stopPropagation()}>
                  <header><div><p>SECURITY CONTROL</p><h2>Reset student PIN</h2><span>Replace the protected-action PIN for {pinStudent.name}. The previous PIN will stop working immediately.</span></div><button type="button" aria-label="Close" onClick={() => setPinStudent(null)}><X /></button></header>
                  <div className="admin-pin-student"><strong>{pinStudent.name}</strong><span>{pinStudent.email} · {pinStudent.admissionId}</span></div>
                  <label><span>New four-digit PIN</span><input type="password" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" value={adminPin} onChange={(event) => { setAdminPin(event.target.value.replace(/\D/g, "")); setAdminPinError(""); }} placeholder="••••" autoFocus required /></label>
                  <label><span>Confirm new PIN</span><input type="password" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" value={adminPinConfirm} onChange={(event) => { setAdminPinConfirm(event.target.value.replace(/\D/g, "")); setAdminPinError(""); }} placeholder="••••" required /></label>
                  {adminPinError && <div className="admin-student-form-error">{adminPinError}</div>}
                  {adminPinSaved && <div className="admin-success"><CheckCircle2 /> Security PIN updated.</div>}
                  <footer><button type="button" onClick={() => setPinStudent(null)}>Cancel</button><button type="submit" disabled={adminPinSaved}><UserCheck /> Save secure PIN</button></footer>
                </form>
              </div>
            )}
          </section>
        )}

        {activeItem === "Manage Resources" && (
          <section className="admin-page">
            <AdminPageHeader eyebrow="RESOURCE CONTROL" title="Manage resources" description="Monitor shared API credits, services, assignments, and remaining capacity." action={<button className="admin-primary-action" type="button">+ Add resource</button>} />
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Resource</th><th>Type</th><th>Assigned</th><th>Remaining</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {resources.map((resource) => <tr key={resource.name}><td><strong>{resource.name}</strong><small>Shared workspace resource</small></td><td>{resource.type}</td><td>{resource.assigned}</td><td><div className="admin-resource-remaining"><span>{resource.remaining}</span><i><b style={{ width: resource.remaining }} /></i></div></td><td><span className={`admin-table-status${resource.status === "Low" ? " admin-table-status--review" : ""}`}>{resource.status}</span></td><td><button type="button">Configure</button></td></tr>)}
            </tbody></table></div>
          </section>
        )}

        {activeItem === "Send Notifications" && (
          <section className="admin-page admin-form-page">
            <AdminPageHeader eyebrow="COMMUNICATION" title="Send notifications" description="Share announcements, reminders, and important updates with students." />
            <form className="admin-editor" onSubmit={submitNotification}>
              <div className="admin-editor-heading"><span><BellPlus /></span><div><h2>New notification</h2><p>Compose a clear message for your selected audience.</p></div></div>
              {sentMessage && <div className="admin-success"><CheckCircle2 /> Notification sent successfully.</div>}
              <label><span>Audience</span><select required><option>All students</option><option>Active students</option><option>AI Engineering</option><option>Cloud Foundations</option></select></label>
              <label><span>Notification title</span><input placeholder="Scheduled maintenance reminder" required /></label>
              <label><span>Message</span><textarea rows={6} placeholder="Write a helpful message for students..." required /></label>
              <label><span>Priority</span><select><option>Normal</option><option>Important</option><option>Urgent</option></select></label>
              <div className="admin-editor-actions"><button type="button">Save draft</button><button type="submit"><Send /> Send notification</button></div>
            </form>
          </section>
        )}

        {activeItem === "Provide Certificate" && (
          <section className="admin-page admin-form-page">
            <AdminPageHeader eyebrow="CREDENTIALS" title="Provide certificate" description="Create a verifiable certificate for a completed student program." />
            <form className="admin-editor" onSubmit={submitCertificate}>
              <div className="admin-editor-heading"><span className="admin-editor-icon--gold"><Award /></span><div><h2>Issue new certificate</h2><p>Enter the achievement details and generate a credential.</p></div></div>
              {certificateCreated && <div className="admin-success"><CheckCircle2 /> Certificate generated successfully.</div>}
              <div className="admin-editor-grid"><label><span>Student</span><select required><option value="">Select a student</option>{students.filter((student) => student.status === "Active").map((student) => <option key={student.email}>{student.name}</option>)}</select></label><label><span>Program or course</span><input placeholder="AI Engineering" required /></label><label><span>Issue date</span><input type="date" required /></label><label><span>Credential ID</span><input placeholder="CERT-2026-001" required /></label></div>
              <label><span>Achievement note</span><textarea rows={4} placeholder="Successfully completed all required modules and assessments." /></label>
              <div className="admin-editor-actions"><button type="button">Preview</button><button type="submit"><Award /> Generate certificate</button></div>
            </form>
          </section>
        )}

        {activeItem === "Avatar Creator" && (
          <section className="admin-page avatar-creator-page">
            <AdminPageHeader eyebrow="AZURE FOUNDRY" title="Avatar Creator" description="Generate six premium transparent avatars per day with the deployed GPT Image model." />
            <div className="avatar-admin-layout">
              <section className="avatar-generator-card">
                <div className="avatar-generator-heading"><span><Images /></span><div><h2>Automatic avatar studio</h2><p>A new transparent avatar is created every 15 minutes.</p></div><strong>{avatarRemaining}/6 left today</strong></div>
                <label><span>Optional manual idea</span><textarea rows={4} value={avatarPrompt} onChange={(event) => setAvatarPrompt(event.target.value)} placeholder="Leave empty to generate a randomized academy avatar..." /></label>
                {avatarError && <div className="admin-student-form-error">{avatarError}</div>}
                <button className="avatar-generate-button" type="button" onClick={() => generateAvatar()} disabled={avatarBusy || avatarRemaining === 0}>{avatarBusy ? <><LoaderCircle className="avatar-spinner" /> Generating with Azure…</> : <><Images /> Generate one now</>}</button>
              </section>
              <section className="avatar-requests-card"><header><div><p>ACCESS REQUESTS</p><h2>Student approvals</h2></div><span>{students.filter((student) => student.avatarAccess === "Pending").length} pending</span></header>
                <div>{students.filter((student) => student.avatarAccess === "Pending").map((student) => <article key={student.id}><div><strong>{student.name}</strong><small>{student.email}</small></div><button type="button" onClick={() => onApproveAvatar(student.id)}>Approve library</button></article>)}{students.every((student) => student.avatarAccess !== "Pending") && <p className="avatar-no-requests">No avatar requests waiting.</p>}</div>
              </section>
            </div>
            <section className="avatar-library-admin"><header><div><p>AVATAR LIBRARY</p><h2>Generated today</h2></div><span>{avatars.length} available</span></header><div className="avatar-library-grid">{avatars.map((avatar) => <article key={avatar.id}><img src={avatar.url} alt="Generated folder avatar" /><span>Transparent PNG</span></article>)}{avatars.length === 0 && <div className="avatar-library-empty">Your generated avatars will appear here.</div>}</div></section>
          </section>
        )}
      </div>
    </main>
  );
}
