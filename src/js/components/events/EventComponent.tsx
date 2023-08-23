import { memo } from 'react';
import { useEffect, useRef, useState } from 'preact/hooks';

import EventDB from '@/nostr/EventDB';

import Events from '../../nostr/Events';
import Key from '../../nostr/Key';
import SocialNetwork from '../../nostr/SocialNetwork';
import { translate as t } from '../../translations/Translation.mjs';
import Icons from '../../utils/Icons';

import Note from './note/Note';
import EventDropdown from './EventDropdown';
import Follow from './Follow';
import Like from './Like';
import Repost from './Repost';
import Zap from './Zap';

declare global {
  interface Window {
    prerenderReady: boolean;
  }
}

export interface EventComponentProps {
  id: string;
  standalone?: boolean;
  asInlineQuote?: boolean;
  showReplies?: number;
  showRepliedMsg?: boolean;
  isReply?: boolean;
  isQuote?: boolean;
  isQuoting?: boolean;
  feedOpenedAt?: number;
  fullWidth?: boolean;
}

const EventComponent = (props: EventComponentProps) => {
  const hex = Key.toNostrHexAddress(props.id);
  const [state, setState] = useState<{ [key: string]: any }>({
    sortedReplies: [],
    meta: {},
    event: hex && EventDB.get(hex),
  });
  const retrievingTimeout = useRef<any>();
  const unmounted = useRef<boolean>(false);

  const handleEvent = (event: any) => {
    clearTimeout(retrievingTimeout.current);
    if (unmounted.current) {
      return;
    }

    if (state.retrieving) {
      setState((prevState) => ({ ...prevState, retrieving: false }));
    }

    setState((prevState) => ({ ...prevState, event }));
  };

  useEffect(() => {
    if (!props.id) {
      console.log('error: no id', props);
      return;
    }
    unmounted.current = false;
    const hexId = Key.toNostrHexAddress(props.id);

    /*
    localState.get('mutedNotes').on(
      (mutedNotes) => {
        const muted = mutedNotes && mutedNotes[hexId];
        setState((prevState) => ({ ...prevState, muted }));
      },
      // ...
    );
     */

    retrievingTimeout.current = setTimeout(() => {
      setState((prevState) => ({ ...prevState, retrieving: true }));
    }, 1000);
    hexId && Events.getEventById(hexId, true, (event) => handleEvent(event));

    return () => {
      unmounted.current = true;
    };
  }, []);

  useEffect(() => {
    if (props.standalone) {
      if (!state.msg && state.msg) {
        setTimeout(() => {
          window.prerenderReady = true;
        }, 1000);
      }
    }
  });

  const renderDropdown = () => {
    return props.asInlineQuote ? null : <EventDropdown id={props.id || ''} event={state.event} />;
  };

  if (!props.id) {
    console.error('no id on event', props);
    return null;
  }
  if (!state.event) {
    return (
      <div key={props.id}>
        <div
          className={`m-2 md:mx-4 flex items-center ${
            state.retrieving ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-700 ease-in-out`}
        >
          <div className="text">{t('looking_up_message')}</div>
          <div>{renderDropdown()}</div>
        </div>
      </div>
    );
  }

  if (SocialNetwork.isBlocked(state.event.pubkey)) {
    if (props.standalone || props.isQuote) {
      return (
        <div className="m-2 md:mx-4 flex items-center">
          <i className="mr-2">{Icons.newFollower}</i>
          <span> Message from a blocked user</span>
        </div>
      );
    } else {
      return null;
    }
  }

  const renderComponent = () => {
    let Component: any = Note;

    if (state.event.kind === 1) {
      const mentionIndex = state.event?.tags?.findIndex(
        (tag) => tag[0] === 'e' && tag[3] === 'mention',
      );
      if (state.event?.content === `#[${mentionIndex}]`) {
        Component = Repost;
      }
    } else {
      Component = {
        1: Note,
        3: Follow,
        6: Repost,
        7: Like,
        9735: Zap,
      }[state.event.kind];
    }

    if (!Component) {
      console.error('unknown event kind', state.event);
      return null;
    }

    return (
      <Component
        key={props.id}
        event={state.event}
        fullWidth={props.fullWidth}
        fadeIn={!props.feedOpenedAt || props.feedOpenedAt < state.event.created_at}
        {...props}
      />
    );
  };

  return renderComponent();
};

export default memo(EventComponent);
