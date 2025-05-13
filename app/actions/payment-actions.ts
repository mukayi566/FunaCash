"use server"

import { z } from "zod"

// Transaction schema for validation
const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  recipientPhone: z.string().min(10, "Valid phone number is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  currency: z.enum(["ZMW", "ZWL"]),
  note: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

export async function initiateWhatsAppPayment(formData: FormData) {
  try {
    // Safely extract form data with fallbacks
    const rawData = {
      amount: formData.get("amount")?.toString() || "",
      recipientPhone: formData.get("recipientPhone")?.toString() || "",
      recipientName: formData.get("recipientName")?.toString() || "",
      currency: formData.get("currency")?.toString() || "ZMW",
      note: formData.get("note")?.toString() || undefined,
    }

    console.log("Processing payment with data:", rawData)

    // Validate the data
    const validatedData = transactionSchema.parse(rawData)

    // Generate a unique transaction ID
    const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // In a real application, you would:
    // 1. Store the transaction in your database
    // 2. Initiate the WhatsApp API call to the official number
    // 3. Handle the response and update the transaction status

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Return success with transaction details
    return {
      success: true,
      message: "Payment initiated successfully",
      transactionId,
      whatsappNumber: "+44 7860 088593",
      details: {
        ...validatedData,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Payment initiation error:", error)

    if (error instanceof z.ZodError) {
      // Return validation errors
      return {
        success: false,
        message: "Validation failed: " + error.errors.map((e) => e.message).join(", "),
        errors: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      }
    }

    // Return generic error
    return {
      success: false,
      message: "Failed to initiate payment. Please try again.",
    }
  }
}

export async function verifyTransaction(transactionId: string) {
  try {
    // In a real application, you would:
    // 1. Query your database for the transaction
    // 2. Check the status with the payment provider
    // 3. Update the transaction status

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Randomly determine if transaction is successful (for demo purposes)
    const isSuccessful = Math.random() > 0.2

    if (isSuccessful) {
      return {
        success: true,
        status: "completed",
        message: "Transaction completed successfully",
      }
    } else {
      return {
        success: false,
        status: "failed",
        message: "Transaction verification failed. Please contact support.",
      }
    }
  } catch (error) {
    return {
      success: false,
      status: "error",
      message: "An error occurred while verifying the transaction",
    }
  }
}

export async function getTransactionHistory() {
  // In a real application, you would fetch from your database
  // For demo purposes, we'll return mock data

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    success: true,
    transactions: [
      {
        id: "TX-1234567890",
        amount: "500.00",
        currency: "ZMW",
        recipientName: "Grace Moyo",
        recipientPhone: "+263 71 234 5678",
        status: "completed",
        date: new Date(Date.now() - 3600000).toISOString(),
        fee: "10.00",
      },
      {
        id: "TX-0987654321",
        amount: "750.00",
        currency: "ZMW",
        recipientName: "David Banda",
        recipientPhone: "+263 77 876 5432",
        status: "completed",
        date: new Date(Date.now() - 86400000).toISOString(),
        fee: "15.00",
      },
      {
        id: "TX-5678901234",
        amount: "300.00",
        currency: "ZWL",
        recipientName: "Tendai Ncube",
        recipientPhone: "+263 73 456 7890",
        status: "pending",
        date: new Date(Date.now() - 172800000).toISOString(),
        fee: "6.00",
      },
    ],
  }
}
