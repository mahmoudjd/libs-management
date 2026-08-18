import type { AppContext } from "../context/app-ctx"

const jsonMediaType = "application/json"

function jsonContent(schema: Record<string, unknown>) {
  return {
    [jsonMediaType]: {
      schema,
    },
  }
}

function jsonResponse(description: string, schema: Record<string, unknown>) {
  return {
    description,
    content: jsonContent(schema),
  }
}

function csvResponse(description: string) {
  return {
    description,
    content: {
      "text/csv": {
        schema: {
          type: "string",
        },
      },
    },
  }
}

function ref(name: string) {
  return { $ref: `#/components/schemas/${name}` }
}

function bearerSecurity() {
  return [{ bearerAuth: [] }]
}

function paginationParameters(defaultPageSize: number, maxPageSize: number) {
  return [
    {
      name: "page",
      in: "query",
      description: "Page number starting at 1.",
      schema: {
        type: "integer",
        minimum: 1,
        default: 1,
      },
    },
    {
      name: "pageSize",
      in: "query",
      description: `Items per page. Maximum ${maxPageSize}.`,
      schema: {
        type: "integer",
        minimum: 1,
        maximum: maxPageSize,
        default: defaultPageSize,
      },
    },
    {
      name: "paginated",
      in: "query",
      description: "When set to true, wraps the response in pagination metadata.",
      schema: {
        type: "boolean",
      },
    },
  ]
}

function paginatedResponseSchema(itemSchema: Record<string, unknown>) {
  return {
    type: "object",
    required: ["items", "total", "page", "pageSize"],
    properties: {
      items: {
        type: "array",
        items: itemSchema,
      },
      total: {
        type: "integer",
        minimum: 0,
      },
      page: {
        type: "integer",
        minimum: 1,
      },
      pageSize: {
        type: "integer",
        minimum: 1,
      },
    },
  }
}

export function createOpenApiDocument(ctx: AppContext) {
  const serverUrl = ctx.config.api.prefix

  return {
    openapi: "3.1.0",
    info: {
      title: "Libraries Management API",
      version: "1.0.0",
      description: "OpenAPI specification for the library management backend.",
    },
    servers: [
      {
        url: serverUrl,
        description: "Configured API prefix",
      },
    ],
    tags: [
      { name: "System", description: "Operational endpoints" },
      { name: "Auth", description: "Authentication and user session endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Books", description: "Book catalog and stock management" },
      { name: "Loans", description: "Loan lifecycle endpoints" },
      { name: "Reservations", description: "Reservation workflows" },
      { name: "Dashboard", description: "Dashboard summaries and trends" },
      { name: "Exports", description: "CSV export endpoints" },
      { name: "Audit", description: "Audit log access" },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: {
            "200": jsonResponse("Service is healthy.", {
              type: "object",
              required: ["status"],
              properties: {
                status: {
                  type: "string",
                  enum: ["ok"],
                },
              },
            }),
          },
        },
      },
      "/openapi.json": {
        get: {
          tags: ["System"],
          summary: "OpenAPI document",
          responses: {
            "200": jsonResponse("OpenAPI specification.", {
              type: "object",
              additionalProperties: true,
            }),
          },
        },
      },
      "/docs": {
        get: {
          tags: ["System"],
          summary: "OpenAPI documentation UI",
          responses: {
            "200": {
              description: "HTML documentation page rendered from the OpenAPI document.",
              content: {
                "text/html": {
                  schema: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: jsonContent(ref("LoginRequest")),
          },
          responses: {
            "200": jsonResponse("Successful login.", ref("AuthSuccessResponse")),
            "400": jsonResponse("Missing credentials.", ref("MessageResponse")),
            "401": jsonResponse("Invalid login credentials.", ref("MessageResponse")),
          },
        },
      },
      "/auth/google-login": {
        post: {
          tags: ["Auth"],
          summary: "Login or register via Google profile data",
          requestBody: {
            required: true,
            content: jsonContent(ref("GoogleLoginRequest")),
          },
          responses: {
            "200": jsonResponse("Successful Google login.", ref("AuthSuccessResponse")),
            "400": jsonResponse("Missing email.", ref("MessageResponse")),
            "500": jsonResponse("User creation failed.", ref("MessageResponse")),
          },
        },
      },
      "/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: jsonContent(ref("SignupRequest")),
          },
          responses: {
            "201": jsonResponse("User registered.", ref("MessageResponse")),
            "400": {
              description: "Validation error or duplicate user.",
              content: jsonContent({
                oneOf: [ref("MessageResponse"), ref("ValidationError")],
              }),
            },
          },
        },
      },
      "/auth/users": {
        get: {
          tags: ["Users"],
          summary: "List users",
          security: bearerSecurity(),
          responses: {
            "200": jsonResponse("List of users without password hashes.", {
              type: "array",
              items: ref("User"),
            }),
            "403": jsonResponse("Only admins can access this endpoint.", ref("ErrorResponse")),
          },
        },
      },
      "/auth/get-user/{userId}": {
        get: {
          tags: ["Users"],
          summary: "Get one user",
          security: bearerSecurity(),
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              description: "MongoDB user id.",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": jsonResponse("User profile.", ref("UserProfile")),
            "400": jsonResponse("Invalid user id.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Forbidden.", ref("ErrorResponse")),
            "404": jsonResponse("User not found.", ref("ErrorResponse")),
          },
        },
      },
      "/auth/users/{userId}/role": {
        patch: {
          tags: ["Users"],
          summary: "Update a user role",
          security: bearerSecurity(),
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              description: "MongoDB user id.",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: jsonContent(ref("UpdateUserRoleRequest")),
          },
          responses: {
            "200": {
              description: "Role updated or unchanged.",
              content: jsonContent({
                oneOf: [
                  ref("RoleUpdatedResponse"),
                  ref("MessageResponse"),
                ],
              }),
            },
            "400": jsonResponse("Invalid user id or role.", ref("ErrorResponse")),
            "403": jsonResponse("Only admins can update roles.", ref("ErrorResponse")),
            "404": jsonResponse("User not found.", ref("ErrorResponse")),
            "409": jsonResponse("At least one admin must remain.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/books": {
        get: {
          tags: ["Books"],
          summary: "List books",
          parameters: [
            {
              name: "q",
              in: "query",
              description: "Searches title, author and genre.",
              schema: { type: "string" },
            },
            {
              name: "genre",
              in: "query",
              description: "Case-insensitive genre filter.",
              schema: { type: "string" },
            },
            {
              name: "availableOnly",
              in: "query",
              description: "Only books with at least one available copy.",
              schema: { type: "boolean" },
            },
            {
              name: "sortBy",
              in: "query",
              schema: {
                type: "string",
                enum: ["title", "author", "genre", "createdAt", "availableCopies", "totalCopies"],
                default: "createdAt",
              },
            },
            {
              name: "order",
              in: "query",
              schema: {
                type: "string",
                enum: ["asc", "desc"],
                default: "desc",
              },
            },
            ...paginationParameters(20, 100),
          ],
          responses: {
            "200": {
              description: "Book list, optionally paginated.",
              content: jsonContent({
                oneOf: [
                  {
                    type: "array",
                    items: ref("Book"),
                  },
                  ref("PaginatedBooks"),
                ],
              }),
            },
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
        post: {
          tags: ["Books"],
          summary: "Create a book",
          security: bearerSecurity(),
          requestBody: {
            required: true,
            content: jsonContent(ref("BookInput")),
          },
          responses: {
            "201": jsonResponse("Created book.", ref("Book")),
            "400": {
              description: "Validation error.",
              content: jsonContent(ref("ValidationError")),
            },
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can add books.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/books/{bookId}": {
        put: {
          tags: ["Books"],
          summary: "Update a book",
          security: bearerSecurity(),
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: jsonContent(ref("BookInput")),
          },
          responses: {
            "200": jsonResponse("Updated book.", ref("BookUpdateResponse")),
            "400": {
              description: "Invalid id or validation error.",
              content: jsonContent({
                oneOf: [ref("ErrorResponse"), ref("ValidationError")],
              }),
            },
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can update books.", ref("ErrorResponse")),
            "404": jsonResponse("Book not found.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
        delete: {
          tags: ["Books"],
          summary: "Delete a book",
          security: bearerSecurity(),
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": jsonResponse("Book deleted.", ref("MessageResponse")),
            "400": jsonResponse("Invalid book id.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can delete books.", ref("ErrorResponse")),
            "404": jsonResponse("Book not found.", ref("ErrorResponse")),
            "409": jsonResponse("Book has active loans.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/books/{bookId}/change-availability": {
        put: {
          tags: ["Books"],
          summary: "Adjust available copies for a book",
          security: bearerSecurity(),
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: jsonContent(ref("ChangeBookAvailabilityRequest")),
          },
          responses: {
            "200": jsonResponse("Availability updated.", ref("BookAvailabilityResponse")),
            "400": jsonResponse("Invalid request.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can change availability.", ref("ErrorResponse")),
            "404": jsonResponse("Book not found.", ref("ErrorResponse")),
            "409": jsonResponse("Stock is inconsistent with active loans.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/loans": {
        get: {
          tags: ["Loans"],
          summary: "List loans",
          security: bearerSecurity(),
          parameters: [
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["active", "overdue", "returned"],
              },
            },
            {
              name: "overdue",
              in: "query",
              schema: {
                type: "boolean",
              },
            },
            {
              name: "userId",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "sortBy",
              in: "query",
              schema: {
                type: "string",
                enum: ["loanDate", "returnDate", "returnedAt", "extensionCount"],
                default: "loanDate",
              },
            },
            {
              name: "order",
              in: "query",
              schema: {
                type: "string",
                enum: ["asc", "desc"],
                default: "desc",
              },
            },
            ...paginationParameters(20, 100),
          ],
          responses: {
            "200": {
              description: "Loan list, optionally paginated.",
              content: jsonContent({
                oneOf: [
                  {
                    type: "array",
                    items: ref("EnrichedLoan"),
                  },
                  ref("PaginatedLoans"),
                ],
              }),
            },
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can list all loans.", ref("MessageResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
        post: {
          tags: ["Loans"],
          summary: "Create a loan",
          security: bearerSecurity(),
          requestBody: {
            required: true,
            content: jsonContent(ref("CreateLoanRequest")),
          },
          responses: {
            "201": jsonResponse("Loan created.", ref("Loan")),
            "400": jsonResponse("Invalid or missing fields.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Forbidden.", ref("ErrorResponse")),
            "404": jsonResponse("User not found.", ref("ErrorResponse")),
            "409": jsonResponse("Book unavailable or reserved for another user.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/loans/overdue": {
        get: {
          tags: ["Loans"],
          summary: "List overdue loans",
          security: bearerSecurity(),
          responses: {
            "200": jsonResponse("Overdue loans.", {
              type: "array",
              items: ref("EnrichedLoan"),
            }),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can view overdue loans.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/loans/overdue/reminders": {
        post: {
          tags: ["Loans"],
          summary: "Prepare overdue reminders",
          security: bearerSecurity(),
          responses: {
            "200": jsonResponse("Prepared reminders.", ref("OverdueRemindersResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can send overdue reminders.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/loans/{userId}": {
        get: {
          tags: ["Loans"],
          summary: "List loans for one user",
          security: bearerSecurity(),
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["active", "overdue", "returned"],
              },
            },
            ...paginationParameters(20, 100),
          ],
          responses: {
            "200": {
              description: "User loan list, optionally paginated.",
              content: jsonContent({
                oneOf: [
                  {
                    type: "array",
                    items: ref("UserLoan"),
                  },
                  ref("PaginatedUserLoans"),
                ],
              }),
            },
            "400": jsonResponse("Invalid user id.", ref("MessageResponse")),
            "401": jsonResponse("Authentication required.", ref("MessageResponse")),
            "403": jsonResponse("Forbidden.", ref("MessageResponse")),
            "500": jsonResponse("Internal server error.", ref("MessageResponse")),
          },
        },
      },
      "/loans/{loanId}": {
        put: {
          tags: ["Loans"],
          summary: "Mark a loan as returned",
          security: bearerSecurity(),
          parameters: [
            {
              name: "loanId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": jsonResponse("Loan returned.", ref("LoanReturnResponse")),
            "400": jsonResponse("Invalid or missing loan id.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Forbidden.", ref("ErrorResponse")),
            "404": jsonResponse("Loan not found.", ref("ErrorResponse")),
            "409": jsonResponse("Loan already returned.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
        delete: {
          tags: ["Loans"],
          summary: "Delete a loan",
          security: bearerSecurity(),
          parameters: [
            {
              name: "loanId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": jsonResponse("Loan deleted.", ref("MessageResponse")),
            "400": jsonResponse("Invalid or missing loan id.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can delete loans.", ref("ErrorResponse")),
            "404": jsonResponse("Loan not found.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/loans/{loanId}/extend": {
        put: {
          tags: ["Loans"],
          summary: "Extend a loan",
          security: bearerSecurity(),
          parameters: [
            {
              name: "loanId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: false,
            content: jsonContent(ref("ExtendLoanRequest")),
          },
          responses: {
            "200": jsonResponse("Loan extended.", ref("LoanExtendResponse")),
            "400": jsonResponse("Invalid request.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Forbidden.", ref("ErrorResponse")),
            "404": jsonResponse("Loan not found.", ref("ErrorResponse")),
            "409": jsonResponse("Loan cannot be extended.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/reservations": {
        get: {
          tags: ["Reservations"],
          summary: "List reservations",
          security: bearerSecurity(),
          parameters: [
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["pending", "fulfilled", "cancelled"],
              },
            },
          ],
          responses: {
            "200": jsonResponse("Reservation list.", {
              type: "array",
              items: ref("EnrichedReservation"),
            }),
            "403": jsonResponse("Only staff can list reservations.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
        post: {
          tags: ["Reservations"],
          summary: "Create a reservation",
          security: bearerSecurity(),
          requestBody: {
            required: true,
            content: jsonContent(ref("CreateReservationRequest")),
          },
          responses: {
            "201": jsonResponse("Reservation created.", ref("Reservation")),
            "400": jsonResponse("Invalid request.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Forbidden.", ref("ErrorResponse")),
            "404": jsonResponse("Book or user not found.", ref("ErrorResponse")),
            "409": jsonResponse("Reservation conflict.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/reservations/me": {
        get: {
          tags: ["Reservations"],
          summary: "List current user's reservations",
          security: bearerSecurity(),
          parameters: [
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["pending", "fulfilled", "cancelled"],
              },
            },
          ],
          responses: {
            "200": jsonResponse("Current user's reservations.", {
              type: "array",
              items: ref("EnrichedReservation"),
            }),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/reservations/{reservationId}": {
        delete: {
          tags: ["Reservations"],
          summary: "Cancel a reservation",
          security: bearerSecurity(),
          parameters: [
            {
              name: "reservationId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": jsonResponse("Reservation cancelled.", ref("MessageResponse")),
            "400": jsonResponse("Invalid reservation id.", ref("ErrorResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Forbidden.", ref("ErrorResponse")),
            "404": jsonResponse("Reservation not found.", ref("ErrorResponse")),
            "409": jsonResponse("Reservation cannot be cancelled.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/dashboard/kpis": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard KPI summary",
          security: bearerSecurity(),
          responses: {
            "200": {
              description: "Dashboard KPIs, shape depends on current role.",
              content: jsonContent({
                oneOf: [ref("DashboardStaffKpis"), ref("DashboardUserKpis")],
              }),
            },
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/dashboard/loan-trends": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard loan trend points",
          security: bearerSecurity(),
          parameters: [
            {
              name: "range",
              in: "query",
              description: "Time range bucket selection.",
              schema: {
                type: "string",
                enum: ["1m", "3m", "1y"],
                default: "3m",
              },
            },
          ],
          responses: {
            "200": jsonResponse("Loan trend series.", ref("LoanTrendResponse")),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "400": jsonResponse("Invalid user id in token.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/exports/books.csv": {
        get: {
          tags: ["Exports"],
          summary: "Export books as CSV",
          security: bearerSecurity(),
          responses: {
            "200": csvResponse("CSV export of books."),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can export books.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/exports/users.csv": {
        get: {
          tags: ["Exports"],
          summary: "Export users as CSV",
          security: bearerSecurity(),
          responses: {
            "200": csvResponse("CSV export of users."),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only admins can export users.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/exports/loans.csv": {
        get: {
          tags: ["Exports"],
          summary: "Export loans as CSV",
          security: bearerSecurity(),
          responses: {
            "200": csvResponse("CSV export of loans."),
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only staff can export loans.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
      "/audit-logs": {
        get: {
          tags: ["Audit"],
          summary: "List audit logs",
          security: bearerSecurity(),
          parameters: [
            {
              name: "action",
              in: "query",
              schema: { type: "string" },
            },
            {
              name: "entityType",
              in: "query",
              schema: { type: "string" },
            },
            ...paginationParameters(50, 200),
          ],
          responses: {
            "200": {
              description: "Audit logs, optionally paginated.",
              content: jsonContent({
                oneOf: [
                  {
                    type: "array",
                    items: ref("AuditLog"),
                  },
                  ref("PaginatedAuditLogs"),
                ],
              }),
            },
            "401": jsonResponse("Authentication required.", ref("ErrorResponse")),
            "403": jsonResponse("Only admins can read audit logs.", ref("ErrorResponse")),
            "500": jsonResponse("Internal server error.", ref("ErrorResponse")),
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["error"],
          properties: {
            error: { type: "string" },
          },
        },
        MessageResponse: {
          type: "object",
          required: ["message"],
          properties: {
            message: { type: "string" },
          },
        },
        ValidationError: {
          type: "object",
          required: ["name", "message"],
          properties: {
            name: { type: "string" },
            message: { type: "string" },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  path: {
                    type: "array",
                    items: {
                      oneOf: [{ type: "string" }, { type: "number" }],
                    },
                  },
                  message: { type: "string" },
                },
                additionalProperties: true,
              },
            },
          },
          additionalProperties: true,
        },
        UserRole: {
          type: "string",
          enum: ["admin", "librarian", "user"],
        },
        AuthenticatedUser: {
          type: "object",
          required: ["id", "email", "firstName", "lastName", "role", "accessToken"],
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: ref("UserRole"),
            accessToken: { type: "string" },
          },
        },
        AuthSuccessResponse: {
          type: "object",
          required: ["message", "user"],
          properties: {
            message: { type: "string" },
            user: ref("AuthenticatedUser"),
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        GoogleLoginRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
          },
        },
        SignupRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        User: {
          type: "object",
          required: ["_id", "firstName", "lastName", "email", "role"],
          properties: {
            _id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: ref("UserRole"),
          },
        },
        UserProfile: {
          type: "object",
          required: ["_id", "firstName", "lastName", "email", "role"],
          properties: {
            _id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: ref("UserRole"),
          },
        },
        UpdateUserRoleRequest: {
          type: "object",
          required: ["role"],
          properties: {
            role: ref("UserRole"),
          },
        },
        RoleUpdatedResponse: {
          type: "object",
          required: ["message", "role"],
          properties: {
            message: { type: "string" },
            role: ref("UserRole"),
          },
        },
        Book: {
          type: "object",
          required: ["_id", "title", "author", "genre", "totalCopies", "availableCopies", "available"],
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            author: { type: "string" },
            genre: { type: "string" },
            totalCopies: { type: "integer", minimum: 1 },
            availableCopies: { type: "integer", minimum: 0 },
            available: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        BookInput: {
          type: "object",
          required: ["title", "author", "genre"],
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            genre: { type: "string" },
            totalCopies: { type: "integer", minimum: 1 },
            availableCopies: { type: "integer", minimum: 0 },
            available: { type: "boolean" },
          },
        },
        BookUpdateResponse: {
          type: "object",
          required: ["message", "book", "availabilityAdjusted", "maxAvailableCopies", "activeLoanCount"],
          properties: {
            message: { type: "string" },
            book: ref("Book"),
            availabilityAdjusted: { type: "boolean" },
            maxAvailableCopies: { type: "integer", minimum: 0 },
            activeLoanCount: { type: "integer", minimum: 0 },
          },
        },
        ChangeBookAvailabilityRequest: {
          type: "object",
          properties: {
            available: { type: "boolean" },
            availableCopies: { type: "integer", minimum: 0 },
          },
          additionalProperties: false,
        },
        BookAvailabilityResponse: {
          type: "object",
          required: ["message", "fulfilledReservations", "availabilityAdjusted", "maxAvailableCopies", "activeLoanCount"],
          properties: {
            message: { type: "string" },
            fulfilledReservations: { type: "integer", minimum: 0 },
            availabilityAdjusted: { type: "boolean" },
            maxAvailableCopies: { type: "integer", minimum: 0 },
            activeLoanCount: { type: "integer", minimum: 0 },
          },
        },
        LoanStatus: {
          type: "string",
          enum: ["active", "overdue", "returned"],
        },
        LoanSource: {
          type: "string",
          enum: ["direct", "reservation"],
        },
        Loan: {
          type: "object",
          required: [
            "_id",
            "bookId",
            "userId",
            "loanDate",
            "returnDate",
            "returnedAt",
            "extensionCount",
            "source",
            "status",
            "overdue",
          ],
          properties: {
            _id: { type: "string" },
            bookId: { type: "string" },
            userId: { type: "string" },
            loanDate: { type: "string", format: "date-time" },
            returnDate: { type: "string", format: "date-time" },
            returnedAt: {
              anyOf: [
                { type: "string", format: "date-time" },
                { type: "null" },
              ],
            },
            extensionCount: { type: "integer", minimum: 0 },
            source: ref("LoanSource"),
            status: ref("LoanStatus"),
            overdue: { type: "boolean" },
          },
        },
        LoanUserSummary: {
          type: "object",
          required: ["id", "name", "firstName", "lastName", "email", "role"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: ref("UserRole"),
          },
        },
        EnrichedLoan: {
          allOf: [
            ref("Loan"),
            {
              type: "object",
              required: ["book", "user"],
              properties: {
                book: {
                  anyOf: [ref("Book"), { type: "null" }],
                },
                user: {
                  anyOf: [ref("LoanUserSummary"), { type: "null" }],
                },
              },
            },
          ],
        },
        UserLoan: {
          allOf: [
            ref("Loan"),
            {
              type: "object",
              required: ["book"],
              properties: {
                book: {
                  anyOf: [ref("Book"), { type: "null" }],
                },
              },
            },
          ],
        },
        CreateLoanRequest: {
          type: "object",
          required: ["bookId", "userId", "returnDate"],
          properties: {
            bookId: { type: "string" },
            userId: { type: "string" },
            returnDate: { type: "string", format: "date-time" },
          },
        },
        LoanReturnResponse: {
          type: "object",
          required: ["message", "autoReservationFulfilled"],
          properties: {
            message: { type: "string" },
            autoReservationFulfilled: { type: "boolean" },
          },
        },
        ExtendLoanRequest: {
          type: "object",
          properties: {
            days: {
              type: "integer",
              minimum: 1,
              maximum: 30,
              default: 7,
            },
          },
        },
        LoanExtendResponse: {
          type: "object",
          required: ["message", "returnDate", "extensionCount", "maxExtensions"],
          properties: {
            message: { type: "string" },
            returnDate: { type: "string", format: "date-time" },
            extensionCount: { type: "integer", minimum: 1 },
            maxExtensions: { type: "integer", minimum: 1 },
          },
        },
        OverdueReminder: {
          type: "object",
          required: ["loanId", "userId", "email", "name", "bookId", "bookTitle", "dueDate"],
          properties: {
            loanId: { type: "string" },
            userId: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            bookId: { type: "string" },
            bookTitle: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
          },
        },
        OverdueRemindersResponse: {
          type: "object",
          required: ["message", "count", "reminders"],
          properties: {
            message: { type: "string" },
            count: { type: "integer", minimum: 0 },
            reminders: {
              type: "array",
              items: ref("OverdueReminder"),
            },
          },
        },
        ReservationStatus: {
          type: "string",
          enum: ["pending", "fulfilled", "cancelled"],
        },
        Reservation: {
          type: "object",
          required: ["_id", "bookId", "userId", "createdAt", "status", "fulfilledAt", "cancelledAt"],
          properties: {
            _id: { type: "string" },
            bookId: { type: "string" },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            status: ref("ReservationStatus"),
            fulfilledAt: {
              anyOf: [
                { type: "string", format: "date-time" },
                { type: "null" },
              ],
            },
            cancelledAt: {
              anyOf: [
                { type: "string", format: "date-time" },
                { type: "null" },
              ],
            },
          },
        },
        EnrichedReservation: {
          allOf: [
            ref("Reservation"),
            {
              type: "object",
              required: ["book", "user"],
              properties: {
                book: {
                  anyOf: [ref("Book"), { type: "null" }],
                },
                user: {
                  anyOf: [ref("LoanUserSummary"), { type: "null" }],
                },
              },
            },
          ],
        },
        CreateReservationRequest: {
          type: "object",
          required: ["bookId"],
          properties: {
            bookId: { type: "string" },
            userId: {
              type: "string",
              description: "Optional for staff. Regular users always reserve for themselves.",
            },
          },
        },
        TopGenre: {
          type: "object",
          required: ["genre", "count"],
          properties: {
            genre: { type: "string" },
            count: { type: "integer", minimum: 0 },
          },
        },
        DashboardStaffKpis: {
          type: "object",
          required: [
            "role",
            "totalBooks",
            "availableBooks",
            "totalUsers",
            "activeLoans",
            "overdueLoans",
            "pendingReservations",
            "topGenres",
          ],
          properties: {
            role: {
              type: "string",
              enum: ["admin", "librarian"],
            },
            totalBooks: { type: "integer", minimum: 0 },
            availableBooks: { type: "integer", minimum: 0 },
            totalUsers: { type: "integer", minimum: 0 },
            activeLoans: { type: "integer", minimum: 0 },
            overdueLoans: { type: "integer", minimum: 0 },
            pendingReservations: { type: "integer", minimum: 0 },
            topGenres: {
              type: "array",
              items: ref("TopGenre"),
            },
          },
        },
        DashboardUserKpis: {
          type: "object",
          required: [
            "role",
            "totalBooks",
            "availableBooks",
            "myActiveLoans",
            "myOverdueLoans",
            "myPendingReservations",
          ],
          properties: {
            role: {
              type: "string",
              enum: ["user"],
            },
            totalBooks: { type: "integer", minimum: 0 },
            availableBooks: { type: "integer", minimum: 0 },
            myActiveLoans: { type: "integer", minimum: 0 },
            myOverdueLoans: { type: "integer", minimum: 0 },
            myPendingReservations: { type: "integer", minimum: 0 },
          },
        },
        LoanTrendTotals: {
          type: "object",
          required: ["loaned", "returned", "activeNow", "overdueNow"],
          properties: {
            loaned: { type: "integer", minimum: 0 },
            returned: { type: "integer", minimum: 0 },
            activeNow: { type: "integer", minimum: 0 },
            overdueNow: { type: "integer", minimum: 0 },
          },
        },
        LoanTrendPoint: {
          type: "object",
          required: [
            "key",
            "label",
            "start",
            "end",
            "loanedCount",
            "returnedCount",
            "activeOpenCount",
            "overdueOpenCount",
          ],
          properties: {
            key: { type: "string" },
            label: { type: "string" },
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" },
            loanedCount: { type: "integer", minimum: 0 },
            returnedCount: { type: "integer", minimum: 0 },
            activeOpenCount: { type: "integer", minimum: 0 },
            overdueOpenCount: { type: "integer", minimum: 0 },
          },
        },
        LoanTrendResponse: {
          type: "object",
          required: ["role", "scope", "range", "granularity", "start", "end", "totals", "points"],
          properties: {
            role: ref("UserRole"),
            scope: {
              type: "string",
              enum: ["all", "mine"],
            },
            range: {
              type: "string",
              enum: ["1m", "3m", "1y"],
            },
            granularity: {
              type: "string",
              enum: ["day", "month"],
            },
            start: { type: "string", format: "date-time" },
            end: { type: "string", format: "date-time" },
            totals: ref("LoanTrendTotals"),
            points: {
              type: "array",
              items: ref("LoanTrendPoint"),
            },
          },
        },
        AuditLog: {
          type: "object",
          required: ["_id", "actorUserId", "action", "entityType", "entityId", "details", "createdAt"],
          properties: {
            _id: { type: "string" },
            actorUserId: {
              anyOf: [{ type: "string" }, { type: "null" }],
            },
            actorRole: {
              anyOf: [ref("UserRole"), { type: "null" }],
            },
            action: { type: "string" },
            entityType: { type: "string" },
            entityId: {
              anyOf: [{ type: "string" }, { type: "null" }],
            },
            details: {
              type: "object",
              additionalProperties: true,
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PaginatedBooks: paginatedResponseSchema(ref("Book")),
        PaginatedLoans: paginatedResponseSchema(ref("EnrichedLoan")),
        PaginatedUserLoans: paginatedResponseSchema(ref("UserLoan")),
        PaginatedAuditLogs: paginatedResponseSchema(ref("AuditLog")),
      },
    },
  }
}
