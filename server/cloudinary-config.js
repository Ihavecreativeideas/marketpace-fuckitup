// Cloudinary Configuration for MarketPace Image CDN
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('⚠️ Cloudinary credentials missing - image uploads will not work');
      return false;
    }

    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully');
    console.log('📸 Image CDN ready for MarketPace uploads');
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Cloudinary storage configuration for different upload types
const createCloudinaryStorage = (folder = 'marketpace') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      public_id: (req, file) => {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        return `${folder}_${timestamp}_${randomString}`;
      }
    }
  });
};

// Different storage configurations for different content types
const profilePictureStorage = createCloudinaryStorage('marketpace/profiles');
const postImageStorage = createCloudinaryStorage('marketpace/posts');
const checkinPhotoStorage = createCloudinaryStorage('marketpace/checkins');
const productImageStorage = createCloudinaryStorage('marketpace/products');
const eventImageStorage = createCloudinaryStorage('marketpace/events');
const businessLogoStorage = createCloudinaryStorage('marketpace/business-logos');

// Multer configurations for different upload types
const profileUpload = multer({ 
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const postUpload = multer({ 
  storage: postImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for posts
});

const checkinUpload = multer({ 
  storage: checkinPhotoStorage,
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB limit for check-ins
});

const productUpload = multer({ 
  storage: productImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB for product images
});

const eventUpload = multer({ 
  storage: eventImageStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB for event banners
});

const businessUpload = multer({ 
  storage: businessLogoStorage,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB for business logos
});

// Image URL helpers
const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransforms = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  };
  
  return cloudinary.url(publicId, defaultTransforms);
};

// Get different sizes for responsive images
const getResponsiveImageUrls = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 400, crop: 'limit' }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 800, crop: 'limit' }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 1200, crop: 'limit' }),
    original: getOptimizedImageUrl(publicId)
  };
};

// Delete image from Cloudinary
const deleteCloudinaryImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  testCloudinaryConnection,
  profileUpload,
  postUpload,
  checkinUpload,
  productUpload,
  eventUpload,
  businessUpload,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  deleteCloudinaryImage
};