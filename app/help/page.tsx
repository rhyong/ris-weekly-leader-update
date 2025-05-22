"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database, Sprout } from "lucide-react";

export default function HelpPage() {
  // State for tracking API operations
  const [initializeStatus, setInitializeStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  
  const [seedStatus, setSeedStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Function to initialize database tables
  const handleInitializeDatabase = async () => {
    setInitializeStatus({ loading: true });
    try {
      const response = await fetch('/api/database/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setInitializeStatus({ 
          loading: false, 
          success: true, 
          message: data.message || "Database tables initialized successfully" 
        });
      } else {
        setInitializeStatus({ 
          loading: false, 
          success: false, 
          message: data.message || "Failed to initialize database tables" 
        });
      }
    } catch (error) {
      setInitializeStatus({ 
        loading: false, 
        success: false, 
        message: "An error occurred while initializing the database" 
      });
    }
  };

  // Function to seed database with sample data
  const handleSeedDatabase = async () => {
    setSeedStatus({ loading: true });
    try {
      const response = await fetch('/api/database/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSeedStatus({ 
          loading: false, 
          success: true, 
          message: data.message || "Database seeded with sample data successfully" 
        });
      } else {
        setSeedStatus({ 
          loading: false, 
          success: false, 
          message: data.message || "Failed to seed database with sample data" 
        });
      }
    } catch (error) {
      setSeedStatus({ 
        loading: false, 
        success: false, 
        message: "An error occurred while seeding the database" 
      });
    }
  };

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Help & Documentation</h1>
      
      <Tabs defaultValue="database">
        <TabsList className="mb-4">
          <TabsTrigger value="database">Database Setup</TabsTrigger>
          <TabsTrigger value="usage">Usage Guide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup & Initialization</CardTitle>
              <CardDescription>
                Setup your PostgreSQL database and seed it with sample data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-3">Prerequisites</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>PostgreSQL installed and running</li>
                  <li>Database credentials configured</li>
                </ul>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Database Configuration</h3>
                <p className="mb-3">
                  Create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file in the project root with the following variables:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto">
                  <code>
{`DATABASE_URL=postgresql://username:password@localhost:5432/weekly_updates
# Replace with your actual PostgreSQL credentials`}
                  </code>
                </pre>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Initialize Database Schema</h3>
                <p className="mb-3">
                  Run the migration script to create necessary tables:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto">
                  <code>
{`# From project root
npm run migrate`}
                  </code>
                </pre>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will execute the SQL schema from <code className="bg-muted px-1 py-0.5 rounded">schema.sql</code> to create all required tables.
                </p>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Seed Sample Data</h3>
                <p className="mb-3">
                  To populate your database with sample data:
                </p>
                <pre className="bg-muted p-4 rounded-md overflow-auto">
                  <code>
{`# From project root
npm run seed`}
                  </code>
                </pre>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will add sample users, teams, and leadership updates to help you get started.
                </p>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Sample Users for Testing</h3>
                <p className="mb-3">The seed script creates the following test users:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Username</th>
                        <th className="px-4 py-2 text-left">Password</th>
                        <th className="px-4 py-2 text-left">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-2">admin</td>
                        <td className="px-4 py-2">password123</td>
                        <td className="px-4 py-2">Administrator</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">teamlead</td>
                        <td className="px-4 py-2">password123</td>
                        <td className="px-4 py-2">Team Lead</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">manager</td>
                        <td className="px-4 py-2">password123</td>
                        <td className="px-4 py-2">Manager</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  <strong>Note:</strong> These are for development purposes only. Replace with secure credentials in production.
                </p>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Troubleshooting</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Connection Issues</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensure PostgreSQL is running and credentials are correct in your .env.local file.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Migration Failures</h4>
                    <p className="text-sm text-muted-foreground">
                      Check database logs and ensure your PostgreSQL user has appropriate permissions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Reset Database</h4>
                    <p className="text-sm text-muted-foreground">
                      To reset the database, run <code className="bg-muted px-1 py-0.5 rounded">npm run reset-db</code> which will drop and recreate all tables.
                    </p>
                  </div>
                </div>
              </section>
              
              <Separator className="my-6" />
              
              <section>
                <h3 className="text-xl font-medium mb-4">Quick Setup</h3>
                <p className="mb-6">
                  You can use the buttons below to quickly set up your database without running commands manually.
                  Make sure you have configured your database connection in the <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file first.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Step 1: Initialize Database Tables</h4>
                    <p className="text-sm text-muted-foreground">
                      Create all necessary tables and schema for the application.
                    </p>
                    <Button 
                      onClick={handleInitializeDatabase}
                      disabled={initializeStatus.loading}
                      className="w-full"
                    >
                      {initializeStatus.loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Initializing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Initialize Database Tables
                        </span>
                      )}
                    </Button>
                    
                    {initializeStatus.message && (
                      <Alert variant={initializeStatus.success ? "default" : "destructive"}>
                        <div className="flex items-start gap-2">
                          {initializeStatus.success ? (
                            <CheckCircle2 className="h-4 w-4 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mt-0.5" />
                          )}
                          <div>
                            <AlertTitle>{initializeStatus.success ? "Success" : "Error"}</AlertTitle>
                            <AlertDescription>{initializeStatus.message}</AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Step 2: Seed Sample Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Populate the database with sample users, teams, and updates.
                    </p>
                    <Button 
                      onClick={handleSeedDatabase}
                      disabled={seedStatus.loading || (initializeStatus.success === undefined)}
                      className="w-full"
                      variant={initializeStatus.success === undefined ? "secondary" : "default"}
                    >
                      {seedStatus.loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Seeding Data...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sprout className="h-4 w-4" />
                          Seed Sample Data
                        </span>
                      )}
                    </Button>
                    
                    {seedStatus.message && (
                      <Alert variant={seedStatus.success ? "default" : "destructive"}>
                        <div className="flex items-start gap-2">
                          {seedStatus.success ? (
                            <CheckCircle2 className="h-4 w-4 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mt-0.5" />
                          )}
                          <div>
                            <AlertTitle>{seedStatus.success ? "Success" : "Error"}</AlertTitle>
                            <AlertDescription>{seedStatus.message}</AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    )}
                  </div>
                </div>
              </section>
            </CardContent>
            <CardFooter className="bg-muted/50 flex justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Note:</span> Initialize database before seeding sample data.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Guide</CardTitle>
              <CardDescription>
                Learn how to use the Weekly Leadership Update system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-3">Getting Started</h3>
                <p>
                  The Weekly Leadership Update system helps team leads and managers track and report on team progress, challenges, and achievements on a weekly basis.
                </p>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Creating Updates</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to the homepage and click "New Update"</li>
                  <li>Select the reporting week and team</li>
                  <li>Fill in each section with relevant information</li>
                  <li>Click "Save" to store as draft or "Submit" to finalize</li>
                </ol>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Viewing History</h3>
                <p>
                  Access previous updates by clicking "History" in the navigation menu. 
                  From there, you can view, edit, or export past updates.
                </p>
              </section>
              
              <Separator />
              
              <section>
                <h3 className="text-xl font-medium mb-3">Exporting Reports</h3>
                <p>
                  To export a report, open the update and click "Export" to download as PDF or send via email.
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}