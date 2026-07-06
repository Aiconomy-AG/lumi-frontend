import { Routes, Route } from 'react-router'
import AppLayout from '@/components/AppLayout'
import StockPage from '@/pages/StockPage'
import AdminPage from '@/pages/AdminPage'
import ChatPage from "@/pages/ChatPage";

export default function App() {
  return (
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div className="p-6">Dashboard (în lucru)</div>} />
          <Route path="/tasks" element={<div className="p-6">Tasks (în lucru)</div>} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
  )
}