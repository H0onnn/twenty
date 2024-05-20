import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FindManyTimelineActivitiesOrderBy';
import { Note } from '@/activities/types/Note';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { ActivityTargetableObject } from '../../types/ActivityTargetableEntity';

export const useNotes = (targetableObject: ActivityTargetableObject) => {
  const notesQueryVariables = useMemo(
    () =>
      ({
        filter: {
          type: { eq: 'Note' },
        },
        orderBy: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
      }) as RecordGqlOperationVariables,
    [],
  );

  const { activities, loading } = useActivities({
    activitiesFilters: notesQueryVariables.filter ?? {},
    activitiesOrderByVariables: notesQueryVariables.orderBy ?? {},
    targetableObjects: [targetableObject],
  });

  const [currentNotesQueryVariables, setCurrentNotesQueryVariables] =
    useRecoilState(currentNotesQueryVariablesState);

  const [cachedNotes, setCachedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: fix useEffect, remove with better pattern
  useEffect(() => {
    if (!isDeeplyEqual(notesQueryVariables, currentNotesQueryVariables)) {
      setCurrentNotesQueryVariables(notesQueryVariables);
    }
  }, [
    notesQueryVariables,
    currentNotesQueryVariables,
    setCurrentNotesQueryVariables,
  ]);

  useEffect(() => {
    if (!loading) {
      setCachedNotes(activities as Note[]);
      setIsLoading(false);
    }
  }, [loading, activities]);

  return {
    notes: cachedNotes,
    loading: isLoading,
  };
};
