import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

// Upload a profile picture
export async function uploadProfilePicture(userId: string, file: File) {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `profile-pictures/${fileName}`

    // Upload the file
    const { data, error } = await supabase.storage.from("profile-pictures").upload(filePath, file, {
      upsert: true,
    })

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error("Error uploading profile picture:", error)
    return { success: false, error: error.message || "Failed to upload profile picture" }
  }
}

// Delete a profile picture
export async function deleteProfilePicture(userId: string) {
  try {
    const filePath = `profile-pictures/${userId}`

    // Delete the file
    const { error } = await supabase.storage.from("profile-pictures").remove([filePath])

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting profile picture:", error)
    return { success: false, error: error.message || "Failed to delete profile picture" }
  }
}

// Get profile picture URL
export async function getProfilePictureURL(userId: string) {
  try {
    const filePath = `profile-pictures/${userId}`

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error: any) {
    // If the file doesn't exist, return a default URL
    return {
      success: false,
      url: `/placeholder.svg?height=200&width=200&text=${userId.substring(0, 2).toUpperCase()}`,
    }
  }
}
