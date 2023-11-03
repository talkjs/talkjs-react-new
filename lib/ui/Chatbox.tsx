import { CSSProperties, ReactNode } from "react";
import type Talk from "talkjs";
import { useSession } from "../SessionContext";
import { getKeyForObject, splitObjectByPrefix } from "../util";
import { useSetter, useConversation, useUIBox } from "../hooks";
import { FirstParameter, UIBoxProps } from "../types";
import { MountedBox } from "../MountedBox";

type ChatboxProps = UIBoxProps<Talk.Chatbox> &
  Talk.ChatboxOptions & {
    highlightedWords?: FirstParameter<Talk.Chatbox["setHighlightedWords"]>;
    chatboxRef?: React.MutableRefObject<Talk.Chatbox | undefined>;
    loadingComponent?: ReactNode;
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode;
  };

export function Chatbox(props: ChatboxProps) {
  const session = useSession();

  if (session) {
    const key = getKeyForObject(session);
    return <ActiveChatbox key={key} session={session} {...props} />;
  } else {
    return (
      <div style={props.style} className={props.className}>
        {props.loadingComponent}
      </div>
    );
  }
}

function ActiveChatbox(props: ChatboxProps & { session: Talk.Session }) {
  const {
    session,
    conversationId,
    syncConversation,
    chatboxRef,
    style,
    className,
    loadingComponent,
    children,
    ...optionsAndEvents
  } = props;

  const [events, options] = splitObjectByPrefix(optionsAndEvents, "on");
  const { messageFilter, presence, highlightedWords, ...simpleOptions } =
    options;

  const box = useUIBox(session, "createChatbox", simpleOptions, chatboxRef);
  useSetter(box, messageFilter, "setMessageFilter");
  useSetter(box, presence, "setPresence");
  useSetter(box, highlightedWords, "setHighlightedWords");
  useConversation(session, box, syncConversation, conversationId);

  return (
    <MountedBox
      box={box}
      session={session}
      className={className}
      style={style}
      loadingComponent={loadingComponent}
      handlers={events}
      children={children}
    />
  );
}
