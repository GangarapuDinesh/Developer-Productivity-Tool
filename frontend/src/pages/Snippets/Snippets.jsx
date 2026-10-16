import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCode,FiCopy,FiEdit2,FiPlus,FiSearch,FiTrash2,FiX,FiCheck,FiFilter,FiRefreshCw,} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useTheme } from "../../context/ThemeContext";
import snippetService from "../../services/snippetService";
import "./Snippets.css";
const emptyForm = {
  title: "",
  language: "JavaScript",
  category: "",
  description: "",
  code: "",
};
const languages = [
  "JavaScript",
  "Java",
  "Python",
  "C",
  "C++",
  "SQL",
  "HTML",
  "CSS",
  "TypeScript",
  "Other",
];
function normalizeSnippet(item) {
  return {
    id: item.id ?? item.snippetId,
    title: item.title ?? "",
    language: item.language ?? "Other",
    category: item.category ?? "",
    description: item.description ?? "",
    code: item.code ?? "",
    createdAt: item.createdAt
      ? String(item.createdAt).slice(0, 10)
      : item.createdDate
        ? String(item.createdDate).slice(0, 10)
        : "—",
  };
}
function getPrismLanguage(language) {
  const languageMap = {
    JavaScript: "javascript",
    Java: "java",
    Python: "python",
    C: "c",
    "C++": "cpp",
    SQL: "sql",
    HTML: "markup",
    CSS: "css",
    TypeScript: "typescript",
    Other: "clike",
  };
  return languageMap[language] || "clike";
}
function Snippets() {
  const { theme } = useTheme();
  const currentTheme = ["light", "dark", "eye"].includes(theme)
    ? theme
    : "light";
  const [snippets, setSnippets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [copiedId, setCopiedId] = useState(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const loadSnippets = async () => {
    setLoading(true);
    setPageError("");
    try {
      const data = await snippetService.getAllSnippets();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setSnippets(items.map(normalizeSnippet));
    } catch (error) {
      console.error("Failed to load snippets:", error);
      setPageError(error.response?.data?.message || "Could not load snippets. Check that the Spring Boot backend is running.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSnippets();
  }, []);
  const filteredSnippets = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return snippets.filter((snippet) => {
      const matchesLanguage =
        selectedLanguage === "All" ||
        snippet.language === selectedLanguage;
      const searchableText = [
        snippet.title,
        snippet.language,
        snippet.category,
        snippet.description,
        snippet.code,
      ]
        .join(" ")
        .toLowerCase();
      return matchesLanguage && searchableText.includes(search);
    });
  }, [snippets, searchTerm, selectedLanguage]);
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setFormError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };
  const openEditModal = (snippet) => {
    setEditingId(snippet.id);
    setFormData({
      title: snippet.title,
      language: snippet.language,
      category: snippet.category,
      description: snippet.description,
      code: snippet.code,
    });
    setFormError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };
  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setFormError("");
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const handleSave = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.code.trim()
    ) {
      setFormError(
        "Please enter a title, category, and code before saving."
      );
      return;
    }
    const snippetData = {
      title: formData.title.trim(),
      language: formData.language,
      category: formData.category.trim(),
      description: formData.description.trim(),
      code: formData.code,
    };
    setSaving(true);
    try {
      if (editingId !== null) {
        const updated = await snippetService.updateSnippet(
          editingId,
          snippetData
        );
        const normalized = normalizeSnippet(updated);
        setSnippets((previous) =>
          previous.map((snippet) =>
            snippet.id === editingId ? normalized : snippet
          )
        );
        setSuccessMessage("Snippet updated successfully.");
      } else {
        const created = await snippetService.createSnippet(
          snippetData
        );
        const normalized = normalizeSnippet(created);
        setSnippets((previous) => [normalized, ...previous]);
        setSuccessMessage("Snippet created successfully.");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      setFormError("");
    } catch (error) {
      console.error("Failed to save snippet:", error);
      setFormError(error.response?.data?.message || "Unable to save the snippet. Check the backend and try again.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this snippet?");
    if (!confirmed) return;
    setPageError("");
    setSuccessMessage("");
    try {
      await snippetService.deleteSnippet(id);
      setSnippets((previous) =>
        previous.filter((snippet) => snippet.id !== id)
      );
      setSuccessMessage("Snippet deleted successfully.");
    } catch (error) {
      console.error("Failed to delete snippet:", error);
      setPageError(error.response?.data?.message ||"Unable to delete the snippet. Please try again.");
    }
  };
  const handleCopy = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      window.setTimeout(() => {
        setCopiedId((current) =>
          current === snippet.id ? null : current
        );
      }, 1800);
    } catch {
      window.alert("Copying was blocked by your browser. Select the code and copy it manually.");
    }
  };
  return (
    <>
      <Navbar />
      <div className={`snippets-layout theme-${currentTheme}`}>
        <Sidebar />
        <main className="snippets-main">
          <header className="snippets-header">
            <div>
              <span className="snippets-eyebrow">
                DEVELOPER WORKSPACE
              </span>
              <h1>Code Snippets</h1>
              <p>
                Save, organize, and reuse your favorite pieces of code.
              </p>
            </div>
            <div className="snippets-header-actions">
              <button
                type="button"
                className="snippets-primary-btn"
                onClick={openAddModal}
              >
                <FiPlus />
                <span>Add Snippet</span>
              </button>
            </div>
          </header>
          {pageError && (
            <div className="snippet-form-error" role="alert">
              {pageError}
              <button
                type="button"
                onClick={loadSnippets}
                disabled={loading}
                aria-label="Retry loading snippets"
              >
                <FiRefreshCw /> Retry
              </button>
            </div>
          )}
          {successMessage && (
            <p className="snippets-success-message" role="status">
              {successMessage}
            </p>
          )}
          <section className="snippets-stats">
            <div className="snippets-stat-card">
              <div className="snippets-stat-icon">
                <FiCode />
              </div>
              <div>
                <span>Total Snippets</span>
                <strong>{snippets.length}</strong>
              </div>
            </div>
            <div className="snippets-stat-card">
              <div className="snippets-stat-icon snippets-stat-purple">
                <FiFilter />
              </div>
              <div>
                <span>Languages Used</span>
                <strong>
                  {new Set(snippets.map((item) => item.language)).size}
                </strong>
              </div>
            </div>
            <div className="snippets-stat-card">
              <div className="snippets-stat-icon snippets-stat-green">
                <FiCheck />
              </div>
              <div>
                <span>Showing Results</span>
                <strong>{filteredSnippets.length}</strong>
              </div>
            </div>
          </section>
          <section className="snippets-toolbar">
            <div className="snippets-search">
              <FiSearch />
              <input
                type="search"
                placeholder="Search snippets, code, or categories..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search snippets"
              />
            </div>
            <select
              className="snippets-language-filter"
              value={selectedLanguage}
              onChange={(event) => setSelectedLanguage(event.target.value)}
              aria-label="Filter by programming language"
            >
              <option value="All">All Languages</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </section>
          <div className="snippets-results-heading">
            <h2>Your Library</h2>
            <span>
              {filteredSnippets.length}{" "}
              {filteredSnippets.length === 1 ? "snippet" : "snippets"}
            </span>
          </div>
          {loading ? (
            <div className="snippets-empty">
              <FiRefreshCw />
              <h3>Loading snippets...</h3>
              <p>Connecting to your backend.</p>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="snippets-empty">
              <div className="snippets-empty-icon">
                <FiCode />
              </div>
              <h3>No snippets found</h3>
              <p>
                Try another search or add a new code snippet to your library.
              </p>
              <button
                type="button"
                className="snippets-primary-btn"
                onClick={openAddModal}
              >
                <FiPlus />
                Add Your First Snippet
              </button>
            </div>
          ) : (
            <section className="snippets-grid">
              {filteredSnippets.map((snippet) => (
                <article className="snippet-card" key={snippet.id}>
                  <div className="snippet-card-header">
                    <div className="snippet-language-icon">
                      <FiCode />
                    </div>
                    <div className="snippet-card-actions">
                      <button
                        type="button"
                        onClick={() => openEditModal(snippet)}
                        title="Edit snippet"
                        aria-label={`Edit ${snippet.title}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="snippet-delete-btn"
                        onClick={() => handleDelete(snippet.id)}
                        title="Delete snippet"
                        aria-label={`Delete ${snippet.title}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="snippet-card-title">
                    <h3>{snippet.title}</h3>
                    <span className="snippet-language-badge">
                      {snippet.language}
                    </span>
                  </div>
                  <p className="snippet-description">
                    {snippet.description || "No description provided."}
                  </p>
                  <div className="snippet-category-row">
                    <span className="snippet-category">
                      {snippet.category || "Uncategorized"}
                    </span>
                    <span className="snippet-date">
                      {snippet.createdAt}
                    </span>
                  </div>
                  <div className="snippet-code-header">
                    <span>CODE PREVIEW</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(snippet)}
                      className={
                        copiedId === snippet.id
                          ? "snippet-copy-btn copied"
                          : "snippet-copy-btn"
                      }
                    >
                      {copiedId === snippet.id ? <FiCheck /> : <FiCopy />}
                      {copiedId === snippet.id ? "Copied" : "Copy code"}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={getPrismLanguage(snippet.language)}
                    style={oneDark}
                    showLineNumbers
                    wrapLongLines
                    customStyle={{
                      boxSizing: "border-box",
                      width: "100%",
                      maxWidth: "100%",
                      maxHeight: "240px",
                      margin: 0,
                      padding: "15px",
                      overflow: "auto",
                      border: "1px solid #293449",
                      borderRadius: "11px",
                      background: "#111827",
                      fontSize: "11px",
                      lineHeight: 1.75,
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: 'Consolas, "Courier New", monospace',
                        tabSize: 2,
                      },
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </article>
              ))}
            </section>
          )}
        </main>
        {isModalOpen && (
          <div
            className="snippet-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <section
              className="snippet-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="snippet-modal-title"
            >
              <div className="snippet-modal-header">
                <div>
                  <span className="snippets-eyebrow">
                    SNIPPET LIBRARY
                  </span>
                  <h2 id="snippet-modal-title">
                    {editingId !== null ? "Edit Snippet" : "Create Snippet"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="snippet-modal-close"
                  onClick={closeModal}
                  disabled={saving}
                  aria-label="Close dialog"
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSave} className="snippet-form">
                <label>
                  Snippet Title *
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. React API Fetch"
                    maxLength={100}
                    required
                  />
                </label>
                <div className="snippet-form-row">
                  <label>
                    Language *
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      {languages.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Category *
                    <input
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g. React"
                      maxLength={50}
                      required
                    />
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What does this code do?"
                    rows={2}
                    maxLength={300}
                  />
                </label>
                <label>
                  Code *
                  <textarea
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Paste your code here..."
                    rows={10}
                    className="snippet-code-input"
                    required
                  />
                </label>
                {formError && (
                  <p className="snippet-form-error" role="alert">
                    {formError}
                  </p>
                )}
                <div className="snippet-form-actions">
                  <button
                    type="button"
                    className="snippet-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="snippets-primary-btn"
                    disabled={saving}
                  >
                    {saving ? <FiRefreshCw /> : <FiCheck />}
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Save Changes"
                        : "Save Snippet"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
export default Snippets;