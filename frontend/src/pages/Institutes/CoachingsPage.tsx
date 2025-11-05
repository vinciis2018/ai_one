import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { CoachingDetailsModal } from "../../components/popups/CoachingDetailsModal";
import { getAllCoachings } from "../../store/slices/coachingSlice";
import type { OrganisationModel } from "../../store/slices/coachingSlice";

export const CoachingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector((state) => state.auth);
  const { coachings, loading, error } = useAppSelector((state) => state.coaching);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(null);

  useEffect(() => {
    if (user) {
      dispatch(getAllCoachings());
    }
  }, [dispatch, user]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📄 Coachings</h1>

      {loading && <p>Loading coachings...</p>}
      {error && <p className="text-red-500">Failed to load coachings.</p>}

      <div className="grid grid-cols-3 gap-4">
        {Array.isArray(coachings) ? coachings.map((coaching: OrganisationModel) => (
          <div
            key={coaching._id}
            className="border rounded-lg p-4 hover:shadow cursor-pointer"
            onClick={() => setSelectedId(coaching?._id)}
          >
            <p className="font-semibold">{coaching.name}</p>
            <p className="text-sm text-gray-600">{coaching.source_type}</p>
            <p className="text-xs text-gray-400">{coaching.created_at}</p>
          </div>
        )) : null}
      </div>

      <CoachingDetailsModal coachingId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};
