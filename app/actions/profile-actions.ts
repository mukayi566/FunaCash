"use server"

import { revalidatePath } from "next/cache"
import { firebaseDb } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { uploadProfilePicture } from "@/lib/storage-service"

export async function updateProfilePicture(userId: string, file: File) {
  try {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Profile picture must be less than 5MB",
      }
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Please upload an image file",
      }
    }

    // Upload the file to Firebase Storage
    const uploadResult = await uploadProfilePicture(userId, file)

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
      }
    }

    // Update the user document with the profile picture URL
    const userRef = doc(firebaseDb, "users", userId)
    await updateDoc(userRef, {
      profilePicture: uploadResult.url,
    })

    // Revalidate paths that might display the profile picture
    revalidatePath("/dashboard/customer")
    revalidatePath("/dashboard/customer/profile")
    revalidatePath("/dashboard/agent")
    revalidatePath("/dashboard/agent/profile")

    return {
      success: true,
      url: uploadResult.url,
    }
  } catch (error) {
    console.error("Error updating profile picture:", error)
    return {
      success: false,
      error: "Failed to update profile picture",
    }
  }
}
