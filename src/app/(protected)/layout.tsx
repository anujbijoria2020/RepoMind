import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { AppSideBar } from "./app-sidebar";
import MobileAppSidebar from "./dashboard/MobileSidebar";

type Props = {
  children: React.ReactNode;
};
const SideBarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSideBar/>
      <MobileAppSidebar/>

      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          
          <div className="ml-auto">
          </div>
            <UserButton />
         </div>
       <div className="h-4"></div>
            <div className="border-sidebar-border bg-sidebar h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border p-4 shadow">
              {children}
            </div>
      </main>
    </SidebarProvider>
  );
};

export default SideBarLayout;
