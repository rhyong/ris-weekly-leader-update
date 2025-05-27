"use client"

import { useState, useEffect, useMemo } from "react"
import { format, addDays, isFriday } from "date-fns"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeamHealthSection from "./sections/team-health-section"
import DeliveryPerformanceSection from "./sections/delivery-performance-section"
import StakeholderEngagementSection from "./sections/stakeholder-engagement-section"
import RisksEscalationsSection from "./sections/risks-escalations-section"
import OpportunitiesWinsSection from "./sections/opportunities-wins-section"
import SupportNeededSection from "./sections/support-needed-section"
import HeaderSection from "./sections/header-section"
import PersonalUpdatesSection from "./sections/personal-updates-section"
import TeamMembersUpdatesSection from "./sections/team-members-section"
import WeeklyUpdateView from "./weekly-update-view"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export type TrafficLight = "Green" | "Yellow" | "Red"
export type WorkloadBalance = "TooMuch" | "TooLittle" | "JustRight"
export type DeliveryRisk = "Low" | "Medium" | "High"

export interface WeeklyUpdateFormData {
  // Header
  top_3_bullets: string
  meta: {
    date: string
    team_name: string
    client_org: string
  }

  // Team Health
  team_health: {
    owner_input: string
    sentiment_score: number
    overall_status: string
    energy_engagement: string
    roles_alignment: string
  }

  // Delivery Performance
  delivery_performance: {
    accomplishments: string[]
    misses_delays: string[]
    workload_balance: WorkloadBalance
  }

  // Stakeholder Engagement
  stakeholder_engagement: {
    feedback_notes: string[]
    expectation_shift: string[]
    stakeholder_nps: number | null
  }

  // Risks & Escalations
  risks_escalations: {
    risks: Array<{
      title: string
      description: string
      severity: TrafficLight
    }>
    escalations: string[]
  }

  // Opportunities & Wins
  opportunities_wins: {
    wins: string[]
    growth_ops: string[]
  }

  // Support Needed
  support_needed: {
    requests: string[]
  }

  // Personal Updates
  personal_updates: {
    personal_wins: string[]
    leadership_focus: {
      skill: string
      practice: string
    }
    reflections: string[]
    goals: Array<{
      description: string
      status: TrafficLight
      update: string
    }>
    support_needed: string
  }

  // Team Members Updates
  team_members_updates: {
    people_changes: string
    top_contributors: Array<{
      name: string
      achievement: string
      recognition: string
    }>
    members_needing_attention: Array<{
      name: string
      issue: string
      support_plan: string
      delivery_risk: DeliveryRisk
    }>
  }
}

interface WeeklyUpdateFormProps {
  isNewUpdate?: boolean;
  existingUpdateId?: string | null;
  initialActiveTab?: string;
}

export default function WeeklyUpdateForm({ isNewUpdate = false, existingUpdateId = null, initialActiveTab = "edit" }: WeeklyUpdateFormProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [savedUpdateId, setSavedUpdateId] = useState<string | null>(existingUpdateId)
  // Only set hasInitialSave to true if this is NOT a new update AND we have an existingUpdateId
  const [hasInitialSave, setHasInitialSave] = useState(!isNewUpdate && Boolean(existingUpdateId))
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  
  // Get the most recent Friday for default date
  const getMostRecentFriday = useMemo(() => {
    const today = new Date()
    
    // If today is Friday, use today's date
    if (isFriday(today)) {
      return format(today, "yyyy-MM-dd")
    }
    
    // Otherwise, find the most recent Friday
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    const daysToSubtract = dayOfWeek === 0 ? 2 : dayOfWeek - 5
    const previousFriday = addDays(today, daysToSubtract <= 0 ? daysToSubtract : daysToSubtract - 7)
    
    return format(previousFriday, "yyyy-MM-dd")
  }, [])

  // Add effects for managing savedUpdateId
  useEffect(() => {
    console.log("savedUpdateId changed:", savedUpdateId);
  }, [savedUpdateId]);
  
  // Force clear session storage if isNewUpdate is true
  useEffect(() => {
    if (isNewUpdate) {
      console.log("New update - clearing savedUpdateId and sessionStorage");
      setSavedUpdateId(null);
      setHasInitialSave(false);
      try {
        sessionStorage.removeItem('lastSavedUpdateId');
      } catch (error) {
        console.warn("Could not access sessionStorage:", error);
      }
    }
  }, [isNewUpdate]);
  
  // Use useEffect to set active tab once we have initial save
  useEffect(() => {
    if (hasInitialSave && initialActiveTab !== "edit") {
      setActiveTab(initialActiveTab);
    }
  }, [hasInitialSave, initialActiveTab]);

  // Initialize form data first with complete structure
  const [formData, setFormData] = useState<WeeklyUpdateFormData>({
    top_3_bullets: "",
    meta: {
      date: getMostRecentFriday,
      team_name: "",
      client_org: "",
    },
    team_health: {
      owner_input: "",
      sentiment_score: 3.5,
      overall_status: "",
      energy_engagement: "",
      roles_alignment: "",
    },
    delivery_performance: {
      accomplishments: [""],
      misses_delays: [""],
      workload_balance: "JustRight",
    },
    stakeholder_engagement: {
      feedback_notes: [""],
      expectation_shift: [""],
      stakeholder_nps: null,
    },
    risks_escalations: {
      risks: [{ title: "", description: "", severity: "Green" }],
      escalations: [""],
    },
    opportunities_wins: {
      wins: [""],
      growth_ops: [""],
    },
    support_needed: {
      requests: [""],
    },
    personal_updates: {
      personal_wins: [""],
      leadership_focus: {
        skill: "",
        practice: "",
      },
      reflections: [""],
      goals: [{ description: "", status: "Green", update: "" }],
      support_needed: "",
    },
    team_members_updates: {
      people_changes: "",
      top_contributors: [{ name: "", achievement: "", recognition: "" }],
      members_needing_attention: [{ name: "", issue: "", support_plan: "", delivery_risk: "Low" }],
    },
  });

  // Debug useEffect to track whether saving is working properly
  useEffect(() => {
    console.log("Current form state:", { 
      hasInitialSave, 
      isSaving, 
      savedUpdateId, 
      isNewUpdate,
      formDataExists: Object.keys(formData).length > 0,
      hasMeta: formData.meta && Object.keys(formData.meta).length > 0
    });
  }, [hasInitialSave, isSaving, savedUpdateId, isNewUpdate, formData]);

  // Check if this is a new update being created based on the isNewUpdate prop
  useEffect(() => {
    console.log("WeeklyUpdateForm initialized with:", { isNewUpdate, existingUpdateId });
    
    if (isNewUpdate) {
      // If this is a new update, make sure the tabs are disabled
      console.log("Initializing new update - disabling tabs");
      setHasInitialSave(false);
      setSavedUpdateId(null);
      try {
        // Clear the last saved ID from sessionStorage for a fresh start
        sessionStorage.removeItem('lastSavedUpdateId');
      } catch (error) {
        console.warn("Could not access sessionStorage:", error);
      }
    } else if (existingUpdateId) {
      // If we were provided an existing update ID, use it
      setSavedUpdateId(existingUpdateId);
      setHasInitialSave(true);
    } else {
      // Otherwise check sessionStorage for a previous ID
      try {
        const savedId = sessionStorage.getItem('lastSavedUpdateId');
        if (savedId && !savedUpdateId) {
          console.log("Retrieved saved update ID from sessionStorage:", savedId);
          setSavedUpdateId(savedId);
          setHasInitialSave(true);
        }
      } catch (error) {
        console.warn("Could not access sessionStorage:", error);
      }
    }
  }, [isNewUpdate, existingUpdateId, savedUpdateId]);
  
  // Initialize the form first to avoid reference issues
  const form = useForm<WeeklyUpdateFormData>({
    defaultValues: formData,
  });
  
  // Update hasInitialSave whenever savedUpdateId changes
  useEffect(() => {
    if (savedUpdateId) {
      setHasInitialSave(true);
    }
  }, [savedUpdateId]);
  
  // Add state for loading data
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Helper function for deep merging objects
   */
  interface DeepMergeTarget {
    [key: string]: any;
  }

  interface DeepMergeSource {
    [key: string]: any;
  }

  function deepMerge(target: DeepMergeTarget, source: DeepMergeSource): DeepMergeTarget {
    // For each property of source
    for (const key in source) {
      // If the property is an object
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // If the target doesn't have this property or it's not an object, create it
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        // Recursive call for nested objects
        deepMerge(target[key], source[key]);
      } else {
        // For arrays and primitive values, just copy the value
        // But don't override with undefined or null
        if (source[key] !== undefined && source[key] !== null) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }
  
  /**
   * Helper function to get default data structure
   */
  function getDefaultDataStructure() {
    return {
      meta: {
        date: getMostRecentFriday,
        team_name: "",
        client_org: "",
      },
      top_3_bullets: "",
      team_health: {
        owner_input: "",
        sentiment_score: 3.5,
        overall_status: "",
        energy_engagement: "",
        roles_alignment: "",
      },
      delivery_performance: {
        accomplishments: [""],
        misses_delays: [""],
        workload_balance: "JustRight",
      },
      stakeholder_engagement: {
        feedback_notes: [""],
        expectation_shift: [""],
        stakeholder_nps: null,
      },
      risks_escalations: {
        risks: [{ title: "", description: "", severity: "Green" }],
        escalations: [""],
      },
      opportunities_wins: {
        wins: [""],
        growth_ops: [""],
      },
      support_needed: {
        requests: [""],
      },
      personal_updates: {
        personal_wins: [""],
        leadership_focus: {
          skill: "",
          practice: "",
        },
        reflections: [""],
        goals: [{ description: "", status: "Green", update: "" }],
        support_needed: "",
      },
      team_members_updates: {
        people_changes: "",
        top_contributors: [{ name: "", achievement: "", recognition: "" }],
        members_needing_attention: [{ name: "", issue: "", support_plan: "", delivery_risk: "Low" }],
      },
    };
  }

  // Separate effect to load existing update data
  useEffect(() => {
    // If we have an existing update ID, fetch the data for it
    if (!isNewUpdate && savedUpdateId) {
      console.log("Fetching existing update data for ID:", savedUpdateId);
      
      const fetchUpdateData = async () => {
        try {
          setIsLoading(true); // Set loading state
          const response = await fetch(`/api/updates/${savedUpdateId}`);
          
          // Debug log to help identify issues
          console.log("API Response status:", response.status, response.statusText);
          
          if (response.ok) {
            const updateData = await response.json();
            console.log("API Response (raw):", JSON.stringify(updateData, null, 2));
            
            // Debug log to help identify data structure issues
            console.log("API Response structure:", {
              hasId: Boolean(updateData?.id),
              hasData: Boolean(updateData?.data),
              dataSections: updateData?.data ? Object.keys(updateData.data) : 'none',
              hasTeamHealth: Boolean(updateData?.data?.team_health),
              hasDeliveryPerformance: Boolean(updateData?.data?.delivery_performance),
              hasStakeholderEngagement: Boolean(updateData?.data?.stakeholder_engagement),
              hasRisksEscalations: Boolean(updateData?.data?.risks_escalations),
              hasOpportunitiesWins: Boolean(updateData?.data?.opportunities_wins),
              hasSupportNeeded: Boolean(updateData?.data?.support_needed),
              hasPersonalUpdates: Boolean(updateData?.data?.personal_updates),
              hasTeamMembersUpdates: Boolean(updateData?.data?.team_members_updates),
            });
            
            if (updateData && updateData.data) {
              // Create a complete data structure by merging with defaults
              const defaultData = getDefaultDataStructure();
              
              // Deep merge the loaded data with the default structure
              const completeData = deepMerge(defaultData, updateData.data);
              
              console.log("Prepared complete form data:", completeData);
              setFormData(completeData as WeeklyUpdateFormData);
              form.reset(completeData);
            } else {
              console.warn("Update data missing or invalid format:", updateData);
              toast({
                title: "Data format error",
                description: "The update data has an invalid format. Using default values.",
                variant: "destructive",
              });
            }
          } else {
            console.error("Failed to fetch update data:", response.status, response.statusText);
            // Try to get error message from response
            let errorMessage = "Failed to load update data";
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // If can't parse JSON, try to get text
              try {
                errorMessage = await response.text();
              } catch (e2) {
                // If all else fails, use status code
                errorMessage = `Error ${response.status}: ${response.statusText}`;
              }
            }
            
            toast({
              title: "Error loading data",
              description: errorMessage,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching update data:", error);
          toast({
            title: "Error",
            description: `Failed to load update: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false); // Always clear loading state
        }
      };
      
      fetchUpdateData();
    }
  }, [savedUpdateId, isNewUpdate, form, toast]);

  const handleSubmit = async (data: WeeklyUpdateFormData) => {
    console.log("Form submitted with data:", {
      date: data.meta.date,
      teamName: data.meta.team_name,
      clientOrg: data.meta.client_org
    });
    
    setFormData(data);
    const success = await saveUpdate(data);
    
    console.log("Form submission result:", success ? "Success" : "Failed");
    console.log("Current savedUpdateId after submission:", savedUpdateId);
    
    // Refresh form data with the latest values
    if (success) {
      form.reset(data);
      
      // Show toast notification of success but stay on current page
      toast({
        title: "Update saved successfully",
        description: isNewUpdate ? "Other tabs are now enabled for editing" : "Your changes have been saved",
      });
      
      // No longer a new update after first save
      if (isNewUpdate) {
        console.log("First save completed - tabs should now be enabled");
        
        // Fetch updates to verify our save was successful
        try {
          const verifyResponse = await fetch("/api/updates");
          const updates = await verifyResponse.json();
          console.log("Verification - Current updates:", updates.length);
        } catch (verifyError) {
          console.warn("Could not verify update count:", verifyError);
        }
      }
    }
  }

  const saveUpdate = async (data: WeeklyUpdateFormData = formData) => {
    console.log("Starting saveUpdate with data:", {
      date: data.meta.date,
      teamName: data.meta.team_name,
      clientOrg: data.meta.client_org,
      isNewUpdate: isNewUpdate,
      hasInitialSave: hasInitialSave,
    });

    // Validate essential fields are populated
    if (!data.meta.date || !data.meta.team_name || !data.meta.client_org) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the date, team name, and client organization fields",
        variant: "destructive",
      });
      return false;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your update",
        variant: "destructive",
      })
      return false
    }

    console.log("User authenticated:", user.name);
    setIsSaving(true)

    try {
      const requestBody = {
        weekDate: data.meta.date,
        teamName: data.meta.team_name,
        clientOrg: data.meta.client_org,
        data: data,
        isNewUpdate: isNewUpdate, // Pass this flag to API
      };
      
      console.log("Sending request to /api/updates:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch("/api/updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("API Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        let errorInfo = "Unknown error";
        try {
          // Try to parse the error response as JSON
          const errorData = await response.json();
          errorInfo = JSON.stringify(errorData);
          console.error("API error response:", errorData);
        } catch (parseError) {
          // If it's not JSON, try to get it as text
          try {
            const errorText = await response.text();
            errorInfo = errorText;
            console.error("API error response text:", errorText);
          } catch (textError) {
            console.error("Could not parse error response");
          }
        }
        
        throw new Error(`Failed to save update: ${response.status} ${response.statusText} - ${errorInfo}`);
      }

      const result = await response.json();
      console.log("API Response result:", result);
      
      // If we got a valid ID back, update the state
      if (result && result.id) {
        console.log("Setting savedUpdateId to:", result.id);
        setSavedUpdateId(result.id);
        setHasInitialSave(true);
        
        // If this was a new update and the date was modified (to force uniqueness),
        // update the form data with the new date
        if (result.wasNewUpdate && result.weekDate && result.weekDate !== data.meta.date) {
          console.log("Updating form with new date:", result.weekDate);
          data.meta.date = result.weekDate;
          setFormData({...data});
        }
        
        // Store the ID in sessionStorage as a backup
        try {
          sessionStorage.setItem('lastSavedUpdateId', result.id);
          console.log("Saved update ID to sessionStorage");
          
          // Also store a flag indicating this is no longer a new update
          if (isNewUpdate) {
            sessionStorage.setItem('isNewUpdate', 'false');
            
            // Redirect to edit page if this was a new update
            setTimeout(() => {
              toast({
                title: "Redirecting to edit page",
                description: "You can now continue adding team member information"
              });
              router.push(`/update/${result.id}/edit`);
            }, 100); // Small delay to ensure state is updated
          }
        } catch (storageError) {
          console.warn("Could not save to sessionStorage:", storageError);
        }
      } else {
        console.warn("API response missing ID field:", result);
      }

      // Display a toast with appropriate message depending on whether this is a new update
      toast({
        title: "Update saved",
        description: !hasInitialSave && isNewUpdate
          ? "Your weekly update has been created. All tabs are now available for editing."
          : "Your weekly update has been saved successfully",
      })

      return true
    } catch (error) {
      console.error("Error saving update:", error)
      toast({
        title: "Error",
        description: "Failed to save your weekly update",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleTabChange = async (value: string) => {
    // Check if trying to access a tab that requires initial save
    if (!hasInitialSave && (value === "members" || value === "personal" || value === "review")) {
      toast({
        title: "Save required",
        description: "Please save your Team Updates first to enable other tabs",
        variant: "destructive",
      });
      return; // Prevent tab change
    }
    
    if (value === "review") {
      setIsPreviewLoading(true)
      const currentValues = form.getValues()
      setFormData(currentValues)
      
      // Save the data and ensure we have the latest update ID
      const success = await saveUpdate(currentValues)
      
      // Log the result for debugging
      console.log("Tab change save result:", success, "Update ID:", savedUpdateId);
      
      setIsPreviewLoading(false)
    }
    setActiveTab(value)
  }

  const viewInNewTab = async () => {
    const currentValues = form.getValues()
    setFormData(currentValues)
    const success = await saveUpdate(currentValues)

    // Log for debugging
    console.log("Save attempt result:", success, "Update ID:", savedUpdateId)

    // Wait for state update to propagate
    setTimeout(() => {
      // Check for ID in state or sessionStorage
      const currentId = savedUpdateId || sessionStorage.getItem('lastSavedUpdateId');
      console.log("Checking for update ID after timeout:", currentId);
      
      if (currentId) {
        console.log("Navigating to update view:", currentId);
        router.push(`/update/${currentId}`);
      } else {
        console.log("No update ID found, redirecting to history page");
        toast({
          title: "Update saved",
          description: "Redirecting to history page where you can find your updates",
        });
        router.push('/history');
      }
    }, 100); // Small delay to ensure state is updated
  }
  
  // Generate test data for each section
  const generateTestData = (section: string) => {
    // Use the most recent Friday for test data
    const fridayDate = getMostRecentFriday;
    
    // Common data for all sections
    const commonData = {
      meta: {
        date: fridayDate,
        team_name: "Frontend Platform Team",
        client_org: "Acme Corporation",
      },
      top_3_bullets: "Sprint complete 🟢 | New feature launched 🟢 | Team morale high 🟢",
    };
    
    // Create test data based on section
    if (section === 'team') {
      form.setValue('meta.date', fridayDate);
      form.setValue('meta.team_name', 'Frontend Platform Team');
      form.setValue('meta.client_org', 'Acme Corporation');
      form.setValue('top_3_bullets', 'Sprint complete 🟢 | New feature launched 🟢 | Team morale high 🟢');
      
      // Team Health
      form.setValue('team_health.owner_input', 'Team is doing great with high energy and excellent collaboration.');
      form.setValue('team_health.sentiment_score', 4.5);
      form.setValue('team_health.overall_status', 'Team morale is high after completing the milestone.');
      form.setValue('team_health.energy_engagement', 'Energy is positive, team is collaborating well on features.');
      form.setValue('team_health.roles_alignment', 'Roles are clear and well-defined with good coordination.');
      
      // Delivery Performance
      form.setValue('delivery_performance.accomplishments', [
        'Completed new dashboard UI',
        'Fixed 8 critical bugs',
        'Improved load time by 40%'
      ]);
      form.setValue('delivery_performance.misses_delays', [
        'API integration delayed due to third-party issues',
        'Documentation updates pending'
      ]);
      form.setValue('delivery_performance.workload_balance', 'JustRight');
      
      // Stakeholder Engagement
      form.setValue('stakeholder_engagement.feedback_notes', [
        'Client praised the new UI design',
        'Stakeholders happy with progress on timeline'
      ]);
      form.setValue('stakeholder_engagement.expectation_shift', [
        'Timeline extended for phase 2 due to scope increase',
        'New requirement added for accessibility compliance'
      ]);
      form.setValue('stakeholder_engagement.stakeholder_nps', 4.2);
      
      // Risks & Escalations
      form.setValue('risks_escalations.risks', [
        {
          title: 'Third-party API reliability',
          description: 'External API has had intermittent outages affecting our service',
          severity: 'Yellow'
        },
        {
          title: 'Resource constraints',
          description: 'Team may be understaffed for upcoming feature work',
          severity: 'Red'
        }
      ]);
      form.setValue('risks_escalations.escalations', [
        'Need decision on feature prioritization for next sprint',
        'Require approval for additional cloud resources'
      ]);
      
      // Opportunities & Wins
      form.setValue('opportunities_wins.wins', [
        'Successfully launched new dashboard with positive feedback',
        'Reduced page load time by 40% through optimization'
      ]);
      form.setValue('opportunities_wins.growth_ops', [
        'Potential for AI-powered analytics in next phase',
        'Opportunity to refactor legacy components for better performance'
      ]);
      
      // Support Needed
      form.setValue('support_needed.requests', [
        'Additional QA resource for next sprint',
        'Technical guidance on new API integration'
      ]);
      
      toast({
        title: "Test data added",
        description: "Team updates test data has been populated",
      });
    }
    
    else if (section === 'members') {
      // Team Members Updates
      form.setValue('team_members_updates.people_changes', 'One new developer joining next week, and one engineer moving to another team at end of month.');
      
      form.setValue('team_members_updates.top_contributors', [
        {
          name: 'Sarah Johnson',
          achievement: 'Led successful client demo that clarified project scope',
          recognition: 'Team shoutout and gift card'
        },
        {
          name: 'Michael Chen',
          achievement: 'Solved complex performance issue affecting multiple features',
          recognition: 'Public recognition in all-hands meeting'
        }
      ]);
      
      form.setValue('team_members_updates.members_needing_attention', [
        {
          name: 'James Smith',
          issue: 'Struggling with time management and work prioritization',
          support_plan: 'Daily check-ins and peer mentoring for 2 weeks',
          delivery_risk: 'Medium'
        },
        {
          name: 'Emily Davis',
          issue: 'Onboarding challenges with our complex codebase',
          support_plan: 'Assigned dedicated mentor and additional documentation time',
          delivery_risk: 'Low'
        }
      ]);
      
      toast({
        title: "Test data added",
        description: "Team members test data has been populated",
      });
    }
    
    else if (section === 'personal') {
      // Personal Updates
      form.setValue('personal_updates.personal_wins', [
        'Successfully led cross-team collaboration on authentication service',
        'Mentored two junior developers who are now contributing independently',
        'Improved team planning process resulting in better sprint outcomes'
      ]);
      
      form.setValue('personal_updates.leadership_focus', {
        skill: 'Strategic delegation',
        practice: 'Assigning more high-level tasks to senior team members and focusing on growth opportunities'
      });
      
      form.setValue('personal_updates.reflections', [
        'Learned the importance of early stakeholder alignment on requirements',
        'Need to create more space for team innovation and creative problem-solving',
        'Regular 1:1s have significantly improved team communication'
      ]);
      
      form.setValue('personal_updates.goals', [
        {
          description: 'Improve team velocity by 15% through process optimization',
          status: 'Green',
          update: 'On track with 10% improvement so far through better planning'
        },
        {
          description: 'Reduce technical debt by 20% in core services',
          status: 'Yellow',
          update: 'Behind schedule due to urgent feature requests taking priority'
        }
      ]);
      
      form.setValue('personal_updates.support_needed', 'Need guidance on balancing technical debt reduction with new feature development priorities.');
      
      toast({
        title: "Test data added",
        description: "Personal updates test data has been populated",
      });
    }
  };

  // For debugging
  console.log("Current state:", { 
    activeTab, 
    hasInitialSave, 
    savedUpdateId, 
    isNewUpdate
  });

  return (
    <div className="max-w-4xl mx-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading update data...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="edit">Team Updates</TabsTrigger>
            <TabsTrigger 
              value="members" 
              disabled={!hasInitialSave} 
              title={!hasInitialSave ? "Save the Team Updates first" : ""}
              data-disabled={!hasInitialSave}
            >
              Team Members
            </TabsTrigger>
            <TabsTrigger 
              value="personal" 
              disabled={!hasInitialSave} 
              title={!hasInitialSave ? "Save the Team Updates first" : ""}
              data-disabled={!hasInitialSave}
            >
              Personal Updates
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              disabled={!hasInitialSave} 
              title={!hasInitialSave ? "Save the Team Updates first" : ""}
              data-disabled={!hasInitialSave}
            >
              Review Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            {/* Only show success message if hasInitialSave is true AND there is a savedUpdateId */}
            {!hasInitialSave || !savedUpdateId ? (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 dark:bg-amber-950 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-300 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Important:</strong> Save this tab first to unlock Team Members, Personal Updates, and Review Report tabs.
                  </span>
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 dark:bg-green-950 dark:border-green-800 animate-fadeIn">
                <p className="text-green-800 dark:text-green-300 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Success:</strong> All tabs are now unlocked! You can proceed to edit Team Members and Personal Updates.
                  </span>
                </p>
              </div>
            )}
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="space-y-6">
                <HeaderSection form={form} />
                <TeamHealthSection form={form} />
                <DeliveryPerformanceSection form={form} />
                <StakeholderEngagementSection form={form} />
                <RisksEscalationsSection form={form} />
                <OpportunitiesWinsSection form={form} />
                <SupportNeededSection form={form} />

                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => generateTestData('team')}
                  >
                    Add Test Data
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Update"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="members">
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="space-y-6">
                <TeamMembersUpdatesSection form={form} />

                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => generateTestData('members')}
                  >
                    Add Test Data
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Update"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="personal">
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="space-y-6">
                <PersonalUpdatesSection form={form} />

                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => generateTestData('personal')}
                  >
                    Add Test Data
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Update"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="review">
            {isPreviewLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            ) : (
              <div>
                <WeeklyUpdateView data={formData} showBackButton={false} />

                <div className="flex justify-end mt-6 print:hidden">
                  <Button onClick={viewInNewTab}>Open in New Tab</Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

