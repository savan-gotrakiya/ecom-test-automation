import { useState } from "react";
import { runProductCheck } from "../../api/productCheck";
import { ApiResponse, ProductCheckResult } from "../../types";
import ResultDisplay from "../ResultDisplay/ResultDisplay";
import styles from "./InputForm.module.css";

const InputForm: React.FC = () => {
  const [urls, setUrls] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [results, setResults] = useState<ProductCheckResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlArray = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (urlArray.length === 0) return alert("Please enter at least one URL");

    setLoading(true);
    setResults(null);
    try {
      const data: ApiResponse = await runProductCheck(urlArray, password);
      if (data.success) setResults(data.data || []);
      else alert(data.error);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>Product URLs (one per line)</label>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="https://example.com/product1
https://example.com/product2"
          rows={6}
          className={styles.textarea}
          disabled={loading}
        />

        <label className={styles.label}>Store Password (if required)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password if store is protected"
          className={styles.passwordInput}
          disabled={loading}
        />

        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Checking..." : "Submit"}
        </button>
      </form>

      {loading && <p className={styles.loadingText}>Checking products...</p>}

      {results && (
        <div className={styles.resultsContainer}>
          <ResultDisplay results={results} />
        </div>
      )}
    </div>
  );
};

export default InputForm;
