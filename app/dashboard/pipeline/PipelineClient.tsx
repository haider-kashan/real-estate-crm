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
  const router = useRouter();

  // Prevent Next.js hydration mismatch on DND components
  useEffect(() => {
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
    
    // Create new array with updated status for immediate UI feedback
    const newLeads = [...leads];
    newLeads[movedLeadIndex] = { ...movedLead, status: newStatus };
    setLeads(newLeads);

    // --- BACKGROUND DATABASE UPDATE ---
    startTransition(async () => {
      const res = await updateLead(leadId, { status: newStatus });
      if (!res.success) {
        // Revert Optimistic UI if it fails
        alert("Failed to update status.");
        setLeads(initialLeads);
      } else {
        router.refresh(); // Sync server state invisibly
      }
    });
  };

  if (!isMounted) return null; // Wait for client render

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* 
        MOBILE UX UPDATE 2:
        Switched to a Vertical Stack layout! 
        Mobile browsers handle vertical scrolling natively during drag events 
        much better than horizontal scrolling.
      */}
      <div className="flex flex-col md:flex-row md:overflow-x-auto h-full w-full px-4 gap-6 pb-24 pt-2">
        
        {COLUMNS.map((col) => {
          const colLeads = leads.filter(l => l.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className="w-full md:w-80 shrink-0 flex flex-col bg-gray-200/50 rounded-2xl border border-gray-200 shadow-sm max-h-[400px] md:max-h-full md:h-[calc(100vh-140px)]"
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white/50 backdrop-blur-sm rounded-t-2xl flex justify-between items-center shrink-0">
                <h3 className="font-bold text-gray-900">{col.title}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.color}`}>
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
                    {colLeads.map((lead, index) => (
                      <Draggable key={lead.id.toString()} draggableId={lead.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => router.push(`/leads/${lead.id}`)}
                            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all ${
                              snapshot.isDragging ? 'shadow-xl scale-105 rotate-2 z-50 ring-2 ring-blue-500 cursor-grabbing' : 'hover:shadow-md cursor-grab'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                               <h4 className="font-bold text-gray-900 text-sm">{lead.name}</h4>
                               
                               {/* MOBILE FALLBACK: Quick Move Dropdown */}
                               <select 
                                 onClick={(e) => e.stopPropagation()}
                                 className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-gray-500 outline-none"
                                 value={lead.status}
                                 onChange={(e) => {
                                    // Trigger a fake drop result to reuse the same logic
                                    onDragEnd({
                                        draggableId: lead.id.toString(),
                                        source: { droppableId: lead.status, index },
                                        destination: { droppableId: e.target.value, index: 0 },
                                        reason: 'DROP',
                                        type: 'DEFAULT',
                                        mode: 'FLUID',
                                        combine: null
                                    } as any);
                                 }}
                               >
                                  {COLUMNS.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                  ))}
                               </select>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase mt-4 border-t pt-2">
                               <span>{lead.location || "No location"}</span>
                               <div className="text-right">
                                 <span className="block text-gray-800">PKR {formatIndianNumber(lead.budget || lead.demand || "0")}</span>
                                 <span className="block text-[8px] text-gray-400 mt-0.5 leading-none">{numberToWordsIndian(lead.budget || lead.demand || "0")}</span>
                               </div>
                             </div>
                             <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-md">
                                   {lead.type}
                                </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}

      </div>
    </DragDropContext>
  );
}
