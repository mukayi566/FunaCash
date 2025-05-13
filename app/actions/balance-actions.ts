import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore"
import { firebaseDb as db } from "@/lib/firebase"

// Demo data for transactions
const demoTransactions = [
  {
    id: "tx1",
    userId: "user1",
    agentId: "demo-agent-123",
    type: "send",
    amount: 500,
    currency: "ZMW",
    recipientName: "John Doe",
    recipientPhone: "+260123456789",
    senderName: "Alice Smith",
    senderPhone: "+260987654321",
    status: "completed",
    fee: 25,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "tx2",
    userId: "user2",
    agentId: "demo-agent-123",
    type: "receive",
    amount: 750,
    currency: "ZMW",
    recipientName: "Bob Johnson",
    recipientPhone: "+260123456788",
    senderName: "Carol Williams",
    senderPhone: "+260987654322",
    status: "completed",
    fee: 37.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: "tx3",
    userId: "user3",
    agentId: "demo-agent-123",
    type: "send",
    amount: 1200,
    currency: "ZMW",
    recipientName: "Eve Brown",
    recipientPhone: "+260123456787",
    senderName: "David Miller",
    senderPhone: "+260987654323",
    status: "completed",
    fee: 60,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

// Demo data for agent balance
const demoAgentBalance = {
  id: "balance1",
  agentId: "demo-agent-123",
  balance: 25000,
  currency: "ZMW",
  lastUpdated: new Date(),
}

// Initialize demo data
export async function initializeDemoData() {
  // This function would normally add demo data to Firestore
  // For now, we'll just return success
  return { success: true }
}

// Get agent transactions
export async function getAgentTransactions(agentId: string) {
  try {
    // For demo agent, return demo transactions
    if (agentId === "demo-agent-123") {
      return {
        success: true,
        transactions: demoTransactions,
        indexNeeded: false,
      }
    }

    // For real agents, query Firestore
    const transactionsRef = collection(db, "transactions")
    const q = query(transactionsRef, where("agentId", "==", agentId), orderBy("createdAt", "desc"), limit(20))

    try {
      const querySnapshot = await getDocs(q)
      const transactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return {
        success: true,
        transactions,
      }
    } catch (error: any) {
      // Check if the error is due to missing index
      if (error.code === "failed-precondition" && error.message.includes("index")) {
        // Extract the URL from the error message
        const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0] || ""

        return {
          success: true,
          transactions: [],
          indexNeeded: true,
          indexUrl,
        }
      }

      throw error
    }
  } catch (error) {
    console.error("Error getting agent transactions:", error)
    return {
      success: false,
      message: "Failed to fetch transactions",
      transactions: [],
    }
  }
}

// Get agent balance
export async function getAgentBalance(agentId: string) {
  try {
    // For demo agent, return demo balance
    if (agentId === "demo-agent-123") {
      return {
        success: true,
        balance: demoAgentBalance,
      }
    }

    // For real agents, query Firestore
    const balanceRef = collection(db, "balances")
    const q = query(balanceRef, where("agentId", "==", agentId), limit(1))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: false,
        message: "Balance not found",
      }
    }

    const balance = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    }

    return {
      success: true,
      balance,
    }
  } catch (error) {
    console.error("Error getting agent balance:", error)
    return {
      success: false,
      message: "Failed to fetch balance",
    }
  }
}

// Get withdrawal requests
export async function getWithdrawalRequests(agentId: string) {
  try {
    // For demo agent, return empty array
    if (agentId === "demo-agent-123") {
      return {
        success: true,
        requests: [],
      }
    }

    // For real agents, query Firestore
    const requestsRef = collection(db, "withdrawalRequests")
    const q = query(
      requestsRef,
      where("agentId", "==", agentId),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
    )

    try {
      const querySnapshot = await getDocs(q)
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return {
        success: true,
        requests,
      }
    } catch (error: any) {
      // Check if the error is due to missing index
      if (error.code === "failed-precondition" && error.message.includes("index")) {
        return {
          success: true,
          requests: [],
        }
      }

      throw error
    }
  } catch (error) {
    console.error("Error getting withdrawal requests:", error)
    return {
      success: false,
      message: "Failed to fetch withdrawal requests",
      requests: [],
    }
  }
}

// Add the getAgentWithdrawalRequests function as a named export
export const getAgentWithdrawalRequests = getWithdrawalRequests

// Update withdrawal request status
export async function processWithdrawalRequest(requestId: string, approved: boolean, notes?: string) {
  try {
    const requestRef = doc(db, "withdrawalRequests", requestId)

    // Update the status and add notes
    await updateDoc(requestRef, {
      status: approved ? "approved" : "rejected",
      notes: notes || "",
    })

    return { success: true, message: `Withdrawal request ${approved ? "approved" : "rejected"} successfully.` }
  } catch (error) {
    console.error("Error processing withdrawal request:", error)
    return { success: false, error: "Failed to process withdrawal request" }
  }
}

// Get agent notifications
export async function getAgentNotifications(agentId: string) {
  try {
    // First, try to query with ordering (requires composite index)
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", agentId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(notificationsQuery)
      const notifications: any[] = []

      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() })
      })

      return { success: true, notifications }
    } catch (indexError) {
      console.warn("Index error, falling back to unordered query:", indexError)

      // If index error occurs, fall back to a simple query without ordering
      const simpleQuery = query(collection(db, "notifications"), where("userId", "==", agentId))

      const snapshot = await getDocs(simpleQuery)
      const notifications: any[] = []

      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() })
      })

      // Sort the notifications in memory instead
      notifications.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
        return dateB - dateA // descending order
      })

      return {
        success: true,
        notifications,
        indexNeeded: true,
        indexUrl:
          "https://console.firebase.google.com/v1/r/project/funacash-5d88f/firestore/indexes?create_composite=ClRwcm9qZWN0cy9mdW5hY2FzaC01ZDg4Zi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90aWZpY2F0aW9ucy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC",
      }
    }
  } catch (error) {
    console.error("Error getting agent notifications:", error)
    return { success: false, error: "Failed to get notifications" }
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, { read: true })

    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Failed to mark notification as read" }
  }
}

// Get user balance
export async function getUserBalance(userId: string) {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("id", "==", userId), limit(1))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        success: false,
        message: "User not found",
      }
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    return {
      success: true,
      balance: userData.balance,
      currency: "ZMW", // Assuming currency is ZMW
    }
  } catch (error) {
    console.error("Error getting user balance:", error)
    return {
      success: false,
      message: "Failed to fetch balance",
    }
  }
}

// Get user by phone
export async function getUserByPhone(phone: string) {
  try {
    const usersQuery = query(collection(db, "users"), where("phone", "==", phone), limit(1))

    const snapshot = await getDocs(usersQuery)

    if (snapshot.empty) {
      return { success: false, error: "User not found" }
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()

    return { success: true, user: { ...userData, id: userDoc.id } }
  } catch (error) {
    console.error("Error getting user by phone:", error)
    return { success: false, error: "Failed to get user" }
  }
}

// Create a withdrawal request
interface WithdrawalRequest {
  userId: string
  amount: number
  phoneNumber: string
  notes?: string
}

export async function createWithdrawalRequest(requestData: WithdrawalRequest) {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate a unique transaction ID
    const requestId = `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    return {
      success: true,
      message: "Withdrawal request created successfully",
      requestId,
      amount: requestData.amount,
      currency: "ZMW",
      agentName: "Funacash Agent",
    }
  } catch (error) {
    console.error("Error creating withdrawal request:", error)
    return {
      success: false,
      message: "Failed to create withdrawal request",
    }
  }
}

export async function verifyWithdrawal(requestId: string) {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      success: true,
      message: "Withdrawal verified successfully",
    }
  } catch (error) {
    console.error("Error verifying withdrawal:", error)
    return {
      success: false,
      message: "Failed to verify withdrawal",
    }
  }
}

// Get user transactions
export async function getUserTransactions(userId: string) {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      success: true,
      transactions: [
        {
          id: "TX-1234567890",
          type: "send",
          amount: 500,
          currency: "ZMW",
          recipientName: "Grace Moyo",
          recipientPhone: "+263 71 234 5678",
          status: "completed",
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          id: "TX-0987654321",
          type: "receive",
          amount: 750,
          currency: "ZMW",
          senderName: "David Banda",
          senderPhone: "+263 77 876 5432",
          status: "completed",
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          id: "TX-5678901234",
          type: "send",
          amount: 300,
          currency: "ZWL",
          recipientName: "Tendai Ncube",
          recipientPhone: "+263 73 456 7890",
          status: "pending",
          createdAt: new Date(Date.now() - 172800000),
        },
      ],
    }
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return {
      success: false,
      message: "Failed to get transactions",
    }
  }
}
