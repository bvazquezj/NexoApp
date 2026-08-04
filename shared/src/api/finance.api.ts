import client from './client'
import type {
  TransactionResponse,
  TransactionPageResponse,
  CategoryResponse,
  BudgetResponse,
  BudgetProgressResponse,
  SubscriptionResponse,
  MonthlyCostResponse,
  BalanceSummaryResponse,
  CategoryBreakdownItem,
  MonthlySummaryResponse,
  ChartDataResponse,
  PeriodComparisonResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  CreateCategoryRequest,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  TransactionFilterState,
  FinanceCurrency,
  CategoryType,
} from '../types/finance.types'

// ── Transactions ──────────────────────────────────────────────────────────────

export function getTransactions(
  filters: TransactionFilterState,
  page: number,
  size = 20,
): Promise<TransactionPageResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.categoryId) params.set('categoryId', filters.categoryId)
  if (filters.type) params.set('type', filters.type)
  return client.get<TransactionPageResponse>(`/finance/transactions?${params}`).then(r => r.data)
}

export function getTransaction(id: string): Promise<TransactionResponse> {
  return client.get<TransactionResponse>(`/finance/transactions/${id}`).then(r => r.data)
}

export function createTransaction(data: CreateTransactionRequest): Promise<TransactionResponse> {
  return client.post<TransactionResponse>('/finance/transactions', data).then(r => r.data)
}

export function updateTransaction(id: string, data: UpdateTransactionRequest): Promise<TransactionResponse> {
  return client.put<TransactionResponse>(`/finance/transactions/${id}`, data).then(r => r.data)
}

export function deleteTransaction(id: string): Promise<void> {
  return client.delete(`/finance/transactions/${id}`).then(() => undefined)
}

export function getTransactionTrash(): Promise<TransactionResponse[]> {
  return client.get<TransactionResponse[]>('/finance/transactions/trash').then(r => r.data)
}

export function restoreTransaction(id: string): Promise<TransactionResponse> {
  return client.post<TransactionResponse>(`/finance/transactions/${id}/restore`).then(r => r.data)
}

// ── Categories ────────────────────────────────────────────────────────────────

export function getCategories(type?: CategoryType): Promise<CategoryResponse[]> {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  const qs = params.toString()
  return client.get<CategoryResponse[]>(`/finance/categories${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export function createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
  return client.post<CategoryResponse>('/finance/categories', data).then(r => r.data)
}

export function updateCategory(id: string, data: Partial<CreateCategoryRequest>): Promise<CategoryResponse> {
  return client.put<CategoryResponse>(`/finance/categories/${id}`, data).then(r => r.data)
}

export function deleteCategory(id: string): Promise<void> {
  return client.delete(`/finance/categories/${id}`).then(() => undefined)
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export function getBudgets(month?: number, year?: number): Promise<BudgetResponse[]> {
  const params = new URLSearchParams()
  if (month !== undefined) params.set('month', String(month))
  if (year !== undefined) params.set('year', String(year))
  const qs = params.toString()
  return client.get<BudgetResponse[]>(`/finance/budgets${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export function getBudgetProgress(month: number, year: number): Promise<BudgetProgressResponse[]> {
  const params = new URLSearchParams({ month: String(month), year: String(year) })
  return client.get<BudgetProgressResponse[]>(`/finance/budgets/progress?${params}`).then(r => r.data)
}

export function createBudget(data: CreateBudgetRequest): Promise<BudgetResponse> {
  return client.post<BudgetResponse>('/finance/budgets', data).then(r => r.data)
}

export function updateBudget(id: string, data: UpdateBudgetRequest): Promise<BudgetResponse> {
  return client.put<BudgetResponse>(`/finance/budgets/${id}`, data).then(r => r.data)
}

export function deleteBudget(id: string): Promise<void> {
  return client.delete(`/finance/budgets/${id}`).then(() => undefined)
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export function getSubscriptions(active?: boolean): Promise<SubscriptionResponse[]> {
  const params = new URLSearchParams()
  if (active !== undefined) params.set('active', String(active))
  const qs = params.toString()
  return client.get<SubscriptionResponse[]>(`/finance/subscriptions${qs ? `?${qs}` : ''}`).then(r => r.data)
}

export function createSubscription(data: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
  return client.post<SubscriptionResponse>('/finance/subscriptions', data).then(r => r.data)
}

export function updateSubscription(id: string, data: UpdateSubscriptionRequest): Promise<SubscriptionResponse> {
  return client.put<SubscriptionResponse>(`/finance/subscriptions/${id}`, data).then(r => r.data)
}

export function deleteSubscription(id: string): Promise<void> {
  return client.delete(`/finance/subscriptions/${id}`).then(() => undefined)
}

export function toggleSubscription(id: string): Promise<SubscriptionResponse> {
  return client.post<SubscriptionResponse>(`/finance/subscriptions/${id}/toggle`).then(r => r.data)
}

export function getSubscriptionMonthlyCost(
  currency: FinanceCurrency,
  exchangeRate?: string,
): Promise<MonthlyCostResponse> {
  const params = new URLSearchParams({ currency })
  if (exchangeRate) params.set('exchangeRate', exchangeRate)
  return client.get<MonthlyCostResponse>(`/finance/subscriptions/monthly-cost?${params}`).then(r => r.data)
}

// ── Summary ───────────────────────────────────────────────────────────────────

export function getBalanceSummary(
  month: number,
  year: number,
  currency: FinanceCurrency,
): Promise<BalanceSummaryResponse> {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
    currency,
  })
  return client.get<BalanceSummaryResponse>(`/finance/summary/balance?${params}`).then(r => r.data)
}

export function getMonthlySummary(
  month: number,
  year: number,
  currency: FinanceCurrency,
): Promise<MonthlySummaryResponse> {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
    currency,
  })
  return client.get<MonthlySummaryResponse>(`/finance/summary/monthly?${params}`).then(r => r.data)
}

export function getCategoryBreakdown(
  month: number,
  year: number,
  currency: FinanceCurrency,
  type?: 'INCOME' | 'EXPENSE',
): Promise<CategoryBreakdownItem[]> {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
    currency,
  })
  if (type) params.set('type', type)
  return client.get<CategoryBreakdownItem[]>(`/finance/summary/categories?${params}`).then(r => r.data)
}

// ── Charts ────────────────────────────────────────────────────────────────────

export function getMonthlyEvolution(year: number, currency: FinanceCurrency): Promise<ChartDataResponse> {
  const params = new URLSearchParams({ year: String(year), currency })
  return client
    .get<ChartDataResponse>(`/finance/summary/charts/monthly-evolution?${params}`)
    .then(r => r.data)
}

export function getCategoryDistribution(
  from: string,
  to: string,
  currency: FinanceCurrency,
  type: 'INCOME' | 'EXPENSE' = 'EXPENSE',
): Promise<CategoryBreakdownItem[]> {
  const params = new URLSearchParams({ from, to, currency, type })
  return client
    .get<CategoryBreakdownItem[]>(`/finance/summary/charts/category-distribution?${params}`)
    .then(r => r.data)
}

export function getBalanceTrend(year: number, currency: FinanceCurrency): Promise<ChartDataResponse> {
  const params = new URLSearchParams({ year: String(year), currency })
  return client
    .get<ChartDataResponse>(`/finance/summary/charts/balance-trend?${params}`)
    .then(r => r.data)
}

export function getPeriodComparison(
  periodA: string,
  periodB: string,
  currency: FinanceCurrency,
): Promise<PeriodComparisonResponse> {
  const params = new URLSearchParams({ periodA, periodB, currency })
  return client
    .get<PeriodComparisonResponse>(`/finance/summary/charts/period-comparison?${params}`)
    .then(r => r.data)
}
