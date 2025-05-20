import WeeklyUpdateForm from "@/components/weekly-update-form"

export default function Home() {
  return (
    <div className="container py-10 px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Weekly Leadership Update</h1>
        <p className="text-muted-foreground">
          Complete your weekly leadership update to share with your team and stakeholders
        </p>
      </div>
      <WeeklyUpdateForm />
    </div>
  )
}
