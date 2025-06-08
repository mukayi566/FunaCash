"use server"

import { createClient } from "@/lib/supabase/server"
import { updateUser } from "@/lib/supabase/database"

export async function updateProfilePicture(userId: string, file: File) {
  try {
    const supabase = createClient()

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `profile-pictures/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file, {
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(filePath)

    // Update user profile with new picture URL
    await updateUser(userId, {
      profile_picture: publicUrl,
    })

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error: any) {
    console.error("Error updating profile picture:", error)
    return {
      success: false,
      error: error.message || "Failed to update profile picture",
    }
  }
}

export async function removeProfilePicture(userId: string) {
  try {
    const supabase = createClient()

    // Remove profile picture URL from user profile
    await updateUser(userId, {
      profile_picture: null,
    })

    // Optionally delete the file from storage
    const filePath = `profile-pictures/${userId}`
    await supabase.storage.from("profile-pictures").remove([filePath])

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error removing profile picture:", error)
    return {
      success: false,
      error: error.message || "Failed to remove profile picture",
    }
  }
}
