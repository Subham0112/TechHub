import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
      withCredentials: true
    })
    .then((res) => {
      if (res.data.role !== "admin") {
        navigate("/unauthorized");
      } else {
        setLoading(false);
      }
    })
    .catch(() => {
      navigate("/login");
    });
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return children;
};

export default AdminRoute;
