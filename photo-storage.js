/**
 * Photo Storage Management
 * Handles saving/loading photos from localStorage
 */

// dev only
export const _testPhotos = [
  '1688381504089.jpeg',
  '1699455018471.jpeg',
  '1744056970861.jpeg',
  '1752057077706.jpeg',
  '1765933298027.jpeg',
  'photo_2025-12-16_23-24-09.jpg',

  '1516839120841.jpeg',
  '1516856965487.jpeg',
  '1517506584047.jpeg',
  '1756203294622.jpeg',
];

// List of photos managed internally (IDs)
export const photosList = [];

// Storage for uploaded photos (data URLs in memory)
export const uploadedPhotos = {};

const STORAGE_KEY_PREFIX = 'frameMaker_photo_';
const PHOTOS_LIST_KEY = 'frameMaker_photosList';

/**
 * Save a single photo to localStorage
 */
function savePhotoToStorage(photoId, dataUrl) {
  localStorage.setItem(STORAGE_KEY_PREFIX + photoId, dataUrl);
}

/**
 * Load a single photo from localStorage
 */
function loadPhotoFromStorage(photoId) {
  return localStorage.getItem(STORAGE_KEY_PREFIX + photoId);
}

/**
 * Delete a single photo from localStorage
 */
function deletePhotoFromStorage(photoId) {
  localStorage.removeItem(STORAGE_KEY_PREFIX + photoId);
}

/**
 * Save photos list to localStorage
 */
export function savePhotosListToStorage() {
  localStorage.setItem(PHOTOS_LIST_KEY, JSON.stringify(photosList));
}

/**
 * Load all photos from localStorage
 */
export function loadPhotosFromStorage() {
  try {
    const savedList = localStorage.getItem(PHOTOS_LIST_KEY);

    if (savedList) {
      const parsed = JSON.parse(savedList);
      photosList.splice(0, photosList.length, ...parsed);

      // Load data URLs for each photo
      parsed.forEach((photoId) => {
        const dataUrl = loadPhotoFromStorage(photoId);
        if (dataUrl) {
          uploadedPhotos[photoId] = dataUrl;
        }
      });

      console.log(`📸 Loaded ${photosList.length} photos from localStorage`);
    } else {
      // First time: initialize with config photos
      photosList.splice(0, photosList.length, ..._testPhotos);
      console.log(
        `📸 No saved photos found, using ${photosList.length} config photos`
      );
    }
  } catch (error) {
    console.error('Error loading photos from storage:', error);
    // Fallback to config photos
    photosList.splice(0, photosList.length, ..._testPhotos);
    console.log(`📸 Using fallback - ${photosList.length} config photos`);
  }
}

/**
 * Initialize test photos from config to localStorage (development only)
 */
async function initializeTestPhotos() {
  try {
    // Check if we already have saved photos
    const savedList = localStorage.getItem(PHOTOS_LIST_KEY);
    if (savedList) {
      console.log(
        '✓ Test photos already initialized (found saved photos list)'
      );
      return; // Already initialized
    }

    console.log(
      `🧪 Initializing test photos (${_testPhotos.length} photos from config)...`
    );

    // Load all test photos from config
    const photoPromises = _testPhotos.map((filename) => {
      return fetch(`./photos/${filename}`)
        .then((response) => response.blob())
        .then((blob) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const photoId = `test-${filename}`;
              const dataUrl = e.target.result;
              uploadedPhotos[photoId] = dataUrl;
              savePhotoToStorage(photoId, dataUrl);
              resolve(photoId);
            };
            reader.readAsDataURL(blob);
          });
        })
        .catch((error) => {
          console.warn(`Failed to load test photo: ${filename}`, error);
          return null;
        });
    });

    const loadedPhotoIds = await Promise.all(photoPromises);
    const validPhotoIds = loadedPhotoIds.filter((id) => id !== null);

    if (validPhotoIds.length > 0) {
      // Replace photosList with test photo IDs
      photosList.splice(0, photosList.length, ...validPhotoIds);

      // Save list to storage
      savePhotosListToStorage();
      console.log(
        `✓ Test photos initialized: ${validPhotoIds.length} photos saved to localStorage`
      );
    }
  } catch (error) {
    console.error('Error initializing test photos:', error);
  }
}

/**
 * Add a new uploaded photo to storage
 */
export function addUploadedPhoto(photoId, dataUrl) {
  uploadedPhotos[photoId] = dataUrl;
  savePhotoToStorage(photoId, dataUrl);
  photosList.unshift(photoId);
  savePhotosListToStorage();
}

// dev only
await initializeTestPhotos();
