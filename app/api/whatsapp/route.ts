import { type NextRequest, NextResponse } from "next/server"
import { getUserByPhone, getUserBalance, createWithdrawalRequest } from "@/app/actions/balance-actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // This is a simplified example of handling WhatsApp API webhooks
    // In a real implementation, you would need to handle authentication, verification, etc.

    const { from, body: messageBody } = body

    // Extract the phone number from the WhatsApp ID
    const phoneNumber = from.replace("whatsapp:", "")

    // Process the message
    const response = await processWhatsAppMessage(phoneNumber, messageBody)

    // Return the response
    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function processWhatsAppMessage(phoneNumber: string, message: string) {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase().trim()

  // Check if the user exists
  const userResult = await getUserByPhone(phoneNumber)

  if (!userResult.success) {
    return {
      message:
        "Welcome to Funacash! It seems you don't have an account with us yet. Please visit our website or contact our customer service to create an account.",
    }
  }

  const user = userResult.user

  // Handle different commands
  if (lowerMessage === "balance" || lowerMessage === "check balance") {
    const balanceResult = await getUserBalance(user.id)

    if (!balanceResult.success) {
      return {
        message: "Sorry, we couldn't retrieve your balance at the moment. Please try again later.",
      }
    }

    return {
      message: `Hello ${user.name}, your current balance is ${balanceResult.balance} ${balanceResult.currency}.`,
    }
  }

  if (lowerMessage.startsWith("withdraw ")) {
    // Extract the amount from the message
    const amountStr = lowerMessage.replace("withdraw ", "").trim()
    const amount = Number.parseFloat(amountStr)

    if (isNaN(amount) || amount <= 0) {
      return {
        message: "Please provide a valid amount to withdraw. For example: 'withdraw 100'",
      }
    }

    // Create withdrawal request
    const withdrawalResult = await createWithdrawalRequest({
      userId: user.id,
      amount,
      phoneNumber: user.phoneNumber,
      notes: "Requested via WhatsApp",
    })

    if (!withdrawalResult.success) {
      if (withdrawalResult.message === "Insufficient balance") {
        return {
          message: `Sorry, you have insufficient balance for this withdrawal. Your current balance is ${withdrawalResult.currentBalance} ${user.country === "zambia" ? "ZMW" : "ZWL"}.`,
        }
      }

      return {
        message: `Sorry, we couldn't process your withdrawal request: ${withdrawalResult.message}`,
      }
    }

    return {
      message: `Your withdrawal request for ${amount} ${user.country === "zambia" ? "ZMW" : "ZWL"} has been submitted successfully. Request ID: ${withdrawalResult.requestId}. ${withdrawalResult.agentName} will process your request shortly.`,
    }
  }

  if (lowerMessage === "help") {
    return {
      message:
        "Available commands:\n- 'balance' - Check your current balance\n- 'withdraw [amount]' - Request a withdrawal\n- 'help' - Show this help message",
    }
  }

  // Default response for unrecognized commands
  return {
    message: "I didn't understand that command. Type 'help' to see available commands.",
  }
}
