import Link from "next/link";
import { AnalysisPriceChart } from "@/features/analysis/AnalysisPriceChart";
export default function AnalysisPage() {
  return (
    <main style={{ padding: "32px 20px 48px", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>Analysis</h1>
      <p style={{ marginBottom: 24, color: "#4b5563" }}>
        Financial Modeling Prep API
        を使って、選択したシンボルの過去終値データを取得しグラフ表示します。
      </p>
      <AnalysisPriceChart />
      <p style={{ marginTop: 20 }}>
        <Link href="/">トップページへ戻る</Link>
      </p>
    </main>
  );
}
