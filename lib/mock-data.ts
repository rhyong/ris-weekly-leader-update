import { createHash, randomUUID } from "crypto"

// Mock user data
export interface User {
  id: string
  username: string
  name: string
  role: string
  password: string
  email?: string
  teamName?: string
  clientOrg?: string
  bio?: string
  profileImage?: string
}

export interface Session {
  id: string
  userId: string
  expires: Date
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email?: string
}

export interface WeeklyUpdate {
  id: string
  userId: string
  weekDate: string
  teamName: string
  clientOrg: string
  data: any
  createdAt: string
  updatedAt: string
}

// Mock team members
export const teamMembers: Record<string, TeamMember[]> = {
  "1": [
    {
      id: "101",
      name: "Sarah Johnson",
      role: "Senior Developer",
      email: "sarah.johnson@example.com"
    },
    {
      id: "102",
      name: "Michael Chen",
      role: "UX Designer",
      email: "michael.chen@example.com"
    },
    {
      id: "103",
      name: "James Smith",
      role: "Backend Developer",
      email: "james.smith@example.com"
    },
    {
      id: "104",
      name: "Emily Davis",
      role: "Frontend Developer",
      email: "emily.davis@example.com"
    }
  ],
  "2": [
    {
      id: "201",
      name: "David Wilson",
      role: "Product Manager",
      email: "david.wilson@example.com"
    },
    {
      id: "202",
      name: "Lisa Taylor",
      role: "QA Lead",
      email: "lisa.taylor@example.com"
    },
    {
      id: "203",
      name: "Robert Brown",
      role: "DevOps Engineer",
      email: "robert.brown@example.com"
    }
  ]
}

// Mock users
export const users: User[] = [
  {
    id: "1",
    username: "testuser",
    name: "Test User",
    role: "Team Lead",
    // This is the hashed version of "password123"
    password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
    email: "test.user@example.com",
    teamName: "Frontend Platform Team",
    clientOrg: "Acme Corporation",
    bio: "Experienced team lead with a passion for building high-performance web applications and mentoring junior developers.",
    profileImage: "/placeholder-user.jpg"
  },
  {
    id: "2",
    username: "janedoe",
    name: "Jane Doe",
    role: "Project Manager",
    // This is the hashed version of "password456"
    password: "c6ba91b90d922e159893f46c387e5dc1b3dc5c101a5a4522f16e2b9408b0b45f",
    email: "jane.doe@example.com",
    teamName: "Backend Services Team",
    clientOrg: "TechCorp Inc.",
    bio: "Seasoned project manager with a background in agile methodologies and a track record of delivering complex projects on time.",
    profileImage: "/placeholder-user.jpg"
  },
]

// Mock sessions
export let sessions: Session[] = []

// Mock weekly updates
// Using let instead of const to allow reassignment if needed
export let weeklyUpdates: WeeklyUpdate[] = [
  {
    id: "1",
    userId: "1",
    weekDate: "2025-05-12",
    teamName: "Frontend Platform",
    clientOrg: "Acme Corp",
    data: {
      top_3_bullets: "Sprint completed 🟢 | New feature launched 🟢 | Team morale high 🟢",
      meta: {
        date: "2025-05-12",
        team_name: "Frontend Platform",
        client_org: "Acme Corp",
      },
      team_health: {
        owner_input: "Team is doing well, high energy and good collaboration.",
        traffic_light: "Green",
        sentiment_score: 4.2,
        overall_status: "Team morale is high after completing the major milestone",
        energy_engagement: "Energy is good, team is collaborating well on the new feature",
        roles_alignment: "Roles are clear and well-defined",
      },
      delivery_performance: {
        accomplishments: ["Completed new dashboard UI", "Fixed 12 critical bugs", "Improved load time by 30%"],
        misses_delays: ["API integration delayed due to third-party issues"],
        workload_balance: "JustRight",
        kpi_snapshot: {
          velocity_delta: 15,
          defects: 3,
        },
      },
      stakeholder_engagement: {
        feedback_notes: ["Client praised the new UI", "Stakeholders happy with progress"],
        expectation_shift: ["Timeline extended for phase 2 due to scope increase"],
        stakeholder_nps: 4.5,
      },
      risks_escalations: {
        risks: [
          {
            title: "Third-party API reliability",
            description: "External API has had intermittent outages",
            severity: "Yellow",
          },
        ],
        escalations: ["Need decision on feature prioritization for next sprint"],
      },
      opportunities_wins: {
        wins: ["Successfully launched new dashboard", "Received positive client feedback"],
        growth_ops: ["Potential for AI-powered analytics in next phase"],
      },
      support_needed: {
        requests: ["Additional QA resource for next sprint"],
      },
      personal_updates: {
        personal_wins: ["Successfully led cross-team collaboration", "Mentored junior developer"],
        reflections: ["Learned importance of early stakeholder alignment"],
        goals: [
          {
            description: "Improve team velocity by 10%",
            status: "Green",
            update: "On track with 8% improvement so far",
          },
        ],
        support_needed: "Need guidance on handling competing priorities",
      },
      team_members_updates: {
        people_changes: "New developer joining next week",
        top_contributors: [
          {
            name: "Sarah Johnson",
            achievement: "Led successful client demo that clarified scope",
            recognition: "Team shoutout and gift card",
          },
        ],
        members_needing_attention: [
          {
            name: "James Smith",
            issue: "Struggling with time management",
            support_plan: "Daily check-ins and peer mentoring",
            delivery_risk: "Medium",
          },
        ],
      },
    },
    createdAt: "2025-05-12T10:30:00Z",
    updatedAt: "2025-05-12T14:45:00Z",
  },
  {
    id: "2",
    userId: "1",
    weekDate: "2025-05-05",
    teamName: "Frontend Platform",
    clientOrg: "Acme Corp",
    data: {
      top_3_bullets: "Sprint planning complete 🟢 | Resource constraints 🟡 | Client feedback positive 🟢",
      meta: {
        date: "2025-05-05",
        team_name: "Frontend Platform",
        client_org: "Acme Corp",
      },
      team_health: {
        owner_input: "Team is focused but concerned about upcoming deadlines.",
        traffic_light: "Yellow",
        sentiment_score: 3.5,
        overall_status: "Team is working well but feeling some pressure",
        energy_engagement: "Energy is moderate, some signs of stress",
        roles_alignment: "Some confusion about responsibilities for new features",
      },
      delivery_performance: {
        accomplishments: ["Completed sprint planning", "Defined architecture for new features"],
        misses_delays: ["Documentation updates pending"],
        workload_balance: "TooMuch",
        kpi_snapshot: {
          velocity_delta: -5,
          defects: 7,
        },
      },
      stakeholder_engagement: {
        feedback_notes: ["Client appreciates transparency about challenges"],
        expectation_shift: ["Adjusted timeline expectations for complex features"],
        stakeholder_nps: 4.0,
      },
      risks_escalations: {
        risks: [
          {
            title: "Resource constraints",
            description: "Team is understaffed for current workload",
            severity: "Yellow",
          },
          {
            title: "Technical debt",
            description: "Legacy code is slowing down new feature development",
            severity: "Yellow",
          },
        ],
        escalations: ["Need decision on hiring additional developer"],
      },
      opportunities_wins: {
        wins: ["Positive client feedback on prototype"],
        growth_ops: ["Opportunity to refactor legacy components"],
      },
      support_needed: {
        requests: ["Additional budget for contractor", "Technical guidance on legacy system"],
      },
      personal_updates: {
        personal_wins: ["Improved team communication processes"],
        reflections: ["Need to better balance tactical and strategic work"],
        goals: [
          {
            description: "Reduce technical debt by 20%",
            status: "Yellow",
            update: "Behind schedule due to urgent feature requests",
          },
        ],
        support_needed: "Need help prioritizing between technical debt and new features",
      },
      team_members_updates: {
        people_changes: "One team member on vacation next week",
        top_contributors: [
          {
            name: "Michael Chen",
            achievement: "Solved complex performance issue affecting multiple features",
            recognition: "Public recognition in all-hands meeting",
          },
        ],
        members_needing_attention: [
          {
            name: "Emily Davis",
            issue: "Onboarding challenges with complex codebase",
            support_plan: "Assigned mentor and additional documentation time",
            delivery_risk: "Low",
          },
        ],
      },
    },
    createdAt: "2025-05-05T09:15:00Z",
    updatedAt: "2025-05-05T16:30:00Z",
  },
]

// Helper functions for mock data
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export function findUserByCredentials(username: string, hashedPassword: string): User | undefined {
  return users.find((user) => user.username === username && user.password === hashedPassword)
}

export function createSession(userId: string): Session {
  const session: Session = {
    id: randomUUID(),
    userId,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
  }
  sessions.push(session)
  return session
}

export function findSessionById(sessionId: string): Session | undefined {
  return sessions.find((session) => session.id === sessionId && session.expires > new Date())
}

export function deleteSession(sessionId: string): void {
  sessions = sessions.filter((session) => session.id !== sessionId)
}

export function findUserById(userId: string): User | undefined {
  return users.find((user) => user.id === userId)
}

export function getTeamMembersForUser(userId: string): TeamMember[] {
  return teamMembers[userId] || []
}

export function updateUserProfile(userId: string, updatedData: Partial<User>): User | undefined {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return undefined;
  
  // Don't allow updating password through this function
  const { password, ...safeData } = updatedData;
  
  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...safeData
  };
  
  return users[userIndex];
}

export function getUpdatesByUserId(userId: string): WeeklyUpdate[] {
  return weeklyUpdates
    .filter((update) => update.userId === userId)
    .sort((a, b) => {
      return new Date(b.weekDate).getTime() - new Date(a.weekDate).getTime()
    })
}

// For debugging persistence issues
let updateCounter = 0;

// Add a global to ensure persistence across API requests
if (typeof global !== 'undefined') {
  if (!global.__mockData) {
    // Initialize the global store
    global.__mockData = {
      weeklyUpdatesStore: [...weeklyUpdates]
    };
    console.log("Initialized global mock data store with", weeklyUpdates.length, "updates");
  } else if (global.__mockData.weeklyUpdatesStore) {
    // Use the global store if it exists and has data
    if (global.__mockData.weeklyUpdatesStore.length > weeklyUpdates.length) {
      console.log("Restoring weeklyUpdates from global store:",
        "global:", global.__mockData.weeklyUpdatesStore.length,
        "local:", weeklyUpdates.length);
      weeklyUpdates = [...global.__mockData.weeklyUpdatesStore];
    } else {
      // Update the global store with our current data
      global.__mockData.weeklyUpdatesStore = [...weeklyUpdates];
      console.log("Updated global store with local weeklyUpdates, count:", weeklyUpdates.length);
    }
  }
}

export function saveUpdate(
  userId: string,
  weekDate: string,
  teamName: string,
  clientOrg: string,
  data: any,
  updateId?: string, // Optional ID for explicit updates
): WeeklyUpdate {
  updateCounter++;
  console.log(`[SAVE UPDATE #${updateCounter}] Called with:`, { 
    userId, 
    weekDate, 
    teamName, 
    clientOrg, 
    updateId: updateId || "not provided",
    currentUpdatesCount: weeklyUpdates.length 
  });
  
  // Verify weeklyUpdates exists and is an array
  if (!weeklyUpdates || !Array.isArray(weeklyUpdates)) {
    console.error("ERROR: weeklyUpdates is not an array!", typeof weeklyUpdates);
    
    // Try to use the global store
    if (typeof global !== 'undefined' && global.__mockData && Array.isArray(global.__mockData.weeklyUpdatesStore)) {
      console.log("Restoring from global.__mockData.weeklyUpdatesStore");
      weeklyUpdates = [...global.__mockData.weeklyUpdatesStore];
    } else {
      // Initialize if undefined - this shouldn't happen, but just in case
      console.log("Initializing empty weeklyUpdates array");
      weeklyUpdates = [];
    }
  }
  
  // Check if update already exists
  let existingUpdateIndex = -1;
  
  // If an explicit updateId is provided, use that for finding the update
  if (updateId) {
    console.log(`[SAVE UPDATE #${updateCounter}] Searching for specific update ID:`, updateId);
    existingUpdateIndex = weeklyUpdates.findIndex(
      (update) => update.id === updateId
    );
  } 
  // Otherwise, look for an update with matching userId and weekDate
  else {
    existingUpdateIndex = weeklyUpdates.findIndex(
      (update) => update.userId === userId && update.weekDate === weekDate,
    );
  }
  
  console.log(`[SAVE UPDATE #${updateCounter}] Existing update index:`, existingUpdateIndex);
  console.log(`[SAVE UPDATE #${updateCounter}] Current updates count:`, weeklyUpdates.length);

  const now = new Date().toISOString()

  if (existingUpdateIndex >= 0) {
    // Update existing
    console.log(`[SAVE UPDATE #${updateCounter}] Updating existing update at index:`, existingUpdateIndex);
    
    // Create a copy to avoid reference issues
    const updatedUpdate = {
      ...weeklyUpdates[existingUpdateIndex],
      teamName,
      clientOrg,
      data,
      updatedAt: now,
    };
    
    // Update the array
    weeklyUpdates[existingUpdateIndex] = updatedUpdate;
    
    // Also update the global store if available
    if (typeof global !== 'undefined' && global.__mockData) {
      global.__mockData.weeklyUpdatesStore = [...weeklyUpdates];
      console.log(`[SAVE UPDATE #${updateCounter}] Updated global store for existing update, length:`, 
        global.__mockData.weeklyUpdatesStore.length);
    }
    
    console.log(`[SAVE UPDATE #${updateCounter}] Updated existing update with ID:`, updatedUpdate.id);
    return updatedUpdate;
  } else {
    // Create new
    try {
      console.log(`[SAVE UPDATE #${updateCounter}] Creating new update - no existing update found`);
      const newId = randomUUID();
      console.log(`[SAVE UPDATE #${updateCounter}] Generated new UUID:`, newId);
      
      const newUpdate: WeeklyUpdate = {
        id: newId,
        userId,
        weekDate,
        teamName,
        clientOrg,
        data,
        createdAt: now,
        updatedAt: now,
      }
      
      console.log(`[SAVE UPDATE #${updateCounter}] New update object created:`, { 
        id: newUpdate.id, 
        userId, 
        weekDate 
      });
      
      // Make a copy of the array before pushing
      const updatesBeforePush = [...weeklyUpdates];
      
      // Push the new update
      weeklyUpdates.push(newUpdate);
      
      // Also update the global store if available
      if (typeof global !== 'undefined' && global.__mockData) {
        global.__mockData.weeklyUpdatesStore = [...weeklyUpdates];
        console.log(`[SAVE UPDATE #${updateCounter}] Updated global store, length:`, 
          global.__mockData.weeklyUpdatesStore.length);
      }
      
      console.log(`[SAVE UPDATE #${updateCounter}] New update added to weeklyUpdates array:`, { 
        beforeLength: updatesBeforePush.length,
        afterLength: weeklyUpdates.length,
        success: weeklyUpdates.length > updatesBeforePush.length
      });
      
      // Verify the update was actually added
      const verifyIndex = weeklyUpdates.findIndex(update => update.id === newId);
      console.log(`[SAVE UPDATE #${updateCounter}] Verification - update index after adding:`, verifyIndex);
      
      return newUpdate
    } catch (error) {
      console.error(`[SAVE UPDATE #${updateCounter}] Error creating new update:`, error);
      throw error;
    }
  }
}
