import type { WeeklyUpdateFormData } from "./weekly-update-form"
import TrafficLightIndicator from "./ui/traffic-light-indicator"
import SentimentBar from "./ui/sentiment-bar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReportPreviewProps {
  data: WeeklyUpdateFormData
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const {
    top_3_bullets,
    meta,
    team_health,
    delivery_performance,
    stakeholder_engagement,
    risks_escalations,
    opportunities_wins,
    support_needed,
    personal_updates,
    team_members_updates,
  } = data

  // Filter out empty items - adding null/undefined checks for all properties
  const filteredAccomplishments = delivery_performance?.accomplishments?.filter((item) => item?.trim() !== "") || []
  const filteredMissesDelays = delivery_performance?.misses_delays?.filter((item) => item?.trim() !== "") || []
  const filteredFeedbackNotes = stakeholder_engagement?.feedback_notes?.filter((item) => item?.trim() !== "") || []
  const filteredExpectationShift = stakeholder_engagement?.expectation_shift?.filter((item) => item?.trim() !== "") || []
  const filteredRisks = risks_escalations?.risks?.filter((risk) => risk?.title?.trim() !== "") || []
  const filteredEscalations = risks_escalations?.escalations?.filter((item) => item?.trim() !== "") || []
  const filteredWins = opportunities_wins?.wins?.filter((item) => item?.trim() !== "") || []
  const filteredGrowthOps = opportunities_wins?.growth_ops?.filter((item) => item?.trim() !== "") || []
  const filteredRequests = support_needed?.requests?.filter((item) => item?.trim() !== "") || []

  // Personal updates - adding null/undefined checks
  const filteredPersonalWins = personal_updates?.personal_wins?.filter((item) => item?.trim() !== "") || []
  const filteredReflections = personal_updates?.reflections?.filter((item) => item?.trim() !== "") || []
  const filteredGoals = personal_updates?.goals?.filter((goal) => goal?.description?.trim() !== "") || []
  const hasLeadershipFocus = false

  // Team members updates - adding null/undefined checks
  const filteredTopContributors = team_members_updates?.top_contributors?.filter(
    (contributor) => contributor?.name?.trim() !== "" || contributor?.achievement?.trim() !== "",
  ) || []
  const filteredMembersNeedingAttention = team_members_updates?.members_needing_attention?.filter(
    (member) => member?.name?.trim() !== "" || member?.issue?.trim() !== "",
  ) || []

  return (
    <div className="space-y-6 print:text-sm">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{meta?.team_name || 'Team'} Weekly Update</h2>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{meta?.date || new Date().toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">{meta?.client_org || 'Organization'}</p>
          </div>
        </div>

        {top_3_bullets && (
          <div className="p-3 bg-muted rounded-md">
            <p className="font-medium">{top_3_bullets}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Team Health */}
      {(team_health?.owner_input ||
        team_health?.overall_status ||
        team_health?.energy_engagement ||
        team_health?.roles_alignment) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Health</h3>
            <div className="flex items-center space-x-3">
              <div className="w-32">
                <p className="text-xs text-right mb-1">
                  Sentiment: {typeof team_health?.sentiment_score === 'number' 
                    ? team_health.sentiment_score.toFixed(1) 
                    : '3.5'}
                </p>
                <SentimentBar value={typeof team_health?.sentiment_score === 'number' 
                  ? team_health.sentiment_score 
                  : 3.5} 
                />
              </div>
            </div>
          </div>

          {team_health?.owner_input && (
            <div>
              <h4 className="text-sm font-medium">Summary</h4>
              <p>{team_health.owner_input}</p>
            </div>
          )}

          {team_health?.overall_status && (
            <div>
              <h4 className="text-sm font-medium">Overall Status</h4>
              <p>{team_health.overall_status}</p>
            </div>
          )}

          {team_health?.energy_engagement && (
            <div>
              <h4 className="text-sm font-medium">Energy & Engagement</h4>
              <p>{team_health.energy_engagement}</p>
            </div>
          )}

          {team_health?.roles_alignment && (
            <div>
              <h4 className="text-sm font-medium">Roles & Responsibilities</h4>
              <p>{team_health.roles_alignment}</p>
            </div>
          )}

          {team_members_updates?.people_changes && (
            <div>
              <h4 className="text-sm font-medium">People Changes</h4>
              <p>{team_members_updates.people_changes}</p>
            </div>
          )}
        </div>
      )}

      {/* Delivery Performance */}
      {(filteredAccomplishments.length > 0 || filteredMissesDelays.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Delivery Performance</h3>
            <div className="flex items-center space-x-2">
              <TrafficLightIndicator
                value={
                  delivery_performance?.workload_balance === "JustRight"
                    ? "Green"
                    : delivery_performance?.workload_balance === "TooLittle"
                      ? "Yellow"
                      : "Red"
                }
              />
            </div>
          </div>

          {filteredAccomplishments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Accomplishments</h4>
              <ul className="list-disc pl-5 space-y-1">
                {filteredAccomplishments.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {filteredMissesDelays.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Misses & Delays</h4>
              <ul className="list-disc pl-5 space-y-1">
                {filteredMissesDelays.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stakeholder Engagement */}
      {(filteredFeedbackNotes.length > 0 || filteredExpectationShift.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Stakeholder Engagement</h3>
            <div className="flex items-center space-x-2">
              {stakeholder_engagement?.stakeholder_nps !== null && typeof stakeholder_engagement.stakeholder_nps === 'number' && (
                <Badge variant="outline" className="font-mono">
                  NPS: {typeof stakeholder_engagement.stakeholder_nps === 'number' ? stakeholder_engagement.stakeholder_nps.toFixed(1) : 'N/A'}
                </Badge>
              )}
              <TrafficLightIndicator
                value={
                  stakeholder_engagement?.stakeholder_nps === null || typeof stakeholder_engagement?.stakeholder_nps !== 'number'
                    ? "Green"
                    : typeof stakeholder_engagement.stakeholder_nps === 'number' && stakeholder_engagement.stakeholder_nps < 3
                      ? "Red"
                      : typeof stakeholder_engagement.stakeholder_nps === 'number' && stakeholder_engagement.stakeholder_nps < 4
                        ? "Yellow"
                        : "Green"
                }
              />
            </div>
          </div>

          {filteredFeedbackNotes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Feedback Notes</h4>
              <ul className="list-disc pl-5 space-y-1">
                {filteredFeedbackNotes.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {filteredExpectationShift.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Expectation Shifts</h4>
              <ul className="list-disc pl-5 space-y-1">
                {filteredExpectationShift.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Risks & Escalations */}
      {(filteredRisks.length > 0 || filteredEscalations.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Risks & Escalations</h3>
            <TrafficLightIndicator
              value={
                filteredRisks.some((r) => r.severity === "Red")
                  ? "Red"
                  : filteredRisks.some((r) => r.severity === "Yellow")
                    ? "Yellow"
                    : "Green"
              }
            />
          </div>

          {filteredRisks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Risks</h4>
              <div className="space-y-2">
                {filteredRisks.map((risk, index) => (
                  <div key={index} className="flex items-start">
                    <TrafficLightIndicator value={risk.severity} className="mt-1 mr-2" />
                    <div>
                      <p className="font-medium">{risk.title}</p>
                      {risk.description && <p className="text-sm">{risk.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredEscalations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Escalations</h4>
              <ul className="list-disc pl-5 space-y-1">
                {filteredEscalations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Opportunities & Wins */}
      {(filteredWins.length > 0 || filteredGrowthOps.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Opportunities & Wins</h3>
            <TrafficLightIndicator value="Green" />
          </div>

          {filteredWins.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Wins</h4>
              <ul className="list-disc pl-5 space-y-1">
                {filteredWins.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {filteredGrowthOps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Growth Opportunities</h4>
              <ul className="list-disc pl-5 space-y-1">
                {filteredGrowthOps.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Support Needed */}
      {filteredRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Support Needed</h3>
          <ul className="list-disc pl-5 space-y-1">
            {filteredRequests.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Team Members Updates Section */}
      {(filteredTopContributors.length > 0 || filteredMembersNeedingAttention.length > 0) && (
        <>
          <Separator className="my-6" />
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Team Members Update (People Focus)</h2>

            {/* Top Contributors / Recognitions */}
            {filteredTopContributors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Top Contributors / Recognitions</h3>

                {filteredTopContributors.map((contributor, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{contributor.name}</span>
                      {contributor.recognition && (
                        <Badge variant="outline" className="ml-auto">
                          {contributor.recognition}
                        </Badge>
                      )}
                    </div>
                    {contributor.achievement && <p className="mt-1">{contributor.achievement}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Team Members Needing Attention */}
            {filteredMembersNeedingAttention.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Team Members Needing Attention</h3>

                {filteredMembersNeedingAttention.map((member, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{member.name}</span>
                      <Badge
                        variant={
                          member.delivery_risk === "Low"
                            ? "outline"
                            : member.delivery_risk === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                        className="ml-auto"
                      >
                        {member.delivery_risk} Risk
                      </Badge>
                    </div>
                    {member.issue && (
                      <div className="mt-1">
                        <span className="text-sm font-medium">Issue: </span>
                        <span>{member.issue}</span>
                      </div>
                    )}
                    {member.support_plan && (
                      <div className="mt-1">
                        <span className="text-sm font-medium">Support Plan: </span>
                        <span>{member.support_plan}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Personal Updates Section */}
      {(filteredPersonalWins.length > 0 ||
        hasLeadershipFocus ||
        filteredReflections.length > 0 ||
        filteredGoals.length > 0 ||
        personal_updates?.support_needed) && (
        <>
          <Separator className="my-6" />
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Personal Leadership Update</h2>

            {/* Personal Wins */}
            {filteredPersonalWins.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Personal Wins or Highlights</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {filteredPersonalWins.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}


            {/* Reflections */}
            {filteredReflections.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Reflections</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {filteredReflections.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Goal Tracking */}
            {filteredGoals.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Goal Tracking</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Goal</TableHead>
                      <TableHead className="w-[20%]">Status</TableHead>
                      <TableHead className="w-[40%]">This Week's Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGoals.map((goal, index) => (
                      <TableRow key={index}>
                        <TableCell>{goal.description}</TableCell>
                        <TableCell>
                          {goal.status === "Green" && <span>🟢 On Track</span>}
                          {goal.status === "Yellow" && <span>🟡 At Risk</span>}
                          {goal.status === "Red" && <span>🔴 Off Track</span>}
                        </TableCell>
                        <TableCell>{goal.update}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Support Needed */}
            {personal_updates?.support_needed && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Support or Feedback Needed</h3>
                <p>{personal_updates.support_needed}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="pt-4 border-t">
        <div className="flex justify-between text-sm text-muted-foreground">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p>AI Recap: Team is on track with key deliverables, monitoring resource constraints.</p>
        </div>
      </div>
    </div>
  )
}
