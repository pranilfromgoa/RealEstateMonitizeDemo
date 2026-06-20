import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { votingProposals, spvs } from '@/data/mockData'
import { Vote, CheckCircle2, Clock, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

export function InvestorVoting() {
  const [votes, setVotes] = useState({})
  const [submitted, setSubmitted] = useState({})

  const handleVote = (proposalId, choice) => {
    setVotes(v => ({ ...v, [proposalId]: choice }))
  }

  const handleSubmit = (proposalId) => {
    setSubmitted(s => ({ ...s, [proposalId]: true }))
  }

  return (
    <Layout>
      <Header title="Brick Owners' Circle" subtitle="Phase 3 — Collective decisions by Brick holders" />
      <div className="ds-page">
        <div className="ds-alert-warning flex items-center gap-3">
          <Badge className="bg-amber-600 text-white">Phase 3</Badge>
          <p className="text-sm">As a Brick owner you have a say in major property decisions. Your vote weight is proportional to the Bricks you hold in each property.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Proposals', value: '2' },
            { label: 'Closed Proposals', value: '1' },
            { label: 'Your Voting Power', value: '450 Bricks' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {votingProposals.map(proposal => {
            const spv = spvs.find(s => s.id === proposal.spvId)
            const totalVotes = proposal.votesFor + proposal.votesAgainst
            const forPct = totalVotes > 0 ? (proposal.votesFor / totalVotes * 100).toFixed(0) : 0
            const againstPct = totalVotes > 0 ? (proposal.votesAgainst / totalVotes * 100).toFixed(0) : 0
            const participationPct = (totalVotes / proposal.totalEligible * 100).toFixed(1)
            const myVote = votes[proposal.id]
            const isSubmitted = submitted[proposal.id]
            const isActive = proposal.status === 'active'

            return (
              <Card key={proposal.id}>
                <CardContent className="py-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'Active' : 'Closed'}
                        </Badge>
                        <span className="text-xs text-gray-400">{spv?.name}</span>
                      </div>
                      <h3 className="ds-section-title text-base">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{proposal.description}</p>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg flex-shrink-0">
                        <Clock size={12} />
                        <span>Closes {proposal.deadline}</span>
                      </div>
                    )}
                  </div>

                  {/* Impact */}
                  <div className="ds-alert-info rounded-lg px-3 py-2 text-xs mb-4">
                    <span className="font-medium">Impact: </span>{proposal.impact}
                  </div>

                  {/* Vote counts */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-600 font-medium">For — {proposal.votesFor.toLocaleString()} votes</span>
                        <span className="text-green-600">{forPct}%</span>
                      </div>
                      <Progress value={parseInt(forPct)} color="green" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-500 font-medium">Against — {proposal.votesAgainst.toLocaleString()} votes</span>
                        <span className="text-red-500">{againstPct}%</span>
                      </div>
                      <Progress value={parseInt(againstPct)} color="red" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{participationPct}% participation · {totalVotes.toLocaleString()} / {proposal.totalEligible.toLocaleString()} eligible Bricks voted</p>
                  </div>

                  {/* Voting action */}
                  {isActive && (
                    isSubmitted ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-3">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-medium">Vote submitted — {myVote === 'for' ? 'Voted For' : 'Voted Against'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground mr-auto">Cast your vote:</p>
                        <button
                          onClick={() => handleVote(proposal.id, 'for')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${myVote === 'for' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}
                        >
                          <ThumbsUp size={14} /> For
                        </button>
                        <button
                          onClick={() => handleVote(proposal.id, 'against')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${myVote === 'against' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
                        >
                          <ThumbsDown size={14} /> Against
                        </button>
                        <Button size="sm" disabled={!myVote} onClick={() => handleSubmit(proposal.id)}>
                          Submit Vote
                        </Button>
                      </div>
                    )
                  )}

                  {proposal.status === 'closed' && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
                      <CheckCircle2 size={16} className="text-gray-400" />
                      <span className="text-sm text-muted-foreground">Voting closed — {parseInt(forPct) > 50 ? 'Proposal Passed' : 'Proposal Rejected'}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
