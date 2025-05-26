"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Briefcase, Mail } from "lucide-react"
import type { TeamMember } from "@/lib/auth-db"

interface TeamMembersListProps {
  teamMembers: TeamMember[]
  teamName?: string
  clientOrg?: string
  readOnly?: boolean
}

export function TeamMembersList({
  teamMembers,
  teamName,
  clientOrg,
  readOnly = true
}: TeamMembersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Team Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {(teamName || clientOrg) && (
          <div className="space-y-2">
            {teamName && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Team Name:</span>
                <span className="font-medium">{teamName}</span>
              </div>
            )}
            {clientOrg && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Client Organization:</span>
                <span className="font-medium">{clientOrg}</span>
              </div>
            )}
          </div>
        )}
        
        {(teamName || clientOrg) && <Separator />}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">Team Members ({teamMembers.length})</h3>
            {!readOnly && (
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Button>
            )}
          </div>
          
          {teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-start p-3 rounded-md border">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                    {member.email && (
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" />
                        {member.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No team members found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}