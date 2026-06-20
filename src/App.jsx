import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Landing from './pages/public/Landing';
import AboutUs from './pages/public/AboutUs';
import Mission from './pages/public/Mission';
import HowItWorks from './pages/public/HowItWorks';
import FAQ from './pages/public/FAQ';

import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import VerifyOTP from './pages/auth/VerifyOTP';
import CompleteProfile from './pages/auth/CompleteProfile';

import Home from './pages/app/Home';
import ListingDetail from './pages/app/ListingDetail';
import CreateListing from './pages/app/CreateListing';
import Profile from './pages/app/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing site */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Auth flow */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          {/* Protected marketplace app */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/listing/:id"
            element={
              <ProtectedRoute>
                <ListingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/create-listing"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
