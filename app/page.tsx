import { Sidebar } from "../components/sidebar";
import { BackgroundAnimation } from "../components/background-animation";

function ApiGridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <path d="M9 14.8 11.35 9h1.3L15 14.8M9.8 13h4.4M8 2.75v2.1M12 2.75v2.1M16 2.75v2.1M8 19.15v2.1M12 19.15v2.1M16 19.15v2.1M2.75 8h2.1M2.75 12h2.1M2.75 16h2.1M19.15 8h2.1M19.15 12h2.1M19.15 16h2.1" />
    </svg>
  );
}

function CloudGridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.7 18.5H6.2a4.2 4.2 0 0 1-.5-8.37A6.45 6.45 0 0 1 18 8.7a4.9 4.9 0 0 1-.2 9.8h-2.35" />
      <path d="m12 11-3.2 5.1h2.35V21l4.05-6.15h-2.55L14.2 11H12Z" />
    </svg>
  );
}

function VerifiedGridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.8 19 5.7v5.1c0 4.5-2.7 8.2-7 10.4-4.3-2.2-7-5.9-7-10.4V5.7L12 2.8Z" />
      <path d="m8.7 12 2.1 2.1 4.7-4.8" />
    </svg>
  );
}

function ChartGridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V7M2.5 20.5h20" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="dashboard-shell">
      <BackgroundAnimation />
      <Sidebar />
      <header className="welcome-section">
        <h1 id="welcome-title" className="welcome-title">
          Welcome, User!
        </h1>
      </header>

      <section className="dashboard-grid" aria-label="Dashboard overview">
        <article className="dashboard-card metric-card">
          <div className="card-heading">
            <span className="card-icon card-icon--purple">
              <ApiGridIcon />
            </span>
            <span className="trend trend--up">+12.4%</span>
          </div>
          <p>API requests</p>
          <strong>1,284</strong>
          <span className="card-caption">This month</span>
        </article>

        <article className="dashboard-card metric-card">
          <div className="card-heading">
            <span className="card-icon card-icon--pink">
              <CloudGridIcon />
            </span>
            <span className="status-pill">Active</span>
          </div>
          <p>Azure services</p>
          <strong>12</strong>
          <span className="card-caption">3 regions connected</span>
        </article>

        <article className="dashboard-card metric-card">
          <div className="card-heading">
            <span className="card-icon card-icon--peach">
              <VerifiedGridIcon />
            </span>
            <span className="trend trend--up">+0.6%</span>
          </div>
          <p>Success rate</p>
          <strong>99.8%</strong>
          <span className="card-caption">Last 30 days</span>
        </article>

        <article className="dashboard-card activity-card">
          <div className="card-title-row">
            <div>
              <p className="card-label">REQUEST ACTIVITY</p>
              <h2>Usage overview</h2>
            </div>
            <span className="period-chip">Last 7 days</span>
          </div>
          <div className="chart" aria-label="API request activity chart">
            {[38, 56, 44, 72, 63, 88, 76, 94, 68, 82, 58, 74].map(
              (height, index) => (
                <span
                  key={index}
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
          <div className="chart-labels">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>
        </article>

        <article className="dashboard-card recent-card">
          <div className="card-title-row">
            <div>
              <p className="card-label">LATEST</p>
              <h2>Recent requests</h2>
            </div>
            <button className="text-button" type="button">View all</button>
          </div>
          <div className="request-list">
            <div className="request-row">
              <span className="request-mark request-mark--purple">
                <ApiGridIcon />
              </span>
              <div>
                <strong>GPT API access</strong>
                <small>AI API · 4 minutes ago</small>
              </div>
              <span className="request-status">Approved</span>
            </div>
            <div className="request-row">
              <span className="request-mark request-mark--pink">
                <CloudGridIcon />
              </span>
              <div>
                <strong>Azure Functions</strong>
                <small>Azure · 28 minutes ago</small>
              </div>
              <span className="request-status request-status--pending">Pending</span>
            </div>
            <div className="request-row">
              <span className="request-mark request-mark--peach">
                <ChartGridIcon />
              </span>
              <div>
                <strong>Analytics workspace</strong>
                <small>Visualize · 2 hours ago</small>
              </div>
              <span className="request-status">Ready</span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
