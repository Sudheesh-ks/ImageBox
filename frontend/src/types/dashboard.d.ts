export interface ImageType {
  _id: string;
  title: string;
  url: string;
  public_id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SelectedFile {
  file: File;
  preview: string;
  title: string;
}
