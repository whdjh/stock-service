import { Routes, Route } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import HomePage from "@/pages/HomePage";
import StockDetailPage from "@/pages/StockDetailPage";
import GuruDetailPage from "@/pages/GuruDetailPage";

export default function App() {
  return (
    <div className="font-[Geist] antialiased bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stock/:ticker" element={<StockDetailPage />} />
              <Route path="/guru/:id" element={<GuruDetailPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
