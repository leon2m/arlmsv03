import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorPage } from './pages/ErrorPage';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { Analytics } from './pages/Analytics';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { TrainingContents } from './pages/TrainingContents';
import { Exams } from './pages/Exams';
import { Surveys } from './pages/Surveys';
import { Certificates } from './pages/Certificates';
import { NotFoundError } from './utils/errors';

// Yükleme komponenti
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Layout wrapper
const WithLayout = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <React.Suspense fallback={<LoadingSpinner />}>
      <Layout>{children}</Layout>
    </React.Suspense>
  </ErrorBoundary>
);

// Error wrapper
const WithError = ({ error }: { error: any }) => (
  <WithLayout>
    <ErrorPage error={error} />
  </WithLayout>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <WithLayout><Navigate to="/dashboard" replace /></WithLayout>,
    errorElement: <WithError error={{ status: 404 }} />
  },
  {
    path: "/dashboard",
    element: <WithLayout><Dashboard /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/training-contents",
    element: <WithLayout><TrainingContents /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/courses",
    element: <WithLayout><Courses /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/exams",
    element: <WithLayout><Exams /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/surveys",
    element: <WithLayout><Surveys /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/certificates",
    element: <WithLayout><Certificates /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/analytics",
    element: <WithLayout><Analytics /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/users",
    element: <WithLayout><Users /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "/settings",
    element: <WithLayout><Settings /></WithLayout>,
    errorElement: <WithError error={{ status: 500 }} />
  },
  {
    path: "*",
    element: <WithLayout><ErrorPage error={{ status: 404 }} /></WithLayout>,
    errorElement: <WithError error={{ status: 404 }} />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;