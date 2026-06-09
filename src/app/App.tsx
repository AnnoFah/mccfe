import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { AttendanceProvider } from "./context/AttendanceContext";

export default function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <RouterProvider router={router} />
      </AttendanceProvider>
    </AuthProvider>
  );
}
