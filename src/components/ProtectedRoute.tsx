import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig"; // your Firebase config

// This component is for making sure that only an Admin that has logged in can see certain pages.
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
