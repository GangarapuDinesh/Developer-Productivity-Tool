import { useNavigate } from "react-router-dom";
import { FiCheckSquare,FiCheckCircle,FiCode,FiTrendingUp,FiClock,FiArrowRight,FiFolder,FiGithub,FiBell,FiTarget,FiUsers,FiBarChart2,FiGitBranch,FiMail,FiMapPin,FiZap,FiShield,FiLayers,} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";
function Home() {
  const navigate = useNavigate();
  const features = [
    {
      icon: <FiCheckSquare />,
      title: "Smart Task Management",
      description:
        "Create tasks, set priorities, manage deadlines, and track completion.",
    },
    {
      icon: <FiFolder />,
      title: "Project Management",
      description:
        "Organize projects, monitor progress, and manage important milestones.",
    },
    {
      icon: <FiCode />,
      title: "Code Snippet Library",
      description:
        "Store, search, categorize, and reuse your favorite code snippets.",
    },
    {
      icon: <FiClock />,
      title: "Pomodoro Focus Timer",
      description:
        "Work in focused sessions, schedule breaks, and build better habits.",
    },
    {
      icon: <FiTrendingUp />,
      title: "Productivity Analytics",
      description:
        "Understand your work patterns through progress charts and reports.",
    },
    {
      icon: <FiGitBranch />,
      title: "GitHub Integration",
      description:
        "Connect your development workflow with GitHub repositories.",
    },
    {
      icon: <FiTarget />,
      title: "Goals and Milestones",
      description:
        "Set achievable goals and monitor your progress toward deadlines.",
    },
    {
      icon: <FiBell />,
      title: "Reminders and Alerts",
      description:
        "Stay informed about approaching deadlines and important activities.",
    },
    {
      icon: <FiUsers />,
      title: "Team Collaboration",
      description:
        "Coordinate tasks, assign responsibilities, and collaborate with teammates.",
    },
    {
      icon: <FiBarChart2 />,
      title: "Work Logs and Reports",
      description:
        "Review daily activity and analyze weekly and monthly productivity.",
    },
    {
      icon: <FiShield />,
      title: "Secure Workspace",
      description:
        "Access your personalized workspace through secure user authentication.",
    },
    {
      icon: <FiLayers />,
      title: "Search and Organization",
      description:
        "Quickly find tasks, projects, and saved snippets with organized workflows.",
    },
  ];
  const steps = [
    {
      number: "01",
      icon: <FiUsers />,
      title: "Create Your Account",
      description:
        "Register and access your personalized developer workspace.",
    },
    {
      number: "02",
      icon: <FiZap />,
      title: "Organize Your Workflow",
      description:
        "Create projects, prioritize tasks, save code, and start focus sessions.",
    },
    {
      number: "03",
      icon: <FiTrendingUp />,
      title: "Track Your Progress",
      description:
        "Review work logs, monitor goals, and understand your productivity.",
    },
  ];
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/",
      icon: <FiGithub />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/",
      icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.36V8.99h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.25 2.37 4.25 5.45v6.3ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V8.99h3.56v11.46ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>,
    },
    {
      name: "X",
      url: "https://x.com/",
      icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.42L5.56 22H2.43l7.25-8.29L1.8 2h6.41l4.43 6.77L18.9 2Zm-1.1 18h1.73L7.27 3.9H5.41L17.8 20Z"/></svg>,
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/",
      icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.57 12 3.57 12 3.57s-7.55 0-9.4.51A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.51 9.4.51 9.4.51s7.55 0 9.4-.51a3 3 0 0 0 2.1-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.55 15.6V8.4L15.82 12l-6.27 3.6Z"/></svg>,
    },
  ];
  return (
    <div className="home-page">
      <Navbar />
      <main>
        <section className="home-main" id="home">
          <div className="home-badge">
            <span />
            Your all-in-one developer workspace
          </div>
          <h1>
            Build Better.
            <br />
            <span>Work Smarter.</span>
            <br />
            Code Faster.
          </h1>
          <p className="home-description">
            DevFlow brings your development workflow together in one
            place. Manage projects, organize tasks, save code snippets,
            track productivity, and stay focused on what matters most.
          </p>
          <div className="home-actions">
            <button
              className="home-primary"
              onClick={() => navigate("/register")}
            >
              Get Started Free <FiArrowRight />
            </button>
            <button
              className="home-secondary"
              onClick={() =>
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Explore Features
            </button>
          </div>
          <div className="home-trust-line">
            <span><FiCheckSquare /> Tasks and projects</span>
            <span><FiCode /> Code organization</span>
            <span><FiTrendingUp /> Progress tracking</span>
          </div>
          <div className="home-preview">
            <div className="home-preview-top">
              <div className="home-window-dots">
                <span />
                <span />
                <span />
              </div>
              <span>DevFlow Workspace Preview</span>
              <FiCode />
            </div>
            <div className="home-preview-content">
              <div className="home-preview-sidebar">
                <div className="home-preview-brand">
                  <FiCode /> DevFlow
                </div>
                <span className="active"><FiBarChart2 /> Overview</span>
                <span><FiCheckSquare /> My Tasks</span>
                <span><FiFolder /> Projects</span>
                <span><FiCode /> Code Snippets</span>
                <span><FiClock /> Focus Timer</span>
              </div>
              <div className="home-preview-dashboard">
                <div className="home-preview-heading">
                  <div>
                    <small>YOUR WORKSPACE</small>
                    <h2>Developer Overview</h2>
                  </div>
                  <span className="home-preview-status">
                    <span /> Workspace preview
                  </span>
                </div>
                <div className="home-preview-stats">
                  <article>
                    <FiCheckSquare />
                    <small>Task Management</small>
                    <strong>Stay Organized</strong>
                    <span>Priorities and deadlines</span>
                  </article>
                  <article>
                    <FiClock />
                    <small>Focus Sessions</small>
                    <strong>Work with Focus</strong>
                    <span>Sessions and breaks</span>
                  </article>
                  <article>
                    <FiTrendingUp />
                    <small>Analytics</small>
                    <strong>Track Progress</strong>
                    <span>Reports and insights</span>
                  </article>
                </div>
                <div className="home-preview-bottom">
                  <div>
                    <FiCode />
                    <span>
                      <strong>Your code, organized</strong>
                      <small>Keep useful snippets within reach.</small>
                    </span>
                  </div>
                  <div>
                    <FiTarget />
                    <span>
                      <strong>Your goals, in view</strong>
                      <small>Keep milestones on track.</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="home-preview-note">
              Illustrative interface preview — not live dashboard data.
            </p>
          </div>
        </section>
        <section className="home-section home-features-section" id="features">
          <div className="home-section-heading">
            <span className="home-eyebrow">POWERFUL FEATURES</span>
            <h2>Everything you need to <span>work smarter</span></h2>
            <p>
              A centralized toolkit to manage your daily development
              activities, improve focus, and keep projects moving forward.
            </p>
          </div>
          <div className="home-features">
            {features.map((feature) => (
              <article className="home-feature-card" key={feature.title}>
                <div className="home-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="home-section home-how-section" id="how-it-works">
          <div className="home-section-heading">
            <span className="home-eyebrow">HOW IT WORKS</span>
            <h2>Your workflow, <span>simplified</span></h2>
            <p>
              Get started in a few simple steps and bring your development
              activities into one organized workspace.
            </p>
          </div>
          <div className="home-steps">
            {steps.map((step) => (
              <article className="home-step-card" key={step.number}>
                <span className="home-step-number">{step.number}</span>
                <div className="home-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="home-section home-about-section" id="about">
          <div className="home-about-visual">
            <div className="home-about-orbit orbit-one" />
            <div className="home-about-orbit orbit-two" />
            <div className="home-about-center"><FiCode /></div>
            <div className="home-about-float float-one"><FiCheckSquare /></div>
            <div className="home-about-float float-two"><FiClock /></div>
            <div className="home-about-float float-three"><FiTrendingUp /></div>
          </div>
          <div className="home-about-content">
            <span className="home-eyebrow">ABOUT DEVFLOW</span>
            <h2>Designed around the way developers work.</h2>
            <p>
              DevFlow is a developer productivity platform designed to
              simplify everyday software development activities. It
              combines task and project management, code snippet
              organization, focus sessions, work logs, and productivity
              reporting in a centralized workspace.
            </p>
            <p>
              Our goal is to help developers stay organized, understand
              their progress, and spend more time building meaningful
              software.
            </p>
            <ul className="home-about-list">
              <li><FiCheckCircle /> One organized development workspace</li>
              <li><FiCheckCircle /> Flexible themes for comfortable viewing</li>
              <li><FiCheckCircle /> Tools for individual and team workflows</li>
            </ul>
            <button
              className="home-primary"
              onClick={() => navigate("/register")}
            >
              Join DevFlow <FiArrowRight />
            </button>
          </div>
        </section>
        <section className="home-contact-section" id="contact">
          <div className="home-contact-content">
            <span className="home-eyebrow">CONTACT US</span>
            <h2>Have a question or suggestion?</h2>
            <p>
              We'd love to hear your feedback and ideas for making
              developer workflows more productive.
            </p>
            <div className="home-contact-options">
              <a href="mailto:YOUR_EMAIL@example.com">
                <FiMail />
                <span>
                  <strong>Email us</strong>
                  <small>YOUR_EMAIL@example.com</small>
                </span>
                <FiArrowRight />
              </a>
              <div className="home-contact-note">
                <FiMapPin />
                <span>
                  <strong>Built for developers everywhere</strong>
                  <small>Work, organize, and build from anywhere.</small>
                </span>
              </div>
            </div>
          </div>
          <div className="home-contact-decoration">
            <FiMail />
            <span>Let's build better workflows.</span>
          </div>
        </section>
        <section className="home-cta-section">
          <div className="home-cta-icon"><FiZap /></div>
          <h2>Ready to take control of your workflow?</h2>
          <p>
            Organize your tasks, focus on your goals, and make every
            development session count.
          </p>
          <button
            className="home-cta-button"
            onClick={() => navigate("/register")}
          >
            Start Your Journey <FiArrowRight />
          </button>
        </section>
      </main>
      <footer className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-brand">
            <a href="#home" className="home-footer-logo">
              <span><FiCode /></span>
              DevFlow
            </a>
            <p>
              Your development workspace for smarter tasks, organized
              code, focused work, and measurable progress.
            </p>
            <div className="home-social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${social.name}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="home-footer-column">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About Us</a>
          </div>
          <div className="home-footer-column">
            <h3>Workspace</h3>
            <a href="#features">Task Management</a>
            <a href="#features">Code Snippets</a>
            <a href="#features">Focus Sessions</a>
            <a href="#features">Productivity Reports</a>
          </div>
          <div className="home-footer-column">
            <h3>Get Started</h3>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Create Account</button>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>© {new Date().getFullYear()} DevFlow. Built for developers.</p>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
export default Home;
