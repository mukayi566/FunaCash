"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Building, Check, Edit, Mail, MapPin, Phone, User, Upload } from "lucide-react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { firebaseDb } from "@/lib/firebase"
import { uploadProfilePicture, deleteProfilePicture } from "@/lib/storage-service"
import { updateUserProfilePicture } from "@/lib/db-service"
import { updateProfilePicture } from "@/app/actions/profile-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function AgentProfilePage() {
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
    email: string | null
    displayName: string | null
    profilePictureUrl: string | null
  } | null>(null)

  // Agent profile data
  const [profile, setProfile] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    businessLicense: "",
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
      fetchAgentProfile(storedUserId)
    } else {
      setIsLoading(false)
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const fetchAgentProfile = async (id: string) => {
    try {
      setIsLoading(true)
      const userDoc = await getDoc(doc(firebaseDb, "users", id))

      if (userDoc.exists()) {
        const userData = userDoc.data()

        // Format date if it exists
        let formattedDate = "Recently"
        if (userData.createdAt) {
          const date = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)
          formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }

        setProfile({
          businessName: userData.businessName || "",
          ownerName: `${userData.firstName || ""} ${userData.lastName || ""}`,
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          country: userData.country || "",
          businessLicense: userData.businessLicense || "",
          dateJoined: formattedDate,
          verificationStatus: userData.verificationStatus || "Pending",
        })

        // Set profile picture if it exists
        if (userData.profilePicture) {
          setProfilePictureUrl(userData.profilePicture)
        } else {
          // Set default avatar with business initials
          const initials = userData.businessName
            ? userData.businessName
                .split(" ")
                .slice(0, 2)
                .map((word) => word.charAt(0))
                .join("")
            : "BA"
          setProfilePictureUrl(`/placeholder.svg?height=96&width=96&text=${initials.toUpperCase()}`)
        }

        setUser({
          uid: id,
          email: userData.email || null,
          displayName: `${userData.firstName || ""} ${userData.lastName || ""}`,
          profilePictureUrl: userData.profilePicture || null,
        })
      }
    } catch (error) {
      console.error("Error fetching agent profile:", error)
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
      const userRef = doc(firebaseDb, "users", userId)

      // Split owner name into first and last name
      const nameParts = profile.ownerName.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      // Only update fields that can be changed by the user
      await updateDoc(userRef, {
        businessName: profile.businessName,
        firstName,
        lastName,
        phone: profile.phone,
        address: profile.address,
        businessLicense: profile.businessLicense,
      })

      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your business profile information has been updated successfully",
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
            description: "Your business profile picture has been updated successfully",
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
          // Set default avatar with business initials
          const initials = profile.businessName
            ? profile.businessName
                .split(" ")
                .slice(0, 2)
                .map((word) => word.charAt(0))
                .join("")
            : "BA"
          setProfilePictureUrl(`/placeholder.svg?height=96&width=96&text=${initials.toUpperCase()}`)

          toast({
            title: "Profile picture removed",
            description: "Your business profile picture has been removed successfully",
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

  const getBusinessInitials = () => {
    return profile.businessName
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
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

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U" // Return a default initial if name is null or undefined

    const nameParts = name.split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.length > 1 ? nameParts[1] : ""

    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase() || "U"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/agent">
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
                <div className="relative mb-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-primary">
                        <AvatarImage
                          src={
                            user?.profilePictureUrl ||
                            `/placeholder.svg?height=96&width=96&text=${getInitials(user?.displayName)}`
                          }
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
                </div>
                <h3 className="text-xl font-bold">{profile.businessName}</h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="mt-4 w-full">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-500">License</span>
                    <span className="text-sm">{profile.businessLicense || "Not provided"}</span>
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
                    <span className="text-sm text-gray-500">Member since</span>
                    <span className="text-sm">{profile.dateJoined}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Manage your business profile</CardDescription>
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
                <Tabs defaultValue="business">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="business">Business Info</TabsTrigger>
                    <TabsTrigger value="owner">Owner Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="business" className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        {isEditing ? (
                          <Input
                            id="businessName"
                            value={profile.businessName}
                            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <Building className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.businessName || "Not provided"}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessLicense">Business License</Label>
                        {isEditing ? (
                          <Input
                            id="businessLicense"
                            value={profile.businessLicense}
                            onChange={(e) => setProfile({ ...profile, businessLicense: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <span>{profile.businessLicense || "Not provided"}</span>
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
                        <Label htmlFor="address">Business Address</Label>
                        {isEditing ? (
                          <Textarea
                            id="address"
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.address || "Not provided"}</span>
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

                  <TabsContent value="owner" className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name</Label>
                        {isEditing ? (
                          <Input
                            id="ownerName"
                            value={profile.ownerName}
                            onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{profile.ownerName}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50">
                          <span className="capitalize">{profile.country}</span>
                        </div>
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
            <DialogTitle>Remove Business Logo</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your business logo? This action cannot be undone.
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
