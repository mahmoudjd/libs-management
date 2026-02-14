export type Book = {
  _id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
};


export type BookFormData = {
  title: string;
  author: string;
  genre: string;
  available: boolean;
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
  role?: 'user' | 'admin';
  accessToken?: string;
};

export type Loan = {
  _id: string;
  bookId: string;
  userId: string;
  loanDate: string;
  returnDate: string;
  book?: Book;
  user?: User;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  accessToken: string;
};

export type AuthResponse = ApiMessageResponse & {
  user: AuthUser;
};
