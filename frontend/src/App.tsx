import { Toaster } from "react-hot-toast";
import UserRoutes from "./routes/routes";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
      <UserRoutes />
    </>
  );
}

export default App;
