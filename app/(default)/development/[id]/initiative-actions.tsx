// app/(default)/development/[id]/initiative-actions.tsx

'use client';

import { DevelopmentInitiativeWithDetails } from '@/types/development';
import EventActions from './event-actions';
import ProjectActions from './project-actions';

interface InitiativeActionsProps {
  initiative: DevelopmentInitiativeWithDetails;
}

export default function InitiativeActions({
  initiative,
}: InitiativeActionsProps) {
  if (initiative.initiative_type === 'event') {
    return <EventActions initiative={initiative} />;
  }

  return <ProjectActions initiative={initiative} />;
}
