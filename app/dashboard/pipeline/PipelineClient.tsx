'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { updateLead } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { formatIndianNumber, numberToWordsIndian } from '@/app/lib/utils';

interface Lead {
  id: number;
  name: string;
  status: string;
  type: string;
  budget?: string | null;
  demand?: string | null;
  location?: string | null;
}

const COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', title: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'interested', title: 'Interested', color: 'bg-orange-100 text-orange-800' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-purple-100 text-purple-800' },
  { id: 'closed', title: 'Closed (Won)', color: 'bg-green-100 text-green-800' }
];

export default function PipelineClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeMobileStage, setActiveMobileStage] = useState<string>('all');
  const router = useRouter();

  // Prevent Next.js hydration mismatch on DND components
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a column, or back in the same spot, do nothing
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // --- OPTIMISTIC UI UPDATE ---
    const leadId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId;
    
    // Find the lead being moved
    const movedLeadIndex = leads.findIndex(l => l.id === leadId);
    if (movedLeadIndex === -1) return;
    
    const movedLead = leads[movedLeadIndex];
    
    // Save the exact previous state before this specific move so we can safely roll back
    const previousLeads = [...leads];
    
    // Create new array with updated status for immediate UI feedback
    const newLeads = [...leads];
    newLeads[movedLeadIndex] = { ...movedLead, status: newStatus };
    setLeads(newLeads);

    // --- BACKGROUND DATABASE UPDATE ---
    startTransition(async () => {
      const res = await updateLead(leadId, { status: newStatus });
      if (!res.success) {
        // Revert Optimistic UI to the exact state before the drop if it fails
        alert("Failed to update status.");
        setLeads(previousLeads);
      } else {
        router.refresh(); // Sync server state invisibly
      }
    });
  };

  if (!isMounted) return null; // Wait for client render

  const filteredColumns = activeMobileStage === 'all' 
    ? COLUMNS 
    : COLUMNS.filter(c => c.id === activeMobileStage);

  return (
    <div className="flex flex-col h-full w-full">
      {/* MOBILE STAGE FILTER SELECTOR */}
      <div className="md:hidden px-4 pt-2 pb-1 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 border-b border-gray-100 bg-white">
        <button
          onClick={() => setActiveMobileStage('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all ${
            activeMobileStage === 'all'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Stages ({leads.length})
        </button>
        {COLUMNS.map((c) => {
          const count = leads.filter(l => l.status === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveMobileStage(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 ${
                activeMobileStage === c.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{c.title}</span>
              <span className="opacity-75 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row md:overflow-x-auto h-full w-full px-3 sm:px-4 gap-4 sm:gap-6 pb-28 pt-3">
          
          {filteredColumns.map((col) => {
            const colLeads = leads.filter(l => l.status === col.id);
            
            return (
              <div 
                key={col.id} 
                className="w-full md:w-80 shrink-0 flex flex-col bg-gray-200/50 rounded-2xl border border-gray-200 shadow-xs max-h-[450px] md:max-h-full md:h-[calc(100vh-140px)]"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-white/70 backdrop-blur-sm rounded-t-2xl flex justify-between items-center shrink-0">
                  <h3 className="font-extrabold text-gray-900 text-sm">{col.title}</h3>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${col.color}`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {colLeads.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-gray-400">
                          No leads in {col.title}
                        </div>
                      ) : (
                        colLeads.map((lead, index) => (
                          <Draggable key={lead.id.toString()} draggableId={lead.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => router.push(`/leads/${lead.id}`)}
                                className={`bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 transition-all ${
                                  snapshot.isDragging ? 'shadow-xl scale-105 rotate-2 z-50 ring-2 ring-blue-500 cursor-grabbing' : 'hover:shadow-md cursor-grab'
                                }`}
                              >
                                <div className="flex justify-between items-center gap-2 mb-2">
                                   <h4 className="font-extrabold text-gray-900 text-sm truncate">{lead.name}</h4>
                                   
                                   {/* MOBILE ENHANCED: Quick Move Dropdown with 36px+ Touch Target */}
                                   <select 
                                     onClick={(e) => e.stopPropagation()}
                                     className="text-xs font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 min-h-[36px] text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                     value={lead.status}
                                     onChange={(e) => {
                                        onDragEnd({
                                            draggableId: lead.id.toString(),
                                            source: { droppableId: lead.status, index },
                                            destination: { droppableId: e.target.value, index: 0 },
                                            reason: 'DROP',
                                            type: 'DEFAULT',
                                            mode: 'FLUID',
                                            combine: null
                                        } as DropResult);
                                     }}
                                   >
                                      {COLUMNS.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                      ))}
                                   </select>
                                </div>

                                <div className="flex justify-between items-center text-xs font-bold text-gray-500 mt-3 border-t border-gray-100 pt-2">
                                   <span className="truncate max-w-[120px]">{lead.location || "No location"}</span>
                                   <div className="text-right">
                                     <span className="block text-gray-900 font-extrabold">PKR {formatIndianNumber(lead.budget || lead.demand || "0")}</span>
                                     <span className="block text-[9px] text-gray-400 mt-0.5 leading-none uppercase font-bold">{numberToWordsIndian(lead.budget || lead.demand || "0")}</span>
                                   </div>
                                 </div>
                                 <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-50">
                                    <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                                       {lead.type}
                                    </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}

        </div>
      </DragDropContext>
    </div>
  );
}