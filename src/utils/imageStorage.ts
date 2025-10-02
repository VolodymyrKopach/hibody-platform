/**
 * Image Storage using IndexedDB
 * Stores images as Blobs instead of Base64 strings
 * Much more efficient for large images
 */

const DB_NAME = 'worksheet_images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

interface ImageRecord {
  id: string;
  blob: Blob;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

/**
 * Initialize IndexedDB
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('📦 IndexedDB object store created');
      }
    };
  });
}

/**
 * Store image in IndexedDB
 */
export async function storeImage(blob: Blob, filename: string): Promise<string> {
  try {
    const db = await openDatabase();
    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const record: ImageRecord = {
      id,
      blob,
      filename,
      mimeType: blob.type,
      size: blob.size,
      createdAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(record);

      request.onsuccess = () => {
        console.log(`✅ Image stored in IndexedDB: ${id} (${(blob.size / 1024).toFixed(2)}KB)`);
        resolve(id);
      };

      request.onerror = () => {
        reject(new Error('Failed to store image'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to store image:', error);
    throw error;
  }
}

/**
 * Retrieve image from IndexedDB
 */
export async function getImage(id: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const record = request.result as ImageRecord | undefined;
        resolve(record?.blob || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve image'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to retrieve image:', error);
    return null;
  }
}

/**
 * Delete image from IndexedDB
 */
export async function deleteImage(id: string): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`🗑️ Image deleted from IndexedDB: ${id}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete image'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}

/**
 * Get all stored images
 */
export async function getAllImages(): Promise<ImageRecord[]> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get all images'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to get all images:', error);
    return [];
  }
}

/**
 * Clear all images from IndexedDB
 */
export async function clearAllImages(): Promise<void> {
  try {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🧹 All images cleared from IndexedDB');
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear images'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Failed to clear images:', error);
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  count: number;
  totalSize: number;
  formattedSize: string;
}> {
  try {
    const images = await getAllImages();
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    
    const formattedSize = 
      totalSize < 1024 ? `${totalSize}B` :
      totalSize < 1024 * 1024 ? `${(totalSize / 1024).toFixed(2)}KB` :
      `${(totalSize / (1024 * 1024)).toFixed(2)}MB`;

    return {
      count: images.length,
      totalSize,
      formattedSize,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return { count: 0, totalSize: 0, formattedSize: '0B' };
  }
}

/**
 * Create object URL from stored image
 */
export async function getImageURL(id: string): Promise<string | null> {
  const blob = await getImage(id);
  if (!blob) return null;
  
  return URL.createObjectURL(blob);
}

/**
 * Delete IndexedDB database completely
 */
export async function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    
    request.onsuccess = () => {
      console.log('🗑️ IndexedDB database deleted completely');
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete database'));
    };
  });
}

