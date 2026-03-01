import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchTeamDetails,
  addMember,
  removeMember,
} from "../Services/Operations/teamActions";
import { clearTeam } from "../redux/teamSlice";
import UpdateTeamModal from "../Components/UpdateTeamModal";

const TeamDetails = () => {
  const dispatch = useDispatch();
  const { teamId } = useParams();

  const { currentTeam, loading } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");

  // ✅ Add Member
  const handleAddMember = () => {
    if (!newMemberId.trim()) return;

    dispatch(addMember(teamId, newMemberId));
    setNewMemberId("");
  };

  // ✅ Remove Member
  const handleRemoveMember = (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      dispatch(removeMember(teamId, memberId));
    }
  };

  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeamDetails(teamId));
    }

    return () => {
      dispatch(clearTeam());
    };
  }, [dispatch, teamId]);

  if (loading || !currentTeam || currentTeam._id !== teamId) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">
        {user?.name} ({user?.role})'s Team
      </h1>

      {/* Team Info */}
      <div className="bg-white flex justify-between rounded-lg p-6 mb-6 shadow">
        <div>
          <h2 className="text-xl font-bold">{currentTeam.name}</h2>
          <p className="text-gray-500">{currentTeam.description}</p>
        </div>

        {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Edit Team
          </button>
        )}
      </div>

      {/* ✅ Add Member Section */}
      {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow flex gap-3">
          <input
            type="text"
            placeholder="Enter User ID"
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />
          <button
            onClick={handleAddMember}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add Member
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
            {currentTeam.members?.length || 0} Members
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {currentTeam.members && currentTeam.members.length > 0 ? (
            currentTeam.members.map((member) => (
              <div
                key={member._id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {member.name
                      ? member.name.charAt(0).toUpperCase()
                      : "?"}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {member.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {member._id === currentTeam.adminId?._id && (
                    <span className="text-[10px] uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">
                      Team Lead
                    </span>
                  )}

                  {(user?.role === "ADMIN" ||
                    user?.role === "MANAGER") &&
                    member._id !== user._id && (
                      <button
                        onClick={() =>
                          handleRemoveMember(member._id)
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-bold uppercase"
                      >
                        Remove
                      </button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No members found in this team.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <UpdateTeamModal
          onClose={() => setOpen(false)}
          currentTeam={currentTeam}
        />
      )}
    </div>
  );
};

export default TeamDetails;