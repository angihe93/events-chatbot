'use client';

import { createIdGenerator } from 'ai';
import { type Message, useChat } from '@ai-sdk/react';
import { deleteLastMessage } from '~/lib/data';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp, RotateCcw } from 'lucide-react';
import ReactMarkdown from "react-markdown"
import React from 'react';
// import isEqual from 'lodash.isequal'

// Simple Spinner component, can replace later
function Spinner() {
    return <span>Loading...</span>;
}

export default function Chat({
    id,
    initialMessages,
}: { id?: string | undefined; initialMessages?: Message[] } = {}) {

    // const [lastMsgId, setLastMsgId] = useState<string | undefined>('') // for delete previous msg in DB if user regenerates
    // useEffect(() => console.log(lastMsgId), [lastMsgId])
    // console.log("Chat id", id)
    const formRef = useRef<HTMLFormElement>(null);

    const { input, handleInputChange, handleSubmit, messages, setMessages, addToolResult, status, stop, error, reload, append } = useChat({
        id, // use the provided chat ID
        initialMessages, // initial messages if provided
        sendExtraMessageFields: true, // send id and createdAt for each message
        // id format for client-side messages:
        generateId: createIdGenerator({
            prefix: 'msgc',
            size: 16,
        }),
        // only send the last message to the server:
        experimental_prepareRequestBody({ messages, id }) {
            return { message: messages[messages.length - 1], id };
        },
        maxSteps: 5,
        async onToolCall({ toolCall }) {
            if (toolCall.toolName === 'getLocation') {
                const cities = [
                    'New York',
                    'Los Angeles',
                    'Chicago',
                    'San Francisco',
                ];
                return cities[Math.floor(Math.random() * cities.length)];
            }
        },
    });

    const handleReload = async () => {
        // this last message doesn't work reliably when a message is from a tool call
        // switch to delete latest message for this chat id
        const lastMsgId = messages[messages.length - 1]?.id
        if (lastMsgId) {
            console.log(`about to remove msg ${lastMsgId} and reload`)
            try {
                // await deleteMessage(lastMsgId)
                await deleteLastMessage(id!)
                await reload()
            } catch (error) { } finally { }
        }
    }

    const handleMoreSuggestionsClick = async () => {
        console.log("clicked more suggestions");
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
        console.log("lastUserMsg", lastUserMsg)
        if (lastUserMsg && lastUserMsg.parts && lastUserMsg.parts[0] && 'text' in lastUserMsg.parts[0]) {
            console.log("'text' in lastUserMsg.parts[0]", 'text' in lastUserMsg.parts[0])
            append({ role: 'user', content: lastUserMsg.parts[0].text })
        }
    }

    const [saveEventClickFlag, setSaveEventClickFlag] = useState(false)

    const handleSaveEvent = async (childrenArray: any[]) => {

        let eventInfo: string[] = []
        for (const item of childrenArray) {
            if (item.props) {
                // // check if its event name or the rest of the <ul>
                if (item.key === ".$p-0") { // event name
                    const eventName =
                        React.isValidElement(item.props.children) &&
                        item.props.children.props?.children;
                    if (eventName) {
                        eventInfo.push(eventName);
                    }
                }
                else if (item.key === ".$ul-0") { // rest of <ul>
                    const innerChildrenArr = item.props.children
                    for (const i of innerChildrenArr) {
                        if (i.props) {
                            if (React.isValidElement(i.props.children) && i.props.children.props) { // link field
                                const link = i.props.children.props.href
                                eventInfo.push(link)
                                // } else { // other fields
                            } else if (Array.isArray(i.props.children) && i.props.children.length > 1) { // other fields
                                const infoItem = i.props.children[1]
                                eventInfo.push(infoItem)
                            }

                        }
                    }
                }
            }
        }
        console.log("handleSaveEvent eventInfo", eventInfo)
        if (eventInfo.length === 4) {
            const saveEventParams = {
                name: eventInfo[0],
                dateTime: eventInfo[1],
                location: eventInfo[2],
                link: eventInfo[3]
            }
            await fetch('/api/save-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveEventParams),
            })
        } else if (eventInfo.length === 5) {
            const saveEventParams = {
                name: eventInfo[0],
                description: eventInfo[1],
                dateTime: eventInfo[2],
                location: eventInfo[3],
                link: eventInfo[4]
            }
            await fetch('/api/save-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveEventParams),
            })
        }
        setSaveEventClickFlag(!saveEventClickFlag)
    }


    // for save button styling
    type SavedEvent =
        | { name: string | undefined; dateTime: string | undefined; location: string | undefined; link: string | undefined; description?: undefined }
        | { name: string | undefined; description: string | undefined; dateTime: string | undefined; location: string | undefined; link: string | undefined };

    const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
    useEffect(() => {
        const fetchSavedEvents = async () => {
            const response = await fetch('/api/save-event/get-saved-events', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            console.log("api response", result)
            const events = result.data.map(
                ({ userId, id, ...rest }: any) => rest
            )
            setSavedEvents(events)
        };
        fetchSavedEvents();
    }, [saveEventClickFlag]);


    return (
        <>
            <div className="container flex flex-col items-center justify-center gap-6 px-10 py-16 w-[60%]">
                messages
                {messages?.sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
                    .map(message => {
                        const style =
                            message.role === "user"
                                ? " bg-blue-100" // "ml-auto mr-8 bg-blue-100"
                                : "bg-gray-200 mb-4"

                        return (
                            <div key={message.id} className={`p-1.5 pl-4 pr-4 rounded-lg flex items-center text-left max-w-[80%] ${style}`}>
                                {message.parts.map((part, index) => {
                                    switch (part.type) {
                                        case 'step-start':
                                            // show step boundaries as horizontal lines:
                                            return index > 0 ? (
                                                <div key={index} className="text-gray-500">
                                                    <hr className="my-2 border-gray-300" />
                                                </div>
                                            ) : null;

                                        // render text parts as simple text:
                                        // print out id for now for debugging
                                        case 'text': {
                                            // dynamically vary padding for ai messages so it looks good for short & long messages
                                            // console.log("part.text", part.text)
                                            // console.log("part.text.length", part.text.length)
                                            const marginSize = part.text.length > 1000 ? '3' : '1'
                                            // console.log("part.text marginSize", marginSize)
                                            const margin = message.role === "assistant" ? `p-${marginSize}` : ""

                                            return (
                                                <div key={index} className={margin}>
                                                    {/* use custom component styling */}
                                                    {/* https://github.com/remarkjs/react-markdown?tab=readme-ov-file#appendix-b-components */}
                                                    {/* https://github.com/remarkjs/react-markdown/issues/832 */}
                                                    <ReactMarkdown components={{
                                                        ol({ children }) {
                                                            return (
                                                                <ol className="list-inside list-decimal mt-3">{children}</ol>
                                                            )
                                                        },
                                                        ul({ children }) {
                                                            console.log(children)
                                                            return (
                                                                (<ul className="list-inside list-disc">
                                                                    {children}
                                                                    {/* <button>save</button> */}
                                                                    {/* <button className='border' onClick={() => { console.log(children); console.log(part) }}>save</button> */}
                                                                </ul>)
                                                            )
                                                        },
                                                        li({ children }) {
                                                            const childrenArray = React.Children.toArray(children)
                                                            console.log("li childrenArray", childrenArray)

                                                            // only place button at end of outer <li>
                                                            const placeButton = React.isValidElement(childrenArray[1]) && childrenArray[1].key === '.$p-0'

                                                            // redo checkIfSaved
                                                            const checkIfSaved = (childrenArray: any) => {
                                                                let eventInfo: string[] = []
                                                                for (const item of childrenArray) {
                                                                    if (item.props) {
                                                                        // check if its event name or the rest of the <ul>
                                                                        if (item.key === ".$p-0") { // event name
                                                                            // Ensure item.props.children is valid before accessing props
                                                                            const eventName =
                                                                                React.isValidElement(item.props.children) &&
                                                                                item.props.children.props?.children;
                                                                            if (eventName) {
                                                                                eventInfo.push(eventName);
                                                                            }
                                                                        }
                                                                        else if (item.key === ".$ul-0") { // rest of <ul>
                                                                            const innerChildrenArr = item.props.children
                                                                            for (const i of innerChildrenArr) {
                                                                                if (i.props) {
                                                                                    // if (i.props.children.props) { // link field
                                                                                    if (React.isValidElement(i.props.children) && i.props.children.props) { // link field
                                                                                        const link = i.props.children.props.href
                                                                                        eventInfo.push(link)
                                                                                        // } else { // other fields
                                                                                    } else if (Array.isArray(i.props.children) && i.props.children.length > 1) { // other fields
                                                                                        const infoItem = i.props.children[1]
                                                                                        eventInfo.push(infoItem)
                                                                                    }

                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                console.log("checkIfSaved eventInfo", eventInfo)
                                                                return savedEvents.some(ev => ev.name === eventInfo[0])
                                                            }

                                                            const isSaved = checkIfSaved(childrenArray)
                                                            const style = isSaved ? 'bg-red-100' : 'bg-gray-300'

                                                            const isEventName = React.isValidElement(childrenArray[0]) && childrenArray[0].key === ".$p-0"
                                                            // sections for each numbered item, fully contain

                                                            return (
                                                                <li>
                                                                    {Array.isArray(children) && children.length > 0 ? children[0] : children}
                                                                    {placeButton && <button className={'mb-3 border rounded-lg p-1 mx-1 ' + style} onClick={() => handleSaveEvent(childrenArray)}>{isSaved ? 'saved' : 'save'}</button>}
                                                                    {Array.isArray(children) ? children.slice(1) : null}
                                                                </li>
                                                                // <li>{children}{placeButton && <div className="flex justify-center"><button className={'mb-3 border rounded-lg p-1 ' + style} onClick={() => handleSaveEvent(childrenArray)}>{isSaved ? 'saved' : 'save'}</button></div>}</li>
                                                            )
                                                        },
                                                        a: ({ node, ...props }) => (
                                                            <a {...props} className="underline text-blue-600 hover:text-blue-800" />
                                                        ),
                                                        p: ({ children }) => {
                                                            return (<span>{children}</span>)
                                                        }
                                                    }}>
                                                        {part.text}
                                                    </ReactMarkdown>
                                                </div>)
                                        }

                                        // for tool invocations, distinguish between the tools and the state:
                                        case 'tool-invocation': {
                                            const callId = part.toolInvocation.toolCallId;

                                            switch (part.toolInvocation.toolName) {
                                                case 'askForConfirmation': {
                                                    switch (part.toolInvocation.state) {
                                                        case 'call':
                                                            return (
                                                                <div key={callId}>
                                                                    {/* {part.toolInvocation.args.message} */}
                                                                    {typeof part.toolInvocation.args === "object" &&
                                                                        part.toolInvocation.args !== null &&
                                                                        "message" in part.toolInvocation.args
                                                                        ? (part.toolInvocation.args as { message: string }).message
                                                                        : null}
                                                                    <div>
                                                                        <button
                                                                            onClick={() =>
                                                                                addToolResult({
                                                                                    toolCallId: callId,
                                                                                    result: 'Yes, confirmed.',
                                                                                })
                                                                            }
                                                                        >
                                                                            Yes
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                addToolResult({
                                                                                    toolCallId: callId,
                                                                                    result: 'No, denied',
                                                                                })
                                                                            }
                                                                        >
                                                                            No
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        case 'result':
                                                            return (
                                                                <div key={callId}>
                                                                    Location access allowed:{' '}
                                                                    {part.toolInvocation.result}
                                                                </div>
                                                            );
                                                    }
                                                    break;
                                                }

                                                case 'getLocation': {
                                                    switch (part.toolInvocation.state) {
                                                        case 'call':
                                                            return <div key={callId}>Getting location...</div>;
                                                        case 'result':
                                                            return (
                                                                <div key={callId}>
                                                                    Location: {part.toolInvocation.result}
                                                                </div>
                                                            );
                                                    }
                                                    break;
                                                }

                                                case 'getWeatherInformation': {
                                                    switch (part.toolInvocation.state) {
                                                        // example of pre-rendering streaming tool calls:
                                                        case 'partial-call':
                                                            return (
                                                                <pre key={callId}>
                                                                    {JSON.stringify(part.toolInvocation, null, 2)}
                                                                </pre>
                                                            );
                                                        case 'call':
                                                            return (
                                                                <div key={callId}>
                                                                    Getting weather information for{' '}
                                                                    {typeof part.toolInvocation.args === "object" &&
                                                                        part.toolInvocation.args !== null &&
                                                                        "city" in part.toolInvocation.args
                                                                        ? (part.toolInvocation.args as { city: string }).city
                                                                        : null}...
                                                                    {/* {part.toolInvocation.args.city}... */}
                                                                </div>
                                                            );
                                                        case 'result':
                                                            return (
                                                                <div key={callId}>
                                                                    Weather in {typeof part.toolInvocation.args === "object" &&
                                                                        part.toolInvocation.args !== null &&
                                                                        "city" in part.toolInvocation.args
                                                                        ? (part.toolInvocation.args as { city: string }).city
                                                                        : null}:{' '}
                                                                    {part.toolInvocation.result}
                                                                </div>
                                                            );
                                                    }
                                                    break;
                                                }
                                                case 'getEvents': {
                                                    switch (part.toolInvocation.state) {
                                                        case 'partial-call':
                                                            return (
                                                                <div key={callId}>
                                                                    Getting events info for {typeof part.toolInvocation.args === "object" &&
                                                                        part.toolInvocation.args !== null &&
                                                                        "query" in part.toolInvocation.args
                                                                        ? (part.toolInvocation.args as { query: string }).query
                                                                        : null}:{' '}...
                                                                    {/* {part.toolInvocation.query} */}
                                                                </div>
                                                            );
                                                    }
                                                    if (part.toolInvocation.state === 'result') {
                                                        console.log("toolInvoation.result", part.toolInvocation.result);
                                                    }
                                                    return (
                                                        <div key={callId}>
                                                            <p>{part.toolInvocation.args}</p>
                                                            {part.toolInvocation.state === 'result' && (
                                                                // <p>{part.toolInvocation.result}</p>
                                                                <ReactMarkdown>{part.toolInvocation.result}</ReactMarkdown>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                case 'addResource': {
                                                    switch (part.toolInvocation.state) {
                                                        case 'partial-call':
                                                            // const toolInvocation = part.toolInvocation as {toolName: string; state: string; args?: any; result?: any; toolCallId?: string }
                                                            const toolInvocation = part.toolInvocation as { toolName: string; state: string; toolCallId?: string }
                                                            return (
                                                                <div key={callId}>
                                                                    {/* called {part.toolInvocation?.args?.toolName} */}
                                                                    called {toolInvocation.toolName}
                                                                </div>
                                                            )
                                                    }
                                                }
                                            }
                                        }
                                        default:
                                            return null;
                                    }
                                })}
                                <br />
                            </div>
                        )
                    }
                    )}

                {/* if last message has invoked searchEvents tool, show button for generate more suggestions */}
                {status === 'ready' && messages && messages[messages.length - 1]?.parts.some(
                    part => part.type === 'tool-invocation' && part.toolInvocation?.args?.date) &&
                    <button type="submit" onClick={handleMoreSuggestionsClick}>More suggestions</button>}

                {/* when is saveChat called? if stop is clicked when message is generating would user prompt be saved? */}
                {(status === 'submitted' || status === 'streaming') && (
                    <div>
                        {status === 'submitted' && <Spinner />}
                        <button type="button" onClick={() => stop()}>
                            Stop
                        </button>
                    </div>
                )}

                {/* TODO: for reload need to update existing db row */}
                {error && (
                    <>
                        <div>An error occurred.</div>
                        <button type="button" onClick={() => reload()}
                            className="p-1 flex items-center gap-1 hover:text-green-700 text-sm"
                        >
                            Retry
                            <RotateCcw />
                        </button>
                    </>
                )}

                {(status === 'ready' && messages.length > 0) &&
                    <div className="flex justify-end">
                        <button onClick={async () => { try { await handleReload() } catch (error) { } finally { } }}
                            disabled={!(status === 'ready')}
                            className="p-1 flex items-center gap-1 hover:text-green-700 text-sm">
                            <RotateCcw />
                            Regenerate
                        </button>
                    </div>}

                <form ref={formRef} onSubmit={handleSubmit}>
                    {/* auto expand text box to fit input text */}
                    <div className='w-[40vw] flex gap-2'>
                        <textarea
                            value={input}
                            onChange={handleInputChange}
                            className="border w-full resize-none overflow-hidden rounded-md p-2"
                            rows={1}
                            onInput={e => {
                                e.currentTarget.style.height = "auto";
                                e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    // handleSubmit(e as any)
                                    formRef.current?.requestSubmit()
                                }
                            }}
                        />
                        <button type="submit"><ArrowUp /></button>
                    </div>
                </form>
            </div >
        </>
    );
}
