import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "@/components/ui/sonner";

import AuthLayout from "./pages/auth/AuthLayout";
import SigninPage from "./pages/auth/SigninPage";
import DashboardPage from "./pages/home/DashboardPage";
import RootLayout from "./pages/home/RootLayout";
import UserPage from "./pages/home/user/UserPage";
import SportTypePage from "./pages/home/sportType/SportTypePage";
import LocationPage from "./pages/home/location/LocationPage";
import GroupChatPage from "./pages/home/groupChat/GroupChatPage";
import UserDetailsPage from "./pages/home/user/UserDetailsPage";
import LocationDetailsPage from "./pages/home/location/LocationDetailsPage";
import CreateLocationPage from "./pages/home/location/CreateLocationPage";
import GroupChatDetailsPage from "./pages/home/groupChat/GroupChatDetailsPage";
import AccountPage from "./pages/home/AccountPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <Routes>
        {/* auth */}
        <Route element={<AuthLayout />}>
          <Route path="signin" element={<SigninPage />} />
        </Route>

        {/* root */}
        <Route element={<RootLayout />}>
          <Route index path="/" element={<DashboardPage />} />

          <Route path="/users" element={<UserPage />} />
          <Route path="/users/:userId" element={<UserDetailsPage />} />

          <Route path="/sportTypes" element={<SportTypePage />} />

          <Route path="/locations" element={<LocationPage />} />
          <Route
            path="/locations/:locationId"
            element={<LocationDetailsPage />}
          />
          <Route path="/locations/create" element={<CreateLocationPage />} />

          <Route path="/groupChats" element={<GroupChatPage />} />
          <Route
            path="/groupChats/:groupChatId"
            element={<GroupChatDetailsPage />}
          />

          <Route path="/account" element={<AccountPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
