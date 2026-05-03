import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminKitchens from "./pages/admin/Kitchens";
import AdminSchools from "./pages/admin/Schools";
import AdminClasses from "./pages/admin/Classes";
import AdminBeneficiaries from "./pages/admin/Beneficiaries";
import AdminMapping from "./pages/admin/Mapping";
import KitchenLayout from "./layouts/KitchenLayout";
import KitchenDashboard from "./pages/kitchen/Dashboard";
import KitchenMenus from "./pages/kitchen/Menus";
import KitchenComposition from "./pages/kitchen/Composition";
import KitchenDistribution from "./pages/kitchen/Distribution";
import KitchenConfirmations from "./pages/kitchen/Confirmations";
import KitchenEvaluations from "./pages/kitchen/Evaluations";
import KitchenFeedback from "./pages/kitchen/Feedback";
import KitchenReports from "./pages/kitchen/Reports";
import TeacherLayout from "./layouts/TeacherLayout";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherConfirmation from "./pages/teacher/Confirmation";
import TeacherMonitoring from "./pages/teacher/Monitoring";
import TeacherNotes from "./pages/teacher/Notes";
import BeneficiaryLayout from "./layouts/BeneficiaryLayout";
import BeneficiaryDashboard from "./pages/beneficiary/Dashboard";
import BeneficiaryAttendance from "./pages/beneficiary/Attendance";
import BeneficiaryRating from "./pages/beneficiary/Rating";
import BeneficiaryComponentRating from "./pages/beneficiary/ComponentRating";
import BeneficiaryFeedback from "./pages/beneficiary/Feedback";
import BeneficiaryHistory from "./pages/beneficiary/History";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "users", Component: AdminUsers },
      { path: "kitchens", Component: AdminKitchens },
      { path: "schools", Component: AdminSchools },
      { path: "classes", Component: AdminClasses },
      { path: "beneficiaries", Component: AdminBeneficiaries },
      { path: "mapping", Component: AdminMapping },
    ],
  },
  {
    path: "/kitchen",
    Component: KitchenLayout,
    children: [
      { index: true, Component: KitchenDashboard },
      { path: "menus", Component: KitchenMenus },
      { path: "composition", Component: KitchenComposition },
      { path: "distribution", Component: KitchenDistribution },
      { path: "confirmations", Component: KitchenConfirmations },
      { path: "evaluations", Component: KitchenEvaluations },
      { path: "feedback", Component: KitchenFeedback },
      { path: "reports", Component: KitchenReports },
    ],
  },
  {
    path: "/teacher",
    Component: TeacherLayout,
    children: [
      { index: true, Component: TeacherDashboard },
      { path: "confirmation", Component: TeacherConfirmation },
      { path: "monitoring", Component: TeacherMonitoring },
      { path: "notes", Component: TeacherNotes },
    ],
  },
  {
    path: "/beneficiary",
    Component: BeneficiaryLayout,
    children: [
      { index: true, Component: BeneficiaryDashboard },
      { path: "attendance", Component: BeneficiaryAttendance },
      { path: "rating", Component: BeneficiaryRating },
      { path: "component-rating", Component: BeneficiaryComponentRating },
      { path: "feedback", Component: BeneficiaryFeedback },
      { path: "history", Component: BeneficiaryHistory },
    ],
  },
]);
