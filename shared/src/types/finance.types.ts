// Shared domain contract for finance.
// Enums
export type TransactionType = 'INCOME' | 'EXPENSE'
export type FinanceCurrency = 'MXN' | 'USD'
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH'
export type SubscriptionFrequency = 'MONTHLY' | 'YEARLY' | 'WEEKLY'

// Category
export interface CategoryResponse {
  id: string
  name: string
  type: CategoryType
  color: string
  isSystem: boolean
}

// Transaction
export interface TransactionResponse {
  id: string
  type: TransactionType
  amount: string        // BigDecimal serialized as string
  currency: FinanceCurrency
  exchangeRate: string  // BigDecimal
  description: string | null
  date: string          // YYYY-MM-DD
  category: CategoryResponse
  clientId: string | null
  deletedAt: string | null
  createdAt: string
}

export interface TransactionPageResponse {
  content: TransactionResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// Budget
export interface BudgetResponse {
  id: string
  category: CategoryResponse
  limitAmount: string
  currency: FinanceCurrency
  month: number
  year: number
}

export interface BudgetProgressResponse {
  budget: BudgetResponse
  spent: string
  remaining: string
  progressPercent: number
  alertLevel: 'WARNING' | 'EXCEEDED' | null
}

// Subscription
export interface SubscriptionResponse {
  id: string
  name: string
  amount: string
  currency: FinanceCurrency
  frequency: SubscriptionFrequency
  nextBillingDate: string
  active: boolean
  category: CategoryResponse
}

export interface SubscriptionCostItem {
  subscriptionId: string
  name: string
  monthlyCost: string
  originalAmount: string
  originalCurrency: FinanceCurrency
  frequency: SubscriptionFrequency
}

export interface MonthlyCostResponse {
  currency: FinanceCurrency
  totalMonthlyCost: string
  breakdown: SubscriptionCostItem[]
}

// Summary
export interface BalanceSummaryResponse {
  currency: FinanceCurrency
  totalIncome: string
  totalExpenses: string
  balance: string
  periodFrom: string
  periodTo: string
  transactionCount: number
}

export interface CategoryBreakdownItem {
  category: CategoryResponse
  total: string
  transactionCount: number
}

export interface MonthlySummaryResponse {
  month: number
  year: number
  currency: FinanceCurrency
  totalIncome: string
  totalExpenses: string
  balance: string
  categoryBreakdown: CategoryBreakdownItem[]
}

// Requests
export interface CreateTransactionRequest {
  type: TransactionType
  amount: string
  currency: FinanceCurrency
  exchangeRate: string
  description?: string
  date: string
  categoryId: string
  clientId?: string
}

export interface UpdateTransactionRequest {
  type?: TransactionType
  amount?: string
  currency?: FinanceCurrency
  exchangeRate?: string
  description?: string
  date?: string
  categoryId?: string
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  color: string
}

export interface CreateBudgetRequest {
  categoryId: string
  limitAmount: string
  currency: FinanceCurrency
  month: number
  year: number
}

export interface UpdateBudgetRequest {
  limitAmount?: string
  currency?: FinanceCurrency
}

export interface CreateSubscriptionRequest {
  name: string
  amount: string
  currency: FinanceCurrency
  frequency: SubscriptionFrequency
  nextBillingDate: string
  categoryId: string
}

export interface UpdateSubscriptionRequest {
  name?: string
  amount?: string
  currency?: FinanceCurrency
  frequency?: SubscriptionFrequency
  nextBillingDate?: string
  categoryId?: string
}

// Charts
export interface MonthDataPoint {
  month: number
  income: string
  expenses: string
  balance: string
}

export interface ChartDataResponse {
  year: number
  currency: FinanceCurrency
  months: MonthDataPoint[]
}

export interface PeriodComparisonResponse {
  periodA: BalanceSummaryResponse
  periodB: BalanceSummaryResponse
}

// Filters
export interface TransactionFilterState {
  from: string | null  // YYYY-MM-DD
  to: string | null
  categoryId: string | null
  type: TransactionType | null
}
