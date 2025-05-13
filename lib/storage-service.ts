import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { firebaseApp } from "./firebase"

const storage = getStorage(firebaseApp)

// Upload a profile picture
export async function uploadProfilePicture(userId: string, file: File) {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `profile-pictures/${userId}`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return { success: true, url: downloadURL }
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return { success: false, error: "Failed to upload profile picture" }
  }
}

// Delete a profile picture
export async function deleteProfilePicture(userId: string) {
  try {
    // Create a reference to the file to delete
    const storageRef = ref(storage, `profile-pictures/${userId}`)

    // Delete the file
    await deleteObject(storageRef)

    return { success: true }
  } catch (error) {
    console.error("Error deleting profile picture:", error)
    return { success: false, error: "Failed to delete profile picture" }
  }
}

// Get profile picture URL
export async function getProfilePictureURL(userId: string) {
  try {
    const storageRef = ref(storage, `profile-pictures/${userId}`)
    const url = await getDownloadURL(storageRef)
    return { success: true, url }
  } catch (error) {
    // If the file doesn't exist, return a default URL
    return {
      success: false,
      url: `/placeholder.svg?height=200&width=200&text=${userId.substring(0, 2).toUpperCase()}`,
    }
  }
}
