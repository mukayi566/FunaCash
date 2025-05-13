import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./config"

// Re-export the storage instance
export { storage }

// Upload file to storage
export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return { url: downloadURL, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

// Get file download URL
export const getFileURL = async (path: string) => {
  try {
    const storageRef = ref(storage, path)
    const url = await getDownloadURL(storageRef)
    return { url, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

// Delete file from storage
export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
