"use client"
import { Button } from "@/components/ui/button";
import { Sidebar ,SidebarHeader,SidebarContent,SidebarGroup,SidebarGroupLabel,SidebarGroupContent, SidebarMenuItem, SidebarMenuButton, SidebarMenu, useSidebar} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";


const items = [
   { title:'Dashboard',
    url:"/dashboard",
    icon:LayoutDashboard
   },
   { title:'QnA',
    url:"/qa",
    icon:Bot
   },
   { title:'Meetings',
    url:"/meetings",
    icon:Presentation
   },{
    title:"Billing",
    url:"/billing",
    icon:CreditCard
   }
]

export function AppSideBar(){
const pathname = usePathname();
const {open} = useSidebar();
const {projects,projectId,setProjectId} = useProject();
const router = useRouter();

return(
    <div>
    <Sidebar collapsible="icon" variant="floating">
         <SidebarHeader>
            <div className="flex items-center gap-2">
                <Image src="/image.png" alt="logo" width={40} height={40} />
                {open? <h1 className="text-xl font-bold text-primar/80">RepoMind</h1>:null}
            </div>
         </SidebarHeader>
         <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>
                    Application
                </SidebarGroupLabel>
                <SidebarGroupContent>
                       {items.map(item=>{
                        return(
                            <SidebarMenuItem key={item.title}>
                               <SidebarMenuButton asChild>
                                <Link href={item.url}
                                className={cn({'bg-primary !text-white':pathname===item.url},'list-none')}
                                >
                                    <item.icon/>
                                <span>{item.title}</span>
                                </Link>
                               </SidebarMenuButton>

                            </SidebarMenuItem>
                        )
                       })}
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel>
                   Your Projects
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {projects?.map(project=>{
                            return(
                                <SidebarMenuItem key={project.
                                name}>
                                    <SidebarMenuButton asChild>
                                       <div onClick={()=>{
                                        setProjectId(project.id);
                                        router.push("/dashboard");
                                       }}>
                                        <div className={cn('rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',{
                                            'bg-primary text-white':project.id===projectId
                                        })}>
                              {project.name[0]}
                                        </div>  
              {open&&<span>{project.name}</span>}
                                       </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}

                        <div className="h-2"></div>
                       <SidebarMenuItem>
                        <Link href='/create'>
                         <Button variant={'outline'} className="w-fit" size={'sm'}>
                            <Plus/>
                         {open? "Create Project" :null}
                        </Button>
                        </Link>
                       </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
                  {open && (
                        <div className="mt-auto p-2 text-xs text-gray-500 italic border-t border-gray-200">
                            Use <kbd className="bg-gray-100 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-100 px-1 rounded">B</kbd> to toggle sidebar
                        </div>
                    )}
         </SidebarContent>
    </Sidebar>
    </div>
)
}