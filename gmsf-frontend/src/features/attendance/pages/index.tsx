import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { RecordAttendance } from "../components/recordAttendance"
import { HistoryAttendance } from "../components/historyAttendance"

export default function AttendancePage() {
  return (
    <>
        <main className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Asistencias</h1>
          </div>
          <Tabs defaultValue="registro" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="registro">Registro</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>
            <TabsContent value="registro">
              <RecordAttendance />
            </TabsContent>
            <TabsContent value="historial">
              <HistoryAttendance />
            </TabsContent>
          </Tabs>
        </main>
    </>
  )
}
