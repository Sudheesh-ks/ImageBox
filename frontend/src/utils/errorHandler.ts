import toast from "react-hot-toast";
import axios from "axios";

export const showErrorToast = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    const errorMsg =
      error.response?.data?.message || error.message || "Something went wrong";
    toast.error(errorMsg);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("An unknown error occurred");
  }
};
