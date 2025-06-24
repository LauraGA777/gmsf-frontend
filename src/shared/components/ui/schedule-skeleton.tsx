import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export function ScheduleSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9" />
                            <Skeleton className="h-9 w-9" />
                            <Skeleton className="h-9 w-16" />
                        </div>
                        <div className="text-center">
                            <Skeleton className="h-7 w-48 mx-auto" />
                            <Skeleton className="h-5 w-56 mx-auto mt-1" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-40" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <div className="w-20 text-right">
                            <Skeleton className="h-7 w-16" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <Skeleton className="h-6 w-1/2 mb-3" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-5 w-2/3" />
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 