interface ErrorLogData {
  error: Error;
  errorInfo?: any;
  timestamp: string;
  url: string;
  userId?: string;
  additionalContext?: Record<string, any>;
}

class LogService {
  private static instance: LogService;
  private readonly maxRetries = 3;
  private readonly logEndpoint = import.meta.env.VITE_LOG_API_ENDPOINT || '/api/logs';
  private readonly isDevelopment = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  async logError(message: string, data: ErrorLogData): Promise<void> {
    const logData = {
      level: 'error',
      message,
      ...data,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };

    if (this.isDevelopment) {
      // Development modunda sadece konsola yazdır
      console.group('Error Log');
      console.error(message);
      console.dir(logData);
      console.groupEnd();
      return;
    }

    try {
      const response = await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (this.isDevelopment) {
        console.error('Failed to send log:', error);
      } else {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
          try {
            const response = await fetch(this.logEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(logData),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
          } catch (error) {
            if (attempt === this.maxRetries) {
              // Son deneme başarısız olduysa local storage'a kaydet
              this.saveToLocalStorage(logData);
            }
            await this.delay(attempt * 1000); // Her denemede bekle
          }
        }
      }
    }
  }

  private saveToLocalStorage(logData: any): void {
    try {
      const key = `error_log_${new Date().getTime()}`;
      const existingLogs = localStorage.getItem('error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push({
        key,
        timestamp: new Date().toISOString(),
        data: logData
      });

      // Sadece son 50 logu tut
      const trimmedLogs = logs.slice(-50);
      localStorage.setItem('error_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Periyodik olarak local storage'daki logları göndermeyi dene
  async syncStoredLogs(): Promise<void> {
    try {
      const storedLogs = localStorage.getItem('error_logs');
      if (!storedLogs) return;

      const logs = JSON.parse(storedLogs);
      const successfulSyncs: string[] = [];

      for (const log of logs) {
        try {
          await fetch(this.logEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(log.data),
          });
          successfulSyncs.push(log.key);
        } catch (error) {
          console.error('Error syncing log:', error);
        }
      }

      // Başarıyla gönderilen logları kaldır
      if (successfulSyncs.length > 0) {
        const remainingLogs = logs.filter((log: any) => !successfulSyncs.includes(log.key));
        localStorage.setItem('error_logs', JSON.stringify(remainingLogs));
      }
    } catch (error) {
      console.error('Error in syncStoredLogs:', error);
    }
  }
}

export const logService = LogService.getInstance();

export function logError(message: string, data: ErrorLogData): void {
  logService.logError(message, data).catch(console.error);
}
