"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Edit, Mail, Phone, User, Upload } from "lucide-react"
import { getUserById, updateUser } from "@/lib/supabase/database"
import { uploadProfilePicture, deleteProfilePicture } from "@/lib/storage-service"
import { updateUserProfilePicture } from "@/lib/db-service"
import { updateProfilePicture } from "@/app/actions/profile-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [user, setUser] = useState<{
    uid: string
    displayName: string
    email: string
    profilePictureUrl: string | null
  } | null>(null)

  // User profile data
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    dateJoined: "",
    verificationStatus: "Pending",
  })

  useEffect(() => {
    // Get userId from cookie
    const storedUserId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_id="))
      ?.split("=")[1]

    if (storedUserId) {
      setUserId(storedUserId)
      fetchUserProfile(storedUserId)
    } else {
      setIsLoading(false)
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const fetchUserProfile = async (id: string) => {
    try {
      setIsLoading(true)
      const userData = await getUserById(id)

      if (userData) {
        // Format date if it exists
        let formattedDate = "Recently"
        if (userData.created_at) {
          const date = new Date(userData.created_at)
          formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }

        setProfile({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          country: userData.country || "",
          address: userData.address || "",
          dateJoined: formattedDate,
          verificationStatus: userData.verification_status || "Pending",
        })

        // Set profile picture if it exists
        if (userData.profile_picture) {
          setProfilePictureUrl(userData.profile_picture)
        } else {
          // Set default avatar
          setProfilePictureUrl("/placeholder.svg")
        }

        // Set user data
        setUser({
          uid: id,
          displayName: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
          profilePictureUrl: userData.profile_picture || null,
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!userId) return

    setIsLoading(true)

    try {
      // Only update fields that can be changed by the user
      await updateUser(userId, {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        address: profile.address,
      })

      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile picture must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Upload the file to Firebase Storage
      const uploadResult = await uploadProfilePicture(userId, file)

      if (uploadResult.success) {
        // Update the user document with the profile picture URL
        const updateResult = await updateUserProfilePicture(userId, uploadResult.url)

        if (updateResult.success) {
          setProfilePictureUrl(uploadResult.url)
          toast({
            title: "Profile picture updated",
            description: "Your profile picture has been updated successfully",
          })
        } else {
          throw new Error(updateResult.error)
        }
      } else {
        throw new Error(uploadResult.error)
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteProfilePicture = async () => {
    if (!userId) return

    setIsUploading(true)
    setShowDeleteDialog(false)

    try {
      // Delete the file from Firebase Storage
      const deleteResult = await deleteProfilePicture(userId)

      if (deleteResult.success) {
        // Update the user document to remove the profile picture URL
        const updateResult = await updateUserProfilePicture(userId, null)

        if (updateResult.success) {
          // Set default avatar
          setProfilePictureUrl("/placeholder.svg")
          toast({
            title: "Profile picture removed",
            description: "Your profile picture has been removed successfully",
          })
        } else {
          throw new Error(updateResult.error)
        }
      } else {
        throw new Error(deleteResult.error)
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error)
      toast({
        title: "Error",
        description: "Failed to remove profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U" // Return a default initial if name is null or undefined

    const nameParts = name.split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.length > 1 ? nameParts[1] : ""

    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase() || "U"
  }

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return

    const file = event.target.files[0]
    setIsLoading(true)

    try {
      const result = await updateProfilePicture(user.uid, file)
      if (result.success) {
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        })
        // Update the local user state with the new profile picture URL
        setUser((prevUser) => (prevUser ? { ...prevUser, profilePictureUrl: result.url } : null))
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile picture",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/customer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-2 border-primary">
                      <AvatarImage
                        src={user?.profilePictureUrl || "/placeholder.svg" || "/placeholder.svg"}
                        alt={user?.displayName || "User"}
                      />
                      <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <label htmlFor="profile-picture-upload" className="cursor-pointer">
                        <div className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors">
                          <Upload size={16} />
                        </div>
                        <input
                          id="profile-picture-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePictureUpload}
                          disabled={isLoading}
                        />
                      </label>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mt-4">{user?.displayName}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <h3 className="text-xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="mt-4 w-full">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">Member since</span>
                    <span className="text-sm">{profile.dateJoined}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="flex items-center">
                      {profile.verificationStatus === "Verified" ? (
                        <>
                          <Check className="mr-1 h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">{profile.verificationStatus}</span>
                        </>
                      ) : (
                        <span className="text-sm text-yellow-600">{profile.verificationStatus}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">Country</span>
                    <span className="text-sm capitalize">{profile.country}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        {isEditing ? (
                          <Input
                            id="firstName"
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.firstName}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        {isEditing ? (
                          <Input
                            id="lastName"
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.lastName}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                          <Mail className="mr-2 h-4 w-4 text-gray-400" />
                          <span>{profile.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <Phone className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        {isEditing ? (
                          <Input
                            id="address"
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <span>{profile.address || "No address provided"}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-blue-700"
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" placeholder="••••••••" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" placeholder="••••••••" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••••" />
                      </div>

                      <div className="pt-2">
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-700">Update Password</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Profile Picture Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Profile Picture</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfilePicture} disabled={isUploading}>
              {isUploading ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
