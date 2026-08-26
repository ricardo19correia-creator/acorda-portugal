'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CreatorProfileView } from '@/components/creators/CreatorProfileView'
import { CreatorsCommentsDrawer } from '@/components/creators/CreatorsCommentsDrawer'
import { ReportPostModal } from '@/components/creators/ReportPostModal'
import {
  togglePostLike,
  togglePostSave,
  voteOnPoll,
  voteOnSuggestion,
} from '@/lib/creators-service'
import type { CreatorPost } from '@/src/types/creators'

export default function CreatorProfilePage() {
  const params = useParams()
  const rawUsername = params?.username as string || 'jogador'
  const username = decodeURIComponent(rawUsername)

  const [activeCommentPost, setActiveCommentPost] = useState<CreatorPost | null>(null)
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false)
  const [activeReportPost, setActiveReportPost] = useState<CreatorPost | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const handleLike = async (postId: string) => {
    try {
      await togglePostLike(postId)
    } catch (e) {}
  }

  const handleSave = (postId: string) => {
    togglePostSave(postId)
  }

  const handleOpenComments = (post: CreatorPost) => {
    setActiveCommentPost(post)
    setIsCommentsDrawerOpen(true)
  }

  const handleVotePoll = async (postId: string, optionId: string) => {
    await voteOnPoll(postId, optionId)
  }

  const handleVoteSuggestion = (postId: string, vote: 'up' | 'down') => {
    voteOnSuggestion(postId, vote)
  }

  const handleReport = (post: CreatorPost) => {
    setActiveReportPost(post)
    setIsReportModalOpen(true)
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="about" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-16">
          <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 pt-6">
            <CreatorProfileView
              username={username}
              onLike={handleLike}
              onSave={handleSave}
              onOpenComments={handleOpenComments}
              onVotePoll={handleVotePoll}
              onVoteSuggestion={handleVoteSuggestion}
              onReport={handleReport}
            />
          </div>
        </main>

        <CreatorsCommentsDrawer
          post={activeCommentPost}
          isOpen={isCommentsDrawerOpen}
          onClose={() => {
            setIsCommentsDrawerOpen(false)
            setActiveCommentPost(null)
          }}
          onCommentAdded={() => {}}
        />

        <ReportPostModal
          post={activeReportPost}
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false)
            setActiveReportPost(null)
          }}
        />

        <SiteFooter />
      </div>
    </div>
  )
}
