export const HttpResponse = {
  // General
  OK: 'OK',
  SERVER_ERROR: 'Internal server error',
  CREATED: 'Created successfully',
  BAD_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',

  // Auth related
  FIELDS_REQUIRED: 'All fields are required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD:
    'Password must be at least 8 characters long, contain at least 1 letter, 1 number, and 1 special character',
  INVALID_PHONE: 'Phone number must contain 10 numbers',  
  INVALID_CREDENTIALS: 'Invalid credentials',
  INCORRECT_PASSWORD: 'Incorrect Password',
  PASSWORD_UPDATED: 'Password updated successfully',
  EMAIL_ALREADY_EXISTS: 'This email already exists',
  REGISTER_SUCCESS: 'Registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',


  // Refresh token related
  REFRESH_TOKEN_MISSING: 'No refresh token provided',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  REFRESH_TOKEN_FAILED: 'Token verification failed',

  // User related
  USER_NOT_FOUND: 'User not found',

  // OTP
  OTP_SENT: 'OTP sent to email',
  OTP_SEND_FAILED: 'OTP sending failed',
  OTP_INVALID: 'Invalid OTP',
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_RESENT: 'OTP resent successfully',
  OTP_NOT_FOUND: 'No pending OTP found',
  OTP_EXPIRED_OR_INVALID: 'OTP not verified or expired',


    IMAGE_UPLOADED: "Image uploaded successfully",
  IMAGE_UPLOAD_FAILED: "Image upload failed",
  IMAGES_FETCHED: "Images fetched successfully",
  IMAGE_FETCH_FAILED: "Failed to fetch images",
  IMAGE_UPDATED: "Image updated successfully",
  IMAGE_UPDATE_FAILED: "Image update failed",
  IMAGE_DELETED: "Image deleted successfully",
  IMAGE_DELETE_FAILED: "Image delete failed",
  NO_FILE_PROVIDED: "No file provided for upload",
};
