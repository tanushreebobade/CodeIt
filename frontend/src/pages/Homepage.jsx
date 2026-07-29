import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div>
      <h1>
        Welcome, {user?.firstName || "User"}!
      </h1>
      <p>{user?.emailId}</p>
      <button onClick={handleLogout}>
        Logout
      </button>

    </div>
  );
}

export default Homepage;