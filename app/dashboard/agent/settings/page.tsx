"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/app/contexts/settings-context"

export default function AgentSettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })

    setIsSaving(false)
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Agent Settings</h1>
        <p className="text-muted-foreground">Manage your agent account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Funacash looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme">Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred theme.</p>
            </div>
            <Select value={settings.theme} onValueChange={(value) => updateSettings({ theme: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
          <CardDescription>Configure your agent business settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="business-name">Business Name</Label>
              <p className="text-sm text-muted-foreground">Your business name as it appears to customers.</p>
            </div>
            <Input
              id="business-name"
              value={settings.businessName || ""}
              onChange={(e) => updateSettings({ businessName: e.target.value })}
              className="w-[250px]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-print-receipts">Auto-Print Receipts</Label>
              <p className="text-sm text-muted-foreground">Automatically print receipts for all transactions.</p>
            </div>
            <Switch
              id="auto-print-receipts"
              checked={settings.autoPrintReceipts}
              onCheckedChange={(checked) => updateSettings({ autoPrintReceipts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="default-commission">Default Commission (%)</Label>
              <p className="text-sm text-muted-foreground">Your default commission percentage for transactions.</p>
            </div>
            <Input
              id="default-commission"
              type="number"
              value={settings.defaultCommission || "2.5"}
              onChange={(e) => updateSettings({ defaultCommission: e.target.value })}
              className="w-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about transactions via email.</p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about transactions via SMS.</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => updateSettings({ smsNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="whatsapp-notifications">WhatsApp Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about transactions via WhatsApp.</p>
            </div>
            <Switch
              id="whatsapp-notifications"
              checked={settings.whatsappNotifications}
              onCheckedChange={(checked) => updateSettings({ whatsappNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Switch
              id="two-factor"
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => updateSettings({ twoFactorEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-logout">Auto Logout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out after period of inactivity.</p>
            </div>
            <Switch
              id="auto-logout"
              checked={settings.autoLogout}
              onCheckedChange={(checked) => updateSettings({ autoLogout: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="transaction-pin">Transaction PIN</Label>
              <p className="text-sm text-muted-foreground">Require PIN for all transactions.</p>
            </div>
            <Switch
              id="transaction-pin"
              checked={settings.transactionPinEnabled}
              onCheckedChange={(checked) => updateSettings({ transactionPinEnabled: checked })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
