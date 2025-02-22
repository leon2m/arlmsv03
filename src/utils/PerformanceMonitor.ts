import React from 'react';
import { logService } from '../services/LogService';

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private readonly PERFORMANCE_THRESHOLD = 1000; // 1 saniye

  // Web Vitals thresholds (based on Google's recommendations)
  private readonly VITALS_THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 },   // First Input Delay
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTI: { good: 3800, poor: 7300 }  // Time to Interactive
  };

  private constructor() {
    this.setupPerformanceObserver();
    this.initializeVitalsTracking();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.handleVitalMetric('FCP', entry.startTime);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Layout shift
      const layoutShiftObserver = new PerformanceObserver((list) => {
        let cumulativeLayoutShift = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += entry.value;
          }
        });
        this.handleVitalMetric('CLS', cumulativeLayoutShift);
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

      // Largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.handleVitalMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First input delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handleVitalMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  private initializeVitalsTracking(): void {
    // Time to Interactive approximation
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          const tti = navigationEntry.domInteractive;
          this.handleVitalMetric('TTI', tti);
        }
      }, 0);
    });
  }

  private handleVitalMetric(name: keyof typeof this.VITALS_THRESHOLDS, value: number): void {
    const thresholds = this.VITALS_THRESHOLDS[name];
    let rating: VitalMetric['rating'] = 'good';

    if (value >= thresholds.poor) {
      rating = 'poor';
    } else if (value >= thresholds.good) {
      rating = 'needs-improvement';
    }

    const metric: VitalMetric = {
      name,
      value,
      rating
    };

    this.logVitalMetric(metric);
  }

  private logVitalMetric(metric: VitalMetric): void {
    if (import.meta.env.DEV) {
      console.group('Web Vital Measurement');
      console.log(`${metric.name}: ${metric.value}ms (${metric.rating})`);
      console.log('Threshold:', this.VITALS_THRESHOLDS[metric.name as keyof typeof this.VITALS_THRESHOLDS]);
      console.groupEnd();
      return;
    }

    logService.logError(`Web Vital Measurement: ${metric.name}`, {
      error: new Error(`Web Vital ${metric.name} measured`),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      additionalContext: {
        metricName: metric.name,
        value: metric.value,
        rating: metric.rating,
        threshold: this.VITALS_THRESHOLDS[metric.name as keyof typeof this.VITALS_THRESHOLDS]
      }
    });
  }

  startMeasure(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      duration: 0,
      metadata
    });
  }

  endMeasure(name: string): void {
    const metric = this.metrics.get(name);
    if (metric) {
      const duration = performance.now() - metric.startTime;
      metric.duration = duration;

      if (duration > this.PERFORMANCE_THRESHOLD) {
        this.logPerformanceMetric(name, metric.startTime, duration, metric.metadata);
      }

      this.metrics.delete(name);
    }
  }

  private logPerformanceMetric(
    name: string,
    startTime: number,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    logService.logError(`Performance Issue: ${name}`, {
      error: new Error(`Performance threshold exceeded for ${name}`),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      additionalContext: {
        metricName: name,
        startTime,
        duration,
        threshold: this.PERFORMANCE_THRESHOLD,
        ...metadata
      }
    });
  }

  // React Component Performance HOC
  measureComponentPerformance<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName: string
  ): React.ComponentType<P> {
    const monitor = this;
    
    return class PerformanceComponent extends React.Component<P> {
      componentDidMount() {
        monitor.endMeasure(`${componentName}_mount`);
      }

      componentWillUnmount() {
        monitor.startMeasure(`${componentName}_unmount`);
      }

      render() {
        monitor.startMeasure(`${componentName}_render`);
        const element = React.createElement(WrappedComponent, this.props);
        monitor.endMeasure(`${componentName}_render`);
        return element;
      }
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
