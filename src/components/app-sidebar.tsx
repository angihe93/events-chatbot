import * as React from "react"
import { Bookmark, ChevronRight } from "lucide-react"

import { SearchForm } from "~/components/search-form"
import { VersionSwitcher } from "~/components/version-switcher"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import { api } from "~/trpc/server"
// import { api } from "~/trpc/react"
import { auth } from "~/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"


// export function AppSidebar({ chatItems, ...props }: { chatItems: ChatItem[] } & React.ComponentProps<typeof Sidebar>) {
export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // redirect('/login')
    return null
  }

  // if (!session?.user) {
  // get user chats
  // map chatId to display slug
  // console.log("api.chat", api.chat)
  type ChatSlugMap = {
    id: string;
    slug: string;
  }
  const chatSlugMap: ChatSlugMap[] = await api.chat.listWithSlug() ?? []
  // const { data: chatSlugMap = [] } = api.chat.listWithSlug.useQuery();
  // console.log("chatSlugMap", chatSlugMap);

  // for sorting chats based on created time
  type ChatTimeMap = {
    id: string;
    createdAt: Date
  }
  const chatTimeMap: ChatTimeMap[] = await api.chat.listWithTime() ?? []
  // const { data: chatTimeMap = [] } = api.chat.listWithTime.useQuery();
  // console.log("chatTimeMap", chatTimeMap)

  type ChatItem = { id: string; title: string }

  const chatItems: ChatItem[] = chatTimeMap?.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()).map((i) => (
    { id: i.id, title: chatSlugMap.find((c) => c.id === i.id)?.slug ? chatSlugMap.find((c) => c.id === i.id)?.slug : `Chat created at ${chatTimeMap.find((c) => c.id === i.id)?.createdAt.toLocaleString()}` } as ChatItem
  ))

  const data = {
    versions: ["0.0.1"],
    navMain: [
      {
        title: "Chats",
        items: chatItems
      }
    ],
  }


  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0] ?? ""}
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild>
                  <a href="/saved-events">
                    <Bookmark />
                    <span>Saved events</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item, idx) => (
                      <SidebarMenuItem key={`${item.title}-${idx}`}>
                        {/* <SidebarMenuButton asChild isActive={item.isActive}> */}
                        <SidebarMenuButton asChild>
                          {/* <a href={item.url}>{item.title}</a> */}
                          <a>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild>
                  <a href="/logout">
                    {/* <item.icon /> */}
                    <span>Logout</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
