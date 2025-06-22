'use client'

import * as React from "react"
import { Bookmark, ChevronRight, PencilLine } from "lucide-react"

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
// import { api } from "~/trpc/server"
import { api } from "~/trpc/react"
// import { auth } from "~/lib/auth"
// import { headers } from "next/headers"
// import { redirect } from "next/navigation"

import { useSession } from "~/context/SessionContext"
import { useChatContext } from "~/context/ChatContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";


// import { useQueryClient } from "@tanstack/react-query"

// export function AppSidebar({ chatItems, ...props }: { chatItems: ChatItem[] } & React.ComponentProps<typeof Sidebar>) {
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const sessionContext = useSession(); // Access session from context
  const session = sessionContext?.session;
  console.log("AppSidebar session", session)

  const router = useRouter()

  // const queryClient = useQueryClient(); // Access React Query's query client

  // TODO: should not render sidebar when user not logged in
  // if (!session?.user) {
  //   return null; // Render nothing if user is not logged in
  // }

  const { selectedChatContext, setSelectedChatContext } = useChatContext(); // Access ChatContext

  type ChatSlugMap = {
    id: string;
    slug: string;
  }
  // const chatSlugMap: ChatSlugMap[] = await api.chat.listWithSlug() ?? []
  const { data: chatSlugMap = [] } = api.chat.listWithSlug.useQuery();
  // console.log("chatSlugMap", chatSlugMap);

  // for sorting chats based on created time
  type ChatTimeMap = {
    id: string;
    createdAt: Date
  }
  // const chatTimeMap: ChatTimeMap[] = await api.chat.listWithTime() ?? []
  const { data: chatTimeMap = [] } = api.chat.listWithTime.useQuery();
  // console.log("chatTimeMap", chatTimeMap)

  type ChatItem = { id: string; title: string }

  const chatItems: ChatItem[] = chatTimeMap?.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()).map((i) => (
    { id: i.id, title: chatSlugMap.find((c) => c.id === i.id)?.slug ? chatSlugMap.find((c) => c.id === i.id)?.slug : `Chat created at ${chatTimeMap.find((c) => c.id === i.id)?.createdAt.toLocaleString()}` } as ChatItem
  ))

  // want to refetch chats data after creating new chat so sidebar can update immediately
  // but can't seem to do useQuery inside useEffect
  // const [chatSlugMap, setChatSlugMap] = useState<ChatSlugMap[]>([])
  // const [chatTimeMap, setChatTimeMap] = useState<ChatTimeMap[]>([])
  // const [chatItems, setChatItems] = useState<ChatItem[]>([])
  // useEffect(() => {
  //   const fetchChats = async () => {
  //     const { data } = api.chat.listWithSlug.useQuery()
  //     if (data) {
  //       setChatSlugMap(data);
  //     }
  //     const timeData: ChatTimeMap[] = api.chat.listWithTime.useQuery().data ?? []
  //     setChatTimeMap(timeData)
  //     const chatItems: ChatItem[] = chatTimeMap?.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()).map((i) => (
  //       { id: i.id, title: chatSlugMap.find((c) => c.id === i.id)?.slug ? chatSlugMap.find((c) => c.id === i.id)?.slug : `Chat created at ${chatTimeMap.find((c) => c.id === i.id)?.createdAt.toLocaleString()}` } as ChatItem
  //     ))
  //     setChatItems(chatItems)
  //   }
  //   fetchChats()
  //   // const { data } = api.chat.listWithSlug.useQuery()
  //   // if (data) {
  //   //   setChatSlugMap(data);
  //   // }
  //   // const timeData: ChatTimeMap[] = api.chat.listWithTime.useQuery().data ?? []
  //   // setChatTimeMap(timeData)
  //   // const chatItems: ChatItem[] = chatTimeMap?.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()).map((i) => (
  //   //   { id: i.id, title: chatSlugMap.find((c) => c.id === i.id)?.slug ? chatSlugMap.find((c) => c.id === i.id)?.slug : `Chat created at ${chatTimeMap.find((c) => c.id === i.id)?.createdAt.toLocaleString()}` } as ChatItem
  //   // ))
  //   // setChatItems(chatItems)
  // }, [selectedChatContext]);


  const data = {
    versions: ["0.0.1"],
    navMain: [
      {
        title: "Chats",
        items: chatItems
      }
    ],
  }

  const createChat = api.chat.create.useMutation({
    onSuccess: async (data) => {
      setSelectedChatContext(data)
      console.log(`created chat ${data}`)
      // queryClient.invalidateQueries({ queryKey: ['chatSlugMap'] }); // Refetch chatSlugMap query
      // queryClient.invalidateQueries({ queryKey: ['chatTimeMap'] }); // Refetch chatTimeMap query
    }
  });

  // TODO: when createChat is clicked, fetch chat ids, slugs again and update sidebar
  // useEffect(() => {

  // }, [selectedChatContext])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0] ?? ""}
        /> */}
        {/* <SearchForm /> */}
        {/* TODO: app logo and name go here */}
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
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton asChild>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      createChat.mutate();
                      router.push("/chat")
                    }}
                  >
                    <PencilLine />
                    <span>New chat</span>
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
                          {/* <a>{item.title}</a> */}
                          <button
                            key={item.id}
                            onClick={() => { setSelectedChatContext(item.id); router.push("/chat") }} // Update selected chat
                          // style={{
                          //   backgroundColor: selectedChat === chat.id ? "lightblue" : "transparent",
                          // }}
                          >
                            {item.title}
                          </button>
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
