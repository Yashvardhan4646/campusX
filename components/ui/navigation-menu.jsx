import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn(
        "relative z-10 flex max-w-max flex-row items-center justify-center",
        className
      )}
      {...props}
    />
  )
)
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={cn(
        "group flex flex-row items-center justify-center gap-6",
        className
      )}
      {...props}
    />
  )
)
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva({
  base: "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-transparent/50 data-[state=open]:bg-transparent/50",
  variants: {},
  defaultVariants: {},
})

const NavigationMenuTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    // Hover open logic
    const [open, setOpen] = React.useState(false);
    return (
      <NavigationMenuPrimitive.Trigger
        ref={ref}
        className={cn(
          navigationMenuTriggerStyle(),
          "group",
          className
        )}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        data-state={open ? "open" : undefined}
        {...props}
      >
        <span className="flex items-center gap-1 whitespace-nowrap">
          {children}
          <ChevronDown
            className="ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </span>
      </NavigationMenuPrimitive.Trigger>
    );
  }
);
NavigationMenuTrigger.displayName =
  NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "left-0 top-full w-full md:absolute md:w-auto bg-[#1a1a1a]/90 border border-[#2a2a2a] rounded-lg shadow-xl backdrop-blur-md data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
        className
      )}
      {...props}
    />
  )
)
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div className={cn("absolute left-0 top-full flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        className={cn(
          "origin-top-center relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border border-[#2a2a2a] bg-[#1a1a1a] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100 md:w-(--radix-navigation-menu-viewport-width)",
          className
        )}
        {...props}
      />
    </div>
  )
)
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
}
