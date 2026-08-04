export type TaskStatus = 'PENDING' | 'READY' | 'REVIEW' | 'COMPLETED';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type DueFilter = 'TODAY' | 'THIS_WEEK' | 'OVERDUE' | null;

export interface MockTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: { id: string; name: string; color: string };
  dueDate: string | null;
  startDate: string | null;
  subtaskCount: number;
  completedSubtaskCount: number;
  projectName: string | null;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pendiente',
  READY: 'Listo',
  REVIEW: 'Revision',
  COMPLETED: 'Completada',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

export const mockTasks: MockTask[] = [
  {
    id: 't1',
    title: 'Definir arquitectura del módulo de finanzas',
    description: 'Documentar decisiones de diseño y el flujo de datos.',
    status: 'PENDING',
    priority: 'HIGH',
    type: { id: 'arch', name: 'Arquitectura', color: '#7C3AED' },
    dueDate: '2026-08-04',
    startDate: '2026-08-02',
    subtaskCount: 3,
    completedSubtaskCount: 0,
    projectName: 'Finanzas 2.0',
  },
  {
    id: 't2',
    title: 'Implementar endpoint de sincronización',
    description: 'Crear el servicio y las pruebas unitarias.',
    status: 'READY',
    priority: 'MEDIUM',
    type: { id: 'dev', name: 'Desarrollo', color: '#2563EB' },
    dueDate: '2026-08-05',
    startDate: null,
    subtaskCount: 5,
    completedSubtaskCount: 2,
    projectName: 'API Core',
  },
  {
    id: 't3',
    title: 'Revisar PR de migración de base de datos',
    description: null,
    status: 'REVIEW',
    priority: 'HIGH',
    type: { id: 'review', name: 'Revisión', color: '#D97706' },
    dueDate: '2026-08-03',
    startDate: null,
    subtaskCount: 0,
    completedSubtaskCount: 0,
    projectName: 'API Core',
  },
  {
    id: 't4',
    title: 'Actualizar documentación de despliegue',
    description: 'Incluir los nuevos pasos de rollback.',
    status: 'COMPLETED',
    priority: 'LOW',
    type: { id: 'docs', name: 'Documentación', color: '#059669' },
    dueDate: '2026-08-01',
    startDate: '2026-07-28',
    subtaskCount: 2,
    completedSubtaskCount: 2,
    projectName: 'Infraestructura',
  },
  {
    id: 't5',
    title: 'Diseñar dashboard de hábitos',
    description: 'Prototipo de la vista de hoy.',
    status: 'PENDING',
    priority: 'MEDIUM',
    type: { id: 'design', name: 'Diseño', color: '#EC4899' },
    dueDate: '2026-08-07',
    startDate: null,
    subtaskCount: 4,
    completedSubtaskCount: 1,
    projectName: 'Hábitos',
  },
];

export const mockKanban: { status: TaskStatus; tasks: MockTask[] }[] = [
  { status: 'PENDING', tasks: mockTasks.filter((t) => t.status === 'PENDING') },
  { status: 'READY', tasks: mockTasks.filter((t) => t.status === 'READY') },
  { status: 'REVIEW', tasks: mockTasks.filter((t) => t.status === 'REVIEW') },
  { status: 'COMPLETED', tasks: mockTasks.filter((t) => t.status === 'COMPLETED') },
];

export const mockGantt = [
  { id: 'g1', title: 'Fase 1: Exploración', startDate: '2026-07-20', endDate: '2026-07-31', progress: 1 },
  { id: 'g2', title: 'Fase 2: Desarrollo', startDate: '2026-08-01', endDate: '2026-08-15', progress: 0.4 },
  { id: 'g3', title: 'Fase 3: QA', startDate: '2026-08-16', endDate: '2026-08-25', progress: 0 },
  { id: 'g4', title: 'Fase 4: Lanzamiento', startDate: '2026-08-26', endDate: '2026-08-31', progress: 0 },
];

// --- Finance ---
export type TransactionType = 'INCOME' | 'EXPENSE';
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';
export type SubscriptionFrequency = 'MONTHLY' | 'YEARLY' | 'WEEKLY';

export interface MockTransaction {
  id: string;
  concept: string;
  amount: string;
  type: TransactionType;
  date: string;
  category: { id: string; name: string; color: string; type: CategoryType };
  clientName: string | null;
}

export const mockTransactions: MockTransaction[] = [
  { id: 'f1', concept: 'Nómina de consultoría', amount: '25000', type: 'INCOME', date: '2026-08-01', category: { id: 'c1', name: 'Ingresos', color: '#059669', type: 'INCOME' }, clientName: 'Empresa XYZ' },
  { id: 'f2', concept: 'Servidores cloud', amount: '890.5', type: 'EXPENSE', date: '2026-08-02', category: { id: 'c2', name: 'Infraestructura', color: '#2563EB', type: 'EXPENSE' }, clientName: null },
  { id: 'f3', concept: 'Licencias de software', amount: '1200', type: 'EXPENSE', date: '2026-08-03', category: { id: 'c3', name: 'Software', color: '#7C3AED', type: 'EXPENSE' }, clientName: null },
  { id: 'f4', concept: 'Cobro parcial proyecto web', amount: '8000', type: 'INCOME', date: '2026-08-05', category: { id: 'c1', name: 'Ingresos', color: '#059669', type: 'INCOME' }, clientName: 'Agencia Digital' },
  { id: 'f5', concept: 'Café y oficina', amount: '340', type: 'EXPENSE', date: '2026-08-06', category: { id: 'c4', name: 'Gastos', color: '#D97706', type: 'EXPENSE' }, clientName: null },
];

export interface MockBudget {
  id: string;
  name: string;
  category: { id: string; name: string; color: string };
  limit: string;
  spent: string;
  period: string;
}

export const mockBudgets: MockBudget[] = [
  { id: 'b1', name: 'Infraestructura mensual', category: { id: 'c2', name: 'Infraestructura', color: '#2563EB' }, limit: '1500', spent: '890.5', period: 'Agosto 2026' },
  { id: 'b2', name: 'Software', category: { id: 'c3', name: 'Software', color: '#7C3AED' }, limit: '2000', spent: '1200', period: 'Agosto 2026' },
  { id: 'b3', name: 'Gastos generales', category: { id: 'c4', name: 'Gastos', color: '#D97706' }, limit: '3000', spent: '2950', period: 'Agosto 2026' },
];

export interface MockSubscription {
  id: string;
  name: string;
  amount: string;
  currency: string;
  frequency: SubscriptionFrequency;
  nextBillingDate: string;
  active: boolean;
  category: { id: string; name: string; color: string };
}

export const mockSubscriptions: MockSubscription[] = [
  { id: 's1', name: 'Vercel Pro', amount: '20', currency: 'USD', frequency: 'MONTHLY', nextBillingDate: '2026-08-15', active: true, category: { id: 'c2', name: 'Infraestructura', color: '#2563EB' } },
  { id: 's2', name: 'Figma', amount: '15', currency: 'USD', frequency: 'MONTHLY', nextBillingDate: '2026-08-20', active: true, category: { id: 'c3', name: 'Software', color: '#7C3AED' } },
  { id: 's3', name: 'Dominio .dev', amount: '110', currency: 'MXN', frequency: 'YEARLY', nextBillingDate: '2026-12-01', active: true, category: { id: 'c5', name: 'Dominios', color: '#059669' } },
];

export interface MockCategory {
  id: string;
  name: string;
  color: string;
  type: CategoryType;
  count: number;
}

export const mockCategories: MockCategory[] = [
  { id: 'c1', name: 'Ingresos', color: '#059669', type: 'INCOME', count: 2 },
  { id: 'c2', name: 'Infraestructura', color: '#2563EB', type: 'EXPENSE', count: 1 },
  { id: 'c3', name: 'Software', color: '#7C3AED', type: 'EXPENSE', count: 1 },
  { id: 'c4', name: 'Gastos', color: '#D97706', type: 'EXPENSE', count: 1 },
  { id: 'c5', name: 'Dominios', color: '#059669', type: 'EXPENSE', count: 0 },
];

export const mockMonthlySeries = [
  { month: 'Ene', income: 22000, expense: 14500 },
  { month: 'Feb', income: 25000, expense: 16000 },
  { month: 'Mar', income: 21000, expense: 17000 },
  { month: 'Abr', income: 28000, expense: 15000 },
  { month: 'May', income: 26000, expense: 15500 },
  { month: 'Jun', income: 30000, expense: 14000 },
  { month: 'Jul', income: 27500, expense: 15800 },
  { month: 'Ago', income: 33000, expense: 16100 },
];

export const mockCategoryBreakdown = [
  { name: 'Ingresos', amount: 33000, color: '#059669' },
  { name: 'Infraestructura', amount: 890.5, color: '#2563EB' },
  { name: 'Software', amount: 1200, color: '#7C3AED' },
  { name: 'Gastos', amount: 340, color: '#D97706' },
];

export const mockBalanceSummary = {
  totalIncome: '33000',
  totalExpense: '2430.5',
  balance: '30569.5',
  currency: 'MXN',
};

// --- Habits ---
export type BlockType = 'HABIT' | 'PRODUCTIVE' | 'SLEEP' | 'BREAK' | 'FREE';

export interface MockHabit {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  category: { id: string; name: string; color: string };
  frequency: 'DAILY' | 'CUSTOM';
  currentStreak: number;
  maxStreak: number;
  isActive: boolean;
  completedToday: boolean;
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  HABIT: 'Hábito',
  PRODUCTIVE: 'Productivo',
  SLEEP: 'Sueño',
  BREAK: 'Descanso',
  FREE: 'Libre',
};

export const mockHabits: MockHabit[] = [
  { id: 'h1', name: 'Meditar', description: '10 minutos de meditación', color: '#7C3AED', icon: 'sparkles', category: { id: 'hc1', name: 'Salud', color: '#7C3AED' }, frequency: 'DAILY', currentStreak: 12, maxStreak: 30, isActive: true, completedToday: true },
  { id: 'h2', name: 'Leer', description: '30 páginas al día', color: '#2563EB', icon: 'book', category: { id: 'hc2', name: 'Crecimiento', color: '#2563EB' }, frequency: 'DAILY', currentStreak: 5, maxStreak: 21, isActive: true, completedToday: false },
  { id: 'h3', name: 'Ejercicio', description: '45 minutos de ejercicio', color: '#D97706', icon: 'barbell', category: { id: 'hc1', name: 'Salud', color: '#D97706' }, frequency: 'CUSTOM', currentStreak: 8, maxStreak: 14, isActive: true, completedToday: false },
  { id: 'h4', name: 'Escribir journal', description: 'Reflexión diaria', color: '#059669', icon: 'create', category: { id: 'hc2', name: 'Crecimiento', color: '#059669' }, frequency: 'DAILY', currentStreak: 3, maxStreak: 45, isActive: false, completedToday: false },
];

export const mockHabitCategories = [
  { id: 'hc1', name: 'Salud', color: '#D97706', count: 2 },
  { id: 'hc2', name: 'Crecimiento', color: '#2563EB', count: 2 },
];

export interface MockRoutineDay {
  id: string;
  dayOfWeek: number;
  name: string;
  isActive: boolean;
  blocks: { id: string; title: string; startTime: string; endTime: string; type: BlockType; habitName: string | null; priority: 'HIGH' | 'MEDIUM' | 'LOW' | null; isFlexible: boolean }[];
}

export const mockRoutines: MockRoutineDay[] = [
  {
    id: 'r0',
    dayOfWeek: 0,
    name: 'Domingo',
    isActive: true,
    blocks: [
      { id: 'rb0', title: 'Despertar', startTime: '08:00', endTime: '08:30', type: 'FREE', habitName: null, priority: null, isFlexible: false },
      { id: 'rb1', title: 'Meditar', startTime: '08:30', endTime: '08:45', type: 'HABIT', habitName: 'Meditar', priority: 'MEDIUM', isFlexible: false },
      { id: 'rb2', title: 'Trabajo profundo', startTime: '10:00', endTime: '13:00', type: 'PRODUCTIVE', habitName: null, priority: 'HIGH', isFlexible: false },
      { id: 'rb3', title: 'Descanso', startTime: '13:00', endTime: '14:00', type: 'BREAK', habitName: null, priority: null, isFlexible: true },
    ],
  },
  {
    id: 'r1',
    dayOfWeek: 1,
    name: 'Lunes',
    isActive: true,
    blocks: [
      { id: 'rb4', title: 'Meditar', startTime: '07:00', endTime: '07:15', type: 'HABIT', habitName: 'Meditar', priority: 'HIGH', isFlexible: false },
      { id: 'rb5', title: 'Sprint mañana', startTime: '08:00', endTime: '11:00', type: 'PRODUCTIVE', habitName: null, priority: 'HIGH', isFlexible: false },
    ],
  },
];

export const mockSleepLogs = [
  { id: 'sl1', date: '2026-08-05', durationMinutes: 455, source: 'SAMSUNG_HEALTH' },
  { id: 'sl2', date: '2026-08-04', durationMinutes: 420, source: 'SAMSUNG_HEALTH' },
  { id: 'sl3', date: '2026-08-03', durationMinutes: 390, source: 'MANUAL' },
  { id: 'sl4', date: '2026-08-02', durationMinutes: 470, source: 'SAMSUNG_HEALTH' },
];

// --- Projects ---
export type ProjectStatus = 'ACTIVE' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Activo',
  IN_PROGRESS: 'En progreso',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  ARCHIVED: 'Archivado',
};

export interface MockProject {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string;
  clientName: string | null;
  startDate: string | null;
  dueDate: string | null;
  taskCount: number;
  completedTaskCount: number;
  budget: string | null;
}

export const mockProjects: MockProject[] = [
  { id: 'p1', name: 'Finanzas 2.0', description: 'Rediseño del módulo financiero', status: 'IN_PROGRESS', color: '#2563EB', clientName: null, startDate: '2026-07-01', dueDate: '2026-09-30', taskCount: 14, completedTaskCount: 5, budget: '150000' },
  { id: 'p2', name: 'API Core', description: 'Backend de la plataforma', status: 'ACTIVE', color: '#7C3AED', clientName: 'Empresa XYZ', startDate: '2026-05-01', dueDate: '2026-10-15', taskCount: 22, completedTaskCount: 11, budget: '280000' },
  { id: 'p3', name: 'Landing Marketing', description: null, status: 'PAUSED', color: '#D97706', clientName: 'Agencia Digital', startDate: '2026-06-10', dueDate: '2026-08-15', taskCount: 8, completedTaskCount: 6, budget: '45000' },
  { id: 'p4', name: 'Infraestructura', description: 'Migración a contenedores', status: 'COMPLETED', color: '#059669', clientName: null, startDate: '2026-03-01', dueDate: '2026-07-31', taskCount: 30, completedTaskCount: 30, budget: '120000' },
];

// --- Deployments ---
export type DeploymentStatus = 'UNKNOWN' | 'DEPLOYING' | 'ACTIVE' | 'DEGRADED' | 'DOWN' | 'INACTIVE';
export type DeploymentEnvironment = 'DEV' | 'STAGING' | 'PROD';
export type DeploymentPlatform = 'VERCEL' | 'RENDER' | 'FLYIO' | 'AWS' | 'RAILWAY' | 'NETLIFY' | 'OTHER';

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  UNKNOWN: 'Desconocido',
  DEPLOYING: 'Desplegando',
  ACTIVE: 'Activo',
  DEGRADED: 'Degradado',
  DOWN: 'Caído',
  INACTIVE: 'Inactivo',
};

export interface MockDeployment {
  id: string;
  name: string;
  platform: DeploymentPlatform;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  url: string;
  branch: string;
  version: string;
  updatedAt: string;
  lastDeployAt: string | null;
}

export const mockDeployments: MockDeployment[] = [
  { id: 'd1', name: 'Web Principal', platform: 'VERCEL', environment: 'PROD', status: 'ACTIVE', url: 'https://app.mipagina.com', branch: 'main', version: 'v2.4.1', updatedAt: '2026-08-03', lastDeployAt: '2026-08-03T10:00:00Z' },
  { id: 'd2', name: 'API', platform: 'RENDER', environment: 'PROD', status: 'DEGRADED', url: 'https://api.mipagina.com', branch: 'main', version: 'v1.9.0', updatedAt: '2026-08-03', lastDeployAt: '2026-08-02T22:30:00Z' },
  { id: 'd3', name: 'Staging', platform: 'VERCEL', environment: 'STAGING', status: 'DEPLOYING', url: 'https://staging.mipagina.com', branch: 'develop', version: 'v2.5.0-beta', updatedAt: '2026-08-03', lastDeployAt: null },
  { id: 'd4', name: 'Worker Jobs', platform: 'FLYIO', environment: 'PROD', status: 'DOWN', url: 'https://jobs.mipagina.com', branch: 'main', version: 'v1.2.0', updatedAt: '2026-08-02', lastDeployAt: '2026-07-28T09:15:00Z' },
];

// --- Clients ---
export interface MockClient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  taskCount: number;
  projectCount: number;
  domainCount: number;
  deploymentCount: number;
}

export const mockClients: MockClient[] = [
  { id: 'cl1', name: 'Empresa XYZ', email: 'contacto@xyz.com', phone: '+52 55 1234 5678', company: 'XYZ S.A.', website: 'xyz.com', taskCount: 8, projectCount: 2, domainCount: 3, deploymentCount: 2 },
  { id: 'cl2', name: 'Agencia Digital', email: 'hola@agenciadigital.mx', phone: '+52 81 8765 4321', company: 'Agencia Digital', website: 'agenciadigital.mx', taskCount: 4, projectCount: 1, domainCount: 1, deploymentCount: 1 },
  { id: 'cl3', name: 'Cliente Sin Proyectos', email: 'info@cliente.com', phone: null, company: null, website: null, taskCount: 0, projectCount: 0, domainCount: 0, deploymentCount: 0 },
];

// --- Domains ---
export type DomainStatus = 'ACTIVE' | 'TRANSFERRED' | 'RELEASED';
export type DomainEffectiveStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TRANSFERRED' | 'RELEASED';

export const DOMAIN_EFFECTIVE_LABELS: Record<DomainEffectiveStatus, string> = {
  ACTIVE: 'Activo',
  EXPIRING_SOON: 'Por expirar',
  EXPIRED: 'Expirado',
  TRANSFERRED: 'Transferido',
  RELEASED: 'Liberado',
};

export interface MockDomain {
  id: string;
  name: string;
  registrar: string;
  dnsProvider: string;
  expiryDate: string;
  status: DomainStatus;
  effectiveStatus: DomainEffectiveStatus;
  autoRenew: boolean;
  clientName: string | null;
}

export const mockDomains: MockDomain[] = [
  { id: 'dm1', name: 'mipagina.com', registrar: 'GODADDY', dnsProvider: 'CLOUDFLARE', expiryDate: '2027-03-15', status: 'ACTIVE', effectiveStatus: 'ACTIVE', autoRenew: true, clientName: null },
  { id: 'dm2', name: 'proyecto.dev', registrar: 'CLOUDFLARE', dnsProvider: 'CLOUDFLARE', expiryDate: '2026-08-20', status: 'ACTIVE', effectiveStatus: 'EXPIRING_SOON', autoRenew: false, clientName: 'Empresa XYZ' },
  { id: 'dm3', name: 'viejo-dominio.com', registrar: 'NAMECHEAP', dnsProvider: 'GODADDY', expiryDate: '2026-06-30', status: 'ACTIVE', effectiveStatus: 'EXPIRED', autoRenew: false, clientName: 'Agencia Digital' },
  { id: 'dm4', name: 'legado.net', registrar: 'IONOS', dnsProvider: 'IONOS', expiryDate: '2026-01-01', status: 'TRANSFERRED', effectiveStatus: 'TRANSFERRED', autoRenew: false, clientName: null },
];

// --- Notifications ---
export interface MockNotification {
  id: string;
  type: 'TASK' | 'HABIT' | 'FINANCE' | 'DOMAIN' | 'DEPLOYMENT' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const mockNotifications: MockNotification[] = [
  { id: 'n1', type: 'TASK', title: 'Tarea por vencer', message: 'La tarea "Revisar PR de migración" vence hoy.', isRead: false, createdAt: '2026-08-03T09:00:00Z' },
  { id: 'n2', type: 'DOMAIN', title: 'Dominio por expirar', message: 'proyecto.dev expira en 17 días.', isRead: false, createdAt: '2026-08-02T18:00:00Z' },
  { id: 'n3', type: 'DEPLOYMENT', title: 'Worker caído', message: 'Worker Jobs está fuera de línea.', isRead: true, createdAt: '2026-08-02T12:30:00Z' },
  { id: 'n4', type: 'FINANCE', title: 'Suscripción próxima', message: 'Vercel Pro se renueva el 15 de agosto.', isRead: true, createdAt: '2026-08-01T08:00:00Z' },
  { id: 'n5', type: 'HABIT', title: 'Racha en riesgo', message: 'Completa tu hábito "Leer" hoy para no perder tu racha.', isRead: false, createdAt: '2026-08-01T07:00:00Z' },
];

export const mockDashboard = {
  greeting: 'Buenos días',
  dateLabel: 'Lunes, 3 de agosto de 2026',
  stats: {
    activeTasks: 3,
    tasksDueToday: 1,
    currentStreak: 12,
    balance: '30,569.50',
  },
  todayHabits: mockHabits.filter((h) => h.isActive).map((h) => ({ id: h.id, name: h.name, color: h.color, completedToday: h.completedToday })),
  recentNotifications: mockNotifications.filter((n) => !n.isRead).map((n) => ({ id: n.id, type: n.type, title: n.title })),
  deploymentDown: mockDeployments.filter((d) => d.status === 'DOWN').length,
};

