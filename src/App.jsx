import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DashboardHome from './pages/dashboard/DashboardHome'
import AdGenerator from './pages/dashboard/AdGenerator'
import Deposit from './pages/dashboard/Deposit'
import Withdrawal from './pages/dashboard/Withdrawal'
import ReferralDashboard from './pages/dashboard/Referral'
import Team from './pages/dashboard/Team'
import WatchEarn from './pages/dashboard/WatchEarn'
import RedeemGiftCode from './pages/dashboard/RedeemGiftCode'
import SupportCenter from './pages/dashboard/SupportCenter'
import Announcements from './pages/dashboard/Announcements'
import ChangePassword from './pages/dashboard/ChangePassword'
import AdminLayout from './pages/admin/AdminLayout'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminDepositsPage from './pages/admin/AdminDepositsPage'
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage'
import AdminBonusWithdrawalsPage from './pages/admin/AdminBonusWithdrawalsPage'
import AdminPurchasedHistoryPage from './pages/admin/AdminPurchasedHistoryPage'
import AdminToolsPage from './pages/admin/AdminToolsPage'
import AdminHistoryPage from './pages/admin/AdminHistoryPage'
import AdminActionSectionPage from './pages/admin/AdminActionSectionPage'
import AdminHistorySectionPage from './pages/admin/AdminHistorySectionPage'
import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import { useApp } from './context/AppContext'

function RequireAuth({ children }) {
  const { isAuthenticated } = useApp()
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />
  return children
}

function GuestOnly({ children }) {
  const { isAuthenticated } = useApp()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  const { isAuthenticated } = useApp()
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/sign-in'} replace />} />
        <Route
          path="/sign-in"
          element={
            <GuestOnly>
              <SignInPage />
            </GuestOnly>
          }
        />
        <Route
          path="/sign-up"
          element={
            <GuestOnly>
              <SignUpPage />
            </GuestOnly>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestOnly>
              <ForgotPasswordPage />
            </GuestOnly>
          }
        />
        <Route
          path="/dashboard"
          element={(
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          )}
        >
          <Route index element={<DashboardHome />} />
          <Route path="purchase" element={<AdGenerator />} />
          <Route path="watch" element={<WatchEarn />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdrawal" element={<Withdrawal />} />
          <Route path="referral" element={<ReferralDashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="redeem-gift-code" element={<RedeemGiftCode />} />
          <Route path="support-center" element={<SupportCenter />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="deposits" element={<AdminDepositsPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="bonus-withdrawals" element={<AdminBonusWithdrawalsPage />} />
          <Route path="purchased-history" element={<AdminPurchasedHistoryPage />} />
          <Route path="add-bank" element={<AdminActionSectionPage />} />
          <Route path="edit-users" element={<AdminActionSectionPage />} />
          <Route path="gift-code" element={<AdminActionSectionPage />} />
          <Route path="account-topup" element={<AdminActionSectionPage />} />
          <Route path="deduct-account" element={<AdminActionSectionPage />} />
          <Route path="lock-withdrawal" element={<AdminActionSectionPage />} />
          <Route path="register-admin" element={<AdminActionSectionPage />} />
          <Route path="change-password" element={<AdminActionSectionPage />} />
          <Route path="announcement" element={<AdminActionSectionPage />} />
          <Route path="investment-history" element={<AdminHistorySectionPage />} />
          <Route path="deposit-history" element={<AdminHistorySectionPage />} />
          <Route path="withdrawal-history" element={<AdminHistorySectionPage />} />
          <Route path="bonus-history" element={<AdminHistorySectionPage />} />
          <Route path="tools" element={<AdminToolsPage />} />
          <Route path="history" element={<AdminHistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/sign-in'} replace />} />
      </Routes>
    </div>
  )
}

export default App
