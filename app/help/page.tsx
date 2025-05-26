"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database, Sprout, RefreshCw, Wifi } from "lucide-react";

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
  
  const [dbStatus, setDbStatus] = useState<{
    loading: boolean;
    connected?: boolean;
    message?: string;
    details?: any;
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
  
  // Function to check database connection status
  const checkDatabaseStatus = async () => {
    setDbStatus({ loading: true });
    try {
      const response = await fetch('/api/database/status');
      const data = await response.json();
      
      if (response.ok) {
        setDbStatus({
          loading: false,
          connected: data.connected,
          message: data.message,
          details: data.database
        });
      } else {
        setDbStatus({
          loading: false,
          connected: false,
          message: data.message || "Failed to check database status"
        });
      }
    } catch (error) {
      setDbStatus({
        loading: false,
        connected: false,
        message: "An error occurred while checking the database connection"
      });
    }
  };
  
  // Check database status on component mount
  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to login
        </Link>
      </div>
      <Tabs defaultValue="database">
        <TabsList className="mb-4">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database</CardTitle>
              <CardDescription>
                Connect to your PostgreSQL database and seed it with sample data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <section className="mb-6">
                <h3 className="text-xl font-medium mb-3">Database Connection Status</h3>
                <div className="p-4 border rounded-md">
                  {dbStatus.loading ? (
                    <div className="flex items-center">
                      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Checking database connection...
                    </div>
                  ) : dbStatus.connected ? (
                    <Alert variant="success">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <div>
                        <AlertTitle>Connected</AlertTitle>
                        <AlertDescription>{dbStatus.message}</AlertDescription>
                        {dbStatus.details && (
                          <div className="mt-2 text-sm">
                            <div>Database Time: {new Date(dbStatus.details.version).toLocaleString()}</div>
                            <div>Users Table: {dbStatus.details.tables.users.exists ? 
                              `Exists (${dbStatus.details.tables.users.count} users)` : 
                              "Not found"}
                            </div>
                          </div>
                        )}
                      </div>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <div>
                        <AlertTitle>Connection Failed</AlertTitle>
                        <AlertDescription>{dbStatus.message}</AlertDescription>
                      </div>
                    </Alert>
                  )}
                  <Button 
                    onClick={checkDatabaseStatus} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    disabled={dbStatus.loading}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </section>
              
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
              <CardTitle>Usage</CardTitle>
              <CardDescription>
                Learn how to use the system effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-3">Getting Started</h3>
                <p>
                  This system helps team leads and managers track and report on team progress, challenges, and achievements on a weekly basis.
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