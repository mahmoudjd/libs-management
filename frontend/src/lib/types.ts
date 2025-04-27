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
