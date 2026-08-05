"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Bot,
  Braces,
  Cloud,
  Clock3,
  Database,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Globe2,
  ImagePlus,
  Images,
  KeyRound,
  Languages,
  LockKeyhole,
  Mail,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserRound,
  Video,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Sidebar } from "../components/sidebar";
import { BackgroundAnimation } from "../components/background-animation";
import { NotificationsMenu } from "../components/notifications-menu";
import { RequestAccessMenu } from "../components/request-access-menu";
import { AdminDashboard, type GeneratedAvatar, type ManagedStudent } from "../components/admin-dashboard";

type AccessRecord = {
  id: string;
  name: string;
  type: "API" | "Azure";
  identifier: string;
  location: string;
  remaining: string;
  progress: number;
  expiry: string;
  status: "Active" | "Expiring soon";
  tone: string;
  icon: LucideIcon;
};

const initialStudents: ManagedStudent[] = [
  { id: "student-1", admissionId: "ADM-2026-001", name: "Aarav Sharma", email: "aarav.sharma@beyondmarks.ai", program: "AI Engineering", resources: ["OpenAI API", "Azure Student", "Project workspace", "Sarvam AI", "Stream Chat", "AI Search"], status: "Active" },
  { id: "student-2", admissionId: "ADM-2026-002", name: "Ananya Iyer", email: "ananya.iyer@beyondmarks.ai", program: "Cloud Foundations", resources: ["Azure Student", "Project workspace", "Blob Storage", "Azure Functions"], status: "Active" },
  { id: "student-3", admissionId: "ADM-2026-003", name: "Rohan Mehta", email: "rohan.mehta@beyondmarks.ai", program: "Full Stack", resources: ["OpenAI API", "Azure Student", "Project workspace"], status: "Pending confirmation" },
  { id: "student-4", admissionId: "ADM-2026-004", name: "Meera Nair", email: "meera.nair@beyondmarks.ai", program: "Data & Analytics", resources: ["Azure Student", "Project workspace", "Cosmos DB", "AI Search", "Databricks"], status: "Active" },
];

const accessRecords: AccessRecord[] = [
  {
    id: "openai-sol",
    name: "GPT-5.6 Sol",
    type: "API",
    identifier: "sk-proj••••84KQ",
    location: "OpenAI",
    remaining: "68% remaining",
    progress: 68,
    expiry: "Sep 30, 2026",
    status: "Active",
    tone: "purple",
    icon: Bot,
  },
  {
    id: "sarvam-105b",
    name: "Sarvam-105B",
    type: "API",
    identifier: "sv-live••••19XR",
    location: "Sarvam AI",
    remaining: "₹1,840 of ₹2,500",
    progress: 74,
    expiry: "Oct 15, 2026",
    status: "Active",
    tone: "green",
    icon: Languages,
  },
  {
    id: "sora-pro",
    name: "Sora 2 Pro",
    type: "API",
    identifier: "sk-video••••73PM",
    location: "OpenAI",
    remaining: "42 minutes left",
    progress: 35,
    expiry: "Aug 31, 2026",
    status: "Expiring soon",
    tone: "peach",
    icon: Video,
  },
  {
    id: "stream-chat",
    name: "Stream Chat",
    type: "API",
    identifier: "stream••••29LT",
    location: "GetStream",
    remaining: "1,642 of 2,000 MAU",
    progress: 82,
    expiry: "Renews monthly",
    status: "Active",
    tone: "cyan",
    icon: MessageCircle,
  },
  {
    id: "blob-storage",
    name: "Azure Blob Storage",
    type: "Azure",
    identifier: "prodassets01",
    location: "Central India",
    remaining: "72 GB of 100 GB",
    progress: 72,
    expiry: "Dec 31, 2026",
    status: "Active",
    tone: "blue",
    icon: Cloud,
  },
  {
    id: "cosmos-db",
    name: "Azure Cosmos DB",
    type: "Azure",
    identifier: "customer-data-db",
    location: "South India",
    remaining: "78% quota left",
    progress: 78,
    expiry: "Dec 31, 2026",
    status: "Active",
    tone: "cyan",
    icon: Database,
  },
  {
    id: "functions",
    name: "Azure Functions",
    type: "Azure",
    identifier: "workflow-functions",
    location: "Central India",
    remaining: "1.4M executions",
    progress: 70,
    expiry: "Nov 30, 2026",
    status: "Active",
    tone: "purple",
    icon: Braces,
  },
  {
    id: "ai-search",
    name: "Azure AI Search",
    type: "Azure",
    identifier: "knowledge-search",
    location: "Central India",
    remaining: "61% capacity left",
    progress: 61,
    expiry: "Sep 15, 2026",
    status: "Expiring soon",
    tone: "pink",
    icon: Search,
  },
];

function AccessRecordIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden="true" />;
}

type Project = {
  id: string;
  name: string;
  github: string;
  deployed: string;
  readme: string;
  images: Array<{ name: string; url: string }>;
};

type ProjectFolder = { id: string; name: string; description: string; tone: string; avatarUrl?: string };
const folderTones = ["purple", "pink", "blue", "peach"];

type DeleteTarget = { type: "folder" | "project"; id: string; name: string };

function ProjectsDashboard({ storageKey, onSecurityCheck, avatars, avatarApproved }: { storageKey: string; onSecurityCheck: (action: () => void, title: string) => void; avatars: GeneratedAvatar[]; avatarApproved: boolean }) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [projects, setProjects] = useState<Record<string, Project[]>>({});
  const [libraryReady, setLibraryReady] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("");
  const [name, setName] = useState("");
  const [github, setGithub] = useState("");
  const [deployed, setDeployed] = useState("");
  const [readme, setReadme] = useState("");
  const [images, setImages] = useState<Array<{ name: string; url: string }>>([]);

  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId);
  const folderProjects = selectedFolderId ? projects[selectedFolderId] ?? [] : [];

  useEffect(() => {
    setLibraryReady(false);
    setSelectedFolderId(null);
    try {
      setFolders(JSON.parse(localStorage.getItem(`beyondmarks_folders_${storageKey}`) || "[]"));
      setProjects(JSON.parse(localStorage.getItem(`beyondmarks_projects_${storageKey}`) || "{}"));
    } catch {
      setFolders([]);
      setProjects({});
    } finally {
      setLibraryReady(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!libraryReady) return;
    localStorage.setItem(`beyondmarks_folders_${storageKey}`, JSON.stringify(folders));
    const persistableProjects = Object.fromEntries(Object.entries(projects).map(([folderId, items]) => [folderId, items.map((project) => ({ ...project, images: [] }))]));
    localStorage.setItem(`beyondmarks_projects_${storageKey}`, JSON.stringify(persistableProjects));
  }, [folders, projects, storageKey, libraryReady]);

  const resetForm = () => {
    setName("");
    setGithub("");
    setDeployed("");
    setReadme("");
    setImages([]);
    setShowForm(false);
  };

  const closeFolder = () => {
    resetForm();
    setSelectedFolderId(null);
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    setImages(
      Array.from(files).slice(0, 6).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    );
  };

  const addProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFolderId || !name.trim()) return;

    const project: Project = {
      id: `${Date.now()}`,
      name: name.trim(),
      github: github.trim(),
      deployed: deployed.trim(),
      readme: readme.trim(),
      images,
    };

    setProjects((current) => ({
      ...current,
      [selectedFolderId]: [...(current[selectedFolderId] ?? []), project],
    }));
    resetForm();
  };

  const addFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = folderName.trim();
    if (!cleanName) return;
    const folder: ProjectFolder = {
      id: crypto.randomUUID(),
      name: cleanName,
      description: folderDescription.trim() || "Student project workspace",
      tone: folderTones[folders.length % folderTones.length],
      avatarUrl: selectedAvatarUrl || undefined,
    };
    setFolders((current) => [...current, folder]);
    setFolderName("");
    setFolderDescription("");
    setSelectedAvatarUrl("");
    setShowFolderForm(false);
  };

  const openQuickProject = () => {
    if (folders.length === 0) {
      setShowFolderForm(true);
      return;
    }
    setSelectedFolderId(folders[0].id);
    setShowForm(true);
  };

  const performDelete = (target: DeleteTarget) => {
    if (target.type === "folder") {
      setFolders((current) => current.filter((folder) => folder.id !== target.id));
      setProjects((current) => {
        const next = { ...current };
        delete next[target.id];
        return next;
      });
      closeFolder();
      return;
    }
    if (!selectedFolderId) return;
    setProjects((current) => ({ ...current, [selectedFolderId]: (current[selectedFolderId] ?? []).filter((project) => project.id !== target.id) }));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    onSecurityCheck(() => performDelete(target), `Delete ${target.type}`);
  };

  return (
    <section className="projects-dashboard" aria-labelledby="projects-title">
      <header className="projects-dashboard-header">
        <div>
          <p>PROJECT LIBRARY</p>
          <h2 id="projects-title">Your project folders</h2>
          <span>Keep source code, deployments, notes, and previews organized.</span>
        </div>
        <div className="project-library-actions">
          <span className="folder-total">{folders.length} {folders.length === 1 ? "folder" : "folders"}</span>
          <button type="button" onClick={() => setShowFolderForm(true)}><Folder /> New folder</button>
          <button type="button" onClick={openQuickProject}><Plus /> Add project</button>
        </div>
      </header>

      {folders.length === 0 ? (
        <div className="empty-project-library">
          <FolderOpen />
          <h3>Your workspace is ready</h3>
          <p>Create your first folder, then add projects, links, README notes, and screenshots.</p>
          <button type="button" onClick={() => setShowFolderForm(true)}><Plus /> Create first folder</button>
        </div>
      ) : <div className="project-folders">
        {folders.map((folder) => {
          const count = projects[folder.id]?.length ?? 0;
          return (
            <button
              className={`project-folder project-folder--${folder.tone}`}
              type="button"
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
            >
              <span className={`project-folder-visual${folder.avatarUrl ? " project-folder-avatar" : ""}`}>{folder.avatarUrl ? <img src={folder.avatarUrl} alt="" /> : <Folder />}</span>
              <span className="project-folder-copy">
                <strong>{folder.name}</strong>
                <small>{folder.description}</small>
              </span>
              <span className="project-folder-count">{count} {count === 1 ? "project" : "projects"}</span>
            </button>
          );
        })}
      </div>}

      {showFolderForm && (
        <div className="folder-dialog-backdrop" role="presentation" onMouseDown={() => setShowFolderForm(false)}>
          <form className="new-folder-dialog" onSubmit={addFolder} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><p>NEW WORKSPACE</p><h2>Create a project folder</h2><span>Approved students can choose an academy-generated avatar.</span></div><button type="button" aria-label="Close" onClick={() => setShowFolderForm(false)}><X /></button></header>
            <div className="new-folder-avatar-preview">{selectedAvatarUrl ? <img src={selectedAvatarUrl} alt="Selected folder avatar preview" /> : <FolderOpen />}</div>
            <label><span>Folder name</span><input value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="AI experiments" autoFocus required /></label>
            <label><span>Description</span><input value={folderDescription} onChange={(event) => setFolderDescription(event.target.value)} placeholder="Models, agents, and prototypes" /></label>
            {avatarApproved && avatars.length > 0 && <div className="folder-avatar-picker"><span>Choose academy avatar</span><div>{avatars.map((avatar) => <button className={selectedAvatarUrl === avatar.url ? "folder-avatar-choice--selected" : ""} type="button" key={avatar.id} onClick={() => setSelectedAvatarUrl(avatar.url)}><img src={avatar.url} alt="Avatar option" /></button>)}</div></div>}
            <footer><button type="button" onClick={() => setShowFolderForm(false)}>Cancel</button><button type="submit"><Plus /> Create folder</button></footer>
          </form>
        </div>
      )}

      {selectedFolder && (
        <div className="folder-dialog-backdrop" role="presentation" onMouseDown={closeFolder}>
          <section
            className="folder-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="folder-dialog-header">
              <div className={`folder-dialog-icon folder-dialog-icon--${selectedFolder.tone}`}>
                <FolderOpen />
              </div>
              <div>
                <p>PROJECT FOLDER</p>
                <h2 id="folder-dialog-title">{selectedFolder.name}</h2>
              </div>
              <button className="folder-dialog-close" type="button" aria-label="Close folder" onClick={closeFolder}>
                <X />
              </button>
            </header>

            {!showForm && (
              <>
                <div className="folder-dialog-toolbar">
                  <p>{folderProjects.length} {folderProjects.length === 1 ? "project" : "projects"}</p>
                  <div>
                    <button className="folder-delete-button" type="button" onClick={() => setDeleteTarget({ type: "folder", id: selectedFolder.id, name: selectedFolder.name })}><Trash2 /> Delete folder</button>
                    <button type="button" onClick={() => setShowForm(true)}><Plus /> Add project</button>
                  </div>
                </div>

                {folderProjects.length === 0 ? (
                  <div className="empty-folder">
                    <FolderOpen />
                    <h3>This folder is empty</h3>
                    <p>Add your first project with links, README notes, and screenshots.</p>
                    <button type="button" onClick={() => setShowForm(true)}><Plus /> Add first project</button>
                  </div>
                ) : (
                  <div className="folder-project-list">
                    {folderProjects.map((project) => (
                      <article className="folder-project-card" key={project.id}>
                        <div className="folder-project-preview">
                          {project.images[0] ? <img src={project.images[0].url} alt="" /> : <FileText />}
                        </div>
                        <div className="folder-project-details">
                          <div className="folder-project-title"><h3>{project.name}</h3><button type="button" aria-label={`Delete ${project.name}`} onClick={() => setDeleteTarget({ type: "project", id: project.id, name: project.name })}><Trash2 /></button></div>
                          <p>{project.readme || "No README added yet."}</p>
                          <div>
                            {project.github && <a href={project.github} target="_blank" rel="noreferrer"><GitBranch /> GitHub</a>}
                            {project.deployed && <a href={project.deployed} target="_blank" rel="noreferrer"><ExternalLink /> Live site</a>}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {showForm && (
              <form className="project-form" onSubmit={addProject}>
                <div className="project-form-heading">
                  <div>
                    <p>NEW PROJECT</p>
                    <h3>Add project details</h3>
                  </div>
                  <button type="button" onClick={resetForm}>Cancel</button>
                </div>

                <label className="project-field project-field--full">
                  <span>Project name <em>Required</em></span>
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Customer support assistant" required />
                </label>
                <label className="project-field">
                  <span><GitBranch /> GitHub link</span>
                  <input type="url" value={github} onChange={(event) => setGithub(event.target.value)} placeholder="https://github.com/you/project" />
                </label>
                <label className="project-field">
                  <span><Globe2 /> Deployed link</span>
                  <input type="url" value={deployed} onChange={(event) => setDeployed(event.target.value)} placeholder="https://project.example.com" />
                </label>
                <label className="project-field project-field--full">
                  <span><FileText /> README</span>
                  <textarea value={readme} onChange={(event) => setReadme(event.target.value)} placeholder="Explain what the project does, how it works, and how to run it..." rows={5} />
                </label>
                <label className="project-image-upload project-field--full">
                  <ImagePlus />
                  <span><strong>Add screenshots</strong><small>PNG, JPG, or WebP · up to 6 images</small></span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => handleImages(event.target.files)} />
                </label>

                {images.length > 0 && (
                  <div className="project-image-previews project-field--full">
                    {images.map((image) => <img src={image.url} alt={image.name} key={image.url} />)}
                  </div>
                )}

                <div className="project-form-actions project-field--full">
                  <button type="button" onClick={resetForm}>Cancel</button>
                  <button type="submit"><Plus /> Add project</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="folder-dialog-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section className="delete-warning-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-warning-title" onMouseDown={(event) => event.stopPropagation()}>
            <span><ShieldAlert /></span>
            <p>PERMANENT ACTION</p>
            <h2 id="delete-warning-title">Delete {deleteTarget.name}?</h2>
            <div>This cannot be undone. {deleteTarget.type === "folder" ? "Every project inside this folder will also be removed." : "The project details, links, README, and previews will be removed."}</div>
            <footer><button type="button" onClick={() => setDeleteTarget(null)}>Keep {deleteTarget.type}</button><button type="button" onClick={confirmDelete}><Trash2 /> Continue securely</button></footer>
          </section>
        </div>
      )}
    </section>
  );
}

type AuthMode = "signin" | "signup" | "admin";

type SignupDetails = { name: string; email: string; admissionId: string; password: string; pin: string };
type StudentSigninDetails = { email: string; password: string };
type SignupResult = "invalid" | "pending" | "active" | "exists";
type StudentAccount = { email: string; passwordHash: string; pinHash?: string };

async function hashStudentPassword(email: string, password: string) {
  const data = new TextEncoder().encode(`${email.trim().toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function AuthScreen({
  onContinue,
  onSignup,
  onSignin,
  onStudentAuthenticated,
}: {
  onContinue: (destination?: "user" | "admin") => void;
  onSignup: (details: SignupDetails) => Promise<SignupResult>;
  onSignin: (details: StudentSigninDetails) => Promise<boolean>;
  onStudentAuthenticated: (email: string) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [email, setEmail] = useState("");
  const [admissionId, setAdmissionId] = useState("");
  const [authError, setAuthError] = useState("");
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [confirmSecurityPin, setConfirmSecurityPin] = useState("");
  const [otpStep, setOtpStep] = useState<"credentials" | "verify">("credentials");
  const [otpChannel, setOtpChannel] = useState<"email" | "sms">("email");
  const [otpRequestId, setOtpRequestId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpTarget, setOtpTarget] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setShowPassword(false);
    setAuthError("");
    setWaitingApproval(false);
    setPassword("");
    setConfirmPassword("");
    setSecurityPin("");
    setConfirmSecurityPin("");
    setOtpStep("credentials");
    setOtpCode("");
    setOtpRequestId("");
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    if (isSignup) {
      if (!email.trim().toLowerCase().endsWith("@beyondmarks.ai")) {
        setAuthError("Use the @beyondmarks.ai email address assigned by your administrator.");
        return;
      }
      if (password !== confirmPassword) {
        setAuthError("The passwords do not match.");
        return;
      }
      if (!/^\d{4}$/.test(securityPin) || securityPin !== confirmSecurityPin) {
        setAuthError("Create and confirm a matching 4-digit security PIN.");
        return;
      }
      const result = await onSignup({ name: signupName, email, admissionId, password, pin: securityPin });
      if (result === "invalid") {
        setAuthError("Admission ID and academy email do not match an admission created by the administrator.");
        setWaitingApproval(false);
        return;
      }
      if (result === "exists") {
        setAuthError("An account already exists for this academy email. Please sign in instead.");
        return;
      }
      if (result === "pending") {
        setAuthError("");
        setWaitingApproval(true);
        return;
      }
      onStudentAuthenticated(email);
      return;
    }
    if (isAdmin) {
      void requestAdminOtp();
      return;
    }
    if (!email.trim().toLowerCase().endsWith("@beyondmarks.ai")) {
      setAuthError("Student sign-in requires your @beyondmarks.ai academy email.");
      return;
    }
    if (!await onSignin({ email, password })) {
      setAuthError("The academy email or password is incorrect, or registration is not complete.");
      return;
    }
    onStudentAuthenticated(email);
  };

  const requestAdminOtp = async () => {
    setOtpBusy(true);
    setAuthError("");
    try {
      const response = await fetch("/api/admin-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send the verification code.");
      setOtpChannel(result.channel);
      setOtpRequestId(result.requestId);
      setOtpTarget(result.maskedTarget);
      setOtpStep("verify");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to send the verification code.");
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyAdminOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOtpBusy(true);
    setAuthError("");
    try {
      const response = await fetch("/api/admin-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: otpRequestId, code: otpCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "That verification code is not valid.");
      onContinue("admin");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "That verification code is not valid.");
    } finally {
      setOtpBusy(false);
    }
  };

  const isSignup = mode === "signup";
  const isAdmin = mode === "admin";

  return (
    <main className="auth-shell">
      <BackgroundAnimation />
      <div className="auth-skip-actions">
        <button className="auth-skip auth-skip--admin" type="button" onClick={() => onContinue("admin")}>
          Skip to admin
        </button>
        <button className="auth-skip" type="button" onClick={() => onContinue("user")}>
          Skip to dashboard <ArrowRight />
        </button>
      </div>

      <section className="auth-layout" aria-label="Account access">
        <div className="auth-intro">
          <p className="auth-kicker">BEYOND MARKS AI ACADEMY</p>
          <h1>Learn. Build.<br />Go beyond.</h1>
          <p className="auth-intro-copy">
            Manage projects, API credentials, Azure services, usage, and renewals from one secure workspace.
          </p>
          <div className="auth-benefits">
            <span><LockKeyhole /> Secure access management</span>
            <span><FolderOpen /> Organized project library</span>
            <span><Cloud /> Cloud services in one view</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-glow" aria-hidden="true" />
          <header className="auth-academy-header">
            <p>WELCOME TO</p>
            <h1>Beyond Marks AI Academy</h1>
          </header>
          <div className="auth-toggle" aria-label="Authentication mode">
            <button
              className={mode === "signin" ? "auth-toggle--active" : ""}
              type="button"
              onClick={() => selectMode("signin")}
            >
              Sign in
            </button>
            <button
              className={mode === "signup" ? "auth-toggle--active" : ""}
              type="button"
              onClick={() => selectMode("signup")}
            >
              Sign up
            </button>
          </div>

          <header className="auth-card-header">
            <p>{isAdmin ? "ADMIN PORTAL" : isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}</p>
            <h2>{isAdmin && otpStep === "verify" ? "Enter security code" : isAdmin ? "Admin sign in" : isSignup ? "Start your workspace" : "Sign in to continue"}</h2>
            <span>
              {isAdmin && otpStep === "verify"
                  ? `We sent a 6-digit code to ${otpTarget}. It expires in 5 minutes.`
                  : isAdmin
                ? "Use your administrator credentials to continue."
                : isSignup
                  ? "Create an account to manage your projects and access."
                  : "Enter your account details to access your dashboard."}
            </span>
          </header>

          {(!isAdmin || otpStep === "credentials") && <form className="auth-form" onSubmit={submitAuth}>
            {isSignup && (
              <label className="auth-field">
                <span>Full name</span>
                <div><UserRound /><input type="text" value={signupName} onChange={(event) => setSignupName(event.target.value)} placeholder="Your full name" autoComplete="name" required /></div>
              </label>
            )}

            {isSignup && (
              <label className="auth-field">
                <span>Admission ID</span>
                <div><KeyRound /><input type="text" value={admissionId} onChange={(event) => setAdmissionId(event.target.value.toUpperCase())} placeholder="ADM-2026-001" required /></div>
              </label>
            )}

            <label className="auth-field">
              <span>{isAdmin ? "Admin email or mobile number" : "Email address"}</span>
              <div><Mail /><input type={isAdmin ? "text" : "email"} value={email} onChange={(event) => setEmail(event.target.value)} placeholder={isAdmin ? "Email or +91 mobile number" : "studentname@beyondmarks.ai"} autoComplete={isAdmin ? "username" : "email"} required /></div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div>
                <LockKeyhole />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} required />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>

            {isSignup && (
              <label className="auth-field">
                <span>Confirm password</span>
                <div><LockKeyhole /><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" minLength={8} required /></div>
              </label>
            )}

            {isSignup && (
              <div className="security-pin-fields">
                <div className="security-pin-heading"><ShieldCheck /><span><strong>Security PIN</strong><small>Required before access requests or deleting work.</small></span></div>
                <label className="auth-field"><span>Create 4-digit PIN</span><div><KeyRound /><input type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} pattern="[0-9]{4}" value={securityPin} onChange={(event) => setSecurityPin(event.target.value.replace(/\D/g, ""))} placeholder="••••" required /></div></label>
                <label className="auth-field"><span>Confirm PIN</span><div><KeyRound /><input type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} pattern="[0-9]{4}" value={confirmSecurityPin} onChange={(event) => setConfirmSecurityPin(event.target.value.replace(/\D/g, ""))} placeholder="••••" required /></div></label>
              </div>
            )}

            {!isSignup && !isAdmin && (
              <div className="auth-form-options">
                <label><input type="checkbox" /> <span>Remember me</span></label>
                <button type="button">Forgot password?</button>
              </div>
            )}

            {authError && <div className="auth-validation-message auth-validation-message--error">{authError}</div>}
            {waitingApproval && (
              <div className="auth-validation-message auth-validation-message--waiting">
                <Clock3 />
                <span><strong>Account locked until approval</strong>Your registration is saved. After an administrator approves it, switch to Sign in and use this email and password.</span>
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={waitingApproval || otpBusy}>
              {waitingApproval ? "Approval pending" : otpBusy && isAdmin ? "Sending secure code…" : isAdmin ? "Send verification code" : isSignup ? "Create account" : "Sign in"}
              <ArrowRight />
            </button>
          </form>}

          {isAdmin && otpStep === "verify" && (
            <form className="auth-form otp-verify-form" onSubmit={verifyAdminOtp}>
              <div className="otp-security-mark"><ShieldCheck /><span><strong>Two-step verification</strong><small>{otpChannel === "email" ? "Email" : "SMS"} delivery protected by Azure</small></span></div>
              <label className="auth-field otp-code-field">
                <span>6-digit verification code</span>
                <div><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" autoFocus required /></div>
              </label>
              {authError && <div className="auth-validation-message auth-validation-message--error">{authError}</div>}
              <button className="auth-submit" type="submit" disabled={otpBusy || otpCode.length !== 6}>{otpBusy ? "Verifying…" : "Verify and continue"}<ArrowRight /></button>
              <div className="otp-verify-actions">
                <button type="button" onClick={requestAdminOtp} disabled={otpBusy}>Send a new code</button>
                <button type="button" onClick={() => { setOtpStep("credentials"); setOtpCode(""); setAuthError(""); }}>Use another admin contact</button>
              </div>
            </form>
          )}

          {(!isAdmin || otpStep === "credentials") && <div className="auth-divider"><span>or</span></div>}

          {(!isAdmin || otpStep === "credentials") && <button
            className={`auth-admin-button${isAdmin ? " auth-admin-button--active" : ""}`}
            type="button"
            onClick={() => selectMode(isAdmin ? "signin" : "admin")}
          >
            {isAdmin ? "Back to user sign in" : "Admin sign in"}
          </button>}

          <p className="auth-terms">
            By continuing, you agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const [appView, setAppView] = useState<"auth" | "user" | "admin">("auth");
  const [currentStudentName, setCurrentStudentName] = useState("Demo Student");
  const [currentStudentEmail, setCurrentStudentEmail] = useState("demo@beyondmarks.ai");
  const [managedStudents, setManagedStudents] = useState<ManagedStudent[]>(initialStudents);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);
  const [generatedAvatars, setGeneratedAvatars] = useState<GeneratedAvatar[]>([]);
  const [studentStorageReady, setStudentStorageReady] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [securityChallenge, setSecurityChallenge] = useState<{ title: string; action: () => void } | null>(null);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    try {
      const storedStudents = localStorage.getItem("beyondmarks_students");
      const storedAccounts = localStorage.getItem("beyondmarks_student_accounts");
      const storedAvatars = localStorage.getItem("beyondmarks_generated_avatars");
      const parsedAccounts: StudentAccount[] = storedAccounts ? JSON.parse(storedAccounts) : [];
      if (storedStudents) {
        const parsedStudents: ManagedStudent[] = JSON.parse(storedStudents);
        setManagedStudents(parsedStudents.map((student) => ({ ...student, securityPinHash: student.securityPinHash || parsedAccounts.find((account) => account.email === student.email.toLowerCase())?.pinHash })));
      }
      if (storedAccounts) setStudentAccounts(parsedAccounts);
      if (storedAvatars) setGeneratedAvatars(JSON.parse(storedAvatars));
    } catch {
      localStorage.removeItem("beyondmarks_students");
      localStorage.removeItem("beyondmarks_student_accounts");
    } finally {
      setStudentStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!studentStorageReady) return;
    localStorage.setItem("beyondmarks_students", JSON.stringify(managedStudents));
  }, [managedStudents, studentStorageReady]);

  useEffect(() => {
    if (!studentStorageReady) return;
    localStorage.setItem("beyondmarks_student_accounts", JSON.stringify(studentAccounts));
  }, [studentAccounts, studentStorageReady]);

  useEffect(() => {
    if (!studentStorageReady) return;
    try { localStorage.setItem("beyondmarks_generated_avatars", JSON.stringify(generatedAvatars)); } catch { /* Keep large images available for this session. */ }
  }, [generatedAvatars, studentStorageReady]);

  const records: AccessRecord[] = useMemo(() => [], [activeItem, currentStudentEmail]);

  const title = activeItem === "Your API Access"
    ? "Your API access"
    : activeItem === "Your Azure Services"
      ? "Your Azure services"
      : "Access overview";

  const copyIdentifier = async (record: AccessRecord) => {
    await navigator.clipboard?.writeText(record.identifier);
    setCopiedId(record.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const requestSignup = async ({ email, admissionId, password, pin }: SignupDetails) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@beyondmarks.ai")) return "invalid" as const;
    const matchingStudent = managedStudents.find(
      (student) => student.email.toLowerCase() === normalizedEmail
        && student.admissionId.toLowerCase() === admissionId.trim().toLowerCase(),
    );

    if (!matchingStudent) return "invalid" as const;
    const existingAccount = studentAccounts.some((account) => account.email === normalizedEmail);
    if (existingAccount) return matchingStudent.status === "Active" ? "exists" as const : "pending" as const;
    if (matchingStudent.status === "Active") {
      const passwordHash = await hashStudentPassword(normalizedEmail, password);
      const pinHash = matchingStudent.securityPinHash || await hashStudentPassword(normalizedEmail, pin);
      setStudentAccounts((current) => [...current, { email: normalizedEmail, passwordHash, pinHash }]);
      setManagedStudents((current) => current.map((student) => student.id === matchingStudent.id ? { ...student, securityPinHash: pinHash } : student));
      return "active" as const;
    }

    const passwordHash = await hashStudentPassword(normalizedEmail, password);
    const pinHash = matchingStudent.securityPinHash || await hashStudentPassword(normalizedEmail, pin);
    setStudentAccounts((current) => [...current, { email: normalizedEmail, passwordHash, pinHash }]);

    setManagedStudents((current) => current.map((student) =>
      student.id === matchingStudent.id ? { ...student, status: "Pending confirmation", securityPinHash: pinHash } : student,
    ));
    return "pending" as const;
  };

  const signInStudent = async ({ email, password }: StudentSigninDetails) => {
    const normalizedEmail = email.trim().toLowerCase();
    const student = managedStudents.find((entry) => entry.email.toLowerCase() === normalizedEmail);
    const account = studentAccounts.find((entry) => entry.email === normalizedEmail);
    if (!student || student.status !== "Active" || !account) return false;
    return account.passwordHash === await hashStudentPassword(normalizedEmail, password);
  };

  const addManagedStudent = (student: Omit<ManagedStudent, "id" | "program" | "resources" | "status">) => {
    setManagedStudents((current) => [
      ...current,
      {
        ...student,
        email: student.email.trim().toLowerCase(),
        id: `student-${Date.now()}`,
        program: "General admission",
        resources: [],
        status: "Awaiting signup",
      },
    ]);
  };

  const confirmManagedStudent = (studentId: string) => {
    setManagedStudents((current) => current.map((student) =>
      student.id === studentId ? { ...student, status: "Active" } : student,
    ));
  };

  const requestAvatarAccess = () => {
    setManagedStudents((current) => current.map((student) => student.email.toLowerCase() === currentStudentEmail ? { ...student, avatarAccess: "Pending" } : student));
  };

  const approveAvatarAccess = (studentId: string) => {
    setManagedStudents((current) => current.map((student) => student.id === studentId ? { ...student, avatarAccess: "Approved" } : student));
  };

  const setStudentSecurityPin = async (studentId: string, pin: string) => {
    const student = managedStudents.find((entry) => entry.id === studentId);
    if (!student) return;
    const email = student.email.toLowerCase();
    const pinHash = await hashStudentPassword(email, pin);
    setManagedStudents((current) => current.map((entry) => entry.id === studentId ? { ...entry, securityPinHash: pinHash } : entry));
    setStudentAccounts((current) => current.map((account) => account.email === email ? { ...account, pinHash } : account));
  };

  const currentStudent = managedStudents.find((student) => student.email.toLowerCase() === currentStudentEmail);

  const openStudentDashboard = (email: string) => {
    const student = managedStudents.find((entry) => entry.email.toLowerCase() === email.trim().toLowerCase());
    setCurrentStudentName(student?.name || "Student");
    setCurrentStudentEmail(email.trim().toLowerCase());
    setAppView("user");
  };

  const requestSecurityCheck = (action: () => void, title: string) => {
    setPinEntry("");
    setPinError("");
    setSecurityChallenge({ action, title });
  };

  const verifySecurityPin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!securityChallenge) return;
    const account = studentAccounts.find((entry) => entry.email === currentStudentEmail);
    const expectedPinHash = currentStudentEmail === "demo@beyondmarks.ai"
      ? await hashStudentPassword(currentStudentEmail, "0000")
      : account?.pinHash || currentStudent?.securityPinHash;
    if (!expectedPinHash) {
      setPinError("No security PIN is registered for this account. Create a new student account with a PIN.");
      return;
    }
    if (await hashStudentPassword(currentStudentEmail, pinEntry) !== expectedPinHash) {
      setPinError("Incorrect security PIN. Check the four digits and try again.");
      return;
    }
    const action = securityChallenge.action;
    setSecurityChallenge(null);
    setPinEntry("");
    action();
  };

  if (appView === "auth") return <AuthScreen onContinue={(destination = "user") => { if (destination === "user") { setCurrentStudentName("Demo Student"); setCurrentStudentEmail("demo@beyondmarks.ai"); } setAppView(destination); }} onSignup={requestSignup} onSignin={signInStudent} onStudentAuthenticated={openStudentDashboard} />;
  if (appView === "admin") return <AdminDashboard students={managedStudents} onAddStudent={addManagedStudent} onConfirmStudent={confirmManagedStudent} avatars={generatedAvatars} onAddAvatar={(avatar) => setGeneratedAvatars((current) => [avatar, ...current])} onApproveAvatar={approveAvatarAccess} onSetStudentPin={setStudentSecurityPin} onLogout={() => setAppView("auth")} />;

  return (
    <main className="dashboard-shell">
      <BackgroundAnimation />
      <Sidebar activeItem={activeItem} onSelectItem={setActiveItem} />
      <header className="welcome-section">
        <h1 id="welcome-title" className="welcome-title">Welcome, {currentStudentName}!</h1>
        <div className="header-actions">
          <RequestAccessMenu onSecurityCheck={requestSecurityCheck} />
          <NotificationsMenu />
        </div>
      </header>

      {activeItem === "Dashboard" ? (
        <ProjectsDashboard storageKey={currentStudentEmail} onSecurityCheck={requestSecurityCheck} avatars={generatedAvatars} avatarApproved={currentStudent?.avatarAccess === "Approved"} />
      ) : activeItem === "Request Avatar" ? (
        <section className="student-avatar-page">
          <header><p>ACADEMY AVATARS</p><h2>Folder avatar library</h2><span>Request access once, then use every approved transparent avatar in your project folders.</span></header>
          {currentStudent?.avatarAccess === "Approved" ? <><div className="student-avatar-status student-avatar-status--approved"><ShieldCheck /><span><strong>Avatar library approved</strong>You can select these avatars while creating a folder.</span></div><div className="student-avatar-grid">{generatedAvatars.map((avatar) => <article key={avatar.id}><img src={avatar.url} alt="Academy folder avatar" /><span>Ready for folders</span></article>)}{generatedAvatars.length === 0 && <p>No avatars have been generated by the administrator yet.</p>}</div></> : currentStudent?.avatarAccess === "Pending" ? <div className="student-avatar-status"><Clock3 /><span><strong>Request awaiting approval</strong>The administrator will review your avatar-library request.</span></div> : <div className="student-avatar-request-card"><Images /><h3>Unlock academy avatars</h3><p>Your security PIN is required before the request is submitted.</p><button type="button" onClick={() => requestSecurityCheck(requestAvatarAccess, "Request avatar access")}>Request avatar access</button></div>}
        </section>
      ) : (
      <section className="access-dashboard" aria-labelledby="access-title">
        <header className="access-dashboard-header">
          <div>
            <div className="access-eyebrow-row">
              <p>ACCESS MANAGEMENT</p>
              <span>Demo data</span>
            </div>
            <h2 id="access-title">{title}</h2>
            <p className="access-dashboard-description">
              Track credentials, service quotas, renewals, and expiration dates in one place.
            </p>
          </div>
          <div className="access-summary" aria-label={`${records.length} active access items`}>
            <strong>{records.length}</strong>
            <span>active items</span>
          </div>
        </header>

        <div className="access-table-wrap">
          <table className="access-table">
            <thead>
              <tr>
                <th>Access</th>
                <th>Key / resource</th>
                <th>Provider / region</th>
                <th>Remaining</th>
                <th>Expiry / renewal</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={7}><div className="empty-access-state"><KeyRound /><strong>No access allocated yet</strong><span>Request an API or Azure service when you are ready.</span></div></td></tr>
              )}
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="access-name-cell">
                      <span className={`access-type-icon access-type-icon--${record.tone}`}>
                        <AccessRecordIcon icon={record.icon} />
                      </span>
                      <div>
                        <strong>{record.name}</strong>
                        <small>{record.type === "API" ? "API credential" : "Azure service"}</small>
                      </div>
                    </div>
                  </td>
                  <td><code>{record.identifier}</code></td>
                  <td>{record.location}</td>
                  <td>
                    <div className="quota-cell">
                      <span>{record.remaining}</span>
                      <span className="quota-track"><span style={{ width: `${record.progress}%` }} /></span>
                    </div>
                  </td>
                  <td>{record.expiry}</td>
                  <td>
                    <span className={`access-status${record.status === "Expiring soon" ? " access-status--warning" : ""}`}>
                      <span />{record.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="copy-access-button"
                      type="button"
                      onClick={() => copyIdentifier(record)}
                      aria-label={`Copy identifier for ${record.name}`}
                    >
                      {copiedId === record.id ? "Copied" : "Copy"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {securityChallenge && (
        <div className="security-pin-backdrop" role="presentation" onMouseDown={() => setSecurityChallenge(null)}>
          <form className="security-pin-dialog" onSubmit={verifySecurityPin} onMouseDown={(event) => event.stopPropagation()}>
            <span className="security-pin-dialog-icon"><ShieldCheck /></span>
            <p>SECURITY CONFIRMATION</p>
            <h2>{securityChallenge.title}</h2>
            <div className="security-pin-description">Enter your private four-digit PIN to confirm this protected action.</div>
            <label><span>Security PIN</span><input type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={4} pattern="[0-9]{4}" value={pinEntry} onChange={(event) => { setPinEntry(event.target.value.replace(/\D/g, "")); setPinError(""); }} placeholder="••••" autoFocus required /></label>
            {pinError && <div className="security-pin-error">{pinError}</div>}
            <footer><button type="button" onClick={() => setSecurityChallenge(null)}>Cancel</button><button type="submit" disabled={pinEntry.length !== 4}><ShieldCheck /> Confirm securely</button></footer>
            {currentStudentEmail === "demo@beyondmarks.ai" && <small className="demo-pin-note">Development shortcut PIN: 0000</small>}
          </form>
        </div>
      )}
    </main>
  );
}
