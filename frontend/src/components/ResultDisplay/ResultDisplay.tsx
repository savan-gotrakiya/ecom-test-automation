import React from "react";
import { ProductCheckResult } from "../../types";
import styles from "./ResultDisplay.module.css";

interface Props {
  results: ProductCheckResult[];
}

const ResultDisplay: React.FC<Props> = ({ results }) => {
  if (!results || results.length === 0) return <p>No results yet.</p>;

  return (
    <div className={styles.container}>
      {(results || []).map((r, i) => {
        const checks = [
          {
            label: "Page Load",
            status: r.pageLoad?.issues?.length ? "FAIL" : "PASS",
            issues: r.pageLoad?.issues || [],
          },
          {
            label: "Critical Elements (Product title, price, description)",
            status: r.elements?.issues?.length ? "FAIL" : "PASS",
            issues: r.elements?.issues || [],
          },
          {
            label: "Add to Cart",
            status: r.addToCartBtn?.issues?.length ? "FAIL" : "PASS",
            issues: r.addToCartBtn?.issues || [],
          },
          {
            label: "Variants",
            status: r.variants?.issues?.length ? "FAIL" : "PASS",
            issues: r.variants?.issues || [],
          },
          {
            label: "Availability",
            status: r.availability?.issues?.length ? "FAIL" : "PASS",
            issues: r.availability?.issues || [],
          },
          {
            label: "Meta Info (Page title, description)",
            status: r.metaInfo?.issues?.length ? "FAIL" : "PASS",
            issues: r.metaInfo?.issues || [],
          },
        ];

        const errorChecks = [
          ...(r.consoleErrors?.length
            ? [
                {
                  label: "Console Errors",
                  status: "Fail",
                  issues: r.consoleErrors.map((i) =>
                    typeof i === "string" ? i : JSON.stringify(i)
                  ),
                },
              ]
            : []),
          ...(r.consoleWarnings?.length
            ? [
                {
                  label: "Console Warnings",
                  status: "Fail",
                  issues: r.consoleWarnings.map((i) =>
                    typeof i === "string" ? i : JSON.stringify(i)
                  ),
                },
              ]
            : []),
          ...(r.networkFailures?.length
            ? [
                {
                  label: "Network Failures",
                  status: "Fail",
                  issues: r.networkFailures.map((i) =>
                    typeof i === "string" ? i : JSON.stringify(i)
                  ),
                },
              ]
            : []),
        ];

        return (
          <div key={i} className={styles.card}>
            <h3>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                {r.metaInfo?.title || r.url}
              </a>
            </h3>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Status</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {[...checks, ...errorChecks].map((c, idx) => (
                  <tr key={idx}>
                    <td>{c.label}</td>
                    <td
                      style={{
                        color:
                          c.status.toLocaleLowerCase() === "pass"
                            ? "green"
                            : "red",
                      }}
                    >
                      {c.status}
                    </td>
                    <td>
                      <div className={styles.scrollCell}>
                        {c.issues.map((issue: any, i: any) => (
                          <div key={i}>{issue}</div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default ResultDisplay;
