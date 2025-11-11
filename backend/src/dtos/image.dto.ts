export interface ImageDTO {
  _id?: string;
  title: string;
  url: string;
  public_id: string;
  userId: string;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
