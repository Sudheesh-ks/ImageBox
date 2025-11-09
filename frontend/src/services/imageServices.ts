import { userApi } from "../axios/axiosInstance";
import { showErrorToast } from "../utils/errorHandler";
import type { ImageType } from "../types/dashboard";
import { IMAGE_API } from "../constants/apiConstants";

// Upload Image
export const uploadImageAPI = async (formData: FormData) => {
  try {
    const res = await userApi.post<{ message: string }>(
      IMAGE_API.UPLOAD,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Get All Images
export const getImagesAPI = async (): Promise<{
  data: { images: ImageType[] };
}> => {
  const res = await userApi.get<{ data: { images: ImageType[] } }>("/images");
  return res.data;
};

// Update Image
export const updateImageAPI = async (id: string, formData: FormData) => {
  try {
    const res = await userApi.put<ImageType>(
      `${IMAGE_API.UPDATE}/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Delete Image
export const deleteImageAPI = async (id: string, public_id: string) => {
  try {
    const res = await userApi.delete<{ message: string }>(
      `${IMAGE_API.DELETE}/${id}`,
      { data: { public_id } }
    );
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Update Image Order
export const updateImageOrderAPI = async (orderedIds: string[]) => {
  try {
    const res = await userApi.put<{ message: string }>(IMAGE_API.REORDER, {
      orderedIds,
    });
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};
