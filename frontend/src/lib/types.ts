export type Book = {
  _id: string;
  title: string;
  author: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
};


export type BookFormData = {
  title: string;
  author: string;
  genre: string;
  totalCopies?: number;
  availableCopies?: number;
  available?: boolean;
};

export type ApiMessageResponse = {
  message: string;
};

export type User = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "user" | "librarian" | "admin";
  accessToken?: string;
};

export type Loan = {
  _id: string;
  bookId: string;
  userId: string;
  loanDate: string;
  returnDate: string;
  returnedAt: string | null;
  extensionCount: number;
  source: "direct" | "reservation";
  status: "active" | "overdue" | "returned";
  overdue: boolean;
  book?: Book | null;
  user?: User | null;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "librarian" | "user";
  accessToken: string;
};

export type AuthResponse = ApiMessageResponse & {
  user: AuthUser;
};

export type Reservation = {
  _id: string;
  bookId: string;
  userId: string;
  createdAt: string;
  status: "pending" | "fulfilled" | "cancelled";
  fulfilledAt: string | null;
  cancelledAt: string | null;
  book?: Book | null;
  user?: User | null;
};

export type DashboardKpis =
  | {
      role: "admin" | "librarian";
      totalBooks: number;
      availableBooks: number;
      totalUsers: number;
      activeLoans: number;
      overdueLoans: number;
      pendingReservations: number;
      topGenres: Array<{ genre: string; count: number }>;
    }
  | {
      role: "user";
      totalBooks: number;
      availableBooks: number;
      myActiveLoans: number;
      myOverdueLoans: number;
      myPendingReservations: number;
    };

export type DashboardTrendRange = "1m" | "3m" | "1y";

export type DashboardLoanTrends = {
  role: "admin" | "librarian" | "user";
  scope: "all" | "mine";
  range: DashboardTrendRange;
  granularity: "day" | "month";
  start: string;
  end: string;
  totals: {
    loaned: number;
    returned: number;
    activeNow: number;
    overdueNow: number;
  };
  points: Array<{
    key: string;
    label: string;
    start: string;
    end: string;
    loanedCount: number;
    returnedCount: number;
    activeOpenCount: number;
    overdueOpenCount: number;
  }>;
};

export type AuditLog = {
  _id: string;
  actorUserId: string | null;
  actorRole?: "admin" | "librarian" | "user";
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
};
