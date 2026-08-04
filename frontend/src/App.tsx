import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/useAuthStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { VerifyEmailPage } from './features/auth/pages/VerifyEmailPage'
import { VerifyEmailPendingPage } from './features/auth/pages/VerifyEmailPendingPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { AppLayout } from './components/layout/AppLayout'
import { TaskListPage } from './features/tasks/pages/TaskListPage'
import { TaskKanbanPage } from './features/tasks/pages/TaskKanbanPage'
import { TaskDetailPage } from './features/tasks/pages/TaskDetailPage'
import { TaskTrashPage } from './features/tasks/pages/TaskTrashPage'
import { TaskGanttPage } from './features/tasks/pages/TaskGanttPage'
import { ClosingCommentModal } from './components/tasks/ClosingCommentModal'
import { FinanceSummaryPage } from './features/finance/pages/FinanceSummaryPage'
import { TransactionListPage } from './features/finance/pages/TransactionListPage'
import { TransactionTrashPage } from './features/finance/pages/TransactionTrashPage'
import { TransactionDetailPage } from './features/finance/pages/TransactionDetailPage'
import { BudgetListPage } from './features/finance/pages/BudgetListPage'
import { SubscriptionListPage } from './features/finance/pages/SubscriptionListPage'
import { CategoryManagerPage } from './features/finance/pages/CategoryManagerPage'
import { FinanceChartsPage } from './features/finance/pages/FinanceChartsPage'
import { HabitTodayPage } from './features/habits/pages/HabitTodayPage'
import { HabitListPage } from './features/habits/pages/HabitListPage'
import { HabitDetailPage } from './features/habits/pages/HabitDetailPage'
import { RoutineListPage } from './features/habits/pages/RoutineListPage'
import { RoutineEditorPage } from './features/habits/pages/RoutineEditorPage'
import { SleepPage } from './features/habits/pages/SleepPage'
import { NotificationsPage } from './features/notifications/pages/NotificationsPage'
import { ProjectListPage } from './features/projects/pages/ProjectListPage'
import { ProjectTrashPage } from './features/projects/pages/ProjectTrashPage'
import { ProjectDetailPage } from './features/projects/pages/ProjectDetailPage'
import { DeploymentListPage } from './features/deployments/pages/DeploymentListPage'
import { DeploymentTrashPage } from './features/deployments/pages/DeploymentTrashPage'
import { DeploymentDetailPage } from './features/deployments/pages/DeploymentDetailPage'
import { ClientListPage } from './features/clients/pages/ClientListPage'
import { ClientTrashPage } from './features/clients/pages/ClientTrashPage'
import { DomainListPage } from './features/domains/pages/DomainListPage'
import { DomainTrashPage } from './features/domains/pages/DomainTrashPage'
import { DomainDetailPage } from './features/domains/pages/DomainDetailPage'

export default function App() {
  const initialize = useAuthStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email/pending" element={<VerifyEmailPendingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="p-6">
                  <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-10 shadow-lift">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-gold-400/10 blur-3xl" />
                    <span className="chip bg-white/10 text-gold-300">Nexo · Vista general</span>
                    <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                      Bienvenido a Nexo
                    </h1>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
                      Tu centro de operaciones personal: tareas, finanzas, hábitos y proyectos en un solo lugar.
                    </p>
                  </div>
                </div>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Task routes */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/kanban"
          element={
            <ProtectedRoute>
              <TaskKanbanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/gantt"
          element={
            <ProtectedRoute>
              <TaskGanttPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/trash"
          element={
            <ProtectedRoute>
              <TaskTrashPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Finance routes */}
        <Route
          path="/finance"
          element={<ProtectedRoute><FinanceSummaryPage /></ProtectedRoute>}
        />
        <Route
          path="/finance/transactions"
          element={<ProtectedRoute><TransactionListPage /></ProtectedRoute>}
        />
        <Route
          path="/finance/transactions/trash"
          element={<ProtectedRoute><TransactionTrashPage /></ProtectedRoute>}
        />
        <Route
          path="/finance/transactions/:id"
          element={<ProtectedRoute><TransactionDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/finance/budgets"
          element={<ProtectedRoute><BudgetListPage /></ProtectedRoute>}
        />
        <Route
          path="/finance/subscriptions"
          element={<ProtectedRoute><SubscriptionListPage /></ProtectedRoute>}
        />
        <Route
          path="/finance/categories"
          element={<ProtectedRoute><CategoryManagerPage /></ProtectedRoute>}
        />
        <Route
          path="/finance/charts"
          element={<ProtectedRoute><FinanceChartsPage /></ProtectedRoute>}
        />

        {/* Habit routes — sub-routes BEFORE dynamic /:id to avoid shadowing */}
        <Route
          path="/habits"
          element={<ProtectedRoute><HabitTodayPage /></ProtectedRoute>}
        />
        <Route
          path="/habits/list"
          element={<ProtectedRoute><HabitListPage /></ProtectedRoute>}
        />
        <Route
          path="/habits/routines"
          element={<ProtectedRoute><RoutineListPage /></ProtectedRoute>}
        />
        <Route
          path="/habits/routines/:routineId/edit"
          element={<ProtectedRoute><RoutineEditorPage /></ProtectedRoute>}
        />
        <Route
          path="/habits/sleep"
          element={<ProtectedRoute><SleepPage /></ProtectedRoute>}
        />
        <Route
          path="/habits/:id"
          element={<ProtectedRoute><HabitDetailPage /></ProtectedRoute>}
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
        />

        {/* Project routes — /trash before /:id to avoid shadowing */}
        <Route
          path="/projects"
          element={<ProtectedRoute><ProjectListPage /></ProtectedRoute>}
        />
        <Route
          path="/projects/trash"
          element={<ProtectedRoute><ProjectTrashPage /></ProtectedRoute>}
        />
        <Route
          path="/projects/:id"
          element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>}
        />

        {/* Deployment routes — /trash before /:id to avoid shadowing */}
        <Route
          path="/deployments"
          element={<ProtectedRoute><DeploymentListPage /></ProtectedRoute>}
        />
        <Route
          path="/deployments/trash"
          element={<ProtectedRoute><DeploymentTrashPage /></ProtectedRoute>}
        />
        <Route
          path="/deployments/:id"
          element={<ProtectedRoute><DeploymentDetailPage /></ProtectedRoute>}
        />

        {/* Client routes */}
        <Route path="/clients" element={<ProtectedRoute><ClientListPage /></ProtectedRoute>} />
        <Route path="/clients/trash" element={<ProtectedRoute><ClientTrashPage /></ProtectedRoute>} />

        {/* Domain routes — /trash before /:id */}
        <Route path="/domains" element={<ProtectedRoute><DomainListPage /></ProtectedRoute>} />
        <Route path="/domains/trash" element={<ProtectedRoute><DomainTrashPage /></ProtectedRoute>} />
        <Route path="/domains/:id" element={<ProtectedRoute><DomainDetailPage /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global modals driven by Zustand */}
      <ClosingCommentModal />
    </>
  )
}
