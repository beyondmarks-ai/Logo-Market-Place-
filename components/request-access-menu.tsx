"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function ApiIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <path d="M9 14.8 11.35 9h1.3L15 14.8M9.8 13h4.4M8 2.75v2.1M12 2.75v2.1M16 2.75v2.1M8 19.15v2.1M12 19.15v2.1M16 19.15v2.1M2.75 8h2.1M2.75 12h2.1M2.75 16h2.1M19.15 8h2.1M19.15 12h2.1M19.15 16h2.1" />
    </svg>
  );
}

function AzureIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.7 18.5H6.2a4.2 4.2 0 0 1-.5-8.37A6.45 6.45 0 0 1 18 8.7a4.9 4.9 0 0 1-.2 9.8h-2.35" />
      <path d="m12 11-3.2 5.1h2.35V21l4.05-6.15h-2.55L14.2 11H12Z" />
    </svg>
  );
}

function AddAccessIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 4.25v11.5M4.25 10h11.5" />
    </svg>
  );
}

function ChevronIcon({ direction = "right" }: { direction?: "right" | "down" | "left" }) {
  const path = direction === "down" ? "m5.5 7.5 4.5 4.5 4.5-4.5" : "m7.5 4.5 5 5.5-5 5.5";
  return (
    <svg className={direction === "left" ? "chevron--left" : undefined} viewBox="0 0 20 20" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function ModelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <path d="M9 9h6v6H9zM8 1.8v2.3M12 1.8v2.3M16 1.8v2.3M8 19.9v2.3M12 19.9v2.3M16 19.9v2.3" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.7" />
      <path d="m5.5 17 4.2-4.2 2.8 2.6 2.6-3 3.4 4.6" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5.5" width="12.5" height="13" rx="3" />
      <path d="m16 10 4.5-2.5v9L16 14" />
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8.5" y="3" width="7" height="13" rx="3.5" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.7" cy="8.7" r="5.2" />
      <path d="m12.6 12.6 3.8 3.8" />
    </svg>
  );
}

function IndicAiIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6.5h14M8.5 6.5v4.2a3.5 3.5 0 0 0 7 0V6.5M6.5 17.5c1.4-2 3.2-3 5.5-3s4.1 1 5.5 3" />
      <circle cx="12" cy="18" r="2.5" />
    </svg>
  );
}

function StreamIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 12h4a4 4 0 0 0 4-4V6M11 12a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-11Z" />
      <path d="M2.8 4h18.4v3.5H2.8zM9 12h6" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v6c0 1.65 3.35 3 7.5 3s7.5-1.35 7.5-3v-6M4.5 11.5v6c0 1.65 3.35 3 7.5 3s7.5-1.35 7.5-3v-6" />
    </svg>
  );
}

function ComputeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="12" rx="2.5" />
      <path d="M8 20h8M12 16v4M7 8h4M7 11.5h7" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="18" r="2.5" /><circle cx="19" cy="18" r="2.5" />
      <path d="m10.8 7.2-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9" />
    </svg>
  );
}

function IntegrationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h12M13 5l3 3-3 3M20 16H8M11 13l-3 3 3 3" />
      <circle cx="4" cy="8" r="1.5" /><circle cx="20" cy="16" r="1.5" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V11M10 20V5M16 20v-7M22 20V8M2.5 20.5h20" />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v3" />
    </svg>
  );
}

function OperationsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12h4l2-5 4 10 2-5h6" />
      <path d="M20 7a9 9 0 1 0 0 10" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
    </svg>
  );
}

function BackupIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.2 8A8 8 0 1 1 4 14M5.2 8V3.8M5.2 8H9.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

type ModelBranch = {
  id: string;
  title: string;
  caption: string;
  accent: string;
  icon: ReactNode;
  models: string[];
};

const modelBranches: ModelBranch[] = [
  {
    id: "openai",
    title: "OpenAI models",
    caption: "Language, reasoning and coding",
    accent: "purple",
    icon: <ModelIcon />,
    models: [
      "GPT-5.6 Sol",
      "GPT-5.6 Terra",
      "GPT-5.6 Luna",
      "GPT-5.5 Pro",
      "GPT-5.5",
      "GPT-5.4 Pro",
      "GPT-5.4",
      "GPT-5.4 mini",
      "GPT-5.4 nano",
      "GPT-5.3-Codex",
      "GPT-5.2 Pro",
      "GPT-5.2",
      "GPT-5.1",
      "GPT-5 Pro",
      "GPT-5",
      "GPT-5 mini",
      "GPT-5 nano",
      "GPT-4.1",
      "GPT-4.1 mini",
      "GPT-4.1 nano",
      "GPT-4o",
      "GPT-4o mini",
      "o3",
      "o4-mini",
      "gpt-oss-120b",
      "gpt-oss-20b",
    ],
  },
  {
    id: "image",
    title: "Microsoft image models",
    caption: "Generate and edit images",
    accent: "pink",
    icon: <ImageIcon />,
    models: [
      "MAI-Image-2.5-Pro",
      "MAI-Image-2.5-Flash",
      "MAI-Image-2.5",
      "MAI-Image-2e",
      "MAI-Image-2",
    ],
  },
  {
    id: "video",
    title: "Video models",
    caption: "Video generation with synced audio",
    accent: "peach",
    icon: <VideoIcon />,
    models: ["Sora 2", "Sora 2 Pro"],
  },
  {
    id: "voice",
    title: "Azure voice models",
    caption: "Realtime voice, audio and speech",
    accent: "blue",
    icon: <VoiceIcon />,
    models: [
      "gpt-realtime-1.5",
      "gpt-realtime",
      "gpt-realtime-mini",
      "gpt-4o-audio-preview",
      "gpt-4o-mini-audio-preview",
      "gpt-4o-mini-tts",
      "tts-1",
      "tts-1-hd",
    ],
  },
  {
    id: "sarvam",
    title: "Sarvam AI models",
    caption: "Indic language, speech and vision APIs",
    accent: "green",
    icon: <IndicAiIcon />,
    models: [
      "Sarvam-105B",
      "Sarvam-30B",
      "Saaras v3",
      "Bulbul v3",
      "Sarvam Translate",
      "Mayura",
      "Sarvam Vision",
    ],
  },
  {
    id: "stream",
    title: "Stream Maker services",
    caption: "Realtime APIs included with your Maker account",
    accent: "cyan",
    icon: <StreamIcon />,
    models: [
      "Stream Chat",
      "Activity Feeds",
      "Video & Audio",
      "AI Moderation",
      "Vision Agents",
    ],
  },
];

const azureServiceBranches: ModelBranch[] = [
  {
    id: "azure-storage",
    title: "Storage",
    caption: "Objects, files, disks and data lakes",
    accent: "blue",
    icon: <StorageIcon />,
    models: [
      "Azure Blob Storage", "Azure Files", "Azure Queue Storage", "Azure Table Storage",
      "Azure Disk Storage", "Azure Data Lake Storage Gen2", "Azure Archive Storage",
      "Azure Elastic SAN", "Azure NetApp Files", "Azure File Sync", "Azure HPC Cache",
    ],
  },
  {
    id: "azure-databases",
    title: "Databases",
    caption: "Relational, NoSQL and managed cache",
    accent: "cyan",
    icon: <DatabaseIcon />,
    models: [
      "Azure SQL Database", "Azure SQL Managed Instance", "SQL Server on Azure VMs",
      "Azure Cosmos DB", "Azure Database for PostgreSQL", "Azure Database for MySQL",
      "Azure Managed Redis", "Azure DocumentDB", "Managed Instance for Apache Cassandra",
    ],
  },
  {
    id: "azure-compute",
    title: "Compute & web",
    caption: "Virtual machines and application hosting",
    accent: "purple",
    icon: <ComputeIcon />,
    models: [
      "Azure Virtual Machines", "Virtual Machine Scale Sets", "Azure App Service",
      "Azure Functions", "Azure Batch", "Azure Service Fabric", "Azure VMware Solution",
      "Azure Virtual Desktop",
    ],
  },
  {
    id: "azure-containers",
    title: "Containers",
    caption: "Managed Kubernetes and container platforms",
    accent: "blue",
    icon: <ModelIcon />,
    models: [
      "Azure Kubernetes Service (AKS)", "Azure Container Apps", "Azure Container Instances",
      "Azure Container Registry", "Azure Red Hat OpenShift", "Azure Kubernetes Fleet Manager",
    ],
  },
  {
    id: "azure-networking",
    title: "Networking",
    caption: "Connectivity, delivery and network security",
    accent: "cyan",
    icon: <NetworkIcon />,
    models: [
      "Azure Virtual Network", "Azure Load Balancer", "Azure Application Gateway",
      "Azure Front Door", "Azure Traffic Manager", "Azure VPN Gateway", "Azure ExpressRoute",
      "Azure Virtual WAN", "Azure Private Link", "Azure DNS", "Azure Firewall",
      "Web Application Firewall", "Azure DDoS Protection", "Azure Bastion", "Azure NAT Gateway",
      "Azure Network Watcher", "Azure Virtual Network Manager", "Azure Public IP",
    ],
  },
  {
    id: "azure-integration",
    title: "Integration & messaging",
    caption: "APIs, workflows, events and realtime messaging",
    accent: "peach",
    icon: <IntegrationIcon />,
    models: [
      "Azure API Management", "Azure Logic Apps", "Azure Service Bus", "Azure Event Grid",
      "Azure Event Hubs", "Azure SignalR Service", "Azure Web PubSub",
      "Azure App Configuration", "Durable Task Scheduler",
    ],
  },
  {
    id: "azure-ai",
    title: "AI & machine learning",
    caption: "Generative AI, search and intelligent APIs",
    accent: "pink",
    icon: <ApiIcon />,
    models: [
      "Azure OpenAI Service", "Azure AI Services", "Azure AI Search", "Azure Machine Learning",
      "Azure AI Document Intelligence", "Azure AI Bot Service", "Azure AI Content Safety",
    ],
  },
  {
    id: "azure-analytics",
    title: "Analytics & data",
    caption: "Data engineering, warehousing and streaming",
    accent: "purple",
    icon: <AnalyticsIcon />,
    models: [
      "Azure Data Factory", "Azure Synapse Analytics", "Azure Databricks", "Azure Data Explorer",
      "Azure Stream Analytics", "Azure Analysis Services", "Azure HDInsight", "Azure Data Share",
      "Microsoft Purview", "Azure Managed Grafana",
    ],
  },
  {
    id: "azure-security",
    title: "Identity & security",
    caption: "Identity, secrets and threat protection",
    accent: "green",
    icon: <SecurityIcon />,
    models: [
      "Microsoft Entra ID", "Microsoft Entra Domain Services", "Azure Managed Identities",
      "Azure Key Vault", "Azure Key Vault Managed HSM", "Microsoft Defender for Cloud",
      "Microsoft Sentinel", "Azure Attestation", "Azure Dedicated HSM",
    ],
  },
  {
    id: "azure-operations",
    title: "Management & monitoring",
    caption: "Observability, governance and cost control",
    accent: "peach",
    icon: <OperationsIcon />,
    models: [
      "Azure Monitor", "Application Insights", "Log Analytics", "Azure Advisor",
      "Azure Automation", "Azure Policy", "Azure Resource Manager", "Azure Cost Management",
      "Azure Chaos Studio",
    ],
  },
  {
    id: "azure-devops",
    title: "Developer & DevOps",
    caption: "Delivery, testing and developer environments",
    accent: "blue",
    icon: <CodeIcon />,
    models: [
      "Azure DevOps", "Azure DevTest Labs", "Azure Deployment Environments",
      "Azure Load Testing", "Azure App Testing", "ARM Templates",
    ],
  },
  {
    id: "azure-iot-recovery",
    title: "IoT, migration & recovery",
    caption: "Connected devices, migration and resilience",
    accent: "green",
    icon: <BackupIcon />,
    models: [
      "Azure IoT Hub", "Azure IoT Central", "Azure Digital Twins", "Device Update for IoT Hub",
      "Azure Migrate", "Azure Database Migration Service", "Azure Backup", "Azure Site Recovery",
      "Recovery Services vault", "Azure Storage Mover",
    ],
  },
];

const itemDescriptions: Record<string, string> = {
  "GPT-5.6 Sol": "OpenAI's flagship model for complex reasoning, coding, and demanding professional work.",
  "GPT-5.6 Terra": "A balanced OpenAI model for strong results with lower cost and faster responses.",
  "GPT-5.6 Luna": "A fast, cost-efficient OpenAI model for simple tasks and high-volume applications.",
  "Sora 2": "OpenAI's video model for generating clips with synchronized audio from text or images.",
  "Sora 2 Pro": "The higher-quality Sora model for more detailed professional video generation.",
  "Sarvam-105B": "Sarvam AI's flagship chat model for advanced reasoning across Indian languages and English.",
  "Sarvam-30B": "A smaller Sarvam chat model for fast, multilingual conversations and language tasks.",
  "Saaras v3": "Converts Indian-language speech into text, translation, transliteration, or code-mixed output.",
  "Bulbul v3": "Turns text into natural-sounding speech across supported Indian languages and English.",
  "Sarvam Translate": "Translates text across 22 Indian languages and English.",
  Mayura: "A translation model optimized for major Indian languages and English.",
  "Sarvam Vision": "Extracts structured, searchable information from documents, scans, and handwriting.",
  "Stream Chat": "Adds production-ready messaging, channels, reactions, threads, and moderation to an app.",
  "Activity Feeds": "Builds personalized timelines, notifications, follows, reactions, and social feeds.",
  "Video & Audio": "Adds video calls, audio rooms, livestreams, recording, and realtime communication.",
  "AI Moderation": "Detects harmful text, images, and video so communities can be moderated automatically.",
  "Vision Agents": "Open-source tools for building AI agents that can join and understand video calls.",
  "Azure Blob Storage": "Object storage for images, videos, backups, logs, and other unstructured files.",
  "Azure Files": "Managed cloud file shares that applications and computers can mount like a network drive.",
  "Azure Queue Storage": "A simple message queue for passing work between application components asynchronously.",
  "Azure Table Storage": "A low-cost NoSQL key-value store for large amounts of structured data.",
  "Azure Disk Storage": "Persistent block storage used as operating-system and data disks for virtual machines.",
  "Azure Data Lake Storage Gen2": "Large-scale storage optimized for analytics, data engineering, and big-data workloads.",
  "Azure Archive Storage": "Very low-cost storage for data that is rarely accessed and kept long term.",
  "Azure SQL Database": "A fully managed relational SQL database without managing servers or operating systems.",
  "Azure SQL Managed Instance": "A managed SQL Server environment with broad compatibility for existing applications.",
  "Azure Cosmos DB": "A globally distributed NoSQL database designed for fast responses at massive scale.",
  "Azure Database for PostgreSQL": "A fully managed PostgreSQL database with backups, patching, and scaling handled by Azure.",
  "Azure Database for MySQL": "A fully managed MySQL database for web and business applications.",
  "Azure Managed Redis": "An in-memory data store used for caching, sessions, and very fast data access.",
  "Azure Virtual Machines": "Cloud computers where you control the operating system, software, CPU, and memory.",
  "Azure App Service": "Hosts web applications and APIs without requiring you to manage virtual machines.",
  "Azure Functions": "Runs small pieces of code when events occur and charges mainly for actual execution.",
  "Azure Kubernetes Service (AKS)": "A managed Kubernetes platform for deploying and scaling containerized applications.",
  "Azure Container Apps": "Runs containers and microservices without requiring direct Kubernetes management.",
  "Azure Container Registry": "A private registry for storing and managing container images and build artifacts.",
  "Azure Virtual Network": "Creates a private network where Azure resources can communicate securely.",
  "Azure Load Balancer": "Distributes network traffic across multiple servers to improve availability and performance.",
  "Azure Application Gateway": "A web traffic load balancer with routing and web application firewall capabilities.",
  "Azure Front Door": "A global entry point that accelerates and protects web applications close to users.",
  "Azure Private Link": "Connects privately to Azure services without sending traffic over the public internet.",
  "Azure API Management": "Publishes, secures, monitors, and manages APIs for developers and applications.",
  "Azure Logic Apps": "Builds automated workflows by connecting applications, data, and external services.",
  "Azure Service Bus": "Reliable enterprise messaging for decoupling applications and processing work asynchronously.",
  "Azure Event Grid": "Routes events from Azure resources to applications using a publish-and-subscribe model.",
  "Azure Event Hubs": "Ingests millions of realtime events from applications, devices, and telemetry sources.",
  "Azure OpenAI Service": "Provides managed access to OpenAI models through Azure security, networking, and governance.",
  "Azure AI Search": "Adds full-text, vector, and hybrid search to applications and AI retrieval systems.",
  "Azure Machine Learning": "Builds, trains, deploys, and manages machine-learning models and workflows.",
  "Azure Data Factory": "Moves and transforms data between systems using visual and code-based pipelines.",
  "Azure Synapse Analytics": "Combines data warehousing, big-data processing, and analytics in one workspace.",
  "Azure Databricks": "A managed Apache Spark platform for data engineering, analytics, and machine learning.",
  "Microsoft Entra ID": "Manages user identities, sign-in, application access, and organizational permissions.",
  "Azure Key Vault": "Securely stores application secrets, encryption keys, and certificates.",
  "Microsoft Defender for Cloud": "Finds security risks and helps protect Azure and hybrid cloud workloads.",
  "Microsoft Sentinel": "A cloud security platform for detecting, investigating, and responding to threats.",
  "Azure Monitor": "Collects metrics and logs to understand the health and performance of applications and resources.",
  "Application Insights": "Monitors application performance, requests, failures, dependencies, and user behavior.",
  "Azure DevOps": "Provides Git repositories, CI/CD pipelines, work tracking, testing, and software delivery tools.",
  "Azure IoT Hub": "Securely connects, monitors, and controls large numbers of internet-connected devices.",
  "Azure Backup": "Protects cloud and on-premises data with managed backups and recovery points.",
  "Azure Site Recovery": "Replicates workloads so they can fail over during an outage or disaster.",
};

const branchFallbacks: Record<string, string> = {
  openai: "An OpenAI language or reasoning model used for text, coding, analysis, and agent workflows.",
  image: "A Microsoft image model for generating or editing images from written instructions.",
  video: "A generative video model that creates moving scenes from text or image prompts.",
  voice: "An audio model for realtime conversation, speech generation, or speech understanding.",
  sarvam: "A Sarvam AI model designed for Indian-language text, speech, translation, or document tasks.",
  stream: "A GetStream service for adding scalable realtime communication or community features to an app.",
  "azure-storage": "An Azure service for storing, moving, or managing application files and data.",
  "azure-databases": "A managed Azure database service that reduces server maintenance and operational work.",
  "azure-compute": "An Azure compute service for running applications, code, or virtualized workloads.",
  "azure-containers": "An Azure service for storing, deploying, or managing containerized applications.",
  "azure-networking": "An Azure networking service for connecting, routing, securing, or delivering traffic.",
  "azure-integration": "An Azure integration service for connecting APIs, workflows, messages, and events.",
  "azure-ai": "An Azure AI service for building intelligent search, generative AI, or machine-learning applications.",
  "azure-analytics": "An Azure data service for collecting, transforming, analyzing, or visualizing information.",
  "azure-security": "An Azure identity or security service for protecting users, secrets, and cloud resources.",
  "azure-operations": "An Azure operations service for monitoring, governing, automating, or optimizing resources.",
  "azure-devops": "An Azure developer service for building, testing, deploying, or managing software.",
  "azure-iot-recovery": "An Azure service for connected devices, workload migration, backup, or disaster recovery.",
};

function describeItem(item: string, branchId: string) {
  if (itemDescriptions[item]) return itemDescriptions[item];
  if (item.includes("Codex")) return "An OpenAI model optimized for software engineering and agentic coding tasks.";
  if (item.includes("mini") || item.includes("nano")) return "A smaller, faster model designed for lower cost and high-volume tasks.";
  if (item.includes("Pro")) return "A higher-capability model intended for difficult tasks where output quality matters most.";
  if (item.includes("realtime")) return "A low-latency model for live voice and audio conversations.";
  if (item.includes("tts")) return "A text-to-speech model that converts written content into spoken audio.";
  return branchFallbacks[branchId] ?? "A selectable API capability available for your application.";
}

export function RequestAccessMenu({ onSecurityCheck }: { onSecurityCheck?: (action: () => void, title: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"root" | "models" | "azure">("root");
  const [openBranch, setOpenBranch] = useState<string | null>("openai");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelQuery, setModelQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsOpen(false);
    window.setTimeout(() => setView("root"), 180);
  };

  useEffect(() => {
    const closeFromOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) closeMenu();
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggleMenu = () => {
    if (isOpen) closeMenu();
    else if (onSecurityCheck) onSecurityCheck(() => setIsOpen(true), "Request access");
    else setIsOpen(true);
  };

  const openCatalog = (catalog: "models" | "azure") => {
    setView(catalog);
    setOpenBranch(catalog === "models" ? "openai" : "azure-storage");
    setModelQuery("");
    setSelectedModel(null);
  };

  const activeBranches = view === "azure" ? azureServiceBranches : modelBranches;

  return (
    <div className="request-access-menu" ref={menuRef}>
      <button
        className="request-access-button"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <span className="request-access-leading"><AddAccessIcon /></span>
        Request Access
        <span className="request-access-chevron"><ChevronIcon direction="down" /></span>
      </button>

      <div
        className={`access-popover${isOpen ? " access-popover--open" : ""}${view !== "root" ? " access-popover--models" : ""}`}
        role="menu"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {view === "root" ? (
          <>
            <div className="access-popover-heading">
              <p>New request</p>
              <h2>Choose access type</h2>
            </div>
            <div className="access-options">
              <button className="access-option" type="button" role="menuitem" onClick={() => openCatalog("models")}>
                <span className="access-option-icon access-option-icon--api"><ApiIcon /></span>
                <span className="access-option-copy">
                  <strong>API Access</strong>
                  <small>Select a model or service and request credentials</small>
                </span>
                <span className="access-option-arrow"><ChevronIcon /></span>
              </button>
              <button className="access-option" type="button" role="menuitem" onClick={() => openCatalog("azure")}>
                <span className="access-option-icon access-option-icon--azure"><AzureIcon /></span>
                <span className="access-option-copy">
                  <strong>Azure Services</strong>
                  <small>Request cloud resources and managed services</small>
                </span>
                <span className="access-option-arrow"><ChevronIcon /></span>
              </button>
            </div>
          </>
        ) : (
          <div className="model-picker">
            <header className="model-picker-header">
              <button type="button" aria-label="Back to access types" onClick={() => setView("root")}>
                <ChevronIcon direction="left" />
              </button>
              <div>
                <p>{view === "azure" ? "Azure services" : "API access"}</p>
                <h2>{view === "azure" ? "Select an Azure service" : "Select a model or service"}</h2>
              </div>
            </header>

            <label className="model-search">
              <SearchIcon />
              <input
                type="search"
                value={modelQuery}
                placeholder={view === "azure" ? "Search Azure services" : "Search models and services"}
                onChange={(event) => setModelQuery(event.target.value)}
              />
            </label>

            <div className="model-branches">
              {activeBranches.map((branch) => {
                const matchingModels = branch.models.filter((model) =>
                  model.toLowerCase().includes(modelQuery.trim().toLowerCase()),
                );
                if (matchingModels.length === 0) return null;

                const expanded = openBranch === branch.id || modelQuery.trim().length > 0;
                return (
                  <section className={`model-branch${expanded ? " model-branch--open" : ""}`} key={branch.id}>
                    <button
                      className="model-branch-trigger"
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpenBranch(expanded ? null : branch.id)}
                    >
                      <span className={`model-branch-icon model-branch-icon--${branch.accent}`}>{branch.icon}</span>
                      <span>
                        <strong>{branch.title}</strong>
                        <small>{branch.caption}</small>
                      </span>
                      <span className="model-branch-count">{matchingModels.length}</span>
                      <span className="model-branch-chevron"><ChevronIcon direction="down" /></span>
                    </button>

                    <div className="model-branch-options">
                      {matchingModels.map((model) => (
                        <div
                          className={`model-choice${selectedModel === model ? " model-choice--selected" : ""}`}
                          key={model}
                        >
                          <button
                            className="model-choice-select"
                            type="button"
                            onClick={() => setSelectedModel(model)}
                          >
                            <span>{model}</span>
                            <span className="model-choice-check" aria-hidden="true">✓</span>
                          </button>
                          <button className="model-info" type="button" aria-label={`About ${model}`}>
                            <span aria-hidden="true">i</span>
                            <span className="model-info-tooltip" role="tooltip">
                              <strong>{model}</strong>
                              {describeItem(model, branch.id)}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <footer className="model-picker-footer">
              <button type="button" disabled={!selectedModel} onClick={closeMenu}>
                {selectedModel ? `Continue with ${selectedModel}` : "Select an option to continue"}
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
