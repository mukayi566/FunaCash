import type { Timestamp } from "firebase/firestore"

export interface ReferralCode {
  id?: string
  userId: string
  code: string
  createdAt?: Timestamp
  active: boolean
}

export interface Referral {
  id?: string
  referrerId: string
  referredId: string
  referralCode: string
  status: "pending" | "completed"
  transactionCompleted: boolean
  rewardAmount: number
  rewardPaid: boolean
  createdAt?: Timestamp
  completedAt?: Timestamp
}

export interface ReferralStats {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalRewardsEarned: number
  rewardsPaid: number
  rewardsPending: number
}
