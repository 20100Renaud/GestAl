import Login from "./pages/Login.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <main>
      <h1>Welcome to GestAl</h1>

      <p>
        Logged in as {user.firstName} {user.lastName}
      </p>

      <p>{user.email}</p>
      <p>Role: {user.role}</p>

      <button onClick={logout}>Logout</button>
    </main>
  );
}
