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
  
  // Get the next Friday for default date
  const getNextFriday = useMemo(() => {
    const today = new Date()
    
    // If today is Friday, next Friday is in 7 days
    // Otherwise, calculate days to add to reach next Friday
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    const daysToAdd = isFriday(today) ? 7 : ((7 - dayOfWeek + 5) % 7)
    const nextFriday = addDays(today, daysToAdd)
    
    // Double-check that it's actually a Friday
    if (!isFriday(nextFriday)) {
      console.error("Calculated date is not a Friday:", format(nextFriday, "yyyy-MM-dd"))
      
      // Force to nearest Friday as a fallback
      const currentDay = nextFriday.getDay()
      const fixedFriday = addDays(nextFriday, currentDay === 5 ? 0 : (5 - currentDay + 7) % 7)
      return format(fixedFriday, "yyyy-MM-dd")
    }
    
    return format(nextFriday, "yyyy-MM-dd")
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
      date: getNextFriday,
      team_name: "",
      client_org: "",
    },
    team_health: {
      owner_input: "",
      sentiment_score: 3.5,
      overall_status: "",
    },
    delivery_performance: {
      accomplishments: [""],
      misses_delays: [""],
      workload_balance: "JustRight",
    },
    stakeholder_engagement: {
      feedback_notes: [""],
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
  // Make sure date is properly formatted in yyyy-MM-dd format
  const formattedData = { ...formData };
  if (formattedData.meta && formattedData.meta.date) {
    try {
      const dateObj = new Date(formattedData.meta.date);
      if (!isNaN(dateObj.getTime())) {
        formattedData.meta.date = dateObj.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("Error formatting date in defaultValues:", e);
    }
  }
  
  const form = useForm<WeeklyUpdateFormData>({
    defaultValues: formattedData,
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
        date: getNextFriday,
        team_name: "",
        client_org: "",
      },
      top_3_bullets: "",
      team_health: {
        owner_input: "",
        sentiment_score: 3.5,
        overall_status: "",
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
              weekDate: updateData?.weekDate,
              formattedWeekDate: updateData?.weekDate ? new Date(updateData.weekDate).toISOString().split('T')[0] : null,
              dataSections: updateData?.data ? Object.keys(updateData.data) : 'none',
              metaDate: updateData?.data?.meta?.date,
              top_3_bullets: updateData?.data?.top_3_bullets,
              hasTeamHealth: Boolean(updateData?.data?.team_health),
              teamHealthFields: updateData?.data?.team_health ? Object.keys(updateData.data.team_health) : 'none',
              overallStatus: updateData?.data?.team_health?.overall_status,
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
              const mergedData = deepMerge(defaultData, updateData.data);
              
              // Make a copy and ensure problematic fields are properly populated
              const completeData = {...mergedData};
              
              // Explicitly ensure the problematic fields are properly populated
              completeData.top_3_bullets = mergedData.top_3_bullets || "";
              
              // Ensure team_health structure is complete
              if (!completeData.team_health) {
                completeData.team_health = {
                  owner_input: "",
                  sentiment_score: 3.5,
                  overall_status: ""
                };
              } else {
                completeData.team_health.owner_input = completeData.team_health.owner_input || "";
                completeData.team_health.sentiment_score = completeData.team_health.sentiment_score || 3.5;
                completeData.team_health.overall_status = completeData.team_health.overall_status || "";
              }
              
              // Ensure the date is in the correct format (yyyy-MM-dd)
              if (completeData.meta && completeData.meta.date) {
                try {
                  const dateObj = new Date(completeData.meta.date);
                  if (!isNaN(dateObj.getTime())) {
                    // Format as yyyy-MM-dd
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    console.log(`Form reset: converting date from ${completeData.meta.date} to ${formattedDate}`);
                    completeData.meta.date = formattedDate;
                  }
                } catch (dateError) {
                  console.error("Error formatting date during form reset:", dateError);
                }
              }
              
              // Log the form data specifically for top_3_bullets and team_health.overall_status
              console.log("Form data check for problematic fields:", {
                top_3_bullets: completeData.top_3_bullets,
                team_health_overall_status: completeData.team_health?.overall_status,
                team_health: completeData.team_health
              });
              
              console.log("Prepared complete form data:", completeData);
              setFormData(completeData as WeeklyUpdateFormData);
              
              // We're going to avoid form.reset() as it's causing issues with complex form components
              console.log("Instead of form.reset(), using individual setValue calls for all fields");
              
              // Update state immediately
              setFormData(completeData as WeeklyUpdateFormData);
              
              // Set each field individually - more reliable than form.reset()
              console.log("Setting all form fields individually with exact values from the database");
              
              // Set meta fields
              form.setValue("meta.date", completeData.meta.date || getNextFriday);
              form.setValue("meta.team_name", completeData.meta.team_name || "");
              form.setValue("meta.client_org", completeData.meta.client_org || "");
              
              // Set top 3 bullets - this is one of the problematic fields
              console.log("Setting top_3_bullets to:", completeData.top_3_bullets);
              form.setValue("top_3_bullets", completeData.top_3_bullets || "");
              
              // Set all team_health fields individually
              console.log("Setting team_health fields:", completeData.team_health);
              form.setValue("team_health.owner_input", completeData.team_health.owner_input || "");
              form.setValue("team_health.sentiment_score", completeData.team_health.sentiment_score || 3.5);
              form.setValue("team_health.overall_status", completeData.team_health.overall_status || "");
              
              // Set delivery_performance fields
              form.setValue("delivery_performance.workload_balance", completeData.delivery_performance.workload_balance || "JustRight");
              form.setValue("delivery_performance.accomplishments", completeData.delivery_performance.accomplishments || [""]);
              form.setValue("delivery_performance.misses_delays", completeData.delivery_performance.misses_delays || [""]);
              
              // Set stakeholder_engagement fields
              form.setValue("stakeholder_engagement.feedback_notes", completeData.stakeholder_engagement.feedback_notes || [""]);
              
              // Set risks_escalations fields
              form.setValue("risks_escalations.risks", completeData.risks_escalations.risks || [{ title: "", description: "", severity: "Green" }]);
              form.setValue("risks_escalations.escalations", completeData.risks_escalations.escalations || [""]);
              
              // Set opportunities_wins fields
              form.setValue("opportunities_wins.wins", completeData.opportunities_wins.wins || [""]);
              form.setValue("opportunities_wins.growth_ops", completeData.opportunities_wins.growth_ops || [""]);
              
              // Set support_needed fields
              form.setValue("support_needed.requests", completeData.support_needed.requests || [""]);
              
              // Set personal_updates fields
              form.setValue("personal_updates.personal_wins", completeData.personal_updates.personal_wins || [""]);
              form.setValue("personal_updates.reflections", completeData.personal_updates.reflections || [""]);
              form.setValue("personal_updates.goals", completeData.personal_updates.goals || [{ description: "", status: "Green", update: "" }]);
              form.setValue("personal_updates.support_needed", completeData.personal_updates.support_needed || "");
              
              // Set team_members_updates fields
              form.setValue("team_members_updates.people_changes", completeData.team_members_updates.people_changes || "");
              form.setValue("team_members_updates.top_contributors", completeData.team_members_updates.top_contributors || [{ name: "", achievement: "", recognition: "" }]);
              form.setValue("team_members_updates.members_needing_attention", completeData.team_members_updates.members_needing_attention || [{ name: "", issue: "", support_plan: "", delivery_risk: "Low" }]);
              
              // Give time for these values to propagate
              setTimeout(() => {
                console.log("Verify values were set correctly:");
                console.log("top_3_bullets:", form.getValues("top_3_bullets"));
                console.log("team_health.overall_status:", form.getValues("team_health.overall_status"));
                console.log("personal_updates.personal_wins:", form.getValues("personal_updates.personal_wins"));
              }, 200);
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
    
    // Debug personal_wins data
    console.log("Personal wins data:", {
      personal_wins: data.personal_updates.personal_wins,
      hasPersonalWins: Boolean(data.personal_updates.personal_wins),
      personalWinsLength: data.personal_updates.personal_wins?.length || 0,
      personalWinsContent: data.personal_updates.personal_wins ? JSON.stringify(data.personal_updates.personal_wins) : 'none'
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
        existingUpdateId: savedUpdateId, // Pass the current update ID if we're editing
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
        console.log(`Response not OK: ${response.status} ${response.statusText}`);
        
        // Default error message
        let errorMessage = "Failed to save your weekly update";
        
        try {
          // Safely attempt to parse the response as JSON
          const errorResponse = await response.json();
          console.log("API error response:", errorResponse);
          
          // Check if we have a structured error response
          if (errorResponse && typeof errorResponse === 'object') {
            // Special handling for duplicate date errors
            if (errorResponse.error === "Duplicate week date") {
              // Set a more specific error message
              errorMessage = errorResponse.message || "A weekly update already exists for this date. Please edit that update from your history instead.";
              
              // Show the error message
              toast({
                title: "Duplicate Report Week Date",
                description: errorMessage,
                variant: "destructive",
              });
              
              // If we received a duplicate update ID, offer to navigate to it
              if (errorResponse.duplicateUpdateId) {
                // Add a second toast with a button to navigate to the existing update
                toast({
                  title: "Edit Existing Update",
                  description: (
                    <div className="flex items-center justify-between">
                      <span>Would you like to edit the existing update?</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/update/${errorResponse.duplicateUpdateId}/edit`)}
                      >
                        Go to Update
                      </Button>
                    </div>
                  ),
                  duration: 10000, // Show for 10 seconds
                });
              }
              
              setIsSaving(false);
              return false;
            } 
            // For other structured errors, use the provided message if available
            else if (errorResponse.message) {
              errorMessage = errorResponse.message;
            }
          }
        } catch (parseError) {
          console.log("Error parsing JSON response:", parseError);
          // If it's not JSON, try to get it as text
          try {
            const errorText = await response.text();
            if (errorText) {
              console.log("API error response text:", errorText);
              // Only use text as error message if it's not empty or HTML
              if (errorText.length < 100 && !errorText.includes("<html>")) {
                errorMessage = errorText;
              }
            }
          } catch (textError) {
            console.log("Could not parse error response as text:", textError);
          }
        }
        
        // Generic error handling for all other errors
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        setIsSaving(false);
        return false;
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
            {/* Only show warning message for new updates that haven't been saved */}
            {isNewUpdate && (!hasInitialSave || !savedUpdateId) && (
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

                <div className="flex justify-end mt-8">
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

                <div className="flex justify-end mt-8">
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

                <div className="flex justify-end mt-8">
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

