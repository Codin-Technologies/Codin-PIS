import * as React from "react"
import { cn } from "@/lib/utils"

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("grid gap-4", className)} {...props} />
}

export function Field({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("grid gap-2", className)} {...props} />
}

export function FieldLabel({
    className,
    ...props
}: React.ComponentProps<"label">) {
    return (
        <label
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
}

export function FieldDescription({
    className,
    ...props
}: React.ComponentProps<"p">) {
    return (
        <p
            className={cn("text-[0.8rem] text-muted-foreground", className)}
            {...props}
        />
    )
}

export function FieldSeparator({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("relative", className)} {...props}>
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            {children && (
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {children}
                    </span>
                </div>
            )}
        </div>
    )
}
