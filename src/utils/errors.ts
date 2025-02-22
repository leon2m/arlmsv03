export class AppError extends Error {
  public status: number;
  public timestamp: string;
  public path: string;

  constructor(message: string, status: number = 500, path: string = window.location.pathname) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Sayfa') {
    super(`${resource} bulunamadı`, 404);
    this.name = 'NotFoundError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Oturum süreniz doldu veya giriş yapılmadı') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Bu işlem için yetkiniz bulunmuyor') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validasyon hatası', 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
