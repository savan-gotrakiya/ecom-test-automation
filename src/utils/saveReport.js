import fs from "fs";
import path from "path";

export function saveReport(results) {
  const __dirname = path.dirname('reports');
  const reportPath = path.join(__dirname, "./reports/report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  return reportPath;
}
