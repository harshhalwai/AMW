import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { AppLayout } from "../layouts/AppLayout";
import { Landing } from "../pages/Landing";
import { OwnerLogin } from "../pages/login/OwnerLogin";
import { EmployeeLogin } from "../pages/login/EmployeeLogin";
import { CustomerLogin } from "../pages/login/CustomerLogin";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { JobsList } from "../pages/jobs/JobsList";
import { NewJob } from "../pages/jobs/NewJob";
import { JobDetails } from "../pages/jobs/JobDetails";
import { CustomersList } from "../pages/customers/CustomersList";
import { EmployeesList } from "../pages/employees/EmployeesList";
import { Analytics } from "../pages/analytics/Analytics";
import { Feedback } from "../pages/feedback/Feedback";
import { Messages } from "../pages/messages/Messages";
import { Settings } from "../pages/settings/Settings";
import { ProductsList } from "../pages/products/Products";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "login/owner", element: <OwnerLogin /> },
      { path: "login/employee", element: <EmployeeLogin /> },
      { path: "login/customer", element: <CustomerLogin /> },
      {
        path: "app",
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "products", element: <ProductsList /> },
          { path: "jobs", element: <JobsList /> },
          { path: "repairs", element: <Navigate to="/app/jobs" replace /> },
          { path: "orders", element: <Navigate to="/app/jobs" replace /> },
          { path: "jobs/new", element: <NewJob /> },
          { path: "jobs/:id", element: <JobDetails /> },
          { path: "customers", element: <CustomersList /> },
          { path: "employees", element: <EmployeesList /> },
          { path: "analytics", element: <Analytics /> },
          { path: "feedback", element: <Feedback /> },
          { path: "messages", element: <Messages /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
